
import asyncio
from telegram.ext import Application
import sys

TOKEN = "8595898561:AAFrsrrDM4U2MCQoe7g_O9QJrhZjteGlOeA"

async def main():
    print(f"Connecting to bot with token {TOKEN}...")
    try:
        app = Application.builder().token(TOKEN).build()
        await app.initialize()
        await app.start()
        
        bot_info = await app.bot.get_me()
        print(f"Connected as @{bot_info.username}")
        print("This should have kicked out the other instance if it was using long polling.")
        
        print("Staying active for 30 seconds to block the other instance...")
        await asyncio.sleep(30)
        
        await app.stop()
        await app.shutdown()
        print("Done.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
