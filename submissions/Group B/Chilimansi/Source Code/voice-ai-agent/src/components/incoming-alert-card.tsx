"use client";

import { MapPin, Navigation, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface PatientInfo {
  name: string;
  avatar: string;
  location: string;
  distance: string;
  time: string;
  condition: string;
}

interface IncomingAlertCardProps {
  patient: PatientInfo;
  onAccept: () => void;
  onDecline: () => void;
}

export default function IncomingAlertCard({ patient, onAccept, onDecline }: IncomingAlertCardProps) {
  return (
    <Card className="border-l-4 border-l-destructive">
      <CardContent className="p-4 space-y-4">
        {/* Patient header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-bold" aria-hidden="true">
            {patient.avatar}
          </div>
          <div className="flex-1">
            <p className="font-semibold">{patient.name}</p>
          </div>
          <Badge variant="destructive">URGENT</Badge>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex flex-col items-center gap-1 rounded-(--radius) bg-secondary p-2">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            <span className="text-muted-foreground">Location</span>
            <span className="font-medium text-center">{patient.location}</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-(--radius) bg-secondary p-2">
            <Navigation className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            <span className="text-muted-foreground">Distance</span>
            <span className="font-medium">{patient.distance}</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-(--radius) bg-secondary p-2">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            <span className="text-muted-foreground">Time</span>
            <span className="font-medium">{patient.time}</span>
          </div>
        </div>

        {/* Condition */}
        <div className="rounded-(--radius) bg-secondary p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Condition</p>
          <p className="font-semibold text-warning">{patient.condition}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onDecline} aria-label="Decline emergency alert">
            Decline
          </Button>
          <Button variant="success" className="flex-1" onClick={onAccept} aria-label="Accept and respond to emergency">
            Accept &amp; Respond
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
