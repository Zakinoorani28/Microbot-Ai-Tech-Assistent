"use client";

import type React from "react";
import { useRef, useEffect, useState, useCallback } from "react";
import { Send, Bot, User, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MarkdownRenderer } from "./markdown-renderer";
import { VoiceInput } from "./voice-input";
import { TextToSpeech } from "./text-to-speech";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  error?: boolean;
}

interface ChatInterfaceProps {
  sessionId: string | null;
  onMessageSent: (message: string, isFirstMessage: boolean) => void;
  onMessagesUpdate: (sessionId: string, messages: Message[]) => void;
  initialMessages?: Message[];
}

export function ChatInterface({
  sessionId,
  onMessageSent,
  onMessagesUpdate,
  initialMessages = [],
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastUpdateRef = useRef<string>("");

  // Reset on session change
  useEffect(() => {
    setMessages(initialMessages);
    setError(null);
  }, [sessionId]);

  // Auto scroll
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Session persistence
  const updateMessages = useCallback(
    (newMessages: Message[]) => {
      if (sessionId && newMessages.length > 0) {
        const messagesKey = `${sessionId}-${newMessages.length}-${
          newMessages[newMessages.length - 1]?.id
        }`;
        if (lastUpdateRef.current !== messagesKey) {
          lastUpdateRef.current = messagesKey;
          onMessagesUpdate(sessionId, newMessages);
        }
      }
    },
    [sessionId, onMessagesUpdate]
  );

  useEffect(() => {
    updateMessages(messages);
  }, [messages, updateMessages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText.trim(),
      timestamp: new Date(),
    };

    const isFirstMessage = messages.length === 0;
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setError(null);

    onMessageSent(messageText.trim(), isFirstMessage);
    setIsLoading(true);

    try {
      // ✅ switched to /api/chat (AIML ChatGPT backend)
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Network error" }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.error) throw new Error(data.error);
      if (!data.reply) throw new Error("No reply received from API");

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);

      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Sorry, I encountered an error: ${errorMessage}. Please check your connection and try again.`,
        timestamp: new Date(),
        error: true,
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(input);
    setInput("");
  };

  const handleVoiceResult = (voiceText: string) => {
    setInput(voiceText);
    setTimeout(() => {
      sendMessage(voiceText);
      setInput("");
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const retryLastMessage = () => {
    if (messages.length >= 2) {
      const lastUserMessage = messages[messages.length - 2];
      if (lastUserMessage.role === "user") {
        setInput(lastUserMessage.content);
        setMessages((prev) => prev.slice(0, -2));
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative w-full overflow-hidden">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 p-3 relative z-10">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Error: {error}</span>
            <Button
              onClick={retryLastMessage}
              size="sm"
              variant="outline"
              className="ml-auto h-6 text-xs"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 pb-24 w-full" ref={scrollAreaRef}>
        <div className="p-2 sm:p-4 space-y-4 w-full max-w-full">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center mx-auto mb-4">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Welcome to MicroBot!
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                I'm your AI tech assistant, ready to help you choose the right
                tech products or get instant support. You can type or speak to
                me in English or Roman Urdu!
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-2 sm:gap-3 w-full",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "flex gap-2 sm:gap-3 max-w-[85%] sm:max-w-[80%]",
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div
                  className={cn(
                    "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    message.role === "user"
                      ? "bg-blue-600"
                      : message.error
                      ? "bg-red-600"
                      : "bg-red-600"
                  )}
                >
                  {message.role === "user" ? (
                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  ) : message.error ? (
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  ) : (
                    <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <div
                    className={cn(
                      "rounded-2xl px-3 py-2 sm:px-4 sm:py-3 break-words overflow-wrap-anywhere",
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : message.error
                        ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                        : "bg-muted text-foreground border"
                    )}
                  >
                    <div className="text-sm leading-relaxed break-words">
                      {message.role === "assistant" && !message.error ? (
                        <MarkdownRenderer content={message.content} />
                      ) : (
                        <div className="whitespace-pre-wrap break-words">
                          {message.content}
                        </div>
                      )}
                    </div>
                    <div
                      className={cn(
                        "text-xs mt-2 opacity-70 flex items-center justify-between",
                        message.role === "user"
                          ? "text-blue-100"
                          : message.error
                          ? "text-red-600 dark:text-red-300"
                          : "text-muted-foreground"
                      )}
                    >
                      <span>{formatTime(message.timestamp)}</span>
                      {message.role === "assistant" && !message.error && (
                        <TextToSpeech text={message.content} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 max-w-4xl mr-auto">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="rounded-2xl px-4 py-3 bg-muted border">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    MicroBot is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="absolute bottom-0 left-0 right-0 bg-background border-t border-border p-2 sm:p-4">
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 w-full max-w-4xl mx-auto"
        >
          <div className="flex-1 relative min-w-0">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask MicroBot anything about tech... (Type or speak)"
              className="min-h-[44px] max-h-32 resize-none pr-20 rounded-xl w-full"
              disabled={isLoading}
            />
            <div className="absolute right-2 top-2 flex items-center gap-1">
              <VoiceInput onResult={handleVoiceResult} disabled={isLoading} />
              <Button
                type="submit"
                size="sm"
                disabled={!input.trim() || isLoading}
                className="h-8 w-8 p-0 bg-red-600 hover:bg-red-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
