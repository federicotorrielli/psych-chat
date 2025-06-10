"use client";

import { ChatLayout } from "@/components/chat/chat-layout";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from "@/components/ui/dialog";
import { ExperimentSetup } from "@/components/experiment-setup";
import { generateUUID } from "@/lib/utils";
import React, { useEffect, useState, useMemo } from "react";
import useChatStore from "../hooks/useChatStore";
import { useExperimentStore } from "../hooks/useExperimentStore";

export default function Home() {
  // Stable ID generation to prevent re-renders
  const id = useMemo(() => generateUUID(), []);
  const [setupOpen, setSetupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const userName = useChatStore((state) => state.userName);
  const setUserName = useChatStore((state) => state.setUserName);
  const saveMessages = useChatStore((state) => state.saveMessages);
  const getChatById = useChatStore((state) => state.getChatById);
  const { 
    currentExperiment, 
    currentParticipant, 
    currentSession,
    loadExperiments,
    experiments 
  } = useExperimentStore();

  // Pre-create empty chat session for smoother UX
  useEffect(() => {
    const existingChat = getChatById(id);
    if (!existingChat) {
      saveMessages(id, []);
    }
  }, [id, saveMessages, getChatById]);

  useEffect(() => {
    const initializeExperiments = async () => {
      await loadExperiments();
      setIsLoading(false);
    };
    initializeExperiments();
  }, [loadExperiments]);

  useEffect(() => {
    // Only check after experiments are loaded
    if (isLoading) return;
    
    // Check if there's an active experiment and we need to set up a session
    const activeExperiments = experiments.filter(e => e.isActive);
    console.log('Active experiments:', activeExperiments.length);
    console.log('Current session:', currentSession);
    console.log('Current participant:', currentParticipant);
    
    // Show setup if there are active experiments and no current session
    if (activeExperiments.length > 0 && !currentSession) {
      setSetupOpen(true);
    }
  }, [experiments, currentSession, isLoading]);

  const onSetupComplete = () => {
    setSetupOpen(false);
    if (!userName) {
      setUserName("Participant");
    }
  };

  // Show loading while experiments are being fetched
  if (isLoading) {
    return (
      <main className="flex h-[calc(100dvh)] flex-col items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading experiments...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-[calc(100dvh)] flex-col items-center ">
        <ChatLayout
          key={id}
          id={id}
          initialMessages={[]}
          navCollapsedSize={10}
          defaultLayout={[30, 160]}
        />
      
      <Dialog open={setupOpen} onOpenChange={(open) => {
        // Don't allow closing the dialog manually - only through setup completion
        if (!open) return;
        setSetupOpen(open);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader className="space-y-2">
            <DialogTitle>Psychology Experiment Setup</DialogTitle>
            <DialogDescription>
              Welcome to our psychology research study. Please complete the setup to begin.
            </DialogDescription>
          </DialogHeader>
          <ExperimentSetup onComplete={onSetupComplete} />
        </DialogContent>
      </Dialog>
    </main>
  );
}
