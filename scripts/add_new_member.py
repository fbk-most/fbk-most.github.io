import os
import requests

SCRIPT_LINK = os.environ.get("SCRIPT_LINK")
WEB_APP_URL = f"https://script.google.com/macros/s/{SCRIPT_LINK}/exec" # TODO: this should not be public

email_to_invite = "flago@fbk.eu"
payload = {"email": email_to_invite}

response = requests.post(WEB_APP_URL, json=payload)
print("Status code:", response.status_code)
print("Response text:", response.text)