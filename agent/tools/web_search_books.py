# Chuc nang: Web search tim ten tac pham lien quan khi CSDL thu vien khong du ket qua.

import json
from typing import Any, Dict, List
from pydantic import BaseModel, Field
from config import DEFAULT_PROVIDER, MODEL_LIGHTWEIGHT_GPT, MODEL_LIGHTWEIGHT_GEMINI, get_ai_model


class WebBookCandidate(BaseModel):
    title: str = Field(description="Ten sach/truyen/tac pham ngan gon.")
    author: str = Field(default="", description="Tac gia neu biet.")
    reason: str = Field(default="", description="Mo ta ngan vi sao tac pham nay khop voi truy van.")
    source_url: str = Field(default="", description="URL nguon neu co.")


class WebBookCandidates(BaseModel):
    candidates: List[WebBookCandidate] = Field(default_factory=list)


def _extract_book_candidates(query: str, raw_results: List[Dict[str, Any]], max_results: int) -> List[Dict[str, Any]]:
    if not raw_results:
        return []
    model_name = MODEL_LIGHTWEIGHT_GPT if DEFAULT_PROVIDER == "openai" else MODEL_LIGHTWEIGHT_GEMINI
    compact_results = [
        {
            "title": item.get("title") or item.get("name") or "",
            "snippet": item.get("snippet") or item.get("description") or "",
            "url": item.get("link") or item.get("url") or "",
        }
        for item in raw_results[:max_results]
    ]
    try:
        model = get_ai_model(model_name, provider=DEFAULT_PROVIDER)
        raw_output = model.generate(
            [
                {
                    "role": "system",
                    "content": (
                        "Ban trich xuat ten sach/truyen/tac pham tu ket qua web cho tro ly thu vien. "
                        "Chi tra ve cac tac pham co kha nang khop truy van. "
                        "Title phai la ten tac pham ngan gon, khong phai tieu de bai viet hay URL."
                    ),
                },
                {
                    "role": "user",
                    "content": f"Truy van: {query}\nKet qua web JSON: {json.dumps(compact_results, ensure_ascii=False)}",
                },
            ],
            response_schema=WebBookCandidates,
        )
        parsed = WebBookCandidates.model_validate_json(raw_output)
        return [item.model_dump() for item in parsed.candidates[:max_results] if item.title.strip()]
    except Exception as e:
        print(f"[WARNING] extract web book candidates failed: {e}")
        return []


def web_search_books(query: str, max_results: int = 5) -> List[Dict[str, Any]]:
    try:
        from tools.web_search_mcp import web_search_mcp
        raw_results = web_search_mcp(f"ten sach tac pham lien quan den: {query}", max_results=max_results, limit_to_trusted=False)
    except Exception as e:
        print(f"[WARNING] web_search_books failed: {e}")
        return []

    extracted = _extract_book_candidates(query, raw_results, max_results)
    if extracted:
        return extracted

    suggestions = []
    for item in raw_results:
        title = item.get("title") or item.get("name") or ""
        snippet = item.get("snippet") or item.get("description") or ""
        if title:
            suggestions.append({
                "title": title,
                "author": "",
                "reason": snippet[:300],
                "source_url": item.get("link") or item.get("url"),
            })
    return suggestions
