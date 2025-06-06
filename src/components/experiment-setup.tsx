"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useExperimentStore } from "@/app/hooks/useExperimentStore";
import { ExperimentConfig, Persona, ExperimentCondition } from "@/types/experiment";
import { User, Brain, Settings, Play } from "lucide-react";

const demographicsSchema = z.object({
  age: z.number().min(18).max(100).optional(),
  gender: z.string().optional(),
  profession: z.string().optional(),
  experienceLevel: z.enum(['novice', 'intermediate', 'expert']).optional(),
});

type DemographicsFormData = z.infer<typeof demographicsSchema>;

interface ExperimentSetupProps {
  onComplete: () => void;
}

export function ExperimentSetup({ onComplete }: ExperimentSetupProps) {
  const {
    experiments,
    personas,
    conditions,
    createParticipant,
    startSession,
    setCurrentExperiment,
    loadPersonas,
    loadConditions,
  } = useExperimentStore();

  const [step, setStep] = useState<'consent' | 'demographics' | 'selection' | 'ready'>('consent');
  const [selectedExperiment, setSelectedExperiment] = useState<ExperimentConfig | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<ExperimentCondition | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DemographicsFormData>({
    resolver: zodResolver(demographicsSchema),
  });

  useEffect(() => {
    loadPersonas();
    loadConditions();
  }, [loadPersonas, loadConditions]);

  useEffect(() => {
    // Auto-select the first active experiment
    const activeExperiments = experiments.filter(e => e.isActive);
    if (activeExperiments.length > 0 && !selectedExperiment) {
      setSelectedExperiment(activeExperiments[0]);
    }
  }, [experiments, selectedExperiment]);

  useEffect(() => {
    if (selectedExperiment) {
      // Auto-assign random persona and condition if randomization is enabled
      if (selectedExperiment.randomizeAssignment) {
        const availablePersonas = personas.filter(p => selectedExperiment.personas.includes(p.id));
        const availableConditions = conditions.filter(c => selectedExperiment.conditions.includes(c.id));
        
        if (availablePersonas.length > 0 && !selectedPersona) {
          const randomPersona = availablePersonas[Math.floor(Math.random() * availablePersonas.length)];
          setSelectedPersona(randomPersona);
        }
        
        if (availableConditions.length > 0 && !selectedCondition) {
          const randomCondition = availableConditions[Math.floor(Math.random() * availableConditions.length)];
          setSelectedCondition(randomCondition);
        }
      }
    }
  }, [selectedExperiment, personas, conditions, selectedPersona, selectedCondition]);

  const handleConsentContinue = () => {
    if (!consentGiven) return;
    
    if (selectedExperiment?.collectDemographics) {
      setStep('demographics');
    } else {
      setStep('selection');
    }
  };

  const handleDemographicsSubmit = (data: DemographicsFormData) => {
    if (selectedExperiment?.randomizeAssignment) {
      setStep('ready');
    } else {
      setStep('selection');
    }
  };

  const handleSelectionContinue = () => {
    setStep('ready');
  };

  const handleStartExperiment = async () => {
    if (!selectedExperiment || !selectedPersona || !selectedCondition) return;

    try {
      const participant = await createParticipant({
        consentGiven: true,
        // Demographics would be collected in real implementation
      });

      await startSession(participant.id, selectedPersona.id, selectedCondition.id);
      setCurrentExperiment(selectedExperiment);
      onComplete();
    } catch (error) {
      console.error("Error starting experiment:", error);
    }
  };

  if (step === 'consent') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informed Consent
            </CardTitle>
            <CardDescription>
              Please read and consent to participate in this research study
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-md text-sm space-y-3">
              <p><strong>Study Title:</strong> {selectedExperiment?.name || "Psychology Research Study"}</p>
              <p><strong>Purpose:</strong> {selectedExperiment?.description || "This study investigates human-AI interaction in psychological contexts."}</p>
              <p><strong>Procedure:</strong> You will engage in a conversation with an AI persona. Your responses will be recorded for research purposes.</p>
              <p><strong>Risks:</strong> There are minimal risks associated with this study.</p>
              <p><strong>Benefits:</strong> Your participation contributes to understanding human-AI interaction.</p>
              <p><strong>Confidentiality:</strong> Your data will be kept confidential and used only for research purposes.</p>
              <p><strong>Voluntary Participation:</strong> Your participation is voluntary and you may withdraw at any time.</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="consent"
                checked={consentGiven}
                onCheckedChange={(checked) => setConsentGiven(checked as boolean)}
              />
              <Label htmlFor="consent" className="text-sm">
                I have read and understood the above information and consent to participate in this research study.
              </Label>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button onClick={handleConsentContinue} disabled={!consentGiven}>
            Continue
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'demographics') {
    return (
      <form onSubmit={handleSubmit(handleDemographicsSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Demographics Information</CardTitle>
            <CardDescription>
              Please provide some basic information about yourself (optional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                {...register("age", { valueAsNumber: true })}
                min={18}
                max={100}
                placeholder="Enter your age"
              />
              {errors.age && (
                <p className="text-sm text-destructive mt-1">{errors.age.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="gender">Gender</Label>
              <Input
                id="gender"
                {...register("gender")}
                placeholder="Enter your gender identity"
              />
            </div>

            <div>
              <Label htmlFor="profession">Profession</Label>
              <Input
                id="profession"
                {...register("profession")}
                placeholder="Enter your profession or field of study"
              />
            </div>

            <div>
              <Label>Experience with AI/Psychology</Label>
              <Select onValueChange={(value) => register("experienceLevel").onChange({ target: { value } })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="novice">Novice - Little to no experience</SelectItem>
                  <SelectItem value="intermediate">Intermediate - Some experience</SelectItem>
                  <SelectItem value="expert">Expert - Extensive experience</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setStep('selection')}>
            Skip
          </Button>
          <Button type="submit">
            Continue
          </Button>
        </div>
      </form>
    );
  }

  if (step === 'selection' && selectedExperiment && !selectedExperiment.randomizeAssignment) {
    const availablePersonas = personas.filter(p => selectedExperiment.personas.includes(p.id));
    const availableConditions = conditions.filter(c => selectedExperiment.conditions.includes(c.id));

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Choose Your AI Persona
            </CardTitle>
            <CardDescription>
              Select the AI persona you would like to interact with
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {availablePersonas.map((persona) => (
                <div
                  key={persona.id}
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedPersona?.id === persona.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedPersona(persona)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{persona.name}</h4>
                      <p className="text-sm text-muted-foreground">{persona.description}</p>
                    </div>
                    <div className="text-xs bg-muted px-2 py-1 rounded">
                      {persona.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Experimental Condition
            </CardTitle>
            <CardDescription>
              Select the interaction style for this session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {availableConditions.map((condition) => (
                <div
                  key={condition.id}
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedCondition?.id === condition.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedCondition(condition)}
                >
                  <h4 className="font-medium">{condition.name}</h4>
                  <p className="text-sm text-muted-foreground">{condition.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleSelectionContinue}
            disabled={!selectedPersona || !selectedCondition}
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'ready') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Ready to Begin
            </CardTitle>
            <CardDescription>
              Your experiment session is configured and ready to start
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Experiment:</span>
                <span>{selectedExperiment?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">AI Persona:</span>
                <span>{selectedPersona?.name} ({selectedPersona?.category})</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Condition:</span>
                <span>{selectedCondition?.name}</span>
              </div>
              {selectedExperiment?.maxSessionDuration && (
                <div className="flex justify-between">
                  <span className="font-medium">Session Duration:</span>
                  <span>Up to {selectedExperiment.maxSessionDuration} minutes</span>
                </div>
              )}
            </div>
            
            <div className="bg-muted p-3 rounded-md text-sm">
              <p><strong>Instructions:</strong> You will now begin a conversation with the AI persona. Be natural and engage as you would in a real conversation. Your responses will be recorded for research purposes.</p>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button onClick={handleStartExperiment}>
            Start Experiment
          </Button>
        </div>
      </div>
    );
  }

  return null;
} 