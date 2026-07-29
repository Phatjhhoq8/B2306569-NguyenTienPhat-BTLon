# Chuc nang: Tim sach trong CSDL thu vien qua backend API.

from typing import Any, Dict, List, Optional
from tools.library_api import api_get, normalize_book


def search_books(
    q: str = "",
    category: Optional[str] = None,
    author: Optional[str] = None,
    publisher: Optional[str] = None,
    status: str = "ACTIVE",
    limit: int = 10,
) -> List[Dict[str, Any]]:
    try:
        data = api_get("/books", {
            "q": q,
            "category": category,
            "author": author,
            "publisher": publisher,
            "status": status,
            "limit": limit,
        })
        books = data.get("books", data if isinstance(data, list) else [])
        return [normalize_book(book) for book in books]
    except Exception as e:
        print(f"[WARNING] search_books failed: {e}")
        return []
