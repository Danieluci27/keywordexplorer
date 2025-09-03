from rag_helper import State, get_model_info, initialize_chat_model, convert_text_to_document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_openai import OpenAIEmbeddings
from langgraph.graph import StateGraph, START
from langchain import hub
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/generate', methods=['POST'])
def generate_rag_response():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid or Missing JSON data"}), 400
    try:
        texts = data['texts']
        query = data['question']
    except KeyError as e:
        return jsonify({"error": f"Missing key in request data: {str(e)}"}), 400
    
    model_info = get_model_info()
    docs = [convert_text_to_document(text, idx) for idx, text in enumerate(texts)]
    chat_model = initialize_chat_model(model_info["model_name"], model_info["model_provider"])
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    embeddings = OpenAIEmbeddings(model=model_info["embedding_model_name"])
    vector_store = InMemoryVectorStore(embeddings)

    prompt = hub.pull("rlm/rag-prompt")
    
    split_docs = text_splitter.split_documents(docs)
    _ = vector_store.add_documents(split_docs)

    def retrieve(state: State):
        retrieved_docs = vector_store.similarity_search(state["question"])
        return {"context": retrieved_docs}
        
    def generate(state: State):
        docs_content = "\n\n".join(doc.page_content for doc in state["context"])
        messages = prompt.invoke({"question": state["question"], "context": docs_content})
        response = chat_model.invoke(messages)
        return {"answer": response.content}

    graph_builder = StateGraph(State).add_sequence([retrieve, generate])
    graph_builder.add_edge(START, "retrieve")
    graph = graph_builder.compile()

    response = graph.invoke({"question": query})
    return jsonify({"response": response["answer"]})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)