import json
import os
import re
from pathlib import Path
from typing import Any

# Load skill taxonomy from seed data (sibling data/seed folder)
_SEED_DIR = Path(__file__).parent.parent / "data" / "seed"

def load_skills() -> list[dict]:
    p = _SEED_DIR / "skills.json"
    if p.exists():
        return json.loads(p.read_text())
    return []

def load_edges() -> list[dict]:
    p = _SEED_DIR / "skill_edges.json"
    if p.exists():
        return json.loads(p.read_text())
    return []

SKILLS: list[dict] = load_skills()
EDGES: list[dict] = load_edges()

# Build alias → canonical_name lookup
_ALIAS_MAP: dict[str, str] = {}
for s in SKILLS:
    _ALIAS_MAP[s["canonical_name"].lower()] = s["canonical_name"]
    for alias in s.get("aliases", []):
        _ALIAS_MAP[alias.lower()] = s["canonical_name"]

def normalize_skill(term: str) -> str | None:
    """Normalize a raw skill mention to a canonical skill name."""
    t = term.strip().lower()
    if t in _ALIAS_MAP:
        return _ALIAS_MAP[t]
    # Partial match
    for key, canonical in _ALIAS_MAP.items():
        if key in t or t in key:
            return canonical
    return None

def extract_skills_from_text(text: str) -> list[dict[str, Any]]:
    """
    Simple keyword + alias extraction from raw text.
    Returns list of {skill, evidence_text, evidence_type}.
    """
    found: dict[str, dict] = {}
    # Tokenize: split on common separators
    words = re.split(r'[\s,;|/\-\(\)]+', text)
    # Also try bigrams and trigrams
    tokens = [" ".join(words[i:i+n]) for n in (1, 2, 3) for i in range(len(words) - n + 1)]

    for token in tokens:
        canonical = normalize_skill(token)
        if canonical and canonical not in found:
            # Find evidence snippet (surrounding 80 chars)
            idx = text.lower().find(token.lower())
            snippet = text[max(0, idx-40):idx+len(token)+40].strip() if idx >= 0 else ""
            found[canonical] = {
                "skill": canonical,
                "evidence_text": snippet,
                "evidence_type": "exact" if token.lower() == canonical.lower() else "alias",
            }
    return list(found.values())
