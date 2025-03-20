"use client";

import DocumentUploader from "./DocumentUploader";
import DocumentDownloader from "./DocumentDownloader";

interface DocumentsSectionProps {
  caseId: number;
  documentUrl?: string;
}

export default function DocumentsSection({ 
  caseId, 
  documentUrl 
}: DocumentsSectionProps) {
  return (
    <section>
      <div className="flex flex-col justify-center items-center mb-10">
        <h4 className="font-medium">Cargue o descargue la tutela</h4>
        <span className="text-sm text-secondary">
          Archivo debe ser docx, pdf
        </span>
      </div>
      <div className="flex gap-5">
        <div className="flex items-center justify-center w-[35%]">
          <DocumentDownloader 
            caseId={caseId} 
            documentUrl={documentUrl} 
          />
        </div>
        <div className="flex items-center justify-center w-full">
          <DocumentUploader caseId={caseId} />
        </div>
      </div>
    </section>
  );
} 