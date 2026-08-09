'use client';

// Client-side replacement for Django's `messages` framework (used by
// base.html's `.fx-messages` block). Any context/component can call
// `pushMessage()` to show a toast; it auto-dismisses after 4.2s exactly
// like the original `fexo.js` did for server-rendered messages.

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type MessageTag = 'success' | 'error' | 'info';

export interface SiteMessage {
  id: number;
  tag: MessageTag;
  text: string;
}

interface MessageContextValue {
  messages: SiteMessage[];
  pushMessage: (text: string, tag?: MessageTag) => void;
  dismissMessage: (id: number) => void;
}

const MessageContext = createContext<MessageContextValue | null>(null);

let nextId = 1;

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<SiteMessage[]>([]);

  const dismissMessage = useCallback((id: number) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const pushMessage = useCallback(
    (text: string, tag: MessageTag = 'success') => {
      const id = nextId++;
      setMessages((prev) => [...prev, { id, tag, text }]);
      setTimeout(() => dismissMessage(id), 4200);
    },
    [dismissMessage]
  );

  const value = useMemo(() => ({ messages, pushMessage, dismissMessage }), [messages, pushMessage, dismissMessage]);

  return <MessageContext.Provider value={value}>{children}</MessageContext.Provider>;
}

export function useMessages() {
  const ctx = useContext(MessageContext);
  if (!ctx) throw new Error('useMessages must be used within MessageProvider');
  return ctx;
}
