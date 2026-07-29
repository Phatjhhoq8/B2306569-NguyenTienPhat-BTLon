# Chuc nang: Tim kiem Internet bang Tavily Search API.

from typing import List, Dict, Any
import urllib.request
import json
import os

TRUSTED_DOMAINS = [
    "wikipedia.org",
    "goodreads.com",
    "fahasa.com",
    "nxbtre.com.vn",
    "nhanam.vn"
]

def web_search_mcp(
    query: str, 
    max_results: int = 5, 
    limit_to_trusted: bool = True, 
    search_depth: str = "basic"
) -> List[Dict[str, Any]]:
    """Tim kiem thong tin tren Internet qua Tavily API va tra ve snippets kem lien ket nguon."""
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key or api_key.strip() == "":
        print("[WARNING] Missing TAVILY_API_KEY in .env file. Skipping web search.")
        return []
        
    url = "https://api.tavily.com/search"
    payload = {
        "api_key": api_key,
        "query": query,
        "search_depth": search_depth,
        "max_results": max_results
    }
    
    if limit_to_trusted and TRUSTED_DOMAINS:
        payload["include_domains"] = TRUSTED_DOMAINS
        
    headers = {
        "Content-Type": "application/json"
    }
    
    proxy_url = os.getenv("WEB_SEARCH_PROXY")
    if proxy_url and proxy_url.strip() != "":
        proxy_handler = urllib.request.ProxyHandler({'http': proxy_url, 'https': proxy_url})
        opener = urllib.request.build_opener(proxy_handler)
        urllib.request.install_opener(opener)
        
    results = []
    seen_links = set()
    is_trusted_search = bool(limit_to_trusted and TRUSTED_DOMAINS)
    
    try:
        req = urllib.request.Request(
            url, 
            data=json.dumps(payload).encode('utf-8'), 
            headers=headers, 
            method='POST'
        )
        with urllib.request.urlopen(req, timeout=15) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            search_results = res_data.get("results", [])
            for r in search_results:
                link = r.get("url")
                # Chỉ thêm nếu URL chưa từng xuất hiện để tránh trùng lặp thông tin
                if link and link not in seen_links:
                    seen_links.add(link)
                    results.append({
                        "title": r.get("title"),
                        "link": link,
                        "snippet": r.get("content"),
                        "trusted": is_trusted_search
                    })
    except Exception as e:
        print(f"[WARNING] Error executing Tavily search: {e}")
        if limit_to_trusted:
            print("[INFO] Retrying free search without domain limits on Tavily...")
            return web_search_mcp(query, max_results=max_results, limit_to_trusted=False, search_depth=search_depth)
        return []
        
    if limit_to_trusted and not results:
        print("[INFO] No results found from trusted domains. Switching to free search on Tavily...")
        return web_search_mcp(query, max_results=max_results, limit_to_trusted=False, search_depth=search_depth)
        
    return results
