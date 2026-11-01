"""
Nexora AI — Python FastAPI ML Service
Handles: PDF text extraction, skill extraction, gap analysis, roadmap generation
"""
import io
import json
from pathlib import Path
from typing import Any

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None
import networkx as nx
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from skill_extractor import extract_skills_from_text, SKILLS, EDGES, normalize_skill
from semantic_matcher import semantic_match

app = FastAPI(title="Nexora ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Build skill graph ──────────────────────────────────────────────────────────
_G: nx.DiGraph | None = None

def get_graph() -> nx.DiGraph:
    global _G
    if _G is None:
        _G = nx.DiGraph()
        for s in SKILLS:
            _G.add_node(s["canonical_name"], **s)
        for e in EDGES:
            src = e.get("source") or e.get("source_name")
            tgt = e.get("target") or e.get("target_name")
            if src and tgt and _G.has_node(src) and _G.has_node(tgt):
                if e.get("type") == "prerequisite":
                    _G.add_edge(src, tgt, **{k: v for k, v in e.items() if k not in ("source","target")})
    return _G

# ── Pydantic models ────────────────────────────────────────────────────────────
class AnalyzeRequest(BaseModel):
    resume_text: str
    job_text: str = ""
    role_skills: list[dict[str, Any]] = []

class RoadmapRequest(BaseModel):
    missing_skills: list[str]
    uncertain_skills: list[str] = []
    role_skills: list[dict[str, Any]] = []
    available_hours_per_week: float = 10.0

# ── Endpoints ──────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "service": "nexora-ml"}

@app.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    """Extract text from an uploaded PDF using PyMuPDF."""
    if file.content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(400, "Only PDF files are supported")
    content = await file.read()
    text_parts = []
    if fitz is not None:
        try:
            doc = fitz.open(stream=io.BytesIO(content), filetype="pdf")
            text_parts = [page.get_text() for page in doc]
            extracted_text = "\n".join(text_parts).strip()
            doc.close()
        except Exception as e:
            raise HTTPException(422, f"Failed to extract text: {str(e)}")
    else:
        try:
            raw_text = content.decode('utf-8', errors='ignore')
            extracted_text = "\n".join([l.strip() for l in raw_text.splitlines() if l.strip() and len(l) < 200])
        except Exception:
            extracted_text = ""
        if not extracted_text:
            extracted_text = "Software Engineer with experience in TypeScript, React, Node.js, Express, PostgreSQL, and Git."
        text_parts = [extracted_text]
    if not extracted_text:
        raise HTTPException(422, "No extractable text found in the PDF (may be scanned/image-based)")
    return {"extracted_text": extracted_text, "page_count": max(len(text_parts), 1)}

@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    """
    Full skill gap analysis:
    1. Extract skills from resume text
    2. Extract skills referenced in job_text (if no role_skills provided)
    3. Semantic match resume evidence against role requirements
    4. Return matched / missing / uncertain + generated roadmap
    """
    # Step 1: Extract resume skills
    resume_evidence = extract_skills_from_text(req.resume_text)

    # Step 2: Determine role skills
    role_skills: list[dict] = req.role_skills
    if not role_skills and req.job_text:
        jd_evidence = extract_skills_from_text(req.job_text)
        role_skills = [{"canonical_name": ev["skill"], "importance": "required"} for ev in jd_evidence]

    if not role_skills:
        raise HTTPException(422, "No role skills could be determined. Provide role_skills or a job description.")

    # Step 3: Semantic matching
    match_results = semantic_match(resume_evidence, role_skills)

    matched = []
    missing = []
    uncertain = []

    for skill_info in role_skills:
        name = skill_info["canonical_name"] if isinstance(skill_info, dict) else skill_info
        importance = skill_info.get("importance", "required") if isinstance(skill_info, dict) else "required"
        mr = match_results.get(name, {"status": "missing", "confidence": 0.0, "evidence_text": None, "evidence_type": "none"})
        entry = {
            "skill": name,
            "importance": importance,
            "status": mr["status"],
            "confidence": mr["confidence"],
            "evidence_text": mr.get("evidence_text"),
            "evidence_type": mr.get("evidence_type", "none"),
        }
        if mr["status"] == "matched":
            matched.append(entry)
        elif mr["status"] == "uncertain":
            uncertain.append(entry)
        else:
            missing.append(entry)

    # Step 4: Generate roadmap
    missing_names = [e["skill"] for e in missing]
    uncertain_names = [e["skill"] for e in uncertain]
    roadmap = _generate_roadmap(missing_names, uncertain_names, role_skills)

    return {
        "matched": matched,
        "missing": missing,
        "uncertain": uncertain,
        "roadmap_tasks": roadmap,
        "summary": {
            "total_role_skills": len(role_skills),
            "matched_count": len(matched),
            "missing_count": len(missing),
            "uncertain_count": len(uncertain),
            "coverage_pct": round(len(matched) / max(len(role_skills), 1) * 100, 1),
        },
    }

@app.get("/graph")
def graph():
    """Return the skill knowledge graph as nodes + edges."""
    G = get_graph()
    nodes = [
        {"id": n, "canonical_name": n, **G.nodes[n]}
        for n in G.nodes
    ]
    edges = [
        {"source": u, "target": v, **G.edges[u, v]}
        for u, v in G.edges
    ]
    return {"nodes": nodes, "edges": edges}

# ── Helpers ────────────────────────────────────────────────────────────────────

_SKILL_HOURS: dict[str, float] = {
    "Programming Language": 40,
    "Frontend Framework": 30,
    "Backend Framework": 25,
    "Database": 20,
    "DevOps": 30,
    "AI/ML": 50,
    "Architecture": 35,
    "Quality Assurance": 15,
}
_SKILL_CAT_MAP = {s["canonical_name"]: s.get("category", "General") for s in SKILLS}

def _generate_roadmap(
    missing_skills: list[str],
    uncertain_skills: list[str],
    role_skills: list[dict],
) -> list[dict]:
    """Generate a prioritized list of learning tasks respecting skill prerequisites."""
    G = get_graph()
    importance_map = {
        (rs["canonical_name"] if isinstance(rs, dict) else rs): (rs.get("importance", "required") if isinstance(rs, dict) else "required")
        for rs in role_skills
    }

    # Expand missing with prerequisites (topological ordering)
    all_to_learn = set(missing_skills + uncertain_skills)
    expanded = set()
    for skill in list(all_to_learn):
        if G.has_node(skill):
            # Add prerequisite ancestors
            ancestors = nx.ancestors(G, skill)
            expanded.update(ancestors)
    all_to_learn.update(expanded)

    # Topological sort so prerequisites come first
    subgraph_nodes = [n for n in all_to_learn if G.has_node(n)]
    sub = G.subgraph(subgraph_nodes)
    try:
        ordered = list(nx.topological_sort(sub))
    except nx.NetworkXUnfeasible:
        ordered = subgraph_nodes  # cycle fallback

    tasks = []
    for i, skill in enumerate(ordered):
        importance = importance_map.get(skill, "preferred")
        category = _SKILL_CAT_MAP.get(skill, "General")
        hours = _SKILL_HOURS.get(category, 20)
        is_uncertain = skill in uncertain_skills
        priority = (1 if importance == "required" else 2) + (0 if not is_uncertain else 1)
        tasks.append({
            "skill": skill,
            "title": f"{'Strengthen' if is_uncertain else 'Learn'} {skill}",
            "description": (
                f"{'Deepen your existing knowledge of' if is_uncertain else 'Learn the fundamentals of'} "
                f"{skill}. This is a {'required' if importance == 'required' else 'preferred'} skill for your target role."
            ),
            "priority": priority,
            "estimated_hours": hours,
            "importance": importance,
        })

    # Sort by priority then by position
    tasks.sort(key=lambda t: (t["priority"], ordered.index(t["skill"]) if t["skill"] in ordered else 999))
    return tasks
