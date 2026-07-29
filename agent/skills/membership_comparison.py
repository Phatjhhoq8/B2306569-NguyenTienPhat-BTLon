# Chuc nang: Skill doc va so sanh goi hoi vien.

import unicodedata
from typing import Any, Dict, List
from tools.get_membership_plans import get_membership_plans


def _format_price(value: Any) -> str:
    try:
        amount = int(value or 0)
    except Exception:
        amount = 0
    if amount == 0:
        return "Miễn phí"
    return f"{amount:,} VND".replace(",", ".")


def _is_standard_plan(plan: Dict[str, Any]) -> bool:
    # 1. Kiểm tra giá tiền bằng 0 (gói Tiêu chuẩn miễn phí)
    if plan.get("giaTien", 0) == 0:
        return True

    # 2. Kiểm tra tên gói hoặc mã gói
    name = str(plan.get("tenGoi") or plan.get("name") or "").lower()
    ma_goi = str(plan.get("maGoi") or plan.get("ma_goi") or "").lower()

    normalized = unicodedata.normalize("NFD", name)
    without_accents = "".join(char for char in normalized if unicodedata.category(char) != "Mn")

    is_standard_name = "tieu chuan" in without_accents or "standard" in name
    is_standard_code = "standard" in ma_goi or "goi005" in ma_goi or plan.get("_id") == "GOI005"

    return is_standard_name or is_standard_code


def get_plan_pros_cons(plan: Dict[str, Any]) -> Dict[str, List[str]]:
    pros = []
    cons = []
    if plan.get("giaTien", 0) == 0:
        pros.append("Không tốn chi phí đăng ký")
        cons.append("Hạn mức mượn và tiện ích thường thấp hơn các gói trả phí")
    if plan.get("soSachToiDa"):
        pros.append(f"Mượn tối đa {plan.get('soSachToiDa')} cuốn cùng lúc")
    if plan.get("soNgayMuonToiDa"):
        pros.append(f"Giữ sách tối đa {plan.get('soNgayMuonToiDa')} ngày")
    if plan.get("mienTienCoc"):
        pros.append("Miễn tiền đặt cọc")
    else:
        cons.append("Có thể vẫn cần đặt cọc theo quy định của gói")
    if plan.get("choPhepGiaHanOnline"):
        pros.append("Hỗ trợ gia hạn online")
    if plan.get("quayNhanUuTien"):
        pros.append("Được ưu tiên phục vụ tại quầy")
    if plan.get("chiaSeNhomGiaDinh"):
        pros.append("Hỗ trợ chia sẻ nhóm gia đình")
    if plan.get("giaoSachTanNha"):
        pros.append("Hỗ trợ giao sách tận nhà")
    if not cons:
        cons.append("Cần cân nhắc chi phí và nhu cầu đọc thực tế")
    return {"pros": pros, "cons": cons}


def compare_membership_plans() -> Dict[str, Any]:
    plans = [plan for plan in get_membership_plans() if not _is_standard_plan(plan)]
    enriched = []
    recommended = None
    for plan in plans:
        item = dict(plan)
        item["formatted_price"] = _format_price(plan.get("giaTien"))
        item["pros_cons"] = get_plan_pros_cons(plan)
        enriched.append(item)
        if plan.get("khuyenDung") and not recommended:
            recommended = plan.get("_id")

    if not recommended and enriched:
        paid = [p for p in enriched if p.get("giaTien", 0) > 0]
        recommended = (paid[0] if paid else enriched[0]).get("_id")

    return {
        "membership_plans": enriched,
        "plan_comparison": {
            "recommended_plan_id": recommended,
            "reason": "Gói này được đánh giá cao nhờ sự cân bằng tối ưu giữa chi phí và quyền lợi mượn sách.",
            "pros_cons": [{"plan_id": p.get("_id"), **p.get("pros_cons", {})} for p in enriched],
        },
    }
