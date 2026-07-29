# CTU eLibrary Multi-Agent Assistant

He thong agent thu vien online duoc rut gon thanh 3 tang:

```text
Tang 3: Orchestrator / dieu phoi
Tang 2: Agents nghiep vu
Tang 1: Skills + Tools
```

Agent khong co Web UI rieng. Frontend chinh hien icon AI canh gio hang; bam icon se mo chat widget.

## Chuc nang

- Chat xa giao ngan gon.
- Goi y sach tu CSDL thu vien.
- Tim sach khi nguoi dung khong nho ten, chi mo ta cot truyen/nhan vat/boi canh/the loai.
- Neu CSDL khong co sach do, agent noi ro khong co va goi y sach lien quan trong CSDL neu tim duoc.
- Neu CSDL khong du ket qua, agent dung web search de tim ten tac pham, sau do kiem tra lai CSDL.
- Tu van dang ky tai khoan doc gia.
- Lay va so sanh goi hoi vien, chi dua den buoc xac nhan; khong tu dang ky/thanh toan.
- Luu so thich doc sach bang JSON local tu luot hoi va sach da muon; moi request chi giu 4 tin nhan gan nhat trong phien.

## Cai dat

```bash
pip install -r requirements.txt
```

Bien moi truong quan trong:

```text
OPENAI_API_KEY hoac GEMINI_API_KEY
LLM_PROVIDER=openai|gemini
LIBRARY_API_BASE=http://localhost:3000/api
PORT=8088
```

Frontend co the cau hinh:

```text
VITE_AGENT_API_URL=http://localhost:8088/api
```

## Chay API Agent

Tu thu muc `agent`:

```bash
python app/server.py
```

Endpoint chinh:

```text
POST http://localhost:8088/api/chat
```

Response co the gom:

```json
{
  "draft_answer": "...",
  "suggested_books": [],
  "external_suggestions": [],
  "membership_plans": [],
  "plan_comparison": {},
  "action": {},
  "ui_payload": {}
}
```

## Rang buoc

- Chi sach co `_id` trong CSDL moi duoc hien trong carousel chon/them gio.
- Sach web search nhung thu vien chua co chi hien tham khao.
- Agent khong co tool subscribe/payment/checkout.
- Nguoi dung phai tu bam xac nhan thanh toan tren frontend.
- Memory khong dung SQL/Redis/Neo4j. So thich doc sach luu tai `agent/data/user_preferences.json`.
