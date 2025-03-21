"use client";

import DocumentUploader from "./DocumentUploader";
import DocumentDownloader from "./DocumentDownloader";
import { DocumentResponse } from "@/actions/uploadDocsActions";

interface DocumentsSectionProps {
  caseId: number;
  documents?: DocumentResponse[];
}

export default function DocumentsSection({ caseId, documents = [] }: DocumentsSectionProps) {
  const handleDocumentUploaded = (doc: DocumentResponse) => {
    console.log("Document uploaded:", doc.id_documento);
    // En una implementación más completa, podríamos añadir el documento a la lista existente
  };

  return (
    <section>
      <div className="flex flex-col justify-center items-center mb-10">
        <h4 className="font-medium">Documentos del caso</h4>
        <span className="text-sm text-secondary">
          Puede cargar o visualizar documentos relacionados con este caso
        </span>
        {documents.length > 0 && (
          <span className="text-xs text-primary mt-1">
            {documents.length} documento{documents.length !== 1 ? 's' : ''} disponible{documents.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className="flex gap-5 flex-col md:flex-row">
        <div className="md:w-[35%] w-full">
          <DocumentDownloader 
            caseId={caseId}
          />
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