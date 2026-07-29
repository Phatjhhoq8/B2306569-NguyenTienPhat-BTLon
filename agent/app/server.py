# Chức năng: Máy chủ HTTP phục vụ API chat cho widget AI trong frontend chính.
# Link trích dẫn: https://github.com/HalogenFlo/TIC_-Hugging_Face_Models_Mastery_RD

import os
import sys
import json
import http.server
from typing import Dict, Any, List

# Thêm thư mục gốc vào PYTHONPATH
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from graph import build_graph
from memory.preference_store import (
    load_user_preferences,
    update_preferences_from_borrowed_books,
    update_preferences_from_query,
)

PORT = int(os.getenv("PORT", 8088))
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

def merge_state(current_state: dict, update: dict) -> dict:
    """Gộp state thủ công tương thích với các reducer định nghĩa trong state.py."""
    new_state = dict(current_state)
    for key, val in update.items():
        if key in ["detected_domains", "suggested_books", "external_suggestions", "membership_plans"]:
            new_state[key] = (new_state.get(key) or []) + (val or [])
        elif key in ["domain_outputs", "plan_comparison", "ui_action", "ui_payload"]:
            new_state[key] = {**(new_state.get(key) or {}), **(val or {})}
        else:
            new_state[key] = val
    return new_state

class WebUIRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Handler xử lý phục vụ trang chủ index.html và API endpoint chat."""

    def __init__(self, *args, **kwargs):
        # Thiết lập thư mục phục vụ static files là thư mục app/
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        """Xử lý định tuyến cho yêu cầu GET static files."""
        if self.path in ["/", "/index.html"]:
            self.path = "/index.html"
            return super().do_GET()
        return super().do_GET()

    def _send_cors_headers(self):
        origin = self.headers.get('Origin') or '*'
        self.send_header('Access-Control-Allow-Origin', origin)
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Allow-Credentials', 'true')

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def do_POST(self):
        """Xử lý API Endpoint POST cho giao dịch chat hoặc xuất tin nhắn."""
        if self.path == "/api/chat":
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                request_json = json.loads(post_data.decode('utf-8'))
                raw_query = request_json.get("raw_query", "").strip()
                user_id = request_json.get("user_id", "").strip()
                if not user_id:
                    self.send_response(401)
                    self.send_header('Content-Type', 'application/json; charset=utf-8')
                    self._send_cors_headers()
                    self.end_headers()
                    self.wfile.write(json.dumps({"success": False, "error": "Bạn cần đăng nhập để sử dụng trợ lý AI."}, ensure_ascii=False).encode('utf-8'))
                    return
                previous_state = request_json.get("state", {})
                
                print(f"\n==================================================")
                print(f"[CHAT REQUEST] User ID: {user_id} | Question: '{raw_query}'")
                print(f"==================================================")
                sys.stdout.flush()
                
                # 1. Khôi phục danh sách tin nhắn lịch sử
                previous_messages = (previous_state.get("messages", []) or [])[-4:]
                borrowed_books = request_json.get("borrowed_books", []) or []
                stored_profile = load_user_preferences(user_id)
                if borrowed_books:
                    stored_profile = update_preferences_from_borrowed_books(user_id, borrowed_books)
                
                # 1. Khởi tạo/Khôi phục state hội thoại
                state = {
                    "user_id": user_id,
                    "user_profile": stored_profile,
                    "borrowed_books": borrowed_books,
                    "messages": previous_messages,
                    "raw_query": raw_query,
                    "refined_query": previous_state.get("refined_query", ""),
                    "book_lookup_mode": previous_state.get("book_lookup_mode", "unknown"),
                    "possible_book_titles": previous_state.get("possible_book_titles", []),
                    "intent": previous_state.get("intent", "chitchat"),
                    "clarification_count": previous_state.get("clarification_count", 0),
                    "detected_domains": previous_state.get("detected_domains", []),
                    "domain_outputs": previous_state.get("domain_outputs", {}),
                    "draft_answer": previous_state.get("draft_answer", ""),
                    "suggested_books": [],
                    "external_suggestions": [],
                    "membership_plans": [],
                    "plan_comparison": previous_state.get("plan_comparison", {}),
                    "ui_action": previous_state.get("ui_action", {}),
                    "ui_payload": previous_state.get("ui_payload", {}),
                    "human_feedback": previous_state.get("human_feedback", ""),
                    "reply_to_message": request_json.get("reply_to_message")
                }
                
                # Cập nhật thông tin làm rõ nếu lượt trước là clarification
                if previous_state.get("intent") == "clarification":
                    state["raw_query"] = f"{previous_state.get('raw_query')} (Thông tin bổ sung: {raw_query})"
                    state["intent"] = "chitchat"
                
                # 2. Xây dựng và chạy đồ thị LangGraph
                app = build_graph()
                final_state = state
                nodes_executed = []
                
                # Stream đồ thị và ghi nhận các Node thực thi
                for output in app.stream(state):
                    for node_name, node_output in output.items():
                        nodes_executed.append(node_name)
                        print(f" -> [EXECUTE NODE]: {node_name}")
                        sys.stdout.flush()
                        final_state = merge_state(final_state, node_output)
                
                # Cập nhật tin nhắn lượt hiện tại vào lịch sử messages
                updated_messages = list(previous_messages)[-4:]
                updated_messages.append({"role": "user", "content": raw_query})
                if final_state.get("draft_answer"):
                    updated_messages.append({"role": "assistant", "content": final_state.get("draft_answer")})
                final_state["messages"] = updated_messages[-4:]
                
                # 3. Cap nhat so thich doc sach tu cau hoi hien tai
                if final_state.get("intent") != "clarification" and final_state.get("draft_answer"):
                    final_state["user_profile"] = update_preferences_from_query(user_id, raw_query)
                
                print(f"[CHAT SUCCESS] Executed {len(nodes_executed)} nodes: {nodes_executed}")
                print(f"==================================================\n")
                sys.stdout.flush()
                
                # Tạo payload kết quả phản hồi
                response_data = {
                    "success": True,
                    "nodes_executed": nodes_executed,
                    "draft_answer": final_state.get("draft_answer"),
                    "intent": final_state.get("intent"),
                    "human_feedback": final_state.get("human_feedback"),
                    "detected_domains": final_state.get("detected_domains"),
                    "suggested_books": final_state.get("suggested_books", []),
                    "external_suggestions": final_state.get("external_suggestions", []),
                    "membership_plans": final_state.get("membership_plans", []),
                    "plan_comparison": final_state.get("plan_comparison", {}),
                    "action": final_state.get("ui_action", {}),
                    "ui_payload": final_state.get("ui_payload", {}),
                    # Trả lại state dạng rút gọn để frontend lưu trữ duy trì phiên tiếp theo
                    "state": {
                        "user_profile": final_state.get("user_profile"),
                        "messages": (final_state.get("messages", []) or [])[-4:],
                        "raw_query": final_state.get("raw_query"),
                        "refined_query": final_state.get("refined_query"),
                        "book_lookup_mode": final_state.get("book_lookup_mode"),
                        "possible_book_titles": final_state.get("possible_book_titles"),
                        "intent": final_state.get("intent"),
                        "clarification_count": final_state.get("clarification_count"),
                        "detected_domains": final_state.get("detected_domains"),
                        "draft_answer": final_state.get("draft_answer"),
                        "plan_comparison": final_state.get("plan_comparison"),
                        "ui_action": final_state.get("ui_action"),
                        "ui_payload": final_state.get("ui_payload"),
                        "human_feedback": final_state.get("human_feedback"),
                        "reply_to_message": None
                    }
                }
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode('utf-8'))
                
            except Exception as e:
                import traceback
                print(f"\n[CHAT ERROR] Exception occurred during chat execution:")
                traceback.print_exc()
                sys.stdout.flush()
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}, ensure_ascii=False).encode('utf-8'))
        else:
            self.send_response(404)
            self._send_cors_headers()
            self.end_headers()

def run_server():
    server_address = ('', PORT)
    httpd = http.server.HTTPServer(server_address, WebUIRequestHandler)
    print(f"\n[INFO] Web UI Server is running at: http://localhost:{PORT}")
    print("[INFO] Press Ctrl+C to stop the server.\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[INFO] Stopping server...")
        httpd.server_close()

if __name__ == "__main__":
    run_server()
