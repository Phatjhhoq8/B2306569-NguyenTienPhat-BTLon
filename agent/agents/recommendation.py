# Chuc nang: RecommendationAgent goi y va tim sach tu CSDL, fallback web neu can.

from typing import Dict, Any, List
from pydantic import BaseModel, Field
from agents.base import BaseAgent
from state import AgentState
from skills.book_matching import find_books_for_query
from memory.preference_store import build_preference_context


class RecommendationOutput(BaseModel):
    draft_answer: str
    suggested_books: List[Dict[str, Any]] = Field(default_factory=list)
    external_suggestions: List[Dict[str, Any]] = Field(default_factory=list)
    suggestion_context: Dict[str, Any] = Field(default_factory=dict)


class RecommendationAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            goal_context="Agent goi y sach cua thu vien online.",
            task_boundary="Chi goi y sach. Sach cho phep chon phai co trong CSDL.",
            skills_tools=["book_matching", "search_books", "web_search_books", "verify_books_in_library"],
            output_schema=RecommendationOutput,
        )

    def run(self, state: AgentState) -> Dict[str, Any]:
        query = state.get("refined_query") or state.get("raw_query", "")
        user_id = state.get("user_id", "web_user_01")
        preference_context = build_preference_context(user_id)
        borrowed_book_ids = [book.get("_id") for book in state.get("borrowed_books", []) if book.get("_id")]
        result = find_books_for_query(query, preference_context=preference_context, borrowed_book_ids=borrowed_book_ids)
        books = result.get("suggested_books", [])
        external = result.get("external_suggestions", [])
        context = result.get("suggestion_context", {})
        context_type = context.get("type")

        if context_type == "direct_library_matches":
            answer = "Minh tim thay mot so sach trong thu vien phu hop voi yeu cau cua ban. Ban co the chon mot hoac nhieu cuon ben duoi."
        elif context_type == "web_verified_library_matches":
            answer = "Minh da doi chieu ket qua tim kiem va tim thay mot so sach co trong thu vien phu hop voi mo ta cua ban."
        elif context_type == "related_alternatives":
            missing_title = context.get("missing_title")
            if missing_title:
                answer = f"Thu vien hien chua co tac pham '{missing_title}'. Tuy nhien, minh tim duoc mot so sach lien quan trong thu vien de ban tham khao."
            else:
                answer = "Thu vien hien chua co dung tac pham ban mo ta, nhung co mot so sach lien quan de ban tham khao."
        else:
            answer = "Minh chua tim thay sach phu hop trong thu vien. Neu ban nho them ten nhan vat, boi canh hoac the loai, minh se tim tiep cho ban."
            if external:
                answer = "Minh tim thay mot so tac pham co ve lien quan tren web, nhung thu vien hien chua co cac sach nay trong CSDL."

        return {
            "draft_answer": answer,
            "suggested_books": books,
            "external_suggestions": external,
            "suggestion_context": context,
        }
