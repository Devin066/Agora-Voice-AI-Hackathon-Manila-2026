import "server-only";

import crypto from "node:crypto";
import type {
  AuditLog,
  ChatLog,
  DocumentRequest,
  DocumentType,
  Role,
  School,
  Upload,
  User,
} from "@/lib/types";

type Store = {
  schools: Map<string, School>;
  users: Map<string, User>;
  documentTypes: Map<string, DocumentType>;
  requests: Map<string, DocumentRequest>;
  uploads: Map<string, Upload>;
  chats: Map<string, ChatLog>;
  audit: AuditLog[];
};

function nowIso() {
  return new Date().toISOString();
}

function id() {
  return crypto.randomUUID();
}

function seed(store: Store) {
  if (store.schools.size > 0) return;

  const at = nowIso();
  const schoolA: School = {
    id: "demo-high",
    name: "Demo High School",
    domain: "demo.edu.ph",
    branding: { primaryColor: "#0f172a", accentColor: "#f97316" },
    createdAt: at,
  };
  const schoolB: School = {
    id: "demo-uni",
    name: "Demo University",
    domain: "demo-university.edu.ph",
    branding: { primaryColor: "#111827", accentColor: "#22c55e" },
    createdAt: at,
  };
  store.schools.set(schoolA.id, schoolA);
  store.schools.set(schoolB.id, schoolB);

  const admin: User = {
    id: "admin@demo-high",
    schoolId: schoolA.id,
    email: "admin@demo.edu.ph",
    name: "School Admin",
    role: "school_admin",
    createdAt: at,
  };
  const student: User = {
    id: "student@demo-high",
    schoolId: schoolA.id,
    email: "student@demo.edu.ph",
    name: "Student",
    role: "student",
    createdAt: at,
  };
  store.users.set(admin.id, admin);
  store.users.set(student.id, student);

  const types: Array<Omit<DocumentType, "id" | "createdAt">> = [
    {
      schoolId: schoolA.id,
      name: "Transcript of Records",
      description: "Official grades and subjects taken.",
      requiresUpload: false,
    },
    {
      schoolId: schoolA.id,
      name: "Good Moral Certificate",
      description: "Certification of good conduct.",
      requiresUpload: true,
    },
    {
      schoolId: schoolA.id,
      name: "Form 137",
      description: "Permanent academic record (basic education).",
      requiresUpload: true,
    },
  ];

  for (const t of types) {
    const docType: DocumentType = { ...t, id: id(), createdAt: at };
    store.documentTypes.set(docType.id, docType);
  }
}

function createStore(): Store {
  const store: Store = {
    schools: new Map(),
    users: new Map(),
    documentTypes: new Map(),
    requests: new Map(),
    uploads: new Map(),
    chats: new Map(),
    audit: [],
  };
  seed(store);
  return store;
}

declare global {
  var __clawdbotStore: Store | undefined;
}

export function getStore(): Store {
  const store = globalThis.__clawdbotStore ?? createStore();
  globalThis.__clawdbotStore = store;
  return store;
}

export function storeNowIso() {
  return nowIso();
}

export function storeId() {
  return id();
}

export function upsertUser(params: {
  schoolId: string;
  email: string;
  name: string;
  role: Role;
}): User {
  const store = getStore();
  const existing = [...store.users.values()].find(
    (u) => u.schoolId === params.schoolId && u.email === params.email,
  );
  if (existing) return existing;

  const user: User = {
    id: storeId(),
    schoolId: params.schoolId,
    email: params.email,
    name: params.name,
    role: params.role,
    createdAt: storeNowIso(),
  };
  store.users.set(user.id, user);
  return user;
}
