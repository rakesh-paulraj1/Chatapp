"use client"
import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";


interface Message {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatHistoryItem {
  role: string;
  parts: { text: string }[];
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const sessionIdRef = useRef<string>( Number(Math.random().toString().slice(2)).toString());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamingMessage]);

  // Cleanup function for aborting ongoing requests
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const convertHistoryToMessages = (history: ChatHistoryItem[]): Message[] => {
    return history.map(item => ({
      content: item.parts[0].text,
      isUser: item.role === 'user',
      timestamp: new Date(),
    }));
  };

  const handleSendMessage = async (content: string) => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    // Add user message
    const userMessage: Message = {
      content,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setCurrentStreamingMessage("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          message: content,
          sessionId: sessionIdRef.current
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      // Update messages with the full chat history
      if (data.history) {
        const historyMessages = convertHistoryToMessages(data.history);
        setMessages(historyMessages);
      } else {
        // Fallback to just adding the new message if no history
        const aiMessage: Message = {
          content: data.text,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          console.log("Request was aborted");
          return;
        }
        console.error("Error generating response:", error.message);
      } else {
        console.error("Unknown error occurred");
      }
      // Add error message
      const errorMessage: Message = {
        content: "Sorry, I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setCurrentStreamingMessage("");
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message.content}
            isUser={message.isUser}
            timestamp={message.timestamp}
          />
        ))}
        {currentStreamingMessage && (
          <ChatMessage
            message={currentStreamingMessage}
            isUser={false}
            timestamp={new Date()}
          />
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
} 