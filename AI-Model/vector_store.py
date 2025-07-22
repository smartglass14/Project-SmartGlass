from langchain.vectorstores.cassandra import Cassandra
from langchain.schema import Document
from langchain.embeddings import HuggingFaceEmbeddings
from astra_config import ASTRA_DB_SECURE_BUNDLE_PATH, ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_ID, ASTRA_DB_KEYSPACE

import cassio
import numpy as np
from embedding_utils import get_embeddings
from functools import lru_cache

# Initialize CassIO (already done in astra_config.py)

# Use the LangChain wrapper for embeddings

@lru_cache(maxsize=1)
def get_embedding_model():
    from langchain.embeddings import HuggingFaceEmbeddings
    return HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

@lru_cache(maxsize=1)
def get_vectorstore():
    from langchain.vectorstores.cassandra import Cassandra
    embedding_model = get_embedding_model()
    return Cassandra(
        embedding=embedding_model,
        table_name="pdf_chunks",
        session=None
    )

def cosine_similarity(a, b):
    a = np.array(a)
    b = np.array(b)
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def store_chunks(chunks):
    vectorstore = get_vectorstore()
    docs = [Document(page_content=chunk) for chunk in chunks]
    vectorstore.add_documents(docs)

def query_similar_chunks(question, top_k=5):
    vectorstore = get_vectorstore()
    docs = vectorstore.similarity_search(question, k=top_k)
    question_emb = get_embeddings(question)[0]
    results = []
    for doc in docs:
        chunk_emb = get_embeddings(doc.page_content)[0]
        score = cosine_similarity(question_emb, chunk_emb)
        results.append({"text": doc.page_content, "score": score})
    return results