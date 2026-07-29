# Chuc nang: QueryReformAgent chuan hoa cau hoi thu vien.

from typing import Dict, Any, List
from pydantic import BaseModel, Field
from agents.base import BaseAgent
from state import AgentState
from config import DEFAULT_PROVIDER, MODEL_LIGHTWEIGHT_GPT, MODEL_LIGHTWEIGHT_GEMINI, get_ai_model


class MissingInfoItem(BaseModel):
    field: str = Field(description="Thong tin con thieu.")
    suggestion: str = Field(description="Cau hoi ngan de lam ro.")


class QueryReformOutput(BaseModel):
    refined_query: str = Field(description="Cau hoi da chuan hoa, giu nguyen y dinh nguoi dung.")
    detected_entities: List[str] = Field(default_factory=list, description="Tu khoa sach, tac gia, nhan vat, the loai, goi hoi vien.")
    book_lookup_mode: str = Field(
        default="unknown",
        description="Neu la tim sach: 'known_title' khi nguoi dung da neu ten sach/tac pham ro; 'description_discovery' khi nguoi dung mo ta nhan vat, cot truyen, boi canh de hoi do la sach/truyen gi; nguoc lai 'unknown'.",
    )
    possible_book_titles: List[str] = Field(
        default_factory=list,
        description="Ten sach/tac pham co the suy ra tu mo ta, neu co. Chi dua ten tac pham, khong dua cau giai thich.",
    )
    original_query: str
    confidence: float = Field(description="Do ro rang 0-1.")
    missing_info: List[MissingInfoItem] = Field(default_factory=list)


class QueryReformAgent(BaseAgent):
    def __init__(self, provider: str = DEFAULT_PROVIDER):
        goal_context = (
            "Ban la chuyen gia phan tich ngon ngu cho tro ly thu vien sach online. "
            "Hay sua loi chinh ta, mo rong viet tat (dk/dang ky, tk/tai khoan, goi/goi hoi vien), "
            "trich xuat tu khoa ve ten sach, tac gia, the loai, nhan vat, cot truyen, boi canh, mood doc va nhu cau goi hoi vien. "
            "Voi truy van tim sach, phan biet ro: known_title neu nguoi dung da neu ten sach/tac pham; "
            "description_discovery neu nguoi dung dang mo ta nhan vat, dac diem, tinh tiet, boi canh de hoi do la truyen/sach/tac pham gi. "
            "Neu tu mo ta co the nhan dien tac pham, dien ten vao possible_book_titles nhung van giu book_lookup_mode la description_discovery. "
            "Khong tra loi cau hoi. Neu nguoi dung mo ta sach mo ho nhung van co the tim bang keyword, dung confidence >= 0.70. "
            "Chi hoi lai khi cau qua ngan den muc khong biet muon tim sach, dang ky hay hoi goi."
        )
        super().__init__(goal_context, "Chi chuan hoa dau vao, khong tra loi.", [], QueryReformOutput)
        self.provider = provider

    def run(self, state: AgentState) -> Dict[str, Any]:
        raw_query = state.get("raw_query", "")
        history_messages = state.get("messages", [])
        model_name = MODEL_LIGHTWEIGHT_GPT if self.provider == "openai" else MODEL_LIGHTWEIGHT_GEMINI

        history_text = ""
        if history_messages:
            formatted = []
            for msg in history_messages[-8:]:
                role = "Nguoi dung" if (isinstance(msg, dict) and msg.get("role") == "user") or getattr(msg, "type", "") == "human" else "Tro ly"
                content = getattr(msg, "content", "") or (msg.get("content") if isinstance(msg, dict) else str(msg))
                formatted.append(f"{role}: {content}")
            history_text = "Lich su gan day:\n" + "\n".join(formatted)

        try:
            model = get_ai_model(model_name, provider=self.provider)
            raw_output = model.generate(
                [
                    {"role": "system", "content": self.goal_context},
                    {"role": "user", "content": f"{history_text}\nCau hoi moi: {raw_query}"},
                ],
                response_schema=self.output_schema,
            )
            return self.output_schema.model_validate_json(raw_output).model_dump()
        except Exception as e:
            print(f"[WARNING] QueryReform fallback: {e}")
            return {
                "refined_query": raw_query,
                "detected_entities": [],
                "book_lookup_mode": "unknown",
                "possible_book_titles": [],
                "original_query": raw_query,
                "confidence": 0.8 if len(raw_query.strip()) > 3 else 0.4,
                "missing_info": [],
            }
