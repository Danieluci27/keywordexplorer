import { useState, useEffect } from "react";
import Draggable from "react-draggable";
import { useRouter, useSearchParams } from "next/navigation";
import OpenAI from "openai";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
}

type Dialogue = {
    id: string;
    summary: string;
    messages: Message[];
}

function fetchDialogueHistory(): Dialogue[] {
    //TO-DO: fetch dialogue from Node.js Dialogue API.
    //Save the current dialogue/fetched history in URL (for faster retrieval when user open/close chat) and then store current thread in database at the same time.
    return [{
      id: "0",
      summary: "the role of embeddings",
      messages: [
      {id: "1", role: "user", content: "What is semantic search?" },
      { id: "2", role: "assistant", content: "Semantic search is a data searching technique that uses machine learning to understand the intent and contextual meaning of search queries." },
      { id: "3", role: "user", content: "How do embeddings improve search results?" },
      { id: "4", role: "assistant", content: "Embeddings convert text into numerical vectors that capture semantic meaning, allowing search engines to find relevant results based on context rather than just keyword matching." },
    ]},
    {
      id: "1",
      summary: "the history of embeddings",
      messages: [
      {id: "1", role: "user", content: "What is semantic search?" },
      { id: "2", role: "assistant", content: "Semantic search is a data searching technique that uses machine learning to understand the intent and contextual meaning of search queries." },
      { id: "3", role: "user", content: "How do embeddings improve search results?" },
      { id: "4", role: "assistant", content: "Embeddings convert text into numerical vectors that capture semantic meaning, allowing search engines to find relevant results based on context rather than just keyword matching." },
    ]}];
}

async function fetchGPTResponse(userQuery: string, dialogue: Dialogue): Promise<string> {
    console.log("Fetching GPT response for query:", userQuery);
    if (userQuery.trim() === "") {
        return "Feel free to ask me anything!";
    }
    try { 
        const messages = dialogue.messages.length > 0 ? dialogue.messages.map((m) => ({ role: m.role, content: m.content })) : [];
        messages.push({ role: "user", content: userQuery });
        console.log("Request body for GPT:", messages);

        const response = await fetch("/api/generate_gpt", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ messages: messages }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to fetch GPT response");
        }
        return data.choices[0].message.content;
    } catch (error) {
        console.error("Error fetching GPT response:", error);
        return "Sorry, I couldn't process your request at the moment.";
    }
}

async function fetchRAGAssistantResponse(texts: string[], userQuery: string): Promise<string> {
    console.log("Fetching RAG assistant response for query:", userQuery, "with texts:", texts);
    if (userQuery.trim() === "") {
        return "Feel free to ask me anything!";
    }
    try {
        const response = await fetch('http://localhost:8000/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ texts: texts, question: userQuery }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.response === undefined || data.response === null) {
            throw new Error("Invalid response from assistant API");
        }
        else if (data.response == "I don't know.") {
            return "I'm sorry, I don't have the information you're looking for.";
        }
        return data.response;
    } catch (error) {
        console.error("Error fetching assistant response:", error);
        return "Sorry, I couldn't process your request at the moment.";
    }
    //TO-DO: fetch response from Flask Assistant API.
}

export default function DisplayAssistant(props: { texts: string[] }) {
    const [dialogues, setDialogues] = useState<Dialogue[]>([]);
    const [userQuery, setUserQuery] = useState<string>("");
    const [currentID, setCurrentID] = useState<string>("");
    const router = useRouter();
    const searchParams = useSearchParams();

    const texts = props.texts;

    useEffect(() => {
        const history = fetchDialogueHistory();
        setDialogues(history);
        setCurrentID("1");

    }, []);

    useEffect(() => {
        const id = searchParams.get('dialogue');
        if (id) {
            setCurrentID(id);
        } else {
            setCurrentID("0");
        }
    }, [searchParams]);

    const handleSelectDialogue =(id: string) => {
        setCurrentID(id);
        router.push(`?dialogue=${id}`);
    }

    const handleAddDialogue = () => {
        const newDialogue: Dialogue = {
            id: Date.now().toString(),
            summary: "New Dialogue",
            messages: [],
        };
        setDialogues((prev) => [...prev, newDialogue]);
        setCurrentID(newDialogue.id);
        router.push(`?dialogue=${newDialogue.id}`);
    }

    function displayMessage(role: string, content: string) {
        return (
            <div
                className={`flex ${
                role === "user" ? "justify-end" : "justify-start"} mb-3`}
            >
                <div
                    className={`max-w-[70%] px-4 py-2 rounded-lg text-sm whitespace-pre-line ${
                    role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-900"
                    }`}
                >
                    {content}
                </div>
            </div>
        );
    }

    function displayColumn() {
        return (
        <div className="w-40 bg-gray-900 text-white h-full flex flex-col">
            <h2 className="text-lg font-bold p-4 border-b border-gray-700">
                Dialogues
            </h2>
            <ul className="flex-1 overflow-y-auto">
            {dialogues.map((d) => (
                <li
                    key={d.id}
                    onClick={() => handleSelectDialogue(d.id)}
                    className={`p-3 cursor-pointer hover:bg-gray-700 ${
                        currentID === d.id ? "bg-gray-800" : ""
                    }`}
                >
                    {d.summary}
                </li>
                ))}
            </ul>

            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={handleAddDialogue}
                    className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium"
                >
                    + New Dialogue
                </button>
            </div>
        </div>
        );
    }

    function displayDialogue(id: string) {
        const dialogue = dialogues.find((d) => d.id === id);
        if (!dialogue) {
            return <div className="flex-1 flex items-center justify-center">No dialogue selected</div>;
        }

        const handleSend = async () => {
            if (!userQuery.trim()) return;

            const baseId = Date.now().toString();

            const newMessage: Message = {
                id: baseId + "u",
                role: "user",
                content: userQuery,
            };
            //prev enforces React to add a message to the latest state of dialogues. 
            setDialogues((prev) => prev.map((d) => d.id === id ? { ...d, messages: [...d.messages, newMessage] } : d));
            
            let assistantResponse = "";
            if (texts.length === 0) {
                assistantResponse = await fetchGPTResponse(userQuery, dialogue);
            } else {
                assistantResponse = await fetchRAGAssistantResponse(texts, userQuery);
            }

            const newResponse: Message = {
                id: baseId + "a",
                role: "assistant",
                content: assistantResponse,
            }
            //prev enforces React to add a message to the latest state of dialogues. 
            setDialogues((prev) => prev.map((d) => d.id === id ? { ...d, messages: [...d.messages, newResponse] } : d));
            // TO-DO: save new message/response to database via Node.js Dialogue API/background job separate from this thread.
            setUserQuery("");
        };

        return (
            <div className="flex-1 flex flex-col h-full bg-white">
                {/* Messages area */}
                <div className="flex-1 overflow-y-auto p-6">
                    {dialogue.messages.map((m) => (
                    <div key={m.id}>{displayMessage(m.role, m.content)}</div>
                    ))}
                </div>

                {/* Input area */}
                <div className="border-t p-4 bg-gray-50">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={userQuery}
                            onChange={(e) => setUserQuery(e.target.value)}
                            placeholder="Send a message..."
                            className="flex-1 rounded-md border border-black px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleSend}
                            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="flex h-full">
            {displayColumn()}
            {displayDialogue(currentID)}
        </div>
    );
}