"use client";

import { useState, useRef, useEffect } from "react";
import { Send, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  user_id: string;
  display_name: string;
  message: string;
}

interface ChatBoxProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  currentUserDisplayName: string;
}

export default function ChatBox({
  messages,
  onSendMessage,
  currentUserDisplayName,
}: ChatBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-white border-2 border-slate-200 rounded-2xl shadow-xl w-80 h-96 flex flex-col mb-4 overflow-hidden"
          >
            <div className="bg-indigo-600 text-white font-bold p-3 flex justify-between items-center shadow-md">
              <span>Live Chat</span>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:text-indigo-200 text-lg"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 p-3 overflow-y-auto bg-slate-50 flex flex-col gap-2">
              {messages.length === 0 ? (
                <p className="text-center text-slate-400 text-sm mt-4">
                  Chưa có tin nhắn nào. Hãy là người đầu tiên!
                </p>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.display_name === currentUserDisplayName ? "items-end" : "items-start"}`}
                  >
                    <span className="text-xs text-slate-400 mb-0.5">
                      {msg.display_name}
                    </span>
                    <span
                      className={`px-3 py-2 rounded-2xl text-sm max-w-[85%] ${msg.display_name === currentUserDisplayName ? "bg-indigo-600 text-white rounded-br-none" : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"}`}
                    >
                      {msg.message}
                    </span>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSend}
              className="p-3 bg-white border-t border-slate-200 flex gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 bg-slate-100 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 hover:-translate-y-1 transition-all"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    </div>
  );
}
