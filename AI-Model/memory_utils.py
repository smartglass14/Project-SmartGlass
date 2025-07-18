from langchain.memory.chat_message_histories import CassandraChatMessageHistory
from langchain.schema import AIMessage, HumanMessage
from collections import defaultdict
from astra_config import USE_ASTRA_DB

user_histories = defaultdict(list)
MAX_TOKEN=4000

def get_chat_messages(user_id: str):
    if USE_ASTRA_DB:
        history = CassandraChatMessageHistory(session_id=user_id)
        full_messages = history.messages
        token_count = sum(len(msg.content) for msg in full_messages) // 4

        if token_count <= MAX_TOKEN:
            selected_history = full_messages
        else:
            selected_history = full_messages[-3:]
        return selected_history, history
    else:
        memory = user_histories[user_id]
        messages = []
        for q, a in memory[-3:]:
            messages.append(HumanMessage(content=q))
            messages.append(AIMessage(content=a))
        return messages, user_histories