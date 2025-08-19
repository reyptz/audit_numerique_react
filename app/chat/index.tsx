import { useState } from "react";
import { ChatAPI } from "../api";
import toast from "react-hot-toast";

export default function ChatIA() {
  const [q, setQ] = useState("");
  const [a, setA] = useState<string>("");

  const ask = async () => {
    if (!q.trim()) return;
    try {
      const { response } = await ChatAPI.ask(q.trim());
      setA(response);
    } catch {
      toast.error("Erreur lors de la requête IA");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-4">Chat IA (LangChain)</h1>
      <div className="flex gap-2">
        <input className="flex-1 rounded-xl border px-3 py-2 bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
               placeholder="Pose une question (ex: expliquer un écart financier)…"
               value={q} onChange={e=> setQ(e.target.value)} />
        <button onClick={ask} className="rounded-xl bg-brand-600 text-white px-4 py-2 hover:bg-brand-700">
          Envoyer
        </button>
      </div>
      {a && (
        <div className="mt-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900 whitespace-pre-wrap">
          {a}
        </div>
      )}
    </div>
  );
}