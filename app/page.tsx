"use client";

import { useState, useEffect, useCallback } from "react";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatInterface } from "@/components/chat-interface";
import { ThemeToggle } from "@/components/theme-toggle";
import { Bot, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
  messages: Message[];
}

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Default to collapsed
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage only once on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem("microbot-sessions");
    const savedCollapsed = localStorage.getItem("microbot-sidebar-collapsed");

    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions).map((session: any) => ({
          ...session,
          timestamp: new Date(session.timestamp),
          messages:
            session.messages?.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            })) || [],
        }));
        setSessions(parsed);
        if (parsed.length > 0) {
          setCurrentSessionId(parsed[0].id);
        }
      } catch (error) {
        console.error("Error loading sessions:", error);
      }
    }

    // Check screen size and set default sidebar state
    const checkScreenSize = () => {
      const isLargeScreen = window.innerWidth >= 1024; // lg breakpoint
      if (savedCollapsed) {
        try {
          setSidebarCollapsed(JSON.parse(savedCollapsed));
        } catch (error) {
          setSidebarCollapsed(!isLargeScreen); // Default collapsed on smaller screens
        }
      } else {
        setSidebarCollapsed(!isLargeScreen); // Default collapsed on smaller screens
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    setIsLoaded(true);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Save sessions to localStorage only when loaded and sessions change
  useEffect(() => {
    if (isLoaded && sessions.length >= 0) {
      localStorage.setItem("microbot-sessions", JSON.stringify(sessions));
    }
  }, [sessions, isLoaded]);

  // Save sidebar state
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        "microbot-sidebar-collapsed",
        JSON.stringify(sidebarCollapsed)
      );
    }
  }, [sidebarCollapsed, isLoaded]);

  const generateTitle = useCallback((message: string): string => {
    const words = message.trim().split(" ");
    if (words.length <= 6) return message;
    return words.slice(0, 6).join(" ") + "...";
  }, []);

  const createNewChat = useCallback(() => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat",
      timestamp: new Date(),
      preview: "Start a conversation...",
      messages: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMobileSidebarOpen(false);
  }, []);

  const selectSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
    setMobileSidebarOpen(false);
  }, []);

  const deleteSession = useCallback(
    (sessionId: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setCurrentSessionId((currentId) => {
        if (currentId === sessionId) {
          const remaining = sessions.filter((s) => s.id !== sessionId);
          return remaining.length > 0 ? remaining[0].id : null;
        }
        return currentId;
      });
    },
    [sessions]
  );

  const renameSession = useCallback((sessionId: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId ? { ...session, title: newTitle } : session
      )
    );
  }, []);

  const handleMessageSent = useCallback(
    (message: string, isFirstMessage: boolean) => {
      if (currentSessionId) {
        setSessions((prev) =>
          prev.map((session) =>
            session.id === currentSessionId
              ? {
                  ...session,
                  title: isFirstMessage
                    ? generateTitle(message)
                    : session.title,
                  preview:
                    message.slice(0, 100) + (message.length > 100 ? "..." : ""),
                  timestamp: new Date(),
                }
              : session
          )
        );
      }
    },
    [currentSessionId, generateTitle]
  );

  const updateSessionMessages = useCallback(
    (sessionId: string, newMessages: Message[]) => {
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? { ...session, messages: newMessages }
            : session
        )
      );
    },
    []
  );

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const currentSession = sessions.find((s) => s.id === currentSessionId);

  if (!isLoaded) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center mx-auto mb-2 animate-spin">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <p className="text-sm text-muted-foreground">Loading MicroBot...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar - Fixed */}
      <div
        className={`${
          sidebarCollapsed ? "w-16" : "w-80"
        } flex-shrink-0 hidden lg:block transition-all duration-300 fixed left-0 top-0 h-full z-20`}
      >
        <ChatSidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onNewChat={createNewChat}
          onSelectSession={selectSession}
          onDeleteSession={deleteSession}
          onRenameSession={renameSession}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-80">
          <ChatSidebar
            sessions={sessions}
            currentSessionId={currentSessionId}
            onNewChat={createNewChat}
            onSelectSession={selectSession}
            onDeleteSession={deleteSession}
            onRenameSession={renameSession}
            isCollapsed={false}
            onToggleCollapse={() => {}}
          />
        </SheetContent>
      </Sheet>

      {/* Main Chat Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 w-full ${
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-80"
        }`}
      >
        {/* Header */}
        <header className="border-b border-border p-4 flex items-center justify-between bg-background relative z-10 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Mobile Menu Button */}
            <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden h-8 w-8 p-0 flex-shrink-0"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
            </Sheet>

            {/* Desktop Sidebar Toggle */}

            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-foreground truncate">
                🤖 MicroBot
              </h1>
              <p className="text-sm text-muted-foreground truncate">
                Your AI Tech Assistant
              </p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <ThemeToggle />
          </div>
        </header>

        {/* Chat Interface */}
        <div className="flex-1 relative overflow-hidden w-full">
          {currentSessionId ? (
            <ChatInterface
              key={currentSessionId}
              sessionId={currentSessionId}
              onMessageSent={handleMessageSent}
              onMessagesUpdate={updateSessionMessages}
              initialMessages={currentSession?.messages || []}
            />
          ) : (
            <div className="flex items-center justify-center h-full p-4">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Welcome to MicroBot!
                </h2>
                <p className="text-muted-foreground mb-6">
                  Your always-available AI assistant, ready to help you choose
                  the right tech products or get instant support—powered by
                  Gemini AI.
                </p>
                <button
                  onClick={createNewChat}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Start New Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
