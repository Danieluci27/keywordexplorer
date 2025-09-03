import os
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.documents import Document
from typing_extensions import List, TypedDict

class State(TypedDict):
    question: str
    context: List[Document]
    answer: str

def get_model_info() -> dict:
    load_dotenv()
    print
    return {
        "model_provider": os.getenv("MODEL_PROVIDER"),
        "model_name": os.getenv("MODEL_NAME"),
        "embedding_model_name": os.getenv("EMBEDDING_MODEL_NAME")
    }

def initialize_chat_model(model_name: str, model_provider: str):
    print(model_name, model_provider)
    return init_chat_model(model_name, model_provider = model_provider)

def convert_text_to_document(text: str, id: int) -> Document:
    return Document(page_content="text", metadata={"source": f"article_{id}"})

    
    



    






