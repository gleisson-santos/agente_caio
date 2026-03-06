
import httpx
import asyncio

TOKEN = "294015246:AAGETHFWcCDBaTP5CDX2fohz0Bm32YJFSI8"

async def main():
    url = f"https://api.telegram.org/bot{TOKEN}/getWebhookInfo"
    async with httpx.AsyncClient() as client:
        resp = await client.get(url)
        print(resp.json())

if __name__ == "__main__":
    asyncio.run(main())
