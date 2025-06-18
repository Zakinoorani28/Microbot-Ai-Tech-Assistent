"use client";

import { useState } from "react";
import {
  Plus,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  MoreHorizontal,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmationDialog } from "./confirmation-dialog";
import { cn } from "@/lib/utils";

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
}

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function ChatSidebar({
  sessions,
  currentSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onRenameSession,
  isCollapsed,
  onToggleCollapse,
}: ChatSidebarProps) {
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const truncateTitle = (title: string, maxLength = 25) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + "...";
  };

  const handleRename = (sessionId: string, currentTitle: string) => {
    setEditingSessionId(sessionId);
    setEditingTitle(currentTitle);
  };

  const handleSaveRename = () => {
    if (editingSessionId && editingTitle.trim()) {
      onRenameSession(editingSessionId, editingTitle.trim());
    }
    setEditingSessionId(null);
    setEditingTitle("");
  };

  const handleCancelRename = () => {
    setEditingSessionId(null);
    setEditingTitle("");
  };

  const handleDeleteClick = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (sessionToDelete) {
      onDeleteSession(sessionToDelete);
    }
    setDeleteDialogOpen(false);
    setSessionToDelete(null);
  };

  if (isCollapsed) {
    return (
      <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border w-16">
        <div className="p-2 border-b border-sidebar-border flex flex-col gap-2">
          <Button
            onClick={onToggleCollapse}
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 hover:bg-sidebar-accent"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </Button>
          <Button
            onClick={onNewChat}
            size="sm"
            className="h-10 w-10 p-0 bg-red-600 hover:bg-red-700 text-white"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2 mb-3">
            <Button
              onClick={onToggleCollapse}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-sidebar-accent"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-sidebar-foreground">
              Chats
            </span>
          </div>
          <Button
            onClick={onNewChat}
            className="w-full justify-start gap-2 bg-red-600 hover:bg-red-700 text-white"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Chat Sessions */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={cn(
                  "group relative flex items-start gap-3 rounded-lg p-3 cursor-pointer transition-all duration-200",
                  "hover:bg-sidebar-accent",
                  currentSessionId === session.id &&
                    "bg-sidebar-accent border border-red-500/20"
                )}
                onClick={() => !editingSessionId && onSelectSession(session.id)}
              >
                <MessageSquare className="h-4 w-4 text-sidebar-foreground/60 flex-shrink-0 mt-0.5" />

                <div className="flex-1 min-w-0 pr-2">
                  {editingSessionId === session.id ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        <Input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveRename();
                            if (e.key === "Escape") handleCancelRename();
                          }}
                          className="h-7 text-sm"
                          autoFocus
                          onBlur={handleSaveRename}
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          onClick={handleSaveRename}
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          onClick={handleCancelRename}
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className="text-sm font-medium text-sidebar-foreground leading-tight mb-1"
                        title={session.title}
                      >
                        {truncateTitle(session.title)}
                      </div>
                      <div
                        className="text-xs text-sidebar-foreground/60 leading-tight mb-1"
                        title={session.preview}
                      >
                        {truncateTitle(session.preview, 35)}
                      </div>
                      <div className="text-xs text-sidebar-foreground/40">
                        {formatTime(session.timestamp)}
                      </div>
                    </>
                  )}
                </div>

                {/* Always visible 3-dot menu */}
                {!editingSessionId && (
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-sidebar-accent opacity-60 hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRename(session.id, session.title);
                          }}
                          className="flex items-center gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(session.id);
                          }}
                          className="flex items-center gap-2 text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete conversation?"
        description="This will permanently delete this conversation. This action cannot be undone."
        onConfirm={handleConfirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
}
