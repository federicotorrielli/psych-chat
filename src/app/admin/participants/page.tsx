"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Participant } from "@/types/experiment";
import { Users, Calendar, UserCheck } from "lucide-react";

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParticipants();
  }, []);

  const loadParticipants = async () => {
    try {
      setLoading(true);
      const participantsQuery = query(
        collection(db, "participants"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(participantsQuery);
      
      const participantData: Participant[] = [];
      querySnapshot.forEach((doc) => {
        participantData.push({ id: doc.id, ...doc.data() } as Participant);
      });
      
      setParticipants(participantData);
    } catch (error) {
      console.error("Error loading participants:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Participants</h1>
          <p className="text-muted-foreground">
            View participant information and demographics
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{participants.length}</div>
            <p className="text-xs text-muted-foreground">
              Registered in the system
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consented</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {participants.filter(p => p.consentGiven).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Have provided consent
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {participants.filter(p => 
                new Date(p.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Joined this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Participants List */}
      <div className="space-y-4">
        {participants.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No participants yet</h3>
              <p className="text-muted-foreground text-center">
                Participants will appear here as they join experiments
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {participants.map((participant) => (
              <Card key={participant.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        Participant {participant.id.slice(-8)}
                      </CardTitle>
                      <Badge variant={participant.consentGiven ? "default" : "secondary"}>
                        {participant.consentGiven ? "Consented" : "No Consent"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {participant.demographicData && Object.keys(participant.demographicData).length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Demographics</p>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {participant.demographicData.age && (
                            <p>Age: {participant.demographicData.age}</p>
                          )}
                          {participant.demographicData.gender && (
                            <p>Gender: {participant.demographicData.gender}</p>
                          )}
                          {participant.demographicData.profession && (
                            <p>Profession: {participant.demographicData.profession}</p>
                          )}
                          {participant.demographicData.experienceLevel && (
                            <p>Experience: {participant.demographicData.experienceLevel}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {participant.assignedCondition && (
                      <div>
                        <p className="text-sm font-medium">Assigned Condition</p>
                        <p className="text-sm text-muted-foreground">{participant.assignedCondition}</p>
                      </div>
                    )}
                    
                    {participant.assignedPersona && (
                      <div>
                        <p className="text-sm font-medium">Assigned Persona</p>
                        <p className="text-sm text-muted-foreground">{participant.assignedPersona}</p>
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      Joined: {new Date(participant.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 