"use client";

import React, { useEffect, useState } from "react";
import { useExperimentStore } from "@/app/hooks/useExperimentStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Settings, Clock, Zap } from "lucide-react";
import { ExperimentCondition } from "@/types/experiment";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ConditionForm } from "@/components/admin/condition-form";

export default function ConditionsPage() {
  const {
    conditions,
    loadConditions,
    deleteCondition,
  } = useExperimentStore();

  const [selectedCondition, setSelectedCondition] = useState<ExperimentCondition | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    loadConditions();
  }, [loadConditions]);

  const handleCreateCondition = () => {
    setSelectedCondition(null);
    setIsFormOpen(true);
  };

  const handleEditCondition = (condition: ExperimentCondition) => {
    setSelectedCondition(condition);
    setIsFormOpen(true);
  };

  const handleDeleteCondition = async (conditionId: string) => {
    if (window.confirm("Are you sure you want to delete this condition?")) {
      await deleteCondition(conditionId);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Experimental Conditions</h1>
          <p className="text-muted-foreground">
            Configure different experimental conditions and behaviors
          </p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateCondition} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Condition
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedCondition ? "Edit Condition" : "Create Condition"}
              </DialogTitle>
            </DialogHeader>
            <ConditionForm
              condition={selectedCondition}
              onSave={() => setIsFormOpen(false)}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conditions</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conditions.length}</div>
            <p className="text-xs text-muted-foreground">
              Available experimental conditions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Delays</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {conditions.filter(c => c.settings.responseDelay > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Conditions with response delays
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interactive Features</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {conditions.filter(c => c.settings.showTypingIndicator || c.settings.enableEmotionalReactions).length}
            </div>
            <p className="text-xs text-muted-foreground">
              With enhanced interactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conditions List */}
      <div className="space-y-4">
        {conditions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Settings className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No conditions yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create experimental conditions to control how the AI behaves during experiments
              </p>
              <Button onClick={handleCreateCondition} className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Condition
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {conditions.map((condition) => (
              <ConditionCard
                key={condition.id}
                condition={condition}
                onEdit={handleEditCondition}
                onDelete={handleDeleteCondition}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ConditionCardProps {
  condition: ExperimentCondition;
  onEdit: (condition: ExperimentCondition) => void;
  onDelete: (conditionId: string) => void;
}

function ConditionCard({ condition, onEdit, onDelete }: ConditionCardProps) {
  const { settings } = condition;
  
  const getActiveFeatures = () => {
    const features = [];
    if (settings.showTypingIndicator) features.push("Typing Indicator");
    if (settings.responseDelay > 0) features.push(`${settings.responseDelay}ms Delay`);
    if (settings.enableEmotionalReactions) features.push("Emotional Reactions");
    if (settings.simulateUserTyping) features.push("Typing Simulation");
    if (settings.randomResponseDelay) features.push("Random Delays");
    if (settings.interruptionHandling) features.push("Interruption Handling");
    return features;
  };

  const activeFeatures = getActiveFeatures();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{condition.name}</CardTitle>
            <Badge variant="outline" className="w-fit">
              {settings.contextAwareness} context
            </Badge>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(condition)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(condition.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {condition.description}
        </p>
        
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium mb-2">Active Features:</p>
            {activeFeatures.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {activeFeatures.map((feature) => (
                  <Badge key={feature} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No special features enabled</p>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground">
            Max Response: {settings.maxResponseLength} chars
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 