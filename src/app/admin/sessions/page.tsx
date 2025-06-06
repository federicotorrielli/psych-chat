"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExperimentSession } from "@/types/experiment";
import { useExperimentStore } from "@/app/hooks/useExperimentStore";
import { Database, Clock, MessageSquare, User, Download, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<ExperimentSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredSessions, setFilteredSessions] = useState<ExperimentSession[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSession, setSelectedSession] = useState<ExperimentSession | null>(null);

  const { personas, conditions, experiments } = useExperimentStore();

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    filterSessions();
  }, [sessions, statusFilter, searchTerm]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const sessionsQuery = query(
        collection(db, "sessions"),
        orderBy("startTime", "desc")
      );
      const querySnapshot = await getDocs(sessionsQuery);
      
      const sessionData: ExperimentSession[] = [];
      querySnapshot.forEach((doc) => {
        sessionData.push({ id: doc.id, ...doc.data() } as ExperimentSession);
      });
      
      setSessions(sessionData);
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterSessions = () => {
    let filtered = sessions;

    if (statusFilter !== "all") {
      filtered = filtered.filter(session => session.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(session =>
        session.participantId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSessions(filtered);
  };

  const getPersonaName = (personaId: string) => {
    return personas.find(p => p.id === personaId)?.name || personaId;
  };

  const getConditionName = (conditionId: string) => {
    return conditions.find(c => c.id === conditionId)?.name || conditionId;
  };

  const getExperimentName = (session: ExperimentSession) => {
    // Find experiment that contains this persona and condition
    const experiment = experiments.find(e => 
      e.personas.includes(session.personaId) && 
      e.conditions.includes(session.conditionId)
    );
    return experiment?.name || "Unknown Experiment";
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000 / 60);
    return `${duration}m`;
  };

  const exportSessionData = () => {
    const data = filteredSessions.map(session => ({
      sessionId: session.id,
      participantId: session.participantId,
      experiment: getExperimentName(session),
      persona: getPersonaName(session.personaId),
      condition: getConditionName(session.conditionId),
      startTime: session.startTime,
      endTime: session.endTime,
      duration: formatDuration(session.startTime, session.endTime),
      messageCount: session.metadata.messageCount,
      status: session.status,
      deviceType: session.metadata.deviceType,
    }));

    const csvContent = [
      Object.keys(data[0]).join(","),
      ...data.map(row => Object.values(row).map(val => `"${val}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `psychology-experiment-sessions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalMessages = filteredSessions.reduce((sum, session) => sum + session.metadata.messageCount, 0);
  const completedSessions = filteredSessions.filter(s => s.status === 'completed').length;
  const activeSessions = filteredSessions.filter(s => s.status === 'active').length;

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
          <h1 className="text-3xl font-bold text-foreground">Experiment Sessions</h1>
          <p className="text-muted-foreground">
            View and analyze data from psychology experiment sessions
          </p>
        </div>
        
        <Button onClick={exportSessionData} className="gap-2" disabled={filteredSessions.length === 0}>
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              {sessions.length} total recorded
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessions}</div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSessions}</div>
            <p className="text-xs text-muted-foreground">
              Finished sessions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMessages}</div>
            <p className="text-xs text-muted-foreground">
              Across all sessions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sessions</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="abandoned">Abandoned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Search</Label>
              <Input
                placeholder="Search by participant ID or session ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Database className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sessions found</h3>
              <p className="text-muted-foreground text-center">
                {sessions.length === 0 
                  ? "No experiment sessions have been recorded yet"
                  : "No sessions match your current filters"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">Session {session.id.slice(-8)}</CardTitle>
                      <Badge variant={
                        session.status === 'completed' ? 'default' :
                        session.status === 'active' ? 'secondary' : 'outline'
                      }>
                        {session.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      Participant: {session.participantId.slice(-8)} • 
                      Experiment: {getExperimentName(session)}
                    </CardDescription>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Eye className="h-3 w-3" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh]">
                      <DialogHeader>
                        <DialogTitle>Session Details: {session.id.slice(-8)}</DialogTitle>
                      </DialogHeader>
                      <SessionDetails session={session} />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Persona</p>
                    <p className="text-muted-foreground">{getPersonaName(session.personaId)}</p>
                  </div>
                  
                  <div>
                    <p className="font-medium">Condition</p>
                    <p className="text-muted-foreground">{getConditionName(session.conditionId)}</p>
                  </div>
                  
                  <div>
                    <p className="font-medium">Duration</p>
                    <p className="text-muted-foreground">
                      {formatDuration(session.startTime, session.endTime)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-medium">Messages</p>
                    <p className="text-muted-foreground">{session.metadata.messageCount}</p>
                  </div>
                </div>
                
                <div className="mt-4 text-xs text-muted-foreground">
                  Started: {new Date(session.startTime).toLocaleString()} • 
                  Device: {session.metadata.deviceType}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function SessionDetails({ session }: { session: ExperimentSession }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="font-medium">Session ID</p>
          <p className="text-muted-foreground font-mono">{session.id}</p>
        </div>
        <div>
          <p className="font-medium">Participant ID</p>
          <p className="text-muted-foreground font-mono">{session.participantId}</p>
        </div>
        <div>
          <p className="font-medium">Start Time</p>
          <p className="text-muted-foreground">{new Date(session.startTime).toLocaleString()}</p>
        </div>
        <div>
          <p className="font-medium">End Time</p>
          <p className="text-muted-foreground">
            {session.endTime ? new Date(session.endTime).toLocaleString() : "Ongoing"}
          </p>
        </div>
      </div>
      
      <div>
        <p className="font-medium mb-2">Conversation Messages</p>
        <ScrollArea className="h-96 border rounded-md p-4">
          <div className="space-y-4">
            {session.messages.map((message, index) => (
              <div key={index} className={`p-3 rounded-md ${
                message.role === 'user' 
                  ? 'bg-blue-50 dark:bg-blue-950 ml-8' 
                  : 'bg-gray-50 dark:bg-gray-900 mr-8'
              }`}>
                <div className="text-xs text-muted-foreground mb-1">
                  {message.role === 'user' ? 'Participant' : 'AI'}
                </div>
                <div className="text-sm">{message.content}</div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
} 