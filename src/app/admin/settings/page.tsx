"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Cpu, 
  Download, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Trash2
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CaretSortIcon } from "@radix-ui/react-icons";
import useChatStore from "@/app/hooks/useChatStore";
import { useExperimentStore } from "@/app/hooks/useExperimentStore";
import { toast } from "sonner";
import PullModel from "@/components/pull-model";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { ImageIcon } from "lucide-react";

export default function AdminSettingsPage() {
  const [models, setModels] = useState<string[]>([]);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const selectedModel = useChatStore((state) => state.selectedModel);
  const setSelectedModel = useChatStore((state) => state.setSelectedModel);
  const deleteAllChats = useChatStore((state) => state.deleteAllChats);
  
  // Experiment store for admin settings
  const { adminSettings, updateAdminSettings } = useExperimentStore();

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tags");
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

      const data = await res.json().catch(() => null);
      if (!data?.models?.length) {
        setModels([]);
        return;
      }

      const modelNames = data.models.map(({ name }: { name: string }) => name);
      setModels(modelNames);
      
      // Set default model if none is selected
      if (!selectedModel && modelNames.length > 0) {
        const defaultModel = modelNames.find((name: string) => name.includes('gemma:2b')) || modelNames[0];
        setSelectedModel(defaultModel);
      }
    } catch (error) {
      console.error("Error fetching models:", error);
      toast.error("Failed to load AI models");
    } finally {
      setLoading(false);
    }
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    setModelSelectorOpen(false);
    toast.success(`AI model changed to ${model}`);
  };

  const handleDeleteAllChats = () => {
    if (window.confirm("Are you sure you want to delete ALL chat data? This action cannot be undone and will affect all participants.")) {
      deleteAllChats();
      toast.success("All chat data deleted successfully");
    }
  };

  const handleImageUploadToggle = (enabled: boolean) => {
    updateAdminSettings({ allowImageUploads: enabled });
    toast.success(`Image uploads ${enabled ? 'enabled' : 'disabled'} for all participants`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground">
            Configure global system settings and AI model management
          </p>
        </div>
      </div>

      {/* AI Model Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            AI Model Configuration
          </CardTitle>
          <CardDescription>
            Manage the AI models used for all experiments and conversations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Current AI Model</h3>
              <div className="flex items-center gap-3">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-muted-foreground">Loading models...</span>
                  </div>
                ) : (
                  <>
                    <Popover open={modelSelectorOpen} onOpenChange={setModelSelectorOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={modelSelectorOpen}
                          className="w-64 justify-between"
                        >
                          {selectedModel || "Select model"}
                          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-1">
                        {models.length > 0 ? (
                          models.map((model) => (
                            <Button
                              key={model}
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => handleModelChange(model)}
                            >
                              <div className="flex items-center gap-2">
                                {selectedModel === model && (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                )}
                                <span>{model}</span>
                              </div>
                            </Button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-muted-foreground">
                            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                            <p>No models available</p>
                            <p className="text-xs">Download a model to get started</p>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadModels}
                      className="gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh
                    </Button>
                  </>
                )}
              </div>
              
              {selectedModel && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                  <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Active Model: {selectedModel}</span>
                  </div>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    This model will be used for all new experiment sessions and conversations.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-foreground mb-2">Model Management</h3>
              <div className="flex gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      Download New Model
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Download AI Model</DialogTitle>
                    </DialogHeader>
                    <PullModel />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Chat Features
          </CardTitle>
          <CardDescription>
            Control what features are available to participants during conversations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Image Uploads</div>
              <div className="text-xs text-muted-foreground">
                Allow participants to upload and send images during conversations
              </div>
            </div>
            <Switch
              checked={adminSettings.allowImageUploads}
              onCheckedChange={handleImageUploadToggle}
            />
          </div>
          
          <div className="flex items-center justify-between opacity-50">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Voice Input</div>
              <div className="text-xs text-muted-foreground">
                Voice input is automatically enabled based on browser support
              </div>
            </div>
            <Switch
              checked={typeof window !== 'undefined' && 'webkitSpeechRecognition' in window}
              disabled={true}
            />
          </div>
        </CardContent>
      </Card>

      {/* System Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Management
          </CardTitle>
          <CardDescription>
            Dangerous operations that affect the entire system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-destructive/20 rounded-md bg-destructive/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-destructive">Danger Zone</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  These actions cannot be undone and will affect all users and experiments.
                </p>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAllChats}
                  className="mt-3 gap-2"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete All Chat Data
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>
            Current system status and statistics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Available Models</p>
              <p className="text-2xl font-bold">{models.length}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Active Model</p>
              <p className="text-lg font-medium">{selectedModel || "None"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 