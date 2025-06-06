import { Message } from "ai";

export interface Persona {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  category: 'patient' | 'psychologist';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ExperimentCondition {
  id: string;
  name: string;
  description: string;
  settings: {
    showTypingIndicator: boolean;
    responseDelay: number; // milliseconds
    maxResponseLength: number;
    enableEmotionalReactions: boolean;
    simulateUserTyping: boolean;
    randomResponseDelay: boolean;
    contextAwareness: 'none' | 'session' | 'full';
    interruptionHandling: boolean;
  };
}

export interface ExperimentSession {
  id: string;
  participantId: string;
  personaId: string;
  conditionId: string;
  messages: Message[];
  startTime: string;
  endTime?: string;
  metadata: {
    userAgent: string;
    deviceType: 'mobile' | 'desktop' | 'tablet';
    sessionDuration?: number;
    messageCount: number;
    averageResponseTime: number;
  };
  status: 'active' | 'completed' | 'abandoned';
}

export interface Participant {
  id: string;
  demographicData: {
    age?: number;
    gender?: string;
    profession?: string;
    experienceLevel?: 'novice' | 'intermediate' | 'expert';
  };
  consentGiven: boolean;
  assignedCondition?: string;
  assignedPersona?: string;
  createdAt: string;
}

export interface ExperimentConfig {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  personas: string[]; // persona IDs
  conditions: string[]; // condition IDs
  randomizeAssignment: boolean;
  collectDemographics: boolean;
  requireConsent: boolean;
  maxSessionDuration: number; // minutes
  createdAt: string;
  updatedAt: string;
} 