import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from skills.book_matching import find_books_for_query

queries = ["Bố Già", "Harry Potter", "Mắt Biếc", "Hoàng Tử Bé", "Bí Mật Tối Thượng"]

for q in queries:
    print(f"\n=== QUERY: '{q}' ===")
    res = find_books_for_query(q)
    suggested = res.get("suggested_books", [])
    external = res.get("external_suggestions", [])
    context = res.get("suggestion_context", {})
    
    print(f"Suggestion Context: {context}")
    print(f"Suggested Books in Library ({len(suggested)}):")
    for b in suggested:
        print(f"  - [{b.get('_id')}] {b.get('tenSach')} | {b.get('tacGia')}")
    print(f"External Suggestions ({len(external)}):")
    for e in external:
        print(f"  - {e.get('title')} | {e.get('author')}")
