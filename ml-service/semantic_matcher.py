import numpy as np
from typing import Any

_MODEL = None

def get_model():
    global _MODEL
    if _MODEL is None:
        from sentence_transformers import SentenceTransformer
        _MODEL = SentenceTransformer("all-MiniLM-L6-v2")
    return _MODEL

def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    a_norm = a / (np.linalg.norm(a) + 1e-8)
    b_norm = b / (np.linalg.norm(b) + 1e-8)
    return float(np.dot(a_norm, b_norm))

def embed_texts(texts: list[str]) -> list[np.ndarray]:
    model = get_model()
    return model.encode(texts, convert_to_numpy=True)

def semantic_match(
    resume_evidence: list[dict[str, Any]],
    role_skills: list[dict[str, Any]],
    threshold_matched: float = 0.55,
    threshold_uncertain: float = 0.35,
) -> dict[str, dict[str, Any]]:
    """
    For each role skill, find the best-matching resume evidence by semantic similarity.
    Returns dict[skill_name] -> {status, confidence, evidence_text, evidence_type}
    """
    if not role_skills:
        return {}

    result: dict[str, dict] = {}

    role_skill_names = [rs["canonical_name"] if isinstance(rs, dict) else rs for rs in role_skills]
    resume_snippets = [ev.get("evidence_text", ev.get("skill", "")) for ev in resume_evidence]
    resume_skills = [ev.get("skill", "") for ev in resume_evidence]

    # Embed role skills and resume evidence
    try:
        role_embeds = embed_texts(role_skill_names)
        resume_embeds = embed_texts(resume_snippets) if resume_snippets else []
    except Exception:
        # Fallback: exact match only
        found_skills = set(resume_skills)
        for rs in role_skills:
            name = rs["canonical_name"] if isinstance(rs, dict) else rs
            if name in found_skills:
                result[name] = {"status": "matched", "confidence": 1.0, "evidence_text": name, "evidence_type": "exact"}
            else:
                result[name] = {"status": "missing", "confidence": 0.0, "evidence_text": None, "evidence_type": "none"}
        return result

    for i, skill_name in enumerate(role_skill_names):
        best_sim = 0.0
        best_ev = None
        best_ev_type = "none"

        # Check exact match first
        if skill_name in resume_skills:
            idx = resume_skills.index(skill_name)
            result[skill_name] = {
                "status": "matched",
                "confidence": 1.0,
                "evidence_text": resume_evidence[idx].get("evidence_text"),
                "evidence_type": resume_evidence[idx].get("evidence_type", "exact"),
            }
            continue

        # Semantic matching against resume evidence
        if resume_embeds:
            sims = [cosine_similarity(role_embeds[i], resume_embeds[j]) for j in range(len(resume_embeds))]
            best_j = int(np.argmax(sims))
            best_sim = sims[best_j]
            best_ev = resume_evidence[best_j].get("evidence_text") if best_sim >= threshold_uncertain else None
            best_ev_type = "semantic"

        if best_sim >= threshold_matched:
            status = "matched"
        elif best_sim >= threshold_uncertain:
            status = "uncertain"
        else:
            status = "missing"

        result[skill_name] = {
            "status": status,
            "confidence": round(best_sim, 3),
            "evidence_text": best_ev,
            "evidence_type": best_ev_type if status != "missing" else "none",
        }

    return result
