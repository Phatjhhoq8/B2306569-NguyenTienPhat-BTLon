# Chuc nang: Luu so thich doc sach bang JSON local, khong dung SQL/Redis.

import json
import os
import re
from datetime import datetime, timezone
from typing import Any, Dict, List


DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
PREFERENCES_FILE = os.path.join(DATA_DIR, "user_preferences.json")

CATEGORY_HINTS = {
    "Trinh tham": ["tham tu", "pha an", "toi pham", "bi an", "dieu tra", "an mang"],
    "Tam ly": ["tam ly", "chua lanh", "nhe nhang", "cam xuc", "buon", "healing"],
    "Phieu luu": ["phieu luu", "hanh trinh", "nhom ban", "cuu the gioi", "kham pha"],
    "Lang man": ["lang man", "tinh yeu", "yeu", "romance"],
    "Khoa hoc": ["khoa hoc", "vu tru", "cong nghe", "science"],
    "Ky nang song": ["ky nang", "tu duy", "phat trien ban than", "self-help"],
}

STOPWORDS = {
    "toi", "minh", "ban", "sach", "truyen", "cuon", "tim", "goi", "y", "co", "khong",
    "muon", "cho", "ve", "la", "nhung", "cac", "nay", "kia", "giup", "voi", "mot",
}


def _ensure_file() -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(PREFERENCES_FILE):
        with open(PREFERENCES_FILE, "w", encoding="utf-8") as f:
            json.dump({}, f, ensure_ascii=False, indent=2)


def _read_all() -> Dict[str, Any]:
    _ensure_file()
    try:
        with open(PREFERENCES_FILE, "r", encoding="utf-8") as f:
            return json.load(f) or {}
    except Exception:
        return {}


def _write_all(data: Dict[str, Any]) -> None:
    _ensure_file()
    with open(PREFERENCES_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def _empty_profile() -> Dict[str, Any]:
    return {
        "favorite_categories": [],
        "favorite_authors": [],
        "favorite_keywords": [],
        "borrowed_book_ids": [],
        "recent_queries": [],
        "updated_at": None,
    }


def _append_unique(values: List[Any], new_values: List[Any], limit: int = 30) -> List[Any]:
    output = list(values or [])
    for value in new_values:
        if value in [None, "", []]:
            continue
        if value not in output:
            output.append(value)
    return output[-limit:]


def _extract_keywords(text: str, limit: int = 12) -> List[str]:
    normalized = re.sub(r"[^0-9a-zA-ZÀ-ỹ\s-]", " ", (text or "").lower())
    words = [w.strip("- ") for w in normalized.split()]
    keywords = []
    for word in words:
        if len(word) < 3 or word in STOPWORDS:
            continue
        if word not in keywords:
            keywords.append(word)
        if len(keywords) >= limit:
            break
    return keywords


def _extract_categories_from_text(text: str) -> List[str]:
    lowered = (text or "").lower()
    categories = []
    for category, hints in CATEGORY_HINTS.items():
        if any(hint in lowered for hint in hints):
            categories.append(category)
    return categories


def _category_name(category: Any) -> str:
    if isinstance(category, dict):
        return category.get("tenTheLoai") or category.get("name") or ""
    return str(category or "")


def _author_names(authors: Any) -> List[str]:
    if not isinstance(authors, list):
        authors = [authors]
    names = []
    for author in authors:
        if isinstance(author, dict):
            name = author.get("tenTacGia") or author.get("name") or author.get("text")
        else:
            name = str(author or "")
        if name:
            names.append(name)
    return names


def load_user_preferences(user_id: str) -> Dict[str, Any]:
    data = _read_all()
    profile = data.get(user_id) or _empty_profile()
    return {**_empty_profile(), **profile}


def save_user_preferences(user_id: str, profile: Dict[str, Any]) -> Dict[str, Any]:
    data = _read_all()
    profile["updated_at"] = datetime.now(timezone.utc).isoformat()
    data[user_id] = profile
    _write_all(data)
    return profile


def update_preferences_from_query(user_id: str, query: str) -> Dict[str, Any]:
    profile = load_user_preferences(user_id)
    profile["favorite_keywords"] = _append_unique(profile.get("favorite_keywords"), _extract_keywords(query))
    profile["favorite_categories"] = _append_unique(profile.get("favorite_categories"), _extract_categories_from_text(query))
    profile["recent_queries"] = _append_unique(profile.get("recent_queries"), [query], limit=10)
    return save_user_preferences(user_id, profile)


def update_preferences_from_borrowed_books(user_id: str, borrowed_books: List[Dict[str, Any]]) -> Dict[str, Any]:
    profile = load_user_preferences(user_id)
    categories: List[str] = []
    authors: List[str] = []
    keywords: List[str] = []
    book_ids: List[str] = []

    for book in borrowed_books or []:
        book_id = book.get("_id") or book.get("id")
        if book_id:
            book_ids.append(book_id)
        category = _category_name(book.get("theLoai"))
        if category:
            categories.append(category)
        authors.extend(_author_names(book.get("tacGia")))
        keywords.extend(_extract_keywords(" ".join([book.get("tenSach", ""), book.get("moTa", "")]), limit=8))

    profile["favorite_categories"] = _append_unique(profile.get("favorite_categories"), categories)
    profile["favorite_authors"] = _append_unique(profile.get("favorite_authors"), authors)
    profile["favorite_keywords"] = _append_unique(profile.get("favorite_keywords"), keywords)
    profile["borrowed_book_ids"] = _append_unique(profile.get("borrowed_book_ids"), book_ids, limit=100)
    return save_user_preferences(user_id, profile)


def build_preference_context(user_id: str) -> str:
    profile = load_user_preferences(user_id)
    parts = []
    if profile.get("favorite_categories"):
        parts.append("The loai hay quan tam: " + ", ".join(profile["favorite_categories"][-8:]))
    if profile.get("favorite_authors"):
        parts.append("Tac gia hay muon/quan tam: " + ", ".join(profile["favorite_authors"][-8:]))
    if profile.get("favorite_keywords"):
        parts.append("Tu khoa so thich: " + ", ".join(profile["favorite_keywords"][-12:]))
    if profile.get("borrowed_book_ids"):
        parts.append("Da muon " + str(len(profile["borrowed_book_ids"])) + " sach truoc do")
    return " | ".join(parts)
