import { createOllama } from "ollama-ai-provider";
import {
  streamText,
  convertToCoreMessages,
  CoreMessage,
  UserContent,
} from "ai";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // Destructure request data
  const { messages, selectedModel, data, experimentData } = await req.json();

  const ollamaUrl = process.env.OLLAMA_URL;

  const initialMessages = messages.slice(0, -1);
  const currentMessage = messages[messages.length - 1];

  const ollama = createOllama({ baseURL: ollamaUrl + "/api" });

  const systemPrompt = experimentData?.personaSystemPrompt;
  let userMessageText = currentMessage.content;

  // If this is the first message, prepend the system prompt to it. This is a
  // common workaround for models that ignore the system prompt otherwise.
  if (systemPrompt && initialMessages.length === 0) {
    userMessageText = `${systemPrompt}\n\n${userMessageText}`;
  }

  // Build message content array directly
  const messageContent: UserContent = [{ type: "text", text: userMessageText }];

  // Add images if they exist
  data?.images?.forEach((imageUrl: string) => {
    const image = new URL(imageUrl);
    messageContent.push({ type: "image", image });
  });

  // Build conversation messages
  let conversationMessages: CoreMessage[] = [];

  // If it's not the first message, add the system prompt as a separate message.
  if (systemPrompt && initialMessages.length > 0) {
    conversationMessages.push({
      role: "system",
      content: systemPrompt,
    });
  }

  // Add converted messages
  conversationMessages.push(...convertToCoreMessages(initialMessages));
  conversationMessages.push({ role: "user", content: messageContent });

  // Apply experimental conditions
  const condition = experimentData?.condition;
  let streamOptions: any = {
    model: ollama(selectedModel),
    messages: conversationMessages,
  };

  // Apply response length limit if specified
  if (condition?.settings?.maxResponseLength) {
    streamOptions.maxTokens = Math.floor(
      condition.settings.maxResponseLength / 4
    ); // Rough token estimation
  }

  // Add experimental delay if specified
  if (condition?.settings?.responseDelay > 0) {
    const delay = condition.settings.randomResponseDelay
      ? condition.settings.responseDelay * (0.5 + Math.random())
      : condition.settings.responseDelay;

    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  // Stream text using the ollama model
  const result = await streamText(streamOptions);

  return result.toDataStreamResponse();
}
