import requests
import sys

def notify_caio(title, message, msg_type="info", chat_id=None):
    """
    Sends a notification to the Nanobot Gateway API.
    Assumes the gateway is running on localhost:18791
    """
    url = "http://localhost:18795/api/notify"
    payload = {
        "title": title,
        "message": message,
        "type": msg_type,
        "chat_id": chat_id
    }
    
    try:
        response = requests.post(url, json=payload, timeout=5)
        if response.status_code == 200:
            print(f"Notification sent successfully: {title}")
        else:
            print(f"Failed to send notification: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Error connecting to Nanobot API: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python bridge_notify.py <title> <message> [type]")
    else:
        t = sys.argv[1]
        m = sys.argv[2]
        tp = sys.argv[3] if len(sys.argv) > 3 else "info"
        notify_caio(t, m, tp)
