"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useExperimentStore } from "@/app/hooks/useExperimentStore";
import { ExperimentCondition } from "@/types/experiment";
import { generateUUID } from "@/lib/utils";

const conditionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  settings: z.object({
    showTypingIndicator: z.boolean(),
    responseDelay: z.number().min(0).max(10000),
    maxResponseLength: z.number().min(50).max(2000),
    enableEmotionalReactions: z.boolean(),
    simulateUserTyping: z.boolean(),
    randomResponseDelay: z.boolean(),
    contextAwareness: z.enum(['none', 'session', 'full']),
    interruptionHandling: z.boolean(),
  }),
});

type ConditionFormData = z.infer<typeof conditionSchema>;

interface ConditionFormProps {
  condition?: ExperimentCondition | null;
  onSave: () => void;
  onCancel: () => void;
}

export function ConditionForm({ condition, onSave, onCancel }: ConditionFormProps) {
  const { saveCondition } = useExperimentStore();
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ConditionFormData>({
    resolver: zodResolver(conditionSchema),
    defaultValues: {
      name: condition?.name || "",
      description: condition?.description || "",
      settings: {
        showTypingIndicator: condition?.settings.showTypingIndicator ?? true,
        responseDelay: condition?.settings.responseDelay ?? 1000,
        maxResponseLength: condition?.settings.maxResponseLength ?? 500,
        enableEmotionalReactions: condition?.settings.enableEmotionalReactions ?? false,
        simulateUserTyping: condition?.settings.simulateUserTyping ?? false,
        randomResponseDelay: condition?.settings.randomResponseDelay ?? false,
        contextAwareness: condition?.settings.contextAwareness ?? 'session',
        interruptionHandling: condition?.settings.interruptionHandling ?? false,
      },
    },
  });

  const watchedSettings = watch("settings");

  const onSubmit = async (data: ConditionFormData) => {
    const conditionData: ExperimentCondition = {
      id: condition?.id || generateUUID(),
      ...data,
    };

    await saveCondition(conditionData);
    onSave();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Condition Name</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Enter condition name"
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Describe this experimental condition and its purpose"
            rows={3}
          />
          {errors.description && (
            <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
          )}
        </div>
      </div>

      {/* Interaction Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Interaction Behavior</CardTitle>
          <CardDescription>
            Configure how the AI should behave during conversations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Show Typing Indicator</Label>
              <p className="text-sm text-muted-foreground">
                Display &quot;AI is typing...&quot; indicator before responses
              </p>
            </div>
            <Switch
              checked={watchedSettings.showTypingIndicator}
              onCheckedChange={(checked) => setValue("settings.showTypingIndicator", checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responseDelay">Response Delay (milliseconds)</Label>
            <Input
              id="responseDelay"
              type="number"
              {...register("settings.responseDelay", { valueAsNumber: true })}
              min={0}
              max={10000}
              step={100}
            />
            <p className="text-xs text-muted-foreground">
              Delay before AI responds (0-10000ms). Current: {watchedSettings.responseDelay}ms
            </p>
            {errors.settings?.responseDelay && (
              <p className="text-sm text-destructive">{errors.settings.responseDelay.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Random Response Delay</Label>
              <p className="text-sm text-muted-foreground">
                Add randomness to response timing (±50% of base delay)
              </p>
            </div>
            <Switch
              checked={watchedSettings.randomResponseDelay}
              onCheckedChange={(checked) => setValue("settings.randomResponseDelay", checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxResponseLength">Max Response Length (characters)</Label>
            <Input
              id="maxResponseLength"
              type="number"
              {...register("settings.maxResponseLength", { valueAsNumber: true })}
              min={50}
              max={2000}
              step={50}
            />
            <p className="text-xs text-muted-foreground">
              Maximum length of AI responses (50-2000 chars)
            </p>
            {errors.settings?.maxResponseLength && (
              <p className="text-sm text-destructive">{errors.settings.maxResponseLength.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Features */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Features</CardTitle>
          <CardDescription>
            Enable experimental features for more realistic interactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Emotional Reactions</Label>
              <p className="text-sm text-muted-foreground">
                Allow AI to express emotions through text formatting and emojis
              </p>
            </div>
            <Switch
              checked={watchedSettings.enableEmotionalReactions}
              onCheckedChange={(checked) => setValue("settings.enableEmotionalReactions", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Simulate User Typing</Label>
              <p className="text-sm text-muted-foreground">
                Show typing indicator while user is composing messages
              </p>
            </div>
            <Switch
              checked={watchedSettings.simulateUserTyping}
              onCheckedChange={(checked) => setValue("settings.simulateUserTyping", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Interruption Handling</Label>
              <p className="text-sm text-muted-foreground">
                Allow AI to handle and respond to message interruptions
              </p>
            </div>
            <Switch
              checked={watchedSettings.interruptionHandling}
              onCheckedChange={(checked) => setValue("settings.interruptionHandling", checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Context Awareness Level</Label>
            <Select
              value={watchedSettings.contextAwareness}
              onValueChange={(value) => setValue("settings.contextAwareness", value as 'none' | 'session' | 'full')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None - No memory of previous messages</SelectItem>
                <SelectItem value="session">Session - Remember current conversation</SelectItem>
                <SelectItem value="full">Full - Remember all interactions with user</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              How much context the AI should remember across conversations
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Condition Preview</CardTitle>
          <CardDescription>
            Summary of how this condition will affect the experiment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Response Time:</strong> {
              watchedSettings.randomResponseDelay 
                ? `${Math.round(watchedSettings.responseDelay * 0.5)}-${Math.round(watchedSettings.responseDelay * 1.5)}ms (random)`
                : `${watchedSettings.responseDelay}ms (fixed)`
            }</p>
            <p><strong>Response Length:</strong> Up to {watchedSettings.maxResponseLength} characters</p>
            <p><strong>Context Memory:</strong> {watchedSettings.contextAwareness}</p>
            <p><strong>Special Features:</strong> {
              [
                watchedSettings.showTypingIndicator && "Typing Indicator",
                watchedSettings.enableEmotionalReactions && "Emotional Reactions", 
                watchedSettings.simulateUserTyping && "User Typing Simulation",
                watchedSettings.interruptionHandling && "Interruption Handling"
              ].filter(Boolean).join(", ") || "None"
            }</p>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {condition ? "Update Condition" : "Create Condition"}
        </Button>
      </div>
    </form>
  );
} 