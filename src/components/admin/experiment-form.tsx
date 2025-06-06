"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useExperimentStore } from "@/app/hooks/useExperimentStore";
import { ExperimentConfig } from "@/types/experiment";
import { generateUUID } from "@/lib/utils";

const experimentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  personas: z.array(z.string()).min(1, "At least one persona is required"),
  conditions: z.array(z.string()).min(1, "At least one condition is required"),
  randomizeAssignment: z.boolean(),
  collectDemographics: z.boolean(),
  requireConsent: z.boolean(),
  maxSessionDuration: z.number().min(1).max(180),
});

type ExperimentFormData = z.infer<typeof experimentSchema>;

interface ExperimentFormProps {
  experiment?: ExperimentConfig | null;
  onSave: () => void;
  onCancel: () => void;
}

export function ExperimentForm({ experiment, onSave, onCancel }: ExperimentFormProps) {
  const { personas, conditions, saveExperiment } = useExperimentStore();
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExperimentFormData>({
    resolver: zodResolver(experimentSchema),
    defaultValues: {
      name: experiment?.name || "",
      description: experiment?.description || "",
      personas: experiment?.personas || [],
      conditions: experiment?.conditions || [],
      randomizeAssignment: experiment?.randomizeAssignment ?? true,
      collectDemographics: experiment?.collectDemographics ?? true,
      requireConsent: experiment?.requireConsent ?? true,
      maxSessionDuration: experiment?.maxSessionDuration || 60,
    },
  });

  const selectedPersonas = watch("personas");
  const selectedConditions = watch("conditions");

  const onSubmit = async (data: ExperimentFormData) => {
    const experimentConfig: ExperimentConfig = {
      id: experiment?.id || generateUUID(),
      ...data,
      isActive: experiment?.isActive ?? false,
      createdAt: experiment?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveExperiment(experimentConfig);
    onSave();
  };

  const handlePersonaToggle = (personaId: string, checked: boolean) => {
    if (checked) {
      setValue("personas", [...selectedPersonas, personaId]);
    } else {
      setValue("personas", selectedPersonas.filter(id => id !== personaId));
    }
  };

  const handleConditionToggle = (conditionId: string, checked: boolean) => {
    if (checked) {
      setValue("conditions", [...selectedConditions, conditionId]);
    } else {
      setValue("conditions", selectedConditions.filter(id => id !== conditionId));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Experiment Name</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Enter experiment name"
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
            placeholder="Describe the purpose and methodology of this experiment"
            rows={3}
          />
          {errors.description && (
            <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="maxSessionDuration">Max Session Duration (minutes)</Label>
          <Input
            id="maxSessionDuration"
            type="number"
            {...register("maxSessionDuration", { valueAsNumber: true })}
            min={1}
            max={180}
          />
          {errors.maxSessionDuration && (
            <p className="text-sm text-destructive mt-1">{errors.maxSessionDuration.message}</p>
          )}
        </div>
      </div>

      {/* Personas Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Personas</CardTitle>
          <CardDescription>
            Select the AI personas that participants will interact with
          </CardDescription>
        </CardHeader>
        <CardContent>
          {personas.length === 0 ? (
            <p className="text-muted-foreground">No personas available. Create some personas first.</p>
          ) : (
            <div className="space-y-3">
              {personas.map((persona) => (
                <div key={persona.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={`persona-${persona.id}`}
                    checked={selectedPersonas.includes(persona.id)}
                    onCheckedChange={(checked) =>
                      handlePersonaToggle(persona.id, checked as boolean)
                    }
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={`persona-${persona.id}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {persona.name}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {persona.description} • {persona.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {errors.personas && (
            <p className="text-sm text-destructive mt-2">{errors.personas.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Conditions Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Experimental Conditions</CardTitle>
          <CardDescription>
            Select the experimental conditions for this study
          </CardDescription>
        </CardHeader>
        <CardContent>
          {conditions.length === 0 ? (
            <p className="text-muted-foreground">No conditions available. Create some conditions first.</p>
          ) : (
            <div className="space-y-3">
              {conditions.map((condition) => (
                <div key={condition.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={`condition-${condition.id}`}
                    checked={selectedConditions.includes(condition.id)}
                    onCheckedChange={(checked) =>
                      handleConditionToggle(condition.id, checked as boolean)
                    }
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={`condition-${condition.id}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {condition.name}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {condition.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {errors.conditions && (
            <p className="text-sm text-destructive mt-2">{errors.conditions.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Experiment Settings</CardTitle>
          <CardDescription>
            Configure how the experiment will be conducted
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Randomize Assignment</Label>
              <p className="text-sm text-muted-foreground">
                Randomly assign personas and conditions to participants
              </p>
            </div>
            <Switch
              checked={watch("randomizeAssignment")}
              onCheckedChange={(checked) => setValue("randomizeAssignment", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Collect Demographics</Label>
              <p className="text-sm text-muted-foreground">
                Ask participants for demographic information
              </p>
            </div>
            <Switch
              checked={watch("collectDemographics")}
              onCheckedChange={(checked) => setValue("collectDemographics", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Require Consent</Label>
              <p className="text-sm text-muted-foreground">
                Participants must provide consent before starting
              </p>
            </div>
            <Switch
              checked={watch("requireConsent")}
              onCheckedChange={(checked) => setValue("requireConsent", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {experiment ? "Update Experiment" : "Create Experiment"}
        </Button>
      </div>
    </form>
  );
} 