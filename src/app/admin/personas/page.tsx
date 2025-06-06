"use client";

import React, { useEffect, useState } from "react";
import { useExperimentStore } from "@/app/hooks/useExperimentStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Brain, User } from "lucide-react";
import { Persona } from "@/types/experiment";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PersonaForm } from "@/components/admin/persona-form";

export default function PersonasPage() {
  const {
    personas,
    loadPersonas,
    deletePersona,
  } = useExperimentStore();

  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    loadPersonas();
  }, [loadPersonas]);

  const handleCreatePersona = () => {
    setSelectedPersona(null);
    setIsFormOpen(true);
  };

  const handleEditPersona = (persona: Persona) => {
    setSelectedPersona(persona);
    setIsFormOpen(true);
  };

  const handleDeletePersona = async (personaId: string) => {
    if (window.confirm("Are you sure you want to delete this persona?")) {
      await deletePersona(personaId);
    }
  };

  const patientPersonas = personas.filter(p => p.category === 'patient');
  const psychologistPersonas = personas.filter(p => p.category === 'psychologist');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Personas</h1>
          <p className="text-muted-foreground">
            Manage AI personas for your psychology experiments
          </p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreatePersona} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Persona
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedPersona ? "Edit Persona" : "Create Persona"}
              </DialogTitle>
            </DialogHeader>
            <PersonaForm
              persona={selectedPersona}
              onSave={() => setIsFormOpen(false)}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patient Personas</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientPersonas.length}</div>
            <p className="text-xs text-muted-foreground">
              AI personas representing various patient types
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Psychologist Personas</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{psychologistPersonas.length}</div>
            <p className="text-xs text-muted-foreground">
              AI personas representing different therapeutic approaches
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Personas List */}
      <div className="space-y-6">
        {/* Patient Personas */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5" />
            Patient Personas
          </h2>
          
          {patientPersonas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <User className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No patient personas created yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patientPersonas.map((persona) => (
                <PersonaCard
                  key={persona.id}
                  persona={persona}
                  onEdit={handleEditPersona}
                  onDelete={handleDeletePersona}
                />
              ))}
            </div>
          )}
        </div>

        {/* Psychologist Personas */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Psychologist Personas
          </h2>
          
          {psychologistPersonas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Brain className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No psychologist personas created yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {psychologistPersonas.map((persona) => (
                <PersonaCard
                  key={persona.id}
                  persona={persona}
                  onEdit={handleEditPersona}
                  onDelete={handleDeletePersona}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {personas.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No personas yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create AI personas to represent patients and psychologists in your experiments
            </p>
            <Button onClick={handleCreatePersona} className="gap-2">
              <Plus className="h-4 w-4" />
              Create First Persona
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface PersonaCardProps {
  persona: Persona;
  onEdit: (persona: Persona) => void;
  onDelete: (personaId: string) => void;
}

function PersonaCard({ persona, onEdit, onDelete }: PersonaCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{persona.name}</CardTitle>
            <Badge variant={persona.category === 'patient' ? 'default' : 'secondary'}>
              {persona.category}
            </Badge>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(persona)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(persona.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">
          {persona.description}
        </p>
        
        {persona.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {persona.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="mt-3 text-xs text-muted-foreground">
          Created: {new Date(persona.createdAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
} 