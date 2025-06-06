"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useExperimentStore } from "@/app/hooks/useExperimentStore";
import { Persona } from "@/types/experiment";
import { generateUUID } from "@/lib/utils";
import { X } from "lucide-react";

const personaSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  systemPrompt: z.string().min(10, "System prompt must be at least 10 characters"),
  category: z.enum(['patient', 'psychologist'], {
    required_error: "Category is required",
  }),
  tags: z.array(z.string()),
});

type PersonaFormData = z.infer<typeof personaSchema>;

interface PersonaFormProps {
  persona?: Persona | null;
  onSave: () => void;
  onCancel: () => void;
}

const defaultPrompts = {
  patient: {
    "Anxious Young Adult": "You are a 24-year-old college student experiencing significant anxiety about your future career and relationships. You tend to overthink situations, worry about judgment from others, and have difficulty sleeping. You're seeking help to manage your anxiety and develop coping strategies. Respond naturally as this person would, showing vulnerability but also hope for improvement.",
    "Depressed Professional": "You are a 35-year-old professional who has been struggling with depression for the past year following a major life change. You feel emotionally numb, have lost interest in activities you used to enjoy, and struggle with feelings of worthlessness. You're hesitant to open up but recognize you need help. Express your struggles while showing gradual willingness to engage in therapy.",
    "PTSD Survivor": "You are a 28-year-old who experienced a traumatic event 6 months ago. You have nightmares, hypervigilance, and avoid certain places or situations that remind you of the trauma. You're dealing with PTSD symptoms but are determined to heal. Show realistic trauma responses while being open to therapeutic interventions."
  },
  psychologist: {
    "Cognitive Behavioral Therapist": "You are an experienced CBT therapist with 10 years of practice. You focus on identifying and changing negative thought patterns and behaviors. You use techniques like thought records, behavioral experiments, and homework assignments. Your approach is structured, evidence-based, and collaborative. Maintain professional boundaries while being warm and supportive.",
    "Humanistic Counselor": "You are a person-centered therapist who believes in the client's inherent capacity for growth and self-actualization. You practice unconditional positive regard, empathy, and genuineness. You reflect feelings, ask open-ended questions, and avoid giving direct advice. Your goal is to create a safe, non-judgmental space for exploration.",
    "Trauma-Informed Therapist": "You are a therapist specializing in trauma recovery using approaches like EMDR and somatic therapy. You understand how trauma affects the nervous system and always prioritize safety and stabilization. You're highly attuned to signs of dissociation or overwhelm and skilled at grounding techniques. Your approach is gentle, patient, and trauma-informed."
  }
};

export function PersonaForm({ persona, onSave, onCancel }: PersonaFormProps) {
  const { savePersona } = useExperimentStore();
  const [newTag, setNewTag] = useState("");
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PersonaFormData>({
    resolver: zodResolver(personaSchema),
    defaultValues: {
      name: persona?.name || "",
      description: persona?.description || "",
      systemPrompt: persona?.systemPrompt || "",
      category: persona?.category || undefined,
      tags: persona?.tags || [],
    },
  });

  const selectedCategory = watch("category");
  const currentTags = watch("tags");

  const onSubmit = async (data: PersonaFormData) => {
    const personaData: Persona = {
      id: persona?.id || generateUUID(),
      ...data,
      createdAt: persona?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await savePersona(personaData);
    onSave();
  };

  const addTag = () => {
    if (newTag.trim() && !currentTags.includes(newTag.trim())) {
      setValue("tags", [...currentTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue("tags", currentTags.filter(tag => tag !== tagToRemove));
  };

  const applyDefaultPrompt = (promptKey: string) => {
    if (selectedCategory && defaultPrompts[selectedCategory]) {
      const prompts = defaultPrompts[selectedCategory] as Record<string, string>;
      if (prompts[promptKey]) {
        setValue("systemPrompt", prompts[promptKey]);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Persona Name</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Enter persona name"
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={selectedCategory}
            onValueChange={(value) => setValue("category", value as "patient" | "psychologist")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="patient">Patient</SelectItem>
              <SelectItem value="psychologist">Psychologist</SelectItem>
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Brief description of this persona"
            rows={2}
          />
          {errors.description && (
            <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
          )}
        </div>
      </div>

      {/* System Prompt */}
      <Card>
        <CardHeader>
          <CardTitle>System Prompt</CardTitle>
          <CardDescription>
            Define how this AI persona should behave and respond
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Default Prompt Templates */}
          {selectedCategory && (
            <div>
              <Label className="text-sm font-medium">Quick Start Templates:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.keys(defaultPrompts[selectedCategory]).map((promptKey) => (
                  <Button
                    key={promptKey}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyDefaultPrompt(promptKey)}
                  >
                    {promptKey}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="systemPrompt">System Prompt</Label>
            <Textarea
              id="systemPrompt"
              {...register("systemPrompt")}
              placeholder="Describe how this persona should behave, their background, personality, and how they should respond to different situations..."
              rows={8}
              className="font-mono text-sm"
            />
            {errors.systemPrompt && (
              <p className="text-sm text-destructive mt-1">{errors.systemPrompt.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
          <CardDescription>
            Add tags to help organize and categorize this persona
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag} variant="outline">
              Add
            </Button>
          </div>

          {currentTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {currentTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {persona ? "Update Persona" : "Create Persona"}
        </Button>
      </div>
    </form>
  );
} 