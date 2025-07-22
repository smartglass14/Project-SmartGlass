import requests
import xml.etree.ElementTree as ET
from config import WOLFRAM_APP_ID

def solve_math_full(query):
    url = "http://api.wolframalpha.com/v2/query"
    params = {
        "input": query,
        "appid": WOLFRAM_APP_ID,
        "format": "plaintext"
    }
    response = requests.get(url, params=params)
    if response.status_code != 200:
        return f"API Error: {response.status_code}"
    root = ET.fromstring(response.content)
    results = []
    for pod in root.findall(".//pod"):
        title = pod.attrib.get("title")
        plaintext = pod.find(".//plaintext")
        if plaintext is not None and plaintext.text:
            results.append(f"{title}: {plaintext.text}")
    return "\n\n".join(results) if results else "No results."
