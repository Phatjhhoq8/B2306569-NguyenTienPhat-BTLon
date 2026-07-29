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
        result = find_books_for_query(
            query,
            preference_context=preference_context,
            borrowed_book_ids=borrowed_book_ids,
            lookup_mode=state.get("book_lookup_mode", "unknown"),
            possible_book_titles=state.get("possible_book_titles", []),
        )
        books = result.get("suggested_books", [])
        external = result.get("external_suggestions", [])
        context = result.get("suggestion_context", {})
        context_type = context.get("type")

        if context_type == "direct_library_matches":
            answer = "Mình tìm thấy một số cuốn sách trong thư viện phù hợp với yêu cầu của bạn. Bạn có thể chọn một hoặc nhiều cuốn bên dưới."
        elif context_type == "web_verified_library_matches":
            answer = "Mình đã tìm tên tác phẩm từ mô tả của bạn, đối chiếu lại CSDL và tìm thấy sách trong thư viện. Bạn có thể chọn sách bên dưới."
        elif context_type == "related_alternatives":
            missing_title = context.get("missing_title")
            if missing_title:
                answer = f"Thư viện hiện chưa có tác phẩm '{missing_title}'. Tuy nhiên, mình tìm thấy một số đầu sách liên quan hiện có tại thư viện để bạn tham khảo."
            else:
                answer = "Thư viện hiện chưa có đúng tác phẩm bạn mô tả, nhưng có một số đầu sách tương tự rất hay để bạn tham khảo."
        else:
            answer = "Mình chưa tìm thấy sách phù hợp trong thư viện. Nếu bạn nhớ thêm tên nhân vật, bối cảnh hoặc thể loại, mình sẽ tiếp tục tìm kiếm cho bạn."
            if external:
                answer = "Mình tìm thấy một số tác phẩm phù hợp mô tả trên Internet, nhưng thư viện chưa nhập các sách này về CSDL. Mình chỉ hiện tên và tóm tắt ngắn để bạn tham khảo chứ không cho chọn mượn."

        return {
            "draft_answer": answer,
            "suggested_books": books,
            "external_suggestions": external,
            "suggestion_context": context,
        }
