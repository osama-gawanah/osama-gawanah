/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { Compass, Library, History, Search, Menu, Plus, Sparkles, Ellipsis } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AIUpgradePricingModal } from "./ai-upgrade-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import conversations from "../data.json";

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive?: boolean;
}

const sidebarItems: SidebarItem[] = [
  { icon: Compass, label: "Explore" },
  { icon: Library, label: "Library" },
  { icon: History, label: "History" }
];

export type Conversation = (typeof conversations)[number];

const groupConversationsByCategory = (conversations: Conversation[]) => {
  const groups: Record<string, { title: string; conversations: Conversation[] }> = {
    today: { title: "Today", conversations: [] },
    yesterday: { title: "Yesterday", conversations: [] },
    "7days": { title: "7 Days Ago", conversations: [] },
    older: { title: "Older", conversations: [] }
  };

  conversations.forEach((conv) => {
    groups[conv.category].conversations.push(conv);
  });

  return Object.entries(groups)

    .filter(([_, group]) => group.conversations.length > 0)
    .map(([key, group]) => ({ key, ...group }));
};

const SidebarContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredConversations, setFilteredConversations] = useState(conversations);

  const params = useParams<{ id: string }>();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const conversationGroups = groupConversationsByCategory(filteredConversations);

  return (
    <div className="flex flex-col border-e lg:w-72 h-full">
      <div className="px-4 py-2 border-b">
        <div className="relative">
          <Search className="top-1/2 left-0 absolute w-4 h-4 text-muted-foreground -translate-y-1/2 transform" />
          <Input
            placeholder="Search chats..."
            className="bg-background shadow-none focus:shadow-none pl-6 border-transparent focus:border-transparent! focus:ring-0! text-sm"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="space-y-4 lg:space-y-8 p-4 overflow-y-auto grow">
        {conversationGroups.map((group) => (
          <div key={group.key}>
            <h3 className="mb-4 text-muted-foreground text-xs">{group.title}</h3>
            <div className="space-y-0.5">
              {group.conversations.map((conversation) => (
                <div className="group flex items-center" key={conversation.id}>
                  <Link
                    href={`/dashboard/apps/ai-chat-v2/${conversation.id}`}
                    className={cn(
                      "block justify-start hover:bg-muted p-2 px-3 rounded-lg w-full min-w-0 text-sm text-start truncate",
                      params.id === conversation.id && "bg-muted"
                    )}>
                    {conversation.title}
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="md:opacity-0 group-hover:opacity-100">
                        <Ellipsis />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>Rename</DropdownMenuItem>
                      <DropdownMenuItem>Share</DropdownMenuItem>
                      <DropdownMenuItem>Pin the chat</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500!">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </div>
        ))}
        {filteredConversations.length === 0 && searchQuery && (
          <div className="py-4 text-muted-foreground text-sm text-center">
            No conversations found
          </div>
        )}
      </div>

      <div>
        <div className="p-4">
          {sidebarItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className={cn("justify-start hover:bg-muted w-full", item.isActive && "bg-muted")}>
              <item.icon />
              {item.label}
            </Button>
          ))}

          <AIUpgradePricingModal>
            <Button variant="ghost" className="justify-start hover:bg-muted w-full">
              <Sparkles /> Upgrade
            </Button>
          </AIUpgradePricingModal>
        </div>

        <div className="p-4 border-t">
          <Button className="w-full" asChild>
            <Link href="/dashboard/apps/ai-chat-v2">
              <Plus />
              New Chat
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function AIChatSidebar() {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden top-0 z-10 absolute end-0">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
