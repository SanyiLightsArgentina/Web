import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type QuoteListContextValue = {
  items: string[];
  has: (model: string) => boolean;
  add: (model: string) => void;
  remove: (model: string) => void;
  toggle: (model: string) => void;
  clear: () => void;
};

const QuoteListContext = createContext<QuoteListContextValue | undefined>(undefined);

const STORAGE_KEY = "quote_list_models";

function readStoredItems(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch (err) {
    console.warn("Failed to read quote list from storage", err);
    return [];
  }
}

export const QuoteListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<string[]>(readStoredItems);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn("Failed to write quote list to storage", err);
    }
  }, [items]);

  const api = useMemo<QuoteListContextValue>(() => ({
    items,
    has: (model: string) => items.includes(model),
    add: (model: string) => setItems((prev) => (prev.includes(model) ? prev : [...prev, model])),
    remove: (model: string) => setItems((prev) => prev.filter((m) => m !== model)),
    toggle: (model: string) => setItems((prev) => (prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model])),
    clear: () => setItems([]),
  }), [items]);

  return <QuoteListContext.Provider value={api}>{children}</QuoteListContext.Provider>;
};

export const useQuoteList = (): QuoteListContextValue => {
  const ctx = useContext(QuoteListContext);
  if (!ctx) throw new Error("useQuoteList must be used within a QuoteListProvider");
  return ctx;
};
