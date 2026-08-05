# Chuc nang: Skill tim sach theo mo ta, fallback web va goi y sach lien quan trong thu vien.

from typing import Any, Dict, List, Optional
from tools.search_books import search_books
from tools.web_search_books import web_search_books
from tools.verify_books_in_library import verify_books_in_library


def _dedupe_books(books: List[Dict[str, Any]], limit: int = 10, exclude_ids: Optional[List[str]] = None) -> List[Dict[str, Any]]:
    seen_ids = set()
    seen_titles = set()
    excluded = set(exclude_ids or [])
    output = []
    for book in books:
        book_id = book.get("_id")
        title = (book.get("tenSach") or "").strip().lower()
        if not title:
            continue
        if book_id and book_id not in seen_ids and book_id not in excluded and title not in seen_titles:
            seen_ids.add(book_id)
            seen_titles.add(title)
            output.append(book)
        if len(output) >= limit:
            break
    return output


def _dedupe_candidates(candidates: List[Dict[str, Any]], limit: int = 10) -> List[Dict[str, Any]]:
    seen = set()
    output = []
    for candidate in candidates:
        title = (candidate.get("title") or "").strip()
        if not title:
            continue
        key = title.lower()
        if key in seen:
            continue
        seen.add(key)
        output.append(candidate)
        if len(output) >= limit:
            break
    return output


def _candidates_from_titles(titles: List[str]) -> List[Dict[str, Any]]:
    return [{"title": title.strip(), "author": "", "reason": "Ten tac pham co the suy ra tu mo ta.", "source_url": ""} for title in titles if title and title.strip()]


def find_books_for_query(
    query: str,
    limit: int = 10,
    preference_context: str = "",
    borrowed_book_ids: Optional[List[str]] = None,
    lookup_mode: str = "unknown",
    possible_book_titles: Optional[List[str]] = None,
) -> Dict[str, Any]:
    enriched_query = " ".join(part for part in [query, preference_context] if part).strip()

    # Bước 1: Ưu tiên tuyệt đối tìm kiếm sách trong CSDL thư viện nội bộ trước
    library_books = search_books(q=enriched_query or query, limit=limit)
    if not library_books and preference_context:
        library_books = search_books(q=query, limit=limit)
    
    # Nếu tìm thấy sách trong thư viện, trả về kết quả ngay lập tức
    if library_books:
        return {
            "suggested_books": _dedupe_books(library_books, limit, borrowed_book_ids),
            "external_suggestions": [],
            "suggestion_context": {
                "type": "direct_library_matches",
                "lookup_mode": lookup_mode
            },
        }

    # Bước 2: Chỉ khi CSDL thư viện trống, mới thực hiện Fallback tìm kiếm ngoài Web
    if lookup_mode == "description_discovery":
        web_candidates = web_search_books(query, max_results=5)
        candidates = _dedupe_candidates(web_candidates + _candidates_from_titles(possible_book_titles or []), limit=8)
        verified = verify_books_in_library(candidates)
        found_from_web = verified.get("found", [])
        missing = verified.get("missing", [])

        if found_from_web:
            return {
                "suggested_books": _dedupe_books(found_from_web, limit, borrowed_book_ids),
                "external_suggestions": [],
                "suggestion_context": {"type": "web_verified_library_matches", "lookup_mode": lookup_mode},
            }

        return {
            "suggested_books": [],
            "external_suggestions": missing[:5] or candidates[:5],
            "suggestion_context": {
                "type": "missing_without_alternatives",
                "lookup_mode": lookup_mode,
                "missing_title": (missing or candidates or [{}])[0].get("title"),
            },
        }

    web_candidates = web_search_books(query, max_results=5)
    verified = verify_books_in_library(web_candidates)
    found_from_web = verified.get("found", [])
    missing = verified.get("missing", [])

    if found_from_web:
        return {
            "suggested_books": _dedupe_books(found_from_web, limit, borrowed_book_ids),
            "external_suggestions": [],
            "suggestion_context": {"type": "web_verified_library_matches"},
        }

    # Thu vien khong co tac pham do: tim sach lien quan bang query goc va cac tu khoa trong title web.
    related_queries = [query, preference_context]
    for item in missing[:3]:
        title = item.get("title", "")
        if title:
            related_queries.append(title)

    related_books: List[Dict[str, Any]] = []
    for related_query in related_queries:
        related_books.extend(search_books(q=related_query, limit=limit))

    return {
        "suggested_books": _dedupe_books(related_books, limit, borrowed_book_ids),
        "external_suggestions": missing[:5],
        "suggestion_context": {
            "type": "related_alternatives" if related_books else "missing_without_alternatives",
            "missing_title": missing[0].get("title") if missing else None,
        },
    }
