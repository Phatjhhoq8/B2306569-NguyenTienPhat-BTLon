# Chuc nang: Smoke tests cho graph tro ly thu vien 3 tang.

import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from graph import build_graph


def test_graph_builds():
    app = build_graph()
    assert app is not None


def test_chitchat_flow_runs():
    app = build_graph()
    state = {
        "user_id": "test_user",
        "user_profile": {},
        "messages": [],
        "raw_query": "Chao ban",
        "refined_query": "",
        "intent": "chitchat",
        "detected_domains": [],
        "domain_outputs": {},
        "draft_answer": "",
        "suggested_books": [],
        "external_suggestions": [],
        "membership_plans": [],
        "plan_comparison": {},
        "ui_action": {},
        "ui_payload": {},
    }
    final_state = app.invoke(state)
    assert final_state.get("draft_answer")
