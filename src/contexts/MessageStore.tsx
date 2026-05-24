"use client";

import { adminMessages, type AdminMessage } from "@/lib/data/admin-messages";
import React, { createContext, useCallback, useContext, useState } from "react";

interface MessageStore {
  messages: AdminMessage[];
  addMessage: (msg: Omit<AdminMessage, "id" | "createdAt" | "status">) => void;
  replyToMessage: (id: string, reply: string) => void;
  closeMessage: (id: string) => void;
  getUserMessages: (userId: string) => AdminMessage[];
}

const MessageContext = createContext<MessageStore | null>(null);

export function MessageStoreProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<AdminMessage[]>(adminMessages);

  const addMessage = useCallback(
    (msg: Omit<AdminMessage, "id" | "createdAt" | "status">) => {
      const newMsg: AdminMessage = {
        ...msg,
        id: `m-${Date.now()}`,
        createdAt: new Date().toLocaleString("uz-UZ", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "open",
      };
      setMessages((prev) => [newMsg, ...prev]);
    },
    []
  );

  const replyToMessage = useCallback((id: string, reply: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              status: "replied" as const,
              adminReply: reply,
              repliedAt: new Date().toLocaleString("uz-UZ", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              }),
            }
          : m
      )
    );
  }, []);

  const closeMessage = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "closed" as const } : m))
    );
  }, []);

  const getUserMessages = useCallback(
    (userId: string) => messages.filter((m) => m.userId === userId),
    [messages]
  );

  return (
    <MessageContext.Provider
      value={{ messages, addMessage, replyToMessage, closeMessage, getUserMessages }}
    >
      {children}
    </MessageContext.Provider>
  );
}

export function useMessageStore() {
  const ctx = useContext(MessageContext);
  if (!ctx) throw new Error("useMessageStore must be inside MessageStoreProvider");
  return ctx;
}
