# Chuc nang: Khai bao registry domain cho tro ly thu vien.

from typing import Dict, List, Any


DOMAIN_REGISTRY: Dict[str, Dict[str, Any]] = {
    "book_recommendation": {
        "display_name": "Goi y va tim sach",
        "node_name": "recommendation_node",
        "fallback_priority": 10,
        "scope": (
            "Tim sach theo ten, tac gia, the loai, mo ta cot truyen, nhan vat, boi canh, "
            "tam trang doc hoac cac sach tuong tu. Neu CSDL khong co, co the dung web search "
            "de tim ten tac pham roi kiem tra lai trong thu vien."
        ),
        "positive_examples": [
            "Toi muon sach co nhan vat tham tu pha an",
            "Tim truyen co nhom ban di phieu luu",
            "Goi y sach chua lanh nhe nhang",
        ],
    },
    "registration_selection": {
        "display_name": "Dang ky tai khoan, lua sach va goi hoi vien",
        "node_name": "registration_selection_node",
        "fallback_priority": 20,
        "scope": (
            "Huong dan dang ky tai khoan doc gia, cach lua sach, tu van goi hoi vien, "
            "so sanh uu/nhuoc diem tung goi va dua nguoi dung den buoc xac nhan thanh toan."
        ),
        "positive_examples": [
            "Dang ky tai khoan nhu the nao?",
            "So sanh cac goi hoi vien giup toi",
            "Toi chon goi Premium",
        ],
    },
}


def get_domain_keys() -> List[str]:
    return list(DOMAIN_REGISTRY.keys())


def get_fallback_domain() -> str:
    return sorted(DOMAIN_REGISTRY.items(), key=lambda item: item[1].get("fallback_priority", 999))[0][0]


def format_domain_table() -> str:
    rows = ["| Domain | Ten hien thi | Pham vi bao phu |", "|---|---|---|"]
    for key, meta in DOMAIN_REGISTRY.items():
        rows.append(f"| '{key}' | {meta['display_name']} | {meta['scope']} |")
    return "\n".join(rows)


def format_domain_examples() -> str:
    blocks = []
    for key, meta in DOMAIN_REGISTRY.items():
        examples = "; ".join(meta.get("positive_examples", []))
        blocks.append(f"- {key}: {examples}")
    return "\n".join(blocks)


def format_domain_key_list() -> str:
    return ", ".join(f"'{key}'" for key in get_domain_keys())
