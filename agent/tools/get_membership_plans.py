# Chuc nang: Doc danh sach goi hoi vien. Tool nay chi read-only.

from typing import Any, Dict, List
from tools.library_api import api_get


def get_membership_plans() -> List[Dict[str, Any]]:
    try:
        data = api_get("/memberships/plans")
        return data if isinstance(data, list) else []
    except Exception as e:
        print(f"[WARNING] get_membership_plans failed: {e}")
        return []
