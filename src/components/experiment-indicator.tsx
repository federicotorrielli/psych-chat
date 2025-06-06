"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useExperimentStore } from "@/app/hooks/useExperimentStore";
import { Brain, Settings, Clock, LogOut } from "lucide-react";

export function ExperimentIndicator() {
  const { 
    currentSession, 
    currentExperiment,
    personas,
    conditions,
    endSession 
  } = useExperimentStore();

  if (!currentSession || !currentExperiment) return null;

  const persona = personas.find(p => p.id === currentSession.personaId);
  const condition = conditions.find(c => c.id === currentSession.conditionId);

  const handleEndSession = async () => {
    if (currentSession && window.confirm("Are you sure you want to end this experiment session?")) {
      await endSession(currentSession.id);
    }
  };

  const sessionDuration = Math.floor((Date.now() - new Date(currentSession.startTime).getTime()) / 1000 / 60);

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-blue-600">
                Experiment Active
              </Badge>
              <span className="text-sm font-medium">{currentExperiment.name}</span>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
                <span>{persona?.name} ({persona?.category})</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Settings className="h-3 w-3" />
                <span>{condition?.name}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{sessionDuration}m elapsed</span>
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEndSession}
            className="gap-1"
          >
            <LogOut className="h-3 w-3" />
            End Session
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 