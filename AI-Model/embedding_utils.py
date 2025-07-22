from sentence_transformers import SentenceTransformer
import requests
from config import OPENROUTER_API_KEY
from functools import lru_cache

@lru_cache(maxsize=1)
def get_model():
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer("all-MiniLM-L6-v2")

# Headers for OpenRouter API
headers = {
    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
    "Content-Type": "application/json"
}

def get_embeddings(text):
    """
    Generate embeddings using SentenceTransformer.
    Input can be a string or a list of strings.
    Returns a list of vectors.
    """
    model = get_model()
    if isinstance(text, str):
        text = [text]
    embeddings= model.encode(text, convert_to_numpy=True)
    return [vec.tolist() for vec in embeddings]

def run_model(prompt_or_messages):
    """
    Sends prompt/messages to OpenRouter's chat API.
    Accepts either a string (simple prompt) or list of messages (chat history).
    """
    payload = {
        "model": "mistralai/mistral-7b-instruct",
        "messages": (
            prompt_or_messages if isinstance(prompt_or_messages, list)
            else [{"role": "user", "content": prompt_or_messages}]
        ),
        "max_tokens": 300
    }

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        return f"❌ OpenRouter API Error: {str(e)}"
