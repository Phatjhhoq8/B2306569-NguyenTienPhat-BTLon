# Chuc nang: Skill tim sach theo mo ta, fallback web va goi y sach lien quan trong thu vien.

from typing import Any, Dict, List, Optional
from tools.search_books import search_books
from tools.web_search_books import web_search_books
from tools.verify_books_in_library import verify_books_in_library


def _dedupe_books(books: List[Dict[str, Any]], limit: int = 10, exclude_ids: Optional[List[str]] = None) -> List[Dict[str, Any]]:
    seen = set()
    excluded = set(exclude_ids or [])
    output = []
    for book in books:
        book_id = book.get("_id")
        if book_id and book_id not in seen and book_id not in excluded:
            seen.add(book_id)
            output.append(book)
        if len(output) >= limit:
            break
    return output


def find_books_for_query(
    query: str,
    limit: int = 10,
    preference_context: str = "",
    borrowed_book_ids: Optional[List[str]] = None,
) -> Dict[str, Any]:
    enriched_query = " ".join(part for part in [query, preference_context] if part).strip()
    library_books = search_books(q=enriched_query or query, limit=limit)
    if not library_books and preference_context:
        library_books = search_books(q=query, limit=limit)
    if library_books:
        return {
            "suggested_books": _dedupe_books(library_books, limit, borrowed_book_ids),
            "external_suggestions": [],
            "suggestion_context": {"type": "direct_library_matches"},
        }

    web_candidates = web_search_books(query, max_results=5)
    verified = verify_books_in_library(web_candidates)
    found_from_web = verified.get("found", [])
    missing = verified.get("missing", [])

    if found_from_web:
        return {
            "suggested_books": _dedupe_books(found_from_web, limit, borrowed_book_ids),
            "external_suggestions": missing[:3],
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
