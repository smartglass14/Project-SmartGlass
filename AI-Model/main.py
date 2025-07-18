from fastapi import FastAPI, Body
from models.schemas import PDFUploadInput, QuestionInput, SummaryOptions
from pdf_utils import extract_text_from_pdf_url, chunk_text
from math_solver import solve_math_full
from embedding_utils import run_model
from vector_store import store_chunks, query_similar_chunks

from memory_utils import get_chat_messages, user_histories
from astra_config import USE_ASTRA_DB
from langchain.schema import HumanMessage
from langchain.memory.chat_message_histories import CassandraChatMessageHistory
from prompt_template import summary_prompt_template, summary_prompt_with_bullets

app = FastAPI()


@app.get("/")
def home():
    return {"message": "SmartGlass AI Server is running!"}


@app.post("/upload-pdf")
async def upload_pdf(body: PDFUploadInput):
    try:
        file_url = body.file_url

        if file_url:
            full_text = extract_text_from_pdf_url(file_url)
            chunks = chunk_text(full_text)
            store_chunks(chunks)

            return {
                "message": f"✅ PDF from URL uploaded. {len(chunks)} chunks extracted and stored.",
                "status": "success"
            }

        return {"error": "Missing file_url", "status": "fail"}

    except Exception as e:
        return {
            "error": f"Upload failed: {str(e)}",
            "status": "fail"
        }


@app.post("/ask")
def ask_question(input: QuestionInput):
    if not input.question.strip():
        return {"error": "Question cannot be empty."}

    question_lower = input.question.lower()
    if any(word in question_lower for word in ['solve', 'integrate', 'limit', 'differentiate']):
        try:
            return {"answer": solve_math_full(input.question)}
        except Exception as e:
            return {"error": f"Math solver failed: {str(e)}"}

    user_id = getattr(input, "user_id", "default")
    chat_messages, history = get_chat_messages(user_id)

    docs = query_similar_chunks(input.question)

    # Only answer if the top similarity score is above threshold
    if not docs or docs[0]["score"] < 0.5:
        return {"answer": "Could not find this in your document."}

    messages = [{
        "role": "system",
        "content": (
            "You are a helpful AI tutor for Indian students, specializing in CBSE, ICSE, and State Board syllabi. "
            "Provide step-by-step solutions using clear, simple language as found in NCERT textbooks. "
            "When relevant, include examples or explanations common in Indian classrooms."
        )
    }]
    for msg in chat_messages:
        messages.append({
            "role": "user" if isinstance(msg, HumanMessage) else "assistant",
            "content": msg.content
        })

    context = "\n\n".join([str(doc["text"]) for doc in docs])
    messages.append({
        "role": "user",
        "content": f"Answer this based on the context:\n\n{str(context)}\n\nQuestion: {str(input.question)}"
    })

    try:
        answer = run_model(messages)
    except Exception as e:
        return {"error": f"AI error: {str(e)}"}

    if USE_ASTRA_DB:
        history.add_user_message(input.question)
        history.add_ai_message(answer)
    else:
        user_histories[user_id].append((input.question, answer))

    if not answer.strip():
        return {"answer": "Sorry, I couldn’t understand that. Try rephrasing your question."}

    return {"answer": answer}


@app.post("/summary")
def summarize_pdf(options: SummaryOptions):
    try:
        docs = query_similar_chunks("summarize this document")
        if not docs:
            return {"summary": "No content found to summarize. Upload a PDF first."}

        context = "\n\n".join([doc["text"] for doc in docs])

        summary_prompt = summary_prompt_template(context[:options.max_tokens])
        if options.bullet_points:
            summary_prompt = summary_prompt_with_bullets(context[:options.max_tokens])

        summary = run_model(summary_prompt)
        return {"summary": summary}
    except Exception as e:
        return {"error": f"Summarization failed: {str(e)}"}


@app.get("/history/{user_id}")
def get_user_history(user_id: str):
    if USE_ASTRA_DB:
        history = CassandraChatMessageHistory(session_id=user_id)
        return {
            "history": [
                {"role": "user" if isinstance(msg, HumanMessage) else "assistant", "content": msg.content}
                for msg in history.messages
            ]
        }
    else:
        return {"history": user_histories.get(user_id, [])}


@app.get("/reset-history/{user_id}")
def reset_user_history(user_id: str):
    if USE_ASTRA_DB:
        history = CassandraChatMessageHistory(session_id=user_id)
        history.clear()
    else:
        user_histories[user_id] = []
    return {"message": f"✅ History reset for user '{user_id}'"}
