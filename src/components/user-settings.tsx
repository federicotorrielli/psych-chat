"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { GearIcon, CaretSortIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { set } from "zod";
import UsernameForm from "./username-form";
import EditUsernameForm from "./edit-username-form";
import PullModel from "./pull-model";
import useChatStore from "@/app/hooks/useChatStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function UserSettings() {
  const [open, setOpen] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);

  const userName = useChatStore((state) => state.userName);
  const selectedModel = useChatStore((state) => state.selectedModel);
  const setSelectedModel = useChatStore((state) => state.setSelectedModel);
  const deleteAllChats = useChatStore((state) => state.deleteAllChats);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/tags");
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

        const data = await res.json().catch(() => null);
        if (!data?.models?.length) return;

        const modelNames = data.models.map(({ name }: { name: string }) => name);
        setModels(modelNames);
        
        // Set default model if none is selected
        if (!selectedModel && modelNames.length > 0) {
          const defaultModel = modelNames.find((name: string) => name.includes('gemma:2b')) || modelNames[0];
          setSelectedModel(defaultModel);
        }
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    })();
  }, [selectedModel, setSelectedModel]);

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    setModelSelectorOpen(false);
    toast.success(`Model changed to ${model}`);
  };

  const handleDeleteAllChats = () => {
    if (window.confirm("Are you sure you want to delete all chats? This action cannot be undone.")) {
      deleteAllChats();
      toast.success("All chats deleted successfully");
      router.push("/");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex justify-start gap-3 w-full h-14 text-base font-normal items-center "
        >
          <Avatar className="flex justify-start items-center overflow-hidden">
            <AvatarImage
              src=""
              alt="AI"
              width={4}
              height={4}
              className="object-contain"
            />
            <AvatarFallback>
              {userName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-xs truncate">
            <p>{userName}</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 p-2">
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <PullModel />
        </DropdownMenuItem>
        <Dialog>
          <DialogTrigger className="w-full">
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <div className="flex w-full gap-2 p-1 items-center cursor-pointer">
                <GearIcon className="w-4 h-4" />
                Settings
              </div>
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader className="space-y-4">
              <DialogTitle>Settings</DialogTitle>
              <EditUsernameForm setOpen={setOpen} />
              
              <div className="pt-4 border-t">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">AI Model</h3>
                    <p className="text-xs text-muted-foreground">Select the AI model for conversations</p>
                  </div>
                  <Popover open={modelSelectorOpen} onOpenChange={setModelSelectorOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={modelSelectorOpen}
                        className="w-full justify-between"
                      >
                        {selectedModel || "Select model"}
                        <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-1">
                      {models.length > 0 ? (
                        models.map((model) => (
                          <Button
                            key={model}
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => handleModelChange(model)}
                          >
                            {model}
                          </Button>
                        ))
                      ) : (
                        <Button variant="ghost" disabled className="w-full">
                          No models available
                        </Button>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Chat Management</h3>
                    <p className="text-xs text-muted-foreground">Manage your chat history</p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAllChats}
                    className="w-full gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete All Chats
                  </Button>
                </div>
              </div>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        <Dialog></Dialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
