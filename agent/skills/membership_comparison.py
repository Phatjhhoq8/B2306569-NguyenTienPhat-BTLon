# Chuc nang: Skill doc va so sanh goi hoi vien.

from typing import Any, Dict, List
from tools.get_membership_plans import get_membership_plans


def _format_price(value: Any) -> str:
    try:
        amount = int(value or 0)
    except Exception:
        amount = 0
    if amount == 0:
        return "Mien phi"
    return f"{amount:,} VND".replace(",", ".")


def get_plan_pros_cons(plan: Dict[str, Any]) -> Dict[str, List[str]]:
    pros = []
    cons = []
    if plan.get("giaTien", 0) == 0:
        pros.append("Khong ton chi phi dang ky")
        cons.append("Han muc muon va tien ich thuong thap hon goi tra phi")
    if plan.get("soSachToiDa"):
        pros.append(f"Muon toi da {plan.get('soSachToiDa')} cuon cung luc")
    if plan.get("soNgayMuonToiDa"):
        pros.append(f"Giu sach toi da {plan.get('soNgayMuonToiDa')} ngay")
    if plan.get("mienTienCoc"):
        pros.append("Mien tien coc")
    else:
        cons.append("Co the van can tien coc theo quy dinh")
    if plan.get("choPhepGiaHanOnline"):
        pros.append("Ho tro gia han online")
    if plan.get("quayNhanUuTien"):
        pros.append("Co quay nhan uu tien")
    if plan.get("chiaSeNhomGiaDinh"):
        pros.append("Ho tro chia se nhom/gia dinh")
    if plan.get("giaoSachTanNha"):
        pros.append("Ho tro giao sach tan nha")
    if not cons:
        cons.append("Can can nhac chi phi va nhu cau doc thuc te")
    return {"pros": pros, "cons": cons}


def compare_membership_plans() -> Dict[str, Any]:
    plans = get_membership_plans()
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
            "reason": "Goi duoc danh dau khuyen dung hoac goi tra phi phu hop nhat voi nhu cau muon nhieu sach hon.",
            "pros_cons": [{"plan_id": p.get("_id"), **p.get("pros_cons", {})} for p in enriched],
        },
    }
