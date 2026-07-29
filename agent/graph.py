# Chuc nang: LangGraph 3 tang cho tro ly thu vien.

from typing import Dict, Any
from langgraph.graph import StateGraph, END
from state import AgentState

from agents.query_reform import QueryReformAgent
from orchestrator import OrchestratorAgent
from agents.chitchat import ChitchatAgent
from agents.recommendation import RecommendationAgent
from agents.registration_selection import RegistrationSelectionAgent
from agents.synthesis import SynthesisAgent


def orchestrator_node(state: AgentState) -> Dict[str, Any]:
    reform = QueryReformAgent().run(state)
    refined_query = reform.get("refined_query", state.get("raw_query", ""))
    routed = OrchestratorAgent().run({**state, "refined_query": refined_query})
    return {
        "refined_query": refined_query,
        "book_lookup_mode": reform.get("book_lookup_mode", "unknown"),
        "possible_book_titles": reform.get("possible_book_titles", []),
        "intent": routed.get("intent", "chitchat"),
        "detected_domains": routed.get("detected_domains", []),
    }


def chitchat_node(state: AgentState) -> Dict[str, Any]:
    output = ChitchatAgent().run(state)
    return {"domain_outputs": {"chitchat": {"draft_answer": output.get("response", "")}}}


def recommendation_node(state: AgentState) -> Dict[str, Any]:
    output = RecommendationAgent().run(state)
    return {
        "domain_outputs": {"book_recommendation": output},
        "suggested_books": output.get("suggested_books", []),
        "external_suggestions": output.get("external_suggestions", []),
    }


def registration_selection_node(state: AgentState) -> Dict[str, Any]:
    output = RegistrationSelectionAgent().run(state)
    return {
        "domain_outputs": {"registration_selection": output},
        "membership_plans": output.get("membership_plans", []),
        "plan_comparison": output.get("plan_comparison", {}),
        "ui_action": output.get("ui_action", {}),
    }


def synthesis_node(state: AgentState) -> Dict[str, Any]:
    output = SynthesisAgent().run(state)
    return {
        "draft_answer": output.get("final_answer", ""),
        "suggested_books": output.get("suggested_books", []),
        "external_suggestions": output.get("external_suggestions", []),
        "membership_plans": output.get("membership_plans", []),
        "plan_comparison": output.get("plan_comparison", {}),
        "ui_action": output.get("ui_action", {}),
        "ui_payload": output.get("ui_payload", {}),
    }


def clear_raw_outputs_node(state: AgentState) -> Dict[str, Any]:
    return {"domain_outputs": {}}


def route_intent(state: AgentState) -> str:
    intent = state.get("intent", "chitchat")
    if intent == "book_recommendation":
        return "recommendation_node"
    if intent == "registration_selection":
        return "registration_selection_node"
    return "chitchat_node"


def build_graph() -> StateGraph:
    workflow = StateGraph(AgentState)

    workflow.add_node("orchestrator_node", orchestrator_node)
    workflow.add_node("chitchat_node", chitchat_node)
    workflow.add_node("recommendation_node", recommendation_node)
    workflow.add_node("registration_selection_node", registration_selection_node)
    workflow.add_node("synthesis_node", synthesis_node)
    workflow.add_node("clear_raw_outputs_node", clear_raw_outputs_node)

    workflow.set_entry_point("orchestrator_node")
    workflow.add_conditional_edges(
        "orchestrator_node",
        route_intent,
        {
            "chitchat_node": "chitchat_node",
            "recommendation_node": "recommendation_node",
            "registration_selection_node": "registration_selection_node",
        },
    )
    workflow.add_edge("chitchat_node", "synthesis_node")
    workflow.add_edge("recommendation_node", "synthesis_node")
    workflow.add_edge("registration_selection_node", "synthesis_node")
    workflow.add_edge("synthesis_node", "clear_raw_outputs_node")
    workflow.add_edge("clear_raw_outputs_node", END)

    return workflow.compile()
