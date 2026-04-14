import httpx
import asyncio

async def test():
    url = "https://bsqlbcybwidmdysuoowu.supabase.co"
    key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzcWxiY3lid2lkbWR5c3Vvb3d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNzY5NzQsImV4cCI6MjA4NDc1Mjk3NH0.5oTaWamd3-RRiTuT7BEOtvgCHQNRu8inxiM6hW9k04w"
    
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
    }
    
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            print(f"Testing {url}/rest/v1/ ...")
            resp = await client.get(f"{url}/rest/v1/", headers=headers)
            print(f"Status Code: {resp.status_code}")
            print(f"Response: {resp.text[:200]}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test())
