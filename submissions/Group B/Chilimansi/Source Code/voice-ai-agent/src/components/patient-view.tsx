"use client";

import { MapPin } from "lucide-react";
import StatusIndicator from "@/components/status-indicator";
import SOSButton from "@/components/sos-button";
import EmergencyActionPlan from "@/components/emergency-action-plan";

interface PatientViewProps {
  emergencyState: "idle" | "alerting";
  onSOSTrigger: () => void;
  status: "idle" | "alerting" | "connected" | "offline";
}

const demoEAP = {
  condition: "Severe Asthma",
  actionRequired:
    "Inhaler is in my front right pocket. If unconscious, call 143 or 911 immediately.",
  emergencyContact: "143 (Red Cross)",
};

export default function PatientView({ emergencyState, onSOSTrigger, status }: PatientViewProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <StatusIndicator status={status} />

      {/* TODO: Supabase — insert emergency record on SOS trigger
          const { error } = await supabase.from('emergencies').insert({
            patient_id: userId,
            condition: demoEAP.condition,
            location: currentLocation,
            status: 'active',
            created_at: new Date().toISOString(),
          });
      */}

      <SOSButton isAlerting={emergencyState === "alerting"} onTrigger={onSOSTrigger} />

      <div className="w-full max-w-sm">
        <EmergencyActionPlan {...demoEAP} />
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
        <span>BGC Taguig, Metro Manila</span>
      </div>
    </div>
  );
}
