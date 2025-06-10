import { Message } from "ai/react";
import React from "react";
import ChatMessage from "./chat-message";
import { ChatMessageList } from "../ui/chat/chat-message-list";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "../ui/chat/chat-bubble";
import { ChatRequestOptions } from "ai";

interface ChatListProps {
  messages: Message[];
  isLoading: boolean;
  loadingSubmit?: boolean;
  reload: (
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
}

export default function ChatList({
  messages,
  isLoading,
  loadingSubmit,
  reload,
}: ChatListProps) {
  const lastMessage = messages[messages.length - 1];
  const isLastMessageStreaming =
    lastMessage?.role === "assistant" && isLoading;

  const messagesToShow = isLastMessageStreaming
    ? messages.slice(0, messages.length - 1)
    : messages;

  return (
    <div className="flex-1 w-full overflow-y-auto">
      <ChatMessageList>
        {messagesToShow.map((message, index) => (
          <ChatMessage
            key={message.id || index}
            message={message}
            isLast={index === messagesToShow.length - 1}
            isLoading={isLoading && index === messagesToShow.length - 1}
            reload={reload}
          />
        ))}
        {(loadingSubmit || isLastMessageStreaming) && (
          <ChatBubble variant="received">
            <ChatBubbleAvatar
              src=""
              width={6}
              height={6}
              className="object-contain dark:invert"
              fallback="👤"
            />
            <ChatBubbleMessage isLoading />
          </ChatBubble>
        )}
      </ChatMessageList>
    </div>
  );
}
