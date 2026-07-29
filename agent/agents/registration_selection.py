# Chuc nang: RegistrationSelectionAgent ho tro dang ky tai khoan, lua sach va goi hoi vien.

from typing import Dict, Any, List
from pydantic import BaseModel, Field
from agents.base import BaseAgent
from state import AgentState
from skills.account_guidance import get_reader_registration_guidance
from skills.membership_comparison import compare_membership_plans


class RegistrationSelectionOutput(BaseModel):
    draft_answer: str
    membership_plans: List[Dict[str, Any]] = Field(default_factory=list)
    plan_comparison: Dict[str, Any] = Field(default_factory=dict)
    ui_action: Dict[str, Any] = Field(default_factory=dict)


class RegistrationSelectionAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            goal_context="Agent ho tro dang ky tai khoan, lua sach va tu van goi hoi vien.",
            task_boundary="Khong tu dang ky goi, khong thanh toan, khong submit thay nguoi dung.",
            skills_tools=["account_guidance", "membership_comparison", "get_membership_plans"],
            output_schema=RegistrationSelectionOutput,
        )

    def run(self, state: AgentState) -> Dict[str, Any]:
        query = (state.get("refined_query") or state.get("raw_query", "")).lower()
        membership_keywords = ["goi", "gói", "hoi vien", "hội viên", "premium", "thanh toan", "thanh toán", "nang cap", "nâng cấp"]

        if any(word in query for word in membership_keywords):
            comparison = compare_membership_plans()
            plans = comparison.get("membership_plans", [])
            answer = (
                "Minh da lay danh sach goi hoi vien hien co va so sanh uu/nhuoc diem tung goi ben duoi. "
                "Ban co the chon goi phu hop; he thong chi dua ban den buoc xac nhan thanh toan va ban phai tu bam xac nhan neu dong y."
            )
            if not plans:
                answer = "Minh chua lay duoc danh sach goi hoi vien tu he thong. Ban co the thu lai sau hoac vao trang Goi hoi vien de xem truc tiep."
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
