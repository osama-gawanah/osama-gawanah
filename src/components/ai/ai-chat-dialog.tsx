"use client";

import React, { useRef, useState } from "react";
import {
  ArrowUpIcon,
  CodeIcon,
  Maximize2,
  MicIcon,
  Minimize2,
  Paperclip,
  SquareIcon,
  Sparkles,
  ThumbsDownIcon,
  ThumbsUpIcon,
  X,
  UserIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  FolderKanbanIcon
} from "lucide-react";
import { CopyIcon } from "@radix-ui/react-icons";
import Lottie from "lottie-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Input,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea
} from "@/components/ui/custom/prompt/input";
import { Suggestion } from "@/components/ui/custom/prompt/suggestion";
import { ChatContainer } from "@/components/ui/custom/prompt/chat-container";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent
} from "@/components/ui/custom/prompt/message";
import { Markdown } from "@/components/ui/custom/prompt/markdown";
import { PromptLoader } from "@/components/ui/custom/prompt/loader";
import { useAiAsk } from "@/lib/api/hooks/use-ai-ask";

import aiSphereAnimation from "./ai-sphere-animation.json";
import { AuroraText } from "../magicui/aurora-text";

const suggestionGroups = [
  {
    icon: UserIcon,
    label: "About Osama",
    highlight: "Why",
    items: [
      "Why should I hire Osama?",
      "Tell me about Osama",
      "What makes Osama a good candidate?",
      "What are Osama's strengths?"
    ]
  },
  {
    icon: BriefcaseIcon,
    label: "Work Experience",
    highlight: "Tell me",
    items: [
      "Tell me about Osama's work experience",
      "What companies has Osama worked for?",
      "What are Osama's previous roles?",
      "What is Osama's professional background?"
    ]
  },
  {
    icon: CodeIcon,
    label: "Technical Skills",
    highlight: "What",
    items: [
      "What are Osama's technical skills?",
      "What programming languages does Osama know?",
      "What technologies is Osama proficient in?",
      "What frameworks and tools does Osama use?"
    ]
  },
  {
    icon: FolderKanbanIcon,
    label: "Projects",
    highlight: "Tell me",
    items: [
      "Tell me about Osama's projects",
      "What projects has Osama worked on?",
      "What are Osama's notable achievements?",
      "What portfolio projects does Osama have?"
    ]
  },
  {
    icon: GraduationCapIcon,
    label: "Education",
    highlight: "What",
    items: [
      "What is Osama's educational background?",
      "Where did Osama study?",
      "What degrees does Osama have?",
      "What certifications does Osama hold?"
    ]
  }
];

export default function AIChatDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [activeCategory, setActiveCategory] = useState("");
  const [isFirstResponse, setIsFirstResponse] = useState(false);
  const [messages, setMessages] = useState<
    { id: number | string; role: string; content: string; files?: File[] }[]
  >([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamContentRef = useRef("");

  const aiAskMutation = useAiAsk({
    onError: (error) => {
      console.error("AI API Error:", error);
      setIsStreaming(false);
      const errorMessageId = messages.length + 2;
      setMessages((prev) => [
        ...prev,
        {
          id: errorMessageId,
          role: "assistant",
          content: `Sorry, I encountered an error: ${error.message || "Unknown error"}. Please try again.`
        }
      ]);
    }
  });

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const streamResponse = async () => {
    if (isStreaming || aiAskMutation.isPending) return;

    if (prompt.trim() || files.length > 0) {
      setIsFirstResponse(true);
      setIsStreaming(true);

      const newMessageId = messages.length + 1;
      const userMessage = {
        id: newMessageId,
        role: "user",
        content: prompt,
        files: files
      };

      setMessages((prev) => [...prev, userMessage]);

      const currentPrompt = prompt;
      setPrompt("");
      setFiles([]);

      const history = messages
        .filter((msg) => msg.role === "user" || msg.role === "assistant")
        .map((msg) => ({
          role: msg.role,
          content: msg.content
        }));

      try {
        const response = await aiAskMutation.mutateAsync({
          question: currentPrompt,
          history: history
        });

        const fullResponse = response.answer;

        setMessages((prev) => [
          ...prev,
          {
            id: newMessageId + 1,
            role: "assistant",
            content: ""
          }
        ]);

        let charIndex = 0;
        streamContentRef.current = "";

        streamIntervalRef.current = setInterval(() => {
          if (charIndex < fullResponse.length) {
            streamContentRef.current += fullResponse[charIndex];
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === newMessageId + 1 ? { ...msg, content: streamContentRef.current } : msg
              )
            );
            charIndex++;
          } else {
            if (streamIntervalRef.current) {
              clearInterval(streamIntervalRef.current);
            }
            setIsStreaming(false);
          }
        }, 5);
      } catch (error) {
        setIsStreaming(false);
      }
    }
  };

  const stopStreaming = () => {
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
    setIsStreaming(false);
  };

  React.useEffect(() => {
    return () => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }
    };
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (uploadInputRef?.current) {
      uploadInputRef.current.value = "";
    }
  };

  const FileListItem = ({
    file,
    dismiss = true,
    index
  }: {
    file: File;
    dismiss?: boolean;
    index: number;
  }) => (
    <div className="bg-muted flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
      <Paperclip className="size-4" />
      <span className="max-w-[120px] truncate">{file.name}</span>
      {dismiss && (
        <button
          onClick={() => handleRemoveFile(index)}
          className="hover:bg-secondary/50 rounded-full p-1"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );

  const activeCategoryData = suggestionGroups.find((group) => group.label === activeCategory);
  const showCategorySuggestions = activeCategory !== "";

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="icon"

        className="fixed bottom-6 end-6 z-50 h-14 w-14 rounded-full shadow-2xl hover:scale-110 transition-transform"
      >

        <Sparkles className="h-6 w-6 text-white" />
      </Button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 end-6 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          size="lg"
          className="h-14 rounded-full shadow-2xl hover:scale-105 transition-transform gap-2 px-6"
        >
          <Sparkles className="h-5 w-5" />
          <span className="font-medium">AI Assistant</span>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(
      "fixed z-50 flex flex-col bg-background border rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ease-in-out",
      isExpanded
        ? "inset-6 w-auto h-auto max-w-4xl mx-auto"
        : "bottom-6 end-6 w-[90vw] sm:w-[480px] h-[85vh] sm:h-[700px]"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">Always here to help</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden p-4">
        <ChatContainer
          className={cn("relative flex-1 space-y-4 pe-2", {
            hidden: !isFirstResponse
          })}
          ref={containerRef}
          scrollToRef={bottomRef}
        >

          {messages.map((message, index) => {
            const isAssistant = message.role === "assistant";
            const isLastMessage = index === messages.length - 1;

            return (
              <Message
                key={message.id}
                className={message.role === "user" ? "justify-end" : "justify-start"}
              >
                <div
                  className={cn("max-w-[85%] flex-1 sm:max-w-[75%]", {
                    "justify-end text-end": !isAssistant
                  })}
                >
                  {isAssistant ? (
                    <div className="space-y-2">
                      <div className="bg-muted text-foreground prose rounded-lg border p-4">
                        <Markdown className={"space-y-4"}>{message.content}</Markdown>
                      </div>
                      <MessageActions
                        className={cn(
                          "flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100",
                          isLastMessage && "opacity-100"
                        )}
                      >
                        <MessageAction tooltip="Copy" delayDuration={100}>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <CopyIcon />
                          </Button>
                        </MessageAction>
                        <MessageAction tooltip="Upvote" delayDuration={100}>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <ThumbsUpIcon />
                          </Button>
                        </MessageAction>
                        <MessageAction tooltip="Downvote" delayDuration={100}>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <ThumbsDownIcon />
                          </Button>
                        </MessageAction>
                      </MessageActions>
                    </div>
                  ) : message?.files && message.files.length > 0 ? (
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex flex-wrap justify-end gap-2">
                        {message.files.map((file, index) => (
                          <FileListItem key={index} index={index} file={file} dismiss={false} />
                        ))}
                      </div>
                      {message.content ? (
                        <MessageContent className="bg-primary text-primary-foreground inline-flex">
                          {message.content}
                        </MessageContent>
                      ) : null}
                    </div>
                  ) : (
                    <MessageContent className="bg-primary text-primary-foreground inline-flex text-start">
                      {message.content}
                    </MessageContent>
                  )}
                </div>
              </Message>
            );
          })}

          {isStreaming && (
            <div className="ps-2">
              <PromptLoader variant="pulse-dot" />
            </div>
          )}
        </ChatContainer>

        {/* Welcome message */}
        {!isFirstResponse && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4 max-w-md">
              <div className="mx-auto w-32 sm:w-48">
                <Lottie className="w-full" animationData={aiSphereAnimation} loop autoplay />
              </div>
              <h1 className="text-xl sm:text-2xl font-medium">
                What would you like to{" "}
                <AuroraText className="font-bold"> know about Osama?</AuroraText>

              </h1>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="mt-4">
          <div className="bg-primary/10 w-full rounded-2xl p-1 pt-0">
            <Input
              value={prompt}
              onValueChange={setPrompt}
              onSubmit={streamResponse}
              className="w-full overflow-hidden border-0 p-0 shadow-none"
            >
              {files.length > 0 && (
                <div className="flex flex-wrap gap-2 pb-2">
                  {files.map((file, index) => (
                    <FileListItem key={index} index={index} file={file} />
                  ))}
                </div>
              )}

              <PromptInputTextarea placeholder="Ask me anything..." className="min-h-auto p-4" />

              <PromptInputActions className="flex items-center justify-between gap-2 p-3">
                <div className="flex items-center gap-2">
                  <PromptInputAction tooltip="Attach files">
                    <label
                      htmlFor="file-upload-dialog"
                      className="hover:bg-secondary-foreground/10 flex size-8 cursor-not-allowed items-center justify-center rounded-2xl opacity-50 pointer-events-none"
                    >
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload-dialog"
                        ref={uploadInputRef}
                        disabled
                      />
                      <Paperclip className="text-primary size-5" />
                    </label>
                  </PromptInputAction>

                </div>

                <div className="flex gap-2">
                  <PromptInputAction tooltip="Voice input">
                    <Button variant="outline" size="icon" className="size-9 rounded-full">
                      <MicIcon size={18} />
                    </Button>
                  </PromptInputAction>
                  <PromptInputAction tooltip={isStreaming ? "Stop generation" : "Send message"}>
                    <Button
                      variant="default"
                      size="icon"
                      className="size-8 rounded-full"
                      onClick={isStreaming ? stopStreaming : streamResponse}
                      disabled={(!prompt.trim() && !isStreaming) || aiAskMutation.isPending}
                    >
                      {isStreaming || aiAskMutation.isPending ? <SquareIcon /> : <ArrowUpIcon />}
                    </Button>
                  </PromptInputAction>
                </div>
              </PromptInputActions>
            </Input>
          </div>

          {true && (
            <div className="relative mt-2">
              {showCategorySuggestions ? (
                <div className="flex flex-col space-y-1">
                  {activeCategoryData?.items.map((suggestion) => (
                    <Suggestion
                      key={suggestion}
                      highlight={activeCategoryData.highlight}
                      onClick={() => {
                        setPrompt(suggestion);
                        setActiveCategory("");
                      }}
                    >
                      {suggestion}
                    </Suggestion>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {suggestionGroups.map((suggestion) => (
                    <Suggestion
                      key={suggestion.label}
                      size="sm"
                      onClick={() => {
                        setActiveCategory(suggestion.label);
                        setPrompt("");
                      }}
                      className="capitalize flex gap-1"
                    >
                      {suggestion.icon && <suggestion.icon />}
                      {suggestion.label}
                    </Suggestion>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
