# Chuc nang: RegistrationSelectionAgent ho tro dang ky tai khoan, lua sach va goi hoi vien.

from typing import Dict, Any, List
from pydantic import BaseModel, Field
from agents.base import BaseAgent
from state import AgentState
from skills.account_guidance import get_reader_registration_guidance
from skills.membership_comparison import compare_membership_plans
from config import DEFAULT_PROVIDER, MODEL_LIGHTWEIGHT_GPT, MODEL_LIGHTWEIGHT_GEMINI, get_ai_model


class RegistrationSelectionOutput(BaseModel):
    draft_answer: str
    membership_plans: List[Dict[str, Any]] = Field(default_factory=list)
    plan_comparison: Dict[str, Any] = Field(default_factory=dict)
    ui_action: Dict[str, Any] = Field(default_factory=dict)


class RegistrationSelectionAgent(BaseAgent):
    def __init__(self, provider: str = DEFAULT_PROVIDER):
        super().__init__(
            goal_context="Agent ho tro dang ky tai khoan, lua sach va tu van goi hoi vien.",
            task_boundary="Khong tu dang ky goi, khong thanh toan, khong submit thay nguoi dung.",
            skills_tools=["account_guidance", "membership_comparison", "get_membership_plans"],
            output_schema=RegistrationSelectionOutput,
        )
        self.provider = provider

    def run(self, state: AgentState) -> Dict[str, Any]:
        query = (state.get("refined_query") or state.get("raw_query", "")).lower()
        membership_keywords = ["goi", "gói", "hoi vien", "hội viên", "premium", "thanh toan", "thanh toán", "nang cap", "nâng cấp"]

        if any(word in query for word in membership_keywords):
            comparison = compare_membership_plans()
            plans = comparison.get("membership_plans", [])
            
            if plans:
                # Chuẩn bị dữ liệu mô tả các gói hội viên gửi lên LLM
                plans_info = []
                for p in plans:
                    pros = ", ".join(p.get("pros_cons", {}).get("pros", []))
                    cons = ", ".join(p.get("pros_cons", {}).get("cons", []))
                    plans_info.append(
                        f"- Gói: {p.get('tenGoi')}\n"
                        f"  Giá đăng ký: {p.get('formatted_price')}\n"
                        f"  Hạn mức mượn tối đa: {p.get('soSachToiDa')} cuốn sách cùng lúc\n"
                        f"  Hạn mượn tối đa: {p.get('soNgayMuonToiDa')} ngày\n"
                        f"  Phí mượn sách giấy: {p.get('phiMuonSachGiay')} VNĐ\n"
                        f"  Phí phạt trễ hạn/ngày: {p.get('phiPhatTreHan')} VNĐ\n"
                        f"  Ưu điểm vượt trội: {pros}\n"
                        f"  Hạn chế: {cons}\n"
                    )
                plans_data_str = "\n".join(plans_info)

                system_prompt = (
                    "Bạn là trợ lý AI thông minh CTU eLibrary của thư viện trường.\n"
                    "Nhiệm vụ của bạn là tư vấn, so sánh các gói hội viên dựa trên câu hỏi của độc giả "
                    "và thông tin các gói hội viên thực tế được cung cấp dưới đây.\n\n"
                    "Yêu cầu phản hồi:\n"
                    "1. Hãy trả lời cực kỳ thân thiện, tự nhiên, đi thẳng vào câu hỏi của độc giả (ví dụ: so sánh các gói, khuyên chọn gói nào, hoặc giải thích gói VIP và Pro khác nhau thế nào).\n"
                    "2. Phân tích điểm mạnh, điểm yếu dựa trên thông tin được cung cấp để giúp người dùng đưa ra lựa chọn sáng suốt.\n"
                    "3. Ở cuối câu trả lời, hãy hướng dẫn độc giả rằng họ có thể chọn một gói hội viên và nhấn nút \"Tiếp tục đến xác nhận thanh toán\" bên dưới để kích hoạt trực tiếp ngay tại đây.\n\n"
                    "DANH SÁCH GÓI HỘI VIÊN THỰC TẾ CỦA THƯ VIỆN:\n"
                    f"{plans_data_str}"
                )

                model_name = MODEL_LIGHTWEIGHT_GPT if self.provider == "openai" else MODEL_LIGHTWEIGHT_GEMINI
                try:
                    model = get_ai_model(model_name, provider=self.provider)
                    draft_answer = model.generate(
                        [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": f"Câu hỏi của độc giả: '{state.get('raw_query')}'"}
                        ]
                    )
                    answer = draft_answer.strip()
                except Exception as e:
                    print(f"[WARNING] LLM generation in RegistrationSelectionAgent failed: {e}")
                    summary_lines = []
                    for p in plans:
                        name = p.get("tenGoi")
                        price = p.get("formatted_price")
                        max_books = p.get("soSachToiDa")
                        max_days = p.get("soNgayMuonToiDa")
                        summary_lines.append(f"- Gói **{name}** ({price}): Mượn tối đa {max_books} sách trong {max_days} ngày.")
                    comparison_text = "\n".join(summary_lines)
                    answer = (
                        "Dưới đây là phần so sánh các gói hội viên hiện có tại thư viện để bạn dễ dàng lựa chọn:\n\n"
                        f"{comparison_text}\n\n"
                        "Bạn có thể chọn một gói và nhấn nút **\"Tiếp tục đến xác nhận thanh toán\"** bên dưới để kích hoạt trực tiếp ngay tại đây nhé!"
                    )
            else:
                answer = "Mình chưa lấy được danh sách gói hội viên từ hệ thống vào lúc này. Bạn có thể thử lại sau hoặc truy cập trực tiếp trang Gói Hội Viên để xem nhé."

            return {
                "draft_answer": answer,
                "membership_plans": plans,
                "plan_comparison": comparison.get("plan_comparison", {}),
                "ui_action": {"type": "CONFIRM_MEMBERSHIP_PLAN", "requires_user_confirmation": True},
            }

        return {
            "draft_answer": get_reader_registration_guidance(),
            "membership_plans": [],
            "plan_comparison": {},
            "ui_action": {"type": "OPEN_REGISTER_PAGE", "requires_user_confirmation": True},
        }
