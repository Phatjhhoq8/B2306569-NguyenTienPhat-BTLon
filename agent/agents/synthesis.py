# Chuc nang: SynthesisAgent dong goi cau tra loi va UI payload cho chat widget.

from typing import Dict, Any, List
from pydantic import BaseModel, Field
from agents.base import BaseAgent
from state import AgentState


class SynthesisOutput(BaseModel):
    final_answer: str
    suggested_books: List[Dict[str, Any]] = Field(default_factory=list)
    external_suggestions: List[Dict[str, Any]] = Field(default_factory=list)
    membership_plans: List[Dict[str, Any]] = Field(default_factory=list)
    plan_comparison: Dict[str, Any] = Field(default_factory=dict)
    ui_action: Dict[str, Any] = Field(default_factory=dict)
    ui_payload: Dict[str, Any] = Field(default_factory=dict)


class SynthesisAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            goal_context="Tong hop ket qua agent nghiep vu thanh response cho frontend.",
            task_boundary="Khong them thong tin khong co trong output tang 2.",
            skills_tools=[],
            output_schema=SynthesisOutput,
        )

    def run(self, state: AgentState) -> Dict[str, Any]:
        outputs = state.get("domain_outputs", {})
        selected = None
        if outputs:
            selected = next(iter(outputs.values()))
        selected = selected or {}

        suggested_books = selected.get("suggested_books", []) or state.get("suggested_books", []) or []
        external_suggestions = selected.get("external_suggestions", []) or state.get("external_suggestions", []) or []
        membership_plans = selected.get("membership_plans", []) or state.get("membership_plans", []) or []
        plan_comparison = selected.get("plan_comparison", {}) or state.get("plan_comparison", {}) or {}
        ui_action = selected.get("ui_action", {}) or state.get("ui_action", {}) or {}

        if suggested_books:
            payload_type = "book_carousel"
        elif membership_plans:
            payload_type = "membership_plans"
        elif external_suggestions:
            payload_type = "external_book_suggestions"
        else:
            payload_type = "text"

        return {
            "final_answer": selected.get("draft_answer") or state.get("draft_answer", ""),
            "suggested_books": suggested_books,
            "external_suggestions": external_suggestions,
            "membership_plans": membership_plans,
            "plan_comparison": plan_comparison,
            "ui_action": ui_action,
            "ui_payload": {
                "type": payload_type,
                "allow_multi_select": bool(suggested_books),
                "suggestion_context": selected.get("suggestion_context", {}),
            },
        }
