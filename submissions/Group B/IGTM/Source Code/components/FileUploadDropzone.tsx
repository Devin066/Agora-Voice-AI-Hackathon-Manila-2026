"use client";

import { UploadCloud, FileCheck2 } from "lucide-react";

type FileUploadDropzoneProps = {
  fileName: string;
  onFileSelect: (file: File | null) => void;
};

export function FileUploadDropzone({
  fileName,
  onFileSelect,
}: FileUploadDropzoneProps) {
  const hasFile = Boolean(fileName);

  return (
    <label
      className={`flex min-h-64 w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed px-8 py-10 text-[#183B56] transition duration-200 ${
        hasFile
          ? "border-[#5C9EAD] bg-[#5C9EAD]/5 shadow-none"
          : "border-[#1C4E78]/20 bg-white shadow-[0_14px_30px_rgba(24,59,86,0.09)] hover:border-[#1C4E78]/40 hover:bg-[#EEF2F5]/60 hover:shadow-[0_20px_40px_rgba(24,59,86,0.12)]"
      }`}
    >
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-full transition duration-200 ${
          hasFile ? "bg-[#5C9EAD]/15 text-[#5C9EAD]" : "bg-[#EEF2F5] text-[#1C4E78]"
        }`}
      >
        {hasFile ? (
          <FileCheck2 className="h-7 w-7" strokeWidth={1.75} />
        ) : (
          <UploadCloud className="h-7 w-7" strokeWidth={1.75} />
        )}
      </div>

      <div className="text-center">
        <span className="block text-lg font-semibold text-[#183B56]">
          {hasFile ? "Resume uploaded" : "Upload your resume"}
        </span>
        <span className="mt-1 block text-sm text-[#1C4E78]/60">
          {fileName || "PDF, DOC, DOCX or TXT · click or drag & drop"}
        </span>
      </div>

      {!hasFile && (
        <span className="rounded-full bg-[#EEF2F5] px-5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#1C4E78]">
          Browse files
        </span>
      )}

      <input
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        className="sr-only"
        onChange={(event) => onFileSelect(event.target.files?.[0] ?? null)}
      />
    </label>
  );
}
