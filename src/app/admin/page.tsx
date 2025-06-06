"use client";

import React, { useEffect, useState } from "react";
import { useExperimentStore } from "@/app/hooks/useExperimentStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, Pause, Edit, Trash2, BarChart3, Brain, Settings } from "lucide-react";
import { ExperimentConfig } from "@/types/experiment";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ExperimentForm } from "@/components/admin/experiment-form";

export default function AdminPage() {
  const {
    experiments,
    personas,
    conditions,
    loadExperiments,
    loadPersonas,
    loadConditions,
    saveExperiment,
    deleteExperiment,
  } = useExperimentStore();

  const [selectedExperiment, setSelectedExperiment] = useState<ExperimentConfig | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    loadExperiments();
    loadPersonas();
    loadConditions();
  }, [loadExperiments, loadPersonas, loadConditions]);

  const handleCreateExperiment = () => {
    setSelectedExperiment(null);
    setIsFormOpen(true);
  };

  const handleEditExperiment = (experiment: ExperimentConfig) => {
    setSelectedExperiment(experiment);
    setIsFormOpen(true);
  };

  const handleToggleExperiment = async (experiment: ExperimentConfig) => {
    const updatedExperiment = {
      ...experiment,
      isActive: !experiment.isActive,
      updatedAt: new Date().toISOString(),
    };
    await saveExperiment(updatedExperiment);
  };

  const handleDeleteExperiment = async (experiment: ExperimentConfig) => {
    if (experiment.isActive) {
      alert("Cannot delete an active experiment. Please deactivate it first.");
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this experiment?")) {
      await deleteExperiment(experiment.id);
    }
  };

  const getPersonaNames = (personaIds: string[]) => {
    return personaIds.map(id => {
      const persona = personas.find(p => p.id === id);
      return persona?.name || id;
    }).join(", ");
  };

  const getConditionNames = (conditionIds: string[]) => {
    return conditionIds.map(id => {
      const condition = conditions.find(c => c.id === id);
      return condition?.name || id;
    }).join(", ");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Experiments</h1>
          <p className="text-muted-foreground">
            Manage your psychology experiments and their configurations
          </p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateExperiment} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Experiment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedExperiment ? "Edit Experiment" : "Create Experiment"}
              </DialogTitle>
            </DialogHeader>
            <ExperimentForm
              experiment={selectedExperiment}
              onSave={() => setIsFormOpen(false)}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Experiments</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{experiments.length}</div>
            <p className="text-xs text-muted-foreground">
              {experiments.filter(e => e.isActive).length} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Personas</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personas.length}</div>
            <p className="text-xs text-muted-foreground">
              {personas.filter(p => p.category === 'patient').length} patients, {personas.filter(p => p.category === 'psychologist').length} psychologists
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conditions</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conditions.length}</div>
            <p className="text-xs text-muted-foreground">
              Experimental conditions available
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Experiments List */}
      <div className="space-y-4">
        {experiments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No experiments yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first psychology experiment to get started
              </p>
              <Button onClick={handleCreateExperiment} className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Experiment
              </Button>
            </CardContent>
          </Card>
        ) : (
          experiments.map((experiment) => (
            <Card key={experiment.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{experiment.name}</CardTitle>
                      <Badge variant={experiment.isActive ? "default" : "secondary"}>
                        {experiment.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <CardDescription>{experiment.description}</CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleExperiment(experiment)}
                      className="gap-2"
                    >
                      {experiment.isActive ? (
                        <>
                          <Pause className="h-4 w-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Activate
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditExperiment(experiment)}
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteExperiment(experiment)}
                      disabled={experiment.isActive}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong className="text-foreground">Personas:</strong>
                    <p className="text-muted-foreground mt-1">
                      {getPersonaNames(experiment.personas) || "None selected"}
                    </p>
                  </div>
                  
                  <div>
                    <strong className="text-foreground">Conditions:</strong>
                    <p className="text-muted-foreground mt-1">
                      {getConditionNames(experiment.conditions) || "None selected"}
                    </p>
                  </div>
                  
                  <div>
                    <strong className="text-foreground">Settings:</strong>
                    <div className="mt-1 space-y-1">
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {experiment.randomizeAssignment ? "Randomized" : "Fixed Assignment"}
                        </Badge>
                        {experiment.collectDemographics && (
                          <Badge variant="outline" className="text-xs">
                            Demographics
                          </Badge>
                        )}
                        {experiment.requireConsent && (
                          <Badge variant="outline" className="text-xs">
                            Consent Required
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <strong className="text-foreground">Duration Limit:</strong>
                    <p className="text-muted-foreground mt-1">
                      {experiment.maxSessionDuration} minutes
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 text-xs text-muted-foreground">
                  Created: {new Date(experiment.createdAt).toLocaleDateString()} • 
                  Updated: {new Date(experiment.updatedAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 