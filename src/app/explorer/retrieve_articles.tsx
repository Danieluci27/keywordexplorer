"use client";

export default function RetrieveArticles(query: String) {
    //TO-DO: fetch articles from Flask Search API.
    return [
      { id: "1", title: "Understanding Semantic Search", description: "A primer on semantic search and how embeddings improve result relevance.", url: "#" },
      { id: "2", title: "Debouncing and Throttling in Search UIs", description: "How to keep your search bar responsive with debouncing and throttling techniques.", url: "#" },
      { id: "3", title: "Retrieval-Augmented Generation Patterns", description: "Exploring RAG patterns including chunking, caching, and evaluation best practices.", url: "#" },
    ];
}
