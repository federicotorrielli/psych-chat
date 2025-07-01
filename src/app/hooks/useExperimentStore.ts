import { create } from "zustand";
import { persist } from "zustand/middleware";
import { collection, doc, setDoc, getDocs, getDoc, updateDoc, query, where, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Persona, 
  ExperimentCondition, 
  ExperimentSession, 
  Participant, 
  ExperimentConfig 
} from "@/types/experiment";
import { Message } from "ai";
import { defaultPersonas, defaultConditions, defaultExperiments } from "@/lib/seedData";

interface ExperimentState {
  // Current experiment state
  currentExperiment: ExperimentConfig | null;
  currentParticipant: Participant | null;
  currentSession: ExperimentSession | null;
  
  // Admin data
  personas: Persona[];
  conditions: ExperimentCondition[];
  experiments: ExperimentConfig[];
  
  // Admin settings
  adminSettings: {
    allowImageUploads: boolean;
  };
  
  // UI state
  isAdmin: boolean;
  lastSaveTime: number;
}

interface ExperimentActions {
  // Admin actions
  setIsAdmin: (isAdmin: boolean) => void;
  updateAdminSettings: (settings: Partial<{ allowImageUploads: boolean }>) => void;
  
  // Persona management
  loadPersonas: () => Promise<void>;
  savePersona: (persona: Persona) => Promise<void>;
  deletePersona: (personaId: string) => Promise<void>;
  
  // Condition management  
  loadConditions: () => Promise<void>;
  saveCondition: (condition: ExperimentCondition) => Promise<void>;
  deleteCondition: (conditionId: string) => Promise<void>;
  
  // Experiment management
  loadExperiments: () => Promise<void>;
  saveExperiment: (experiment: ExperimentConfig) => Promise<void>;
  deleteExperiment: (experimentId: string) => Promise<void>;
  setCurrentExperiment: (experiment: ExperimentConfig) => void;
  
  // Participant management
  createParticipant: (demographicData?: any) => Promise<Participant>;
  setCurrentParticipant: (participant: Participant) => void;
  
  // Session management
  startSession: (participantId: string, personaId: string, conditionId: string, chatId?: string) => Promise<ExperimentSession>;
  updateSession: (sessionId: string, messages: Message[]) => Promise<void>;
  updateSessionChatId: (sessionId: string, chatId: string) => Promise<void>;
  endSession: (sessionId?: string) => Promise<void>;
  saveSessionToFirebase: (session: ExperimentSession) => Promise<void>;
}

export const useExperimentStore = create<ExperimentState & ExperimentActions>()(
  persist(
    (set, get) => ({
      // Initial state
      currentExperiment: null,
      currentParticipant: null,
      currentSession: null,
      personas: [],
      conditions: [],
      experiments: [],
      adminSettings: {
        allowImageUploads: true, // Default to true for backward compatibility
      },
      isAdmin: false,
      lastSaveTime: 0,

      // Admin actions
      setIsAdmin: (isAdmin) => set({ isAdmin }),
      updateAdminSettings: (settings) => set((state) => ({
        adminSettings: { ...state.adminSettings, ...settings }
      })),

      // Persona management
      loadPersonas: async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "personas"));
          const personas: Persona[] = [];
          querySnapshot.forEach((doc) => {
            personas.push({ id: doc.id, ...doc.data() } as Persona);
          });
          
          // Seed default personas if none exist
          if (personas.length === 0) {
            for (const persona of defaultPersonas) {
              await setDoc(doc(db, "personas", persona.id), persona);
              personas.push(persona);
            }
          }
          
          set({ personas });
        } catch (error) {
          console.error("Error loading personas:", error);
          // Fallback to default personas if Firebase fails
          set({ personas: defaultPersonas });
        }
      },

      savePersona: async (persona) => {
        try {
          await setDoc(doc(db, "personas", persona.id), persona);
          const { personas } = get();
          const updatedPersonas = personas.filter(p => p.id !== persona.id);
          set({ personas: [...updatedPersonas, persona] });
        } catch (error) {
          console.error("Error saving persona:", error);
        }
      },

      deletePersona: async (personaId) => {
        try {
          await deleteDoc(doc(db, "personas", personaId));
          const { personas } = get();
          set({ personas: personas.filter(p => p.id !== personaId) });
        } catch (error) {
          console.error("Error deleting persona:", error);
        }
      },

      // Condition management
      loadConditions: async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "conditions"));
          const conditions: ExperimentCondition[] = [];
          querySnapshot.forEach((doc) => {
            conditions.push({ id: doc.id, ...doc.data() } as ExperimentCondition);
          });
          
          // Seed default conditions if none exist
          if (conditions.length === 0) {
            for (const condition of defaultConditions) {
              await setDoc(doc(db, "conditions", condition.id), condition);
              conditions.push(condition);
            }
          }
          
          set({ conditions });
        } catch (error) {
          console.error("Error loading conditions:", error);
          // Fallback to default conditions if Firebase fails
          set({ conditions: defaultConditions });
        }
      },

      saveCondition: async (condition) => {
        try {
          await setDoc(doc(db, "conditions", condition.id), condition);
          const { conditions } = get();
          const updatedConditions = conditions.filter(c => c.id !== condition.id);
          set({ conditions: [...updatedConditions, condition] });
        } catch (error) {
          console.error("Error saving condition:", error);
        }
      },

      deleteCondition: async (conditionId) => {
        try {
          await deleteDoc(doc(db, "conditions", conditionId));
          const { conditions } = get();
          set({ conditions: conditions.filter(c => c.id !== conditionId) });
        } catch (error) {
          console.error("Error deleting condition:", error);
        }
      },

      // Experiment management
      loadExperiments: async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "experiments"));
          const experiments: ExperimentConfig[] = [];
          querySnapshot.forEach((doc) => {
            experiments.push({ id: doc.id, ...doc.data() } as ExperimentConfig);
          });
          
          // Seed default experiments if none exist
          if (experiments.length === 0) {
            for (const experiment of defaultExperiments) {
              await setDoc(doc(db, "experiments", experiment.id), experiment);
              experiments.push(experiment);
            }
          }
          
          set({ experiments });
        } catch (error) {
          console.error("Error loading experiments:", error);
          // Fallback to default experiments if Firebase fails
          set({ experiments: defaultExperiments });
        }
      },

      saveExperiment: async (experiment) => {
        try {
          await setDoc(doc(db, "experiments", experiment.id), experiment);
          const { experiments } = get();
          const updatedExperiments = experiments.filter(e => e.id !== experiment.id);
          set({ experiments: [...updatedExperiments, experiment] });
        } catch (error) {
          console.error("Error saving experiment:", error);
        }
      },

      deleteExperiment: async (experimentId) => {
        try {
          await deleteDoc(doc(db, "experiments", experimentId));
          const { experiments } = get();
          set({ experiments: experiments.filter(e => e.id !== experimentId) });
        } catch (error) {
          console.error("Error deleting experiment:", error);
        }
      },

      setCurrentExperiment: (experiment) => set({ currentExperiment: experiment }),

      // Participant management
      createParticipant: async (demographicData = {}) => {
        const participant: Participant = {
          id: `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          demographicData,
          consentGiven: true,
          createdAt: new Date().toISOString(),
        };

        try {
          await setDoc(doc(db, "participants", participant.id), participant);
          set({ currentParticipant: participant });
          return participant;
        } catch (error) {
          console.error("Error creating participant:", error);
          throw error;
        }
      },

      setCurrentParticipant: (participant) => set({ currentParticipant: participant }),

      // Session management
      startSession: async (participantId, personaId, conditionId, chatId) => {
        // Safely detect device type
        const userAgent = navigator?.userAgent || '';
        const isMobile = /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent);
        const isTablet = /iPad|Android(?!.*Mobile)/.test(userAgent);
        
        let deviceType: 'mobile' | 'desktop' | 'tablet' = 'desktop';
        if (isTablet) deviceType = 'tablet';
        else if (isMobile) deviceType = 'mobile';

        const session: ExperimentSession = {
          id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          participantId: participantId || '',
          personaId: personaId || '',
          conditionId: conditionId || '',
          chatId: chatId,
          messages: [],
          startTime: new Date().toISOString(),
          metadata: {
            userAgent,
            deviceType,
            messageCount: 0,
            averageResponseTime: 0,
          },
          status: 'active',
        };

        try {
          await setDoc(doc(db, "sessions", session.id), session);
          set({ currentSession: session });
          return session;
        } catch (error) {
          console.error("Error starting session:", error);
          throw error;
        }
      },

      updateSession: async (sessionId, messages) => {
        const { currentSession } = get();
        if (!currentSession || currentSession.id !== sessionId) return;

        const updatedSession = {
          ...currentSession,
          messages: messages || [],
          metadata: {
            ...currentSession.metadata,
            messageCount: messages ? messages.length : 0,
          },
        };

        set({ currentSession: updatedSession, lastSaveTime: Date.now() });

        // Auto-save every 30 seconds or every 5 messages
        const timeSinceLastSave = Date.now() - (get().lastSaveTime || 0);
        if (timeSinceLastSave > 30000 || (messages && messages.length % 5 === 0)) {
          await get().saveSessionToFirebase(updatedSession);
        }
      },

      updateSessionChatId: async (sessionId, chatId) => {
        const { currentSession } = get();
        if (!currentSession || currentSession.id !== sessionId) return;

        const updatedSession = {
          ...currentSession,
          chatId: chatId,
        };

        set({ currentSession: updatedSession });
        await get().saveSessionToFirebase(updatedSession);
      },

      endSession: async (sessionId) => {
        const { currentSession } = get();
        if (!currentSession || (sessionId && currentSession.id !== sessionId)) return;

        // Calculate session duration safely
        const startTime = new Date(currentSession.startTime).getTime();
        const sessionDuration = !isNaN(startTime) ? Date.now() - startTime : 0;

        const endedSession = {
          ...currentSession,
          endTime: new Date().toISOString(),
          status: 'completed' as const,
          metadata: {
            ...currentSession.metadata,
            sessionDuration,
          },
        };

        await get().saveSessionToFirebase(endedSession);
        set({ currentSession: null, currentParticipant: null, currentExperiment: null });
      },

      saveSessionToFirebase: async (session) => {
        try {
          // Clean the session data to remove undefined values
          const cleanSession = JSON.parse(JSON.stringify(session, (key, value) => {
            return value === undefined ? null : value;
          }));
          
          await setDoc(doc(db, "sessions", session.id), cleanSession);
          set({ lastSaveTime: Date.now() });
        } catch (error) {
          console.error("Error saving session to Firebase:", error);
        }
      },
    }),
    {
      name: "experiment-store",
      partialize: (state) => ({
        isAdmin: state.isAdmin,
        adminSettings: state.adminSettings,
        currentExperiment: state.currentExperiment,
        currentParticipant: state.currentParticipant,
        currentSession: state.currentSession,
      }),
    }
  )
); 