def get_prompt_template(question):
    q = question.lower()
    if any(word in q for word in ["solve", "find x", "equation", "integrate"]):
        return "Solve this math problem step by step for a class 10 student: "
    elif any(word in q for word in ["area", "volume", "perimeter", "circle"]):
        return "Explain this geometry problem step by step with formulas: "
    elif any(word in q for word in ["summarize", "key points", "chapter"]):
        return "Summarize this academic content in bullet points "
    elif any(word in q for word in ["define", "who is", "explain", "what is"]):
        return "Explain this concept clearly for a student in grade 8: "
    elif any(word in q for word in ["grammar", "rewrite", "correct", "punctuation"]):
        return "Correct the grammar and explain the correction in simple English: "
    elif any(word in q for word in ["joke", "funny", "motivate"]):
        return "Give a funny or motivational response for a student: "
    else:
        return "Answer this question in a helpful and friendly way: "


def summary_prompt_template(contex):
     prompt = f"""
        You are an expert summarizer. Read the following document carefully and generate a clear, well-structured summary.
        
        Instructions:
        1. Structure the summary in paragraph form.
        2. Ensure the flow is logical and easy to follow.
        3. Highlight all key points, important events, or main arguments.
        4. Avoid copying text directly — paraphrase everything in your own words.
        5. Preserve dates, names, and facts accurately.
        6. Use simple language suitable for students or general readers.
        7. If there are multiple themes or sections, write one paragraph per theme.
        
        Document:
        \"\"\"
        {contex}
        \"\"\"
        
        Return only the summary, formatted cleanly.
        """
     return prompt

def summary_prompt_with_bullets(contex):
    prompt = f"""
    You are a document summarization expert. Read the following document and produce a concise, bullet-point summary.

    Instructions:
    - Use bullet points to list all major points clearly.
    - Each point should be short and informative.
    - Highlight important dates, facts, causes, effects, or actions.
    - Do not repeat information.
    - Use clear, easy-to-understand language.

    Document:
    \"\"\"
    {contex}
    \"\"\"

    Return only the bullet points, cleanly formatted.
    """
    return prompt