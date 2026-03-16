"use client";

import { FileText, AlertCircle, Phone } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmergencyActionPlanProps {
  condition: string;
  actionRequired: string;
  emergencyContact: string;
  compact?: boolean;
}

export default function EmergencyActionPlan({
  condition,
  actionRequired,
  emergencyContact,
  compact = false,
}: EmergencyActionPlanProps) {
  return (
    <Card className={cn(compact && "text-sm")}>
      <CardHeader className={cn("flex flex-row items-center gap-2", compact && "p-3")}>
        <FileText className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        <CardTitle className={cn(compact && "text-base")}>Emergency Action Plan</CardTitle>
      </CardHeader>
      <CardContent className={cn("space-y-3", compact && "p-3 pt-0")}>
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-warning" aria-hidden="true" />
          <div>
            <p className="text-xs text-muted-foreground">Condition</p>
            <p className="font-semibold">{condition}</p>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Action Required</p>
          <p className={cn("text-foreground/90", compact && "text-sm")}>{actionRequired}</p>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
          <div>
            <p className="text-xs text-muted-foreground">Emergency Contact</p>
            <p className="font-semibold">{emergencyContact}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
