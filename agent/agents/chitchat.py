# Chuc nang: ChitchatAgent xu ly giao tiep xa giao cho tro ly thu vien.

from typing import Dict, Any, List
from pydantic import BaseModel, Field
from agents.base import BaseAgent
from state import AgentState
from config import DEFAULT_PROVIDER, MODEL_LIGHTWEIGHT_GPT, MODEL_LIGHTWEIGHT_GEMINI, get_ai_model


class ChitchatOutput(BaseModel):
    response: str = Field(description="Phan hoi ngan gon, than thien.")


class ChitchatAgent(BaseAgent):
    def __init__(self, provider: str = DEFAULT_PROVIDER):
        goal_context = (
            "Ban la tro ly thu vien CTU eLibrary. Tra loi chao hoi ngan gon, than thien, "
            "goi y nguoi dung co the hoi ve tim sach, mo ta cot truyen/nhan vat, dang ky tai khoan hoac goi hoi vien."
        )
        super().__init__(goal_context, "Chi chitchat ngan gon, khong bia thong tin sach/goi.", [], ChitchatOutput)
        self.provider = provider

    def run(self, state: AgentState) -> Dict[str, Any]:
        query = state.get("raw_query", "")
        model_name = MODEL_LIGHTWEIGHT_GPT if self.provider == "openai" else MODEL_LIGHTWEIGHT_GEMINI
        try:
            model = get_ai_model(model_name, provider=self.provider)
            raw_output = model.generate(
                [{"role": "system", "content": self.goal_context}, {"role": "user", "content": query}],
                response_schema=self.output_schema,
            )
            return self.output_schema.model_validate_json(raw_output).model_dump()
        except Exception:
            return {"response": "Xin chao! Minh co the giup ban tim sach theo mo ta, goi y sach, huong dan dang ky tai khoan hoac so sanh goi hoi vien."}
