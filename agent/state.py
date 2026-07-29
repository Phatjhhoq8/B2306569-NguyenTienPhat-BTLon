# Chuc nang: Dinh nghia state dung chung cho LangGraph cua agent thu vien.

from typing import TypedDict, List, Dict, Any, Annotated, Optional
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


def merge_dict(left: Optional[Dict[str, Any]], right: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    return {**(left or {}), **(right or {})}


def merge_list(left: Optional[List[Any]], right: Optional[List[Any]]) -> List[Any]:
    return (left or []) + (right or [])


class AgentState(TypedDict, total=False):
    user_id: str
    user_profile: Dict[str, Any]
    borrowed_books: Annotated[List[Dict[str, Any]], merge_list]
    messages: Annotated[List[BaseMessage], add_messages]

    raw_query: str
    refined_query: str
    reply_to_message: Optional[Dict[str, Any]]

    intent: str
    detected_domains: Annotated[List[str], merge_list]
    clarification_count: int
    human_feedback: str

    domain_outputs: Annotated[Dict[str, Any], merge_dict]
    draft_answer: str

    suggested_books: Annotated[List[Dict[str, Any]], merge_list]
    external_suggestions: Annotated[List[Dict[str, Any]], merge_list]
    membership_plans: Annotated[List[Dict[str, Any]], merge_list]
    plan_comparison: Dict[str, Any]
    ui_action: Dict[str, Any]
    ui_payload: Dict[str, Any]
