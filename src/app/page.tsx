// src/app/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import RetrieveArticles from "./retrieve_articles";
import DisplayAssistant from "./display_assistant";
import { Resizable } from "re-resizable";

type Article = {
  id: string;
  title: string;
  description: string;
  url: string;
};

type ArticleCardProps = {
  article: Article;
  selected: boolean;
  onSelect: () => void;
};

function ArticleCard({ article, selected, onSelect }: ArticleCardProps) {
  return (
    <div
      className={
        (selected ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white") +
        " block rounded-xl p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
      }
      aria-pressed={selected}
      aria-label={article.title}
    >
      <h3 className="text-base font-semibold text-black md:text-lg">
        {article.title}
      </h3>
      <p className="mt-1 text-sm leading-6 text-gray-600 line-clamp-2">
        {article.description}
      </p>
      <div className="mt-3 flex items-center justify-between">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-blue-600 underline hover:text-blue-800"
        >
          Read more
        </a>
        <button
          type="button"
          onClick={onSelect}
          className="ml-4 inline-flex items-center rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
        >
          {selected ? "Selected" : "Select"}
        </button>
      </div>
    </div>
  );
}

const sample: Article[] = [
      { id: "1", title: "Understanding Semantic Search", description: "A primer on semantic search and how embeddings improve result relevance.", url: "#" },
      { id: "2", title: "Debouncing and Throttling in Search UIs", description: "How to keep your search bar responsive with debouncing and throttling techniques.", url: "#" },
      { id: "3", title: "Retrieval-Augmented Generation Patterns", description: "Exploring RAG patterns including chunking, caching, and evaluation best practices.", url: "#" },
];

export default function Page() {
  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialogue, setOpenDialogue] = useState(false);
  const [assistantWindowSize, setAssistantWindowSize] = useState({ width: 384, height: 400});
  // Multi-select map: articleId -> true if selected
  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>({});
  const [width, setWidth] = useState(0);

  async function onSearch(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setLoading(true);
    setArticles(RetrieveArticles(query));
    await new Promise((r) => setTimeout(r, 300));
    setLoading(false);
  }

  function toggleSelect(id: string) {
    setSelectedMap((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const w = parseInt(params.get("w") || "384", 10);
    const h = parseInt(params.get("h") || "400", 10);
    setAssistantWindowSize({ width: w, height: h });
  }, []);

  function retrieveTextsFromSelectedArticles() : string[] {
    return articles.filter(a => selectedMap[a.id]).map(a => a.title + ": " + a.description);
  }  
  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-white px-4 py-10">
      <h1 className="mb-6 text-4xl font-bold text-black">Keyword Explorer</h1>

      <form onSubmit={onSearch} className="w-full max-w-2xl" role="search" aria-label="Site search">
        <div className="group flex items-center gap-3 rounded-full border border-gray-300 px-4 py-3 shadow-sm hover:shadow focus-within:shadow md:px-5">
          <input
            name="q"
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-[16px] text-black outline-none placeholder:text-gray-500"
            autoFocus
            aria-label="Search"
          />
          <button
            type="submit"
            className="inline-flex h-9 items-center rounded-full px-4 text-sm font-medium text-white disabled:opacity-60"
            style={{ background: "black" }}
            disabled={loading}
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </div>
      </form>

      <section aria-label="Search results" className="mt-6 w-full max-w-2xl">
        <div className="max-h-[60vh] overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50/60 p-3 md:p-4">
          {loading && (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-[84px] animate-pulse rounded-xl bg-gray-200" />
              ))}
            </div>
          )}

          {!loading && articles.length > 0 && (
            <ul className="space-y-3">
              {articles.map((a) => (
                <li key={a.id}>
                  <ArticleCard
                    article={a}
                    selected={!!selectedMap[a.id]}
                    onSelect={() => toggleSelect(a.id)}
                  />
                </li>
              ))}
            </ul>
          )}

          {!loading && articles.length === 0 && (
            <p className="p-4 text-sm text-gray-600">No results found. Try a different keyword.</p>
          )}
        </div>
      </section>
      <button
        type = "button"
        className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg"
        aria-label="Floating action button"
        onClick={() => setOpenDialogue(!openDialogue)}
      >
        <img
          src="/chatbot_icon.png"
          alt="Action"
          className="h-14 w-14 rounded-full object-cover" />
      </button>

      {openDialogue && (
          <Resizable
            defaultSize={{ width: assistantWindowSize.width, height: assistantWindowSize.height }}
            minWidth={300}
            maxWidth={800}
            enable={{ left: true, top: true }}   // resize only from the left edge
            onResizeStop={(e, direction, ref, d) => {
              const updatedSize = ({
                width: assistantWindowSize.width + d.width,
                height: assistantWindowSize.height + d.height,
              });
              setAssistantWindowSize(updatedSize);

              const params = new URLSearchParams(window.location.search);
              params.set("w", String(updatedSize.width));
              params.set("h", String(updatedSize.height));
              window.history.replaceState(null, "", "?" + params.toString());
            }}
            style={{
                position: "fixed",
                bottom: "5rem", // 20 * 0.25rem
                right: "1rem",  // 4 * 0.25rem
                zIndex: 50,
                background: "white",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}>
            <DisplayAssistant texts={retrieveTextsFromSelectedArticles()} />
          </Resizable>
      )}
    </main>
    //create git repo and push, then implement URL storage for size of assistant screen.
  );
}