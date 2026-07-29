from typing import Any, Dict, List
from tools.library_api import api_get


def get_authors() -> List[Dict[str, Any]]:
    try:
        data = api_get("/authors")
        return data if isinstance(data, list) else []
    except Exception as e:
        print(f"[WARNING] get_authors failed: {e}")
        return []
