# Chuc nang: Kiem tra cac ten tac pham web search co trong CSDL thu vien khong.

from typing import Any, Dict, List
from tools.search_books import search_books


def verify_books_in_library(candidates: List[Dict[str, Any]], limit_per_title: int = 3) -> Dict[str, List[Dict[str, Any]]]:
    found: List[Dict[str, Any]] = []
    missing: List[Dict[str, Any]] = []
    seen_ids = set()

    for candidate in candidates:
        title = candidate.get("title", "").strip()
        if not title:
            continue
        matches = search_books(q=title, limit=limit_per_title)
        if matches:
            for book in matches:
                book_id = book.get("_id")
                if book_id and book_id not in seen_ids:
                    seen_ids.add(book_id)
                    found.append(book)
        else:
            missing.append(candidate)
    return {"found": found, "missing": missing}
