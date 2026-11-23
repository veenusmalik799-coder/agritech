import { useEffect, useRef, useState } from "react";
import { streamChat } from "../lib/api.js";

const PROVIDERS = ["ollama", "anthropic", "openai", "gemini"];

export default function ChatPanel({ context }) {
  const [provider, setProvider] = useState("ollama");
  const [key, setKey] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  async function send(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    if (provider !== "ollama" && !key) return setError(`Add your ${provider} API key to use it.`);

    setError("");
    setInput("");
    const history = [...messages, { role: "user", content: text }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setBusy(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const payload = { provider, messages: history };
    if (context) payload.context = context;

    try {
      await streamChat({
        payload,
        key: provider === "ollama" ? "" : key,
        signal: ctrl.signal,
        onToken: (t) =>
          setMessages((m) => {
            const copy = m.slice();
            const last = copy[copy.length - 1];
            copy[copy.length - 1] = { ...last, content: last.content + t };
            return copy;
          }),
      });
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message);
      setMessages((m) => (m.at(-1)?.content === "" ? m.slice(0, -1) : m));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex h-[28rem] flex-col rounded-xl bg-paper shadow-sm ring-1 ring-field/10">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-field/10 px-4 py-3">
        <h3 className="text-lg font-bold text-field">Ask the farm helper</h3>
        <div className="flex items-center gap-2 text-sm">
          <select value={provider} onChange={(e) => setProvider(e.target.value)}
            className="rounded-md border border-field/20 bg-paper px-2 py-1">
            {PROVIDERS.map((p) => <option key={p}>{p}</option>)}
          </select>
          {provider !== "ollama" && (
            <input type="password" placeholder="API key" value={key}
              onChange={(e) => setKey(e.target.value)} autoComplete="off"
              className="w-36 rounded-md border border-field/20 bg-paper px-2 py-1" />
          )}
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="text-sm text-soil/60">
            Ask about your result, fertiliser, or a crop problem, like “My leaves are turning yellow.”
            {context ? " The helper can see your latest recommendation." : ""}
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex"}>
            <p className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
              m.role === "user" ? "bg-field text-paper" : "bg-sage"
            }`}>
              {m.content || (busy && i === messages.length - 1 ? "…" : "")}
            </p>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {error && <p role="alert" className="px-4 pb-2 text-sm text-warn">{error}</p>}

      <form onSubmit={send} className="flex gap-2 border-t border-field/10 p-3">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your question"
          className="flex-1 rounded-md border border-field/20 bg-paper px-3 py-2 text-sm outline-none focus:border-field focus:ring-2 focus:ring-field/25" />
        {busy ? (
          <button type="button" onClick={() => abortRef.current?.abort()}
            className="rounded-md border border-field/30 px-4 text-sm font-medium text-field">Stop</button>
        ) : (
          <button type="submit" className="rounded-md bg-field px-4 text-sm font-bold text-paper hover:bg-field-dark">Send</button>
        )}
      </form>
    </section>
  );
}