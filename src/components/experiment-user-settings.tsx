"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { GearIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import EditUsernameForm from "./edit-username-form";
import useChatStore from "@/app/hooks/useChatStore";
import { useExperimentStore } from "@/app/hooks/useExperimentStore";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function ExperimentUserSettings() {
  const [open, setOpen] = useState(false);
  const userName = useChatStore((state) => state.userName);
  const { endSession, currentSession } = useExperimentStore();
  const router = useRouter();

  const handleEndSession = async () => {
    if (currentSession) {
      await endSession();
      router.push('/');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex justify-center gap-2 h-10 text-sm font-normal items-center px-3 bg-background border-border hover:bg-muted rounded-full shadow-sm"
        >
          <Avatar className="flex justify-start items-center overflow-hidden w-6 h-6">
            <AvatarImage
              src=""
              alt="User"
              className="object-contain"
            />
            <AvatarFallback className="text-xs">
              {userName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-xs truncate">
            <p>{userName}</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 p-2">
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
            </DialogHeader>
          </DialogContent>
        </Dialog>
        
        <DropdownMenuItem onClick={handleEndSession} className="text-destructive">
          <div className="flex w-full gap-2 p-1 items-center cursor-pointer">
            <LogOut className="w-4 h-4" />
            End Session
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 