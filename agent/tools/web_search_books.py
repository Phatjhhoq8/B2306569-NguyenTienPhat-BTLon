# Chuc nang: Web search tim ten tac pham lien quan khi CSDL thu vien khong du ket qua.

from typing import Any, Dict, List


def web_search_books(query: str, max_results: int = 5) -> List[Dict[str, Any]]:
    try:
        from tools.web_search_mcp import web_search_mcp
        raw_results = web_search_mcp(f"ten sach tac pham lien quan den: {query}", max_results=max_results, limit_to_trusted=False)
    except Exception as e:
        print(f"[WARNING] web_search_books failed: {e}")
        return []

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
