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

import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { GearIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import EditUsernameForm from "./edit-username-form";
import PullModel from "./pull-model";
import useChatStore from "@/app/hooks/useChatStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface UserSettingsProps {
  variant?: 'sidebar' | 'floating';
}

export default function UserSettings({ variant = 'sidebar' }: UserSettingsProps) {
  const [open, setOpen] = useState(false);

  const userName = useChatStore((state) => state.userName);
  const deleteAllChats = useChatStore((state) => state.deleteAllChats);
  const router = useRouter();

  const handleDeleteAllChats = () => {
    if (window.confirm("Are you sure you want to delete all chats? This action cannot be undone.")) {
      deleteAllChats();
      toast.success("All chats deleted successfully");
      router.push("/");
    }
  };

  const buttonClassName = variant === 'floating' 
    ? "flex justify-center gap-2 h-11 text-sm font-medium items-center px-4 bg-card hover:bg-accent border border-border rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
    : "flex justify-start gap-3 w-full h-14 text-base font-normal items-center";
    
  const avatarSize = variant === 'floating' ? "w-7 h-7" : "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant === 'floating' ? 'outline' : 'ghost'}
          className={buttonClassName}
        >
          <Avatar className={`flex justify-start items-center overflow-hidden ${avatarSize}`}>
            <AvatarImage
              src=""
              alt="User"
              width={4}
              height={4}
              className="object-contain"
            />
            <AvatarFallback className={variant === 'floating' ? 'text-xs' : ''}>
              {userName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {variant === 'sidebar' && (
            <div className="text-xs truncate">
              <p>{userName}</p>
            </div>
          )}
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
