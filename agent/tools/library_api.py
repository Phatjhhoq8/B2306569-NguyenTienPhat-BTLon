# Chuc nang: Helper goi API backend thu vien bang standard library.

import json
import os
from typing import Any, Dict, Optional
from urllib.parse import urlencode
from urllib.request import Request, urlopen


BACKEND_API_BASE = os.getenv("LIBRARY_API_BASE", "http://localhost:3000/api").rstrip("/")


def api_get(path: str, params: Optional[Dict[str, Any]] = None, timeout: int = 8) -> Any:
    query = urlencode({k: v for k, v in (params or {}).items() if v not in [None, "", []]}, doseq=True)
    url = f"{BACKEND_API_BASE}{path}"
    if query:
        url = f"{url}?{query}"
    request = Request(url, headers={"Accept": "application/json"})
    with urlopen(request, timeout=timeout) as response:
        payload = json.loads(response.read().decode("utf-8"))
    return payload.get("data", payload)


def normalize_book(book: Dict[str, Any]) -> Dict[str, Any]:
    authors = book.get("tacGia") or []
    if isinstance(authors, dict):
        authors = [authors]
    return {
        "_id": book.get("_id"),
        "tenSach": book.get("tenSach", ""),
        "hinhAnh": book.get("hinhAnh", ""),
        "moTa": book.get("moTa", ""),
        "tacGia": authors,
        "theLoai": book.get("theLoai"),
        "nhaXuatBan": book.get("nhaXuatBan"),
        "rating": book.get("rating", 0),
        "soLuotMuon": book.get("soLuotMuon", 0),
        "viTriKe": book.get("viTriKe", ""),
        "soLuongKhaDung": book.get("soLuongKhaDung", 0),
        "trangThai": book.get("trangThai", "ACTIVE"),
    }
