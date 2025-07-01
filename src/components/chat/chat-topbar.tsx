"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Sidebar } from "../sidebar";
import { Message } from "ai/react";
import { useExperimentStore } from "@/app/hooks/useExperimentStore";

interface ChatTopbarProps {
  isLoading: boolean;
  chatId?: string;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
}

export default function ChatTopbar({
  isLoading,
  chatId,
  messages,
  setMessages,
}: ChatTopbarProps) {
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const { currentSession, experiments } = useExperimentStore();
  
  // Hide hamburger menu during experiment sessions or when experiments are active
  const activeExperiments = experiments.filter(e => e.isActive);
  const hideHamburgerMenu = !!currentSession || activeExperiments.length > 0;

  const handleCloseSidebar = () => {
    setSheetOpen(false);
  };

  return (
    <div className="w-full flex px-4 py-6 items-center justify-start lg:justify-center">
      {!hideHamburgerMenu && (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger>
            <HamburgerMenuIcon className="lg:hidden w-5 h-5" />
          </SheetTrigger>
          <SheetContent side="left">
            <Sidebar
              chatId={chatId || ""}
              isCollapsed={false}
              isMobile={false}
              messages={messages}
              closeSidebar={handleCloseSidebar}
            />
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
