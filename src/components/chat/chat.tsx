"use client";

import ChatTopbar from "./chat-topbar";
import ChatList from "./chat-list";
import ChatBottombar from "./chat-bottombar";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { BytesOutputParser } from "@langchain/core/output_parsers";
import { Attachment, ChatRequestOptions, generateId } from "ai";
import { Message, useChat } from "ai/react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import useChatStore from "@/app/hooks/useChatStore";
import { useExperimentStore } from "@/app/hooks/useExperimentStore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ExperimentIndicator } from "@/components/experiment-indicator";
import Link from "next/link";
import { Settings } from "lucide-react";
import UserSettings from "@/components/user-settings";
import ExperimentUserSettings from "@/components/experiment-user-settings";

export interface ChatProps {
  id: string;
  initialMessages: Message[] | [];
  isMobile?: boolean;
}

export default function Chat({ initialMessages, id, isMobile }: ChatProps) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    setMessages,
    setInput,
    reload,
  } = useChat({
    id,
    initialMessages,
    onResponse: (response) => {
      if (response) {
        setLoadingSubmit(false);
      }
    },
    onFinish: (message) => {
      const savedMessages = getMessagesById(id);
      saveMessages(id, [...savedMessages, message]);
      setLoadingSubmit(false);
    },
    onError: (error) => {
      setLoadingSubmit(false);
      router.replace("/");
      console.error(error.message);
      console.error(error.cause);
    },
  });
  const [loadingSubmit, setLoadingSubmit] = React.useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const base64Images = useChatStore((state) => state.base64Images);
  const setBase64Images = useChatStore((state) => state.setBase64Images);
  const selectedModel = useChatStore((state) => state.selectedModel);
  const saveMessages = useChatStore((state) => state.saveMessages);
  const getMessagesById = useChatStore((state) => state.getMessagesById);
  const router = useRouter();

  // Experiment store
  const { 
    currentSession, 
    personas, 
    conditions, 
    updateSession,
    updateSessionChatId,
    loadPersonas,
    loadConditions
  } = useExperimentStore();

  // Ensure personas and conditions are loaded
  useEffect(() => {
    if (personas.length === 0) loadPersonas();
    if (conditions.length === 0) loadConditions();
  }, [loadPersonas, loadConditions, personas.length, conditions.length]);

  // Admin keyboard shortcut (Ctrl+Alt+A)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key === 'a') {
        e.preventDefault();
        router.push('/admin');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [router]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedModel) {
      toast.error("Please select a model");
      return;
    }

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: input,
    };

    // Save the chat IMMEDIATELY when first message is sent to prevent 404
    const currentMessages = [...messages, userMessage];
    saveMessages(id, currentMessages);
    
    // Navigate to the chat URL now that the chat exists in store
    if (messages.length === 0) {
      router.replace(`/c/${id}`);
    }

    // Update session with chat ID if not already set
    if (currentSession && !currentSession.chatId) {
      updateSessionChatId(currentSession.id, id);
    }

    setLoadingSubmit(true);

    const attachments: Attachment[] = base64Images
      ? base64Images.map((image) => ({
          contentType: "image/base64",
          url: image,
        }))
      : [];

    // Get experiment data if available
    let experimentData = null;
    if (currentSession) {
      const persona = personas.find(p => p.id === currentSession.personaId);
      const condition = conditions.find(c => c.id === currentSession.conditionId);
      
      if (persona) {
        experimentData = {
          personaSystemPrompt: persona.systemPrompt,
          condition: condition,
        };

      } else {
        // If we have a session but no persona found, this is a critical error
        if (personas.length > 0) {
          toast.error("Experiment configuration error: Persona not found");
          return;
        } else {
          // Personas might still be loading
          return;
        }
      }
    }

    const requestOptions: ChatRequestOptions = {
      body: {
        selectedModel: selectedModel,
        experimentData: experimentData,
      },
      ...(base64Images && {
        data: {
          images: base64Images,
        },
        experimental_attachments: attachments,
      }),
    };

    handleSubmit(e, requestOptions);
    setBase64Images(null);

    // Update experiment session
    if (currentSession) {
      updateSession(currentSession.id, currentMessages);
    }
  };

  const removeLatestMessage = () => {
    const updatedMessages = messages.slice(0, -1);
    setMessages(updatedMessages);
    saveMessages(id, updatedMessages);
    return updatedMessages;
  };

  const handleStop = () => {
    stop();
    saveMessages(id, [...messages]);
    setLoadingSubmit(false);
  };

  return (
    <div className="flex flex-col w-full max-w-3xl h-full">
      <ExperimentIndicator />
      
      {/* Admin access - top right */}
      <div className="absolute top-4 right-4 z-50">
        <Link href="/admin">
          <button
            className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full opacity-10 hover:opacity-100 transition-opacity duration-300"
            title="Admin Access (Ctrl+Alt+A)"
            style={{ fontSize: '12px' }}
          >
            <Settings className="h-4 w-4" />
          </button>
        </Link>
      </div>

      {/* User settings - top left */}
      {!isMobile && (
        <div className="absolute top-4 left-4 z-50">
          {currentSession ? (
            <ExperimentUserSettings />
          ) : (
            <UserSettings variant="floating" />
          )}
        </div>
      )}
      
      <ChatTopbar
        isLoading={isLoading}
        chatId={id}
        messages={messages}
        setMessages={setMessages}
      />

      {messages.length === 0 ? (
        <div className="flex flex-col h-full w-full items-center gap-4 justify-center">
          <div className="h-16 w-14 flex items-center justify-center text-4xl">
            👤
          </div>
          <p className="text-center text-base text-muted-foreground">
            You are now chatting with your assigned conversation partner.
          </p>
          <ChatBottombar
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={onSubmit}
            isLoading={isLoading}
            stop={handleStop}
            setInput={setInput}
          />
        </div>
      ) : (
        <>
          <ChatList
            messages={messages}
            isLoading={isLoading}
            loadingSubmit={loadingSubmit}
            reload={async () => {
              removeLatestMessage();

              const requestOptions: ChatRequestOptions = {
                body: {
                  selectedModel: selectedModel,
                },
              };

              setLoadingSubmit(true);
              return reload(requestOptions);
            }}
          />
          <ChatBottombar
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={onSubmit}
            isLoading={isLoading}
            stop={handleStop}
            setInput={setInput}
          />
        </>
      )}
    </div>
  );
}
