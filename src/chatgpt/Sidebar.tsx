import { ArrowLeft, Images, LayoutGrid, MessageSquare, Moon, PanelLeft, Search, SquarePen, Sun, FolderClosed } from "lucide-react";
import { Link } from "react-router";

import { cn } from "../lib/cn";
import type { Theme } from "../lib/useTheme";
import type { Conversation } from "./engine/types";

function OpenAIMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M22.28 9.82a5.98 5.98 0 0 0-.51-4.91 6.05 6.05 0 0 0-6.51-2.9A6.07 6.07 0 0 0 4.98 4.18a5.98 5.98 0 0 0-4 2.9 6.05 6.05 0 0 0 .74 7.1 5.98 5.98 0 0 0 .51 4.91 6.05 6.05 0 0 0 6.51 2.9A5.98 5.98 0 0 0 13.26 24a6.06 6.06 0 0 0 5.77-4.21 5.99 5.99 0 0 0 4-2.9 6.06 6.06 0 0 0-.75-7.07zm-9.02 12.61a4.48 4.48 0 0 1-2.88-1.04l.14-.08 4.78-2.76a.8.8 0 0 0 .39-.68v-6.74l2.02 1.17a.07.07 0 0 1 .04.05v5.58a4.5 4.5 0 0 1-4.49 4.5zm-9.66-4.13a4.47 4.47 0 0 1-.54-3.01l.14.09 4.78 2.76a.77.77 0 0 0 .78 0l5.84-3.37v2.33a.08.08 0 0 1-.03.06L9.74 19.95a4.5 4.5 0 0 1-6.14-1.65zM2.34 7.9a4.49 4.49 0 0 1 2.37-1.97v5.68a.77.77 0 0 0 .39.68l5.81 3.35-2.02 1.17a.08.08 0 0 1-.07 0L4 14.04A4.5 4.5 0 0 1 2.34 7.9zm16.6 3.86-5.83-3.39 2.02-1.16a.08.08 0 0 1 .07 0l4.83 2.79a4.49 4.49 0 0 1-.68 8.1v-5.68a.79.79 0 0 0-.41-.66zm2.01-3.02-.14-.09-4.77-2.78a.78.78 0 0 0-.78 0L9.42 9.24V6.91a.07.07 0 0 1 .03-.06l4.83-2.79a4.5 4.5 0 0 1 6.68 4.66zM8.32 12.86l-2.02-1.16a.08.08 0 0 1-.04-.06V6.07a4.5 4.5 0 0 1 7.37-3.45l-.14.08-4.78 2.76a.8.8 0 0 0-.39.68v6.72zm1.1-2.37 2.6-1.5 2.6 1.5v3l-2.6 1.5-2.6-1.5v-3z" />
    </svg>
  );
}

export function Sidebar({
  conversations,
  activeId,
  collapsed,
  theme,
  onToggleTheme,
  onToggleCollapse,
  onNewChat,
  onSelect,
}: {
  conversations: Conversation[];
  activeId: string | null;
  collapsed: boolean;
  theme: Theme;
  onToggleTheme: () => void;
  onToggleCollapse: () => void;
  onNewChat: () => void;
  onSelect: (id: string) => void;
}) {
  const item = "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm transition hover:bg-surface-tertiary";
  return (
    <aside className={cn("flex h-full shrink-0 flex-col border-r border-subtle bg-surface-secondary transition-[width] duration-200", collapsed ? "w-[60px]" : "w-[260px]")}>
      <div className={cn("flex h-14 items-center px-3", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && <OpenAIMark className="size-6" />}
        <button type="button" onClick={onToggleCollapse} aria-label="Toggle sidebar" className="inline-flex size-9 items-center justify-center rounded-lg text-secondary hover:bg-surface-tertiary">
          <PanelLeft className="size-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2">
        <button type="button" onClick={onNewChat} className={cn(item, collapsed && "justify-center px-0")} title="New chat">
          <SquarePen className="size-[18px] shrink-0" />
          {!collapsed && "New chat"}
        </button>
        <button type="button" className={cn(item, collapsed && "justify-center px-0")} title="Search chats">
          <Search className="size-[18px] shrink-0" />
          {!collapsed && "Search chats"}
        </button>
        <button type="button" className={cn(item, collapsed && "justify-center px-0")} title="Library">
          <Images className="size-[18px] shrink-0" />
          {!collapsed && "Library"}
        </button>
        <button type="button" className={cn(item, collapsed && "justify-center px-0")} title="Apps">
          <LayoutGrid className="size-[18px] shrink-0" />
          {!collapsed && "Apps"}
        </button>
        <button type="button" className={cn(item, collapsed && "justify-center px-0")} title="Projects">
          <FolderClosed className="size-[18px] shrink-0" />
          {!collapsed && "Projects"}
        </button>

        {!collapsed && conversations.length > 0 && (
          <div className="mt-5">
            <div className="px-2.5 pb-1 text-xs font-medium text-tertiary">Chats</div>
            {conversations.map((c) => (
              <button key={c.id} type="button" onClick={() => onSelect(c.id)} className={cn(item, "truncate", activeId === c.id && "bg-surface-tertiary")}>
                <MessageSquare className="size-4 shrink-0 text-tertiary" />
                <span className="truncate">{c.title}</span>
              </button>
            ))}
          </div>
        )}
      </nav>

      <div className="border-t border-subtle p-2">
        <button type="button" onClick={onToggleTheme} className={cn(item, collapsed && "justify-center px-0")} title="Toggle theme">
          {theme === "light" ? <Moon className="size-[18px] shrink-0" /> : <Sun className="size-[18px] shrink-0" />}
          {!collapsed && (theme === "light" ? "Dark mode" : "Light mode")}
        </button>
        <Link to="/" className={cn(item, "text-secondary", collapsed && "justify-center px-0")} title="Back to Wix landing page">
          <ArrowLeft className="size-[18px] shrink-0" />
          {!collapsed && "Back to Wix"}
        </Link>
        <div className={cn("mt-1 flex items-center gap-2.5 px-2.5 py-2", collapsed && "justify-center px-0")}>
          <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-[#7c3aed] text-xs font-semibold text-white">A</span>
          {!collapsed && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm">Adam</span>
              <span className="block text-xs text-tertiary">Plus</span>
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
