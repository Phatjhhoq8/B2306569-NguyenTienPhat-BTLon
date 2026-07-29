from typing import Any, Dict, List
from tools.library_api import api_get


def get_publishers() -> List[Dict[str, Any]]:
    try:
        data = api_get("/publishers")
        return data if isinstance(data, list) else []
    except Exception as e:
        print(f"[WARNING] get_publishers failed: {e}")
        return []
