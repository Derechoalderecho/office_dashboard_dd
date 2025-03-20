"use client";

import DocumentUploader from "./DocumentUploader";
import DocumentDownloader from "./DocumentDownloader";
import { DocumentResponse } from "@/actions/uploadDocsActions";

interface DocumentsSectionProps {
  caseId: number;
}

export default function DocumentsSection({ caseId }: DocumentsSectionProps) {
  const handleDocumentUploaded = (doc: DocumentResponse) => {
    // Just for callback purposes, no need to store the document
    console.log("Document uploaded:", doc.id_documento);
  };

  return (
    <section>
      <div className="flex flex-col justify-center items-center mb-10">
        <h4 className="font-medium">Documentos del caso</h4>
        <span className="text-sm text-secondary">
          Puede cargar o visualizar documentos relacionados con este caso
        </span>
      </div>
      <div className="flex gap-5 flex-col md:flex-row">
        <div className="md:w-[35%] w-full">
          <DocumentDownloader caseId={caseId} />
        </div>
        <div className="md:w-[65%] w-full">
          <DocumentUploader 
            caseId={caseId} 
            onDocumentUploaded={handleDocumentUploaded}
          />
        </div>
      </div>
    </section>
  );
} 