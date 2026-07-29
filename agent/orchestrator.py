# Chuc nang: OrchestratorAgent phan loai intent va dieu phoi agent thu vien.

from typing import Dict, Any, List
from pydantic import BaseModel, Field
from state import AgentState
from config import DEFAULT_PROVIDER, MODEL_ORCHESTRATOR_GPT, MODEL_ORCHESTRATOR_GEMINI, get_ai_model
from domain_registry import format_domain_table, format_domain_examples, get_fallback_domain


class OrchestratorOutput(BaseModel):
    intent: str = Field(description="'chitchat', 'book_recommendation' hoac 'registration_selection'.")
    detected_domains: List[str] = Field(default_factory=list, description="Domain nghiep vu lien quan.")


class OrchestratorAgent:
    def __init__(self, provider: str = DEFAULT_PROVIDER):
        self.provider = provider
        self.output_schema = OrchestratorOutput
        self.goal_context = (
            "Ban la Orchestrator tang 3 cua tro ly thu vien CTU eLibrary. Nhiem vu duy nhat la phan loai intent va dieu phoi.\n"
            "Cac intent hop le:\n"
            "- chitchat: chao hoi, cam on, tam biet, hoi ngoai le ngan.\n"
            "- book_recommendation: tim/goi y sach, mo ta cot truyen, nhan vat, the loai, sach tuong tu, khong nho ten sach.\n"
            "- registration_selection: dang ky tai khoan, lua sach theo thao tac, hoi goi hoi vien, so sanh goi, chon goi.\n\n"
            "Registry domain:\n"
            f"{format_domain_table()}\n\n"
            f"Vi du:\n{format_domain_examples()}\n\n"
            "Neu khong chac giua chitchat va nghiep vu thu vien, hay chon nghiep vu thu vien gan nhat."
        )

    def run(self, state: AgentState) -> Dict[str, Any]:
        query_text = state.get("refined_query") or state.get("raw_query", "")
        model_name = MODEL_ORCHESTRATOR_GPT if self.provider == "openai" else MODEL_ORCHESTRATOR_GEMINI
        try:
            model = get_ai_model(model_name, provider=self.provider)
            raw_output = model.generate(
                [
                    {"role": "system", "content": self.goal_context},
                    {"role": "user", "content": f"Cau hoi: {query_text}"},
                ],
                response_schema=self.output_schema,
            )
            parsed = self.output_schema.model_validate_json(raw_output)
            data = parsed.model_dump()
        except Exception as e:
            print(f"[WARNING] Orchestrator fallback: {e}")
            q = query_text.lower()
            membership_words = ["gói hội viên", "goi hoi vien", "hội viên", "hoi vien", "premium", "thanh toán", "thanh toan", "đăng ký", "dang ky", "tài khoản", "tai khoan", "nâng cấp", "nang cap"]
            book_words = ["sach", "sách", "truyen", "truyện", "nhân vật", "nhan vat", "cốt truyện", "cot truyen", "tác phẩm", "tac pham", "gợi ý", "goi y", "tìm", "tim"]
            if any(w in q for w in membership_words):
                data = {"intent": "registration_selection", "detected_domains": ["registration_selection"]}
            elif any(w in q for w in book_words):
                data = {"intent": "book_recommendation", "detected_domains": ["book_recommendation"]}
            else:
                data = {"intent": "chitchat", "detected_domains": []}

        if data.get("intent") == "book_recommendation" and not data.get("detected_domains"):
            data["detected_domains"] = [get_fallback_domain()]
        if data.get("intent") == "registration_selection" and not data.get("detected_domains"):
            data["detected_domains"] = ["registration_selection"]
        return data
