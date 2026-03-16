export type Role = "school_admin" | "teacher" | "student";

export type RequestStatus =
  | "pending"
  | "processing"
  | "ready"
  | "rejected"
  | "cancelled";

export type ValidationStatus = "unverified" | "passed" | "failed";

export type ChatMessageRole = "system" | "user" | "assistant";

export type Branding = {
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
};

export type School = {
  id: string;
  name: string;
  domain?: string;
  branding?: Branding;
  createdAt: string;
};

export type User = {
  id: string;
  schoolId: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
};

export type DocumentType = {
  id: string;
  schoolId: string;
  name: string;
  description?: string;
  requiresUpload: boolean;
  createdAt: string;
};

export type DocumentRequest = {
  id: string;
  schoolId: string;
  studentId: string;
  documentTypeId: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
};

export type Upload = {
  id: string;
  schoolId: string;
  requestId: string;
  ocrText: string;
  validationStatus: ValidationStatus;
  createdAt: string;
};

export type ChatMessage = {
  role: ChatMessageRole;
  content: string;
  at: string;
};

export type ChatLog = {
  id: string;
  schoolId: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: string;
};

export type AuditLog = {
  id: string;
  schoolId?: string;
  actorUserId?: string;
  action: string;
  at: string;
  metadata?: Record<string, unknown>;
};

