import os
import requests

url = "https://google.serper.dev/search"

headers = {
    "X-API-KEY": os.getenv("SERPER_API_KEY"),
    "Content-Type": "application/json"
}

payload = {"q": "latest AI trends"}

response = requests.post(url, headers=headers, json=payload)

print("Status Code:", response.status_code)
print(response.text)