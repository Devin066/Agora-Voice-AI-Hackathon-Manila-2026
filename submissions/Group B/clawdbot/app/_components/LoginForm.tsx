"use client";

import * as React from "react";
import type { Role, School } from "@/lib/types";
import { Button, Input, Select } from "@/app/_components/ui";
import type { ApiResponse } from "@/lib/api";
import { isApiOk } from "@/lib/api";
import type { User } from "@/lib/types";

const ROLE_LABEL: Record<Role, string> = {
  school_admin: "School Admin",
  teacher: "Teacher",
  student: "Student",
};

export function LoginForm(props: { schools: School[] }) {
  const [schoolId, setSchoolId] = React.useState(props.schools[0]?.id ?? "");
  const [role, setRole] = React.useState<Role>("student");
  const [email, setEmail] = React.useState("student@demo.edu.ph");
  const [name, setName] = React.useState("Student");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (role === "school_admin") {
      setEmail("admin@demo.edu.ph");
      setName("School Admin");
    } else if (role === "teacher") {
      setEmail("teacher@demo.edu.ph");
      setName("Teacher");
    } else {
      setEmail("student@demo.edu.ph");
      setName("Student");
    }
  }, [role]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ schoolId, email, name, role }),
      });
      const json = (await res.json()) as ApiResponse<User>;
      if (!res.ok || !isApiOk(json)) throw new Error(!isApiOk(json) ? json.error.message : "Login failed");
      window.location.href = `/s/${encodeURIComponent(schoolId)}`;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <Select label="School" value={schoolId} onChange={(e) => setSchoolId(e.target.value)}>
        {props.schools.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </Select>
      <Select label="Role" value={role} onChange={(e) => setRole(e.target.value as Role)}>
        {Object.keys(ROLE_LABEL).map((r) => (
          <option key={r} value={r}>
            {ROLE_LABEL[r as Role]}
          </option>
        ))}
      </Select>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu.ph" />
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
      </div>
      {error ? <div className="text-sm text-rose-200">{error}</div> : null}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={busy || !schoolId || !email.trim()}>
          {busy ? "Signing in..." : "Sign in"}
        </Button>
        <span className="text-xs text-zinc-300">Cookies are demo-only.</span>
      </div>
    </form>
  );
}
