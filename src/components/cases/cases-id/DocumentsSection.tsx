"use client";

import { useState, useCallback, useEffect } from "react";
import DocumentUploader from "./DocumentUploader";
import DocumentDownloader from "./DocumentDownloader";
import { DocumentResponse } from "@/actions/uploadDocsActions";
import { useAppDispatch } from "@/store/hooks";
import { fetchCaseByIdFresh } from "@/services/caseService";
import { setDocuments } from "@/store/slices/documentSlice";
import { invalidateCache } from "@/utils/cacheUtils";

interface DocumentsSectionProps {
  caseId: number;
}

export default function DocumentsSection({ caseId }: DocumentsSectionProps) {
  const dispatch = useAppDispatch();
  // Usamos estado para los documentos recién subidos
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Callback para cuando se sube un documento nuevo
  const handleDocumentUploaded = useCallback(
    async (document: DocumentResponse) => {
      console.log("Documento subido, actualizando...", document.id_documento);

      try {
        // 1. Invalidar la caché de casos
        invalidateCache("cases");

        // 2. Obtener datos frescos directamente de la API
        const freshCase = await fetchCaseByIdFresh(caseId);

        // 3. Si se obtuvieron documentos actualizados, actualizarlos en Redux
        if (freshCase?.documentos) {
          // Actualizar los documentos en el estado global
          dispatch(setDocuments(freshCase.documentos));
          console.log("Documentos actualizados:", freshCase.documentos.length);
        }

        // 4. Incrementar el trigger para forzar actualización
        setRefreshTrigger((prev) => prev + 1);

        // 5. Si el modal no está abierto, abrirlo para mostrar el documento
        if (!isModalOpen) {
          setIsModalOpen(true);
        }
      } catch (error) {
        console.error("Error al actualizar documentos:", error);
      }
    },
    [caseId, dispatch, isModalOpen]
  );

  const handleModalOpenChange = useCallback((isOpen: boolean) => {
    setIsModalOpen(isOpen);
  }, []);

  return (
    <section>
      <div className="flex flex-col justify-center items-center mb-10">
        <h4 className="font-medium">Documentos del caso</h4>
        <p className="text-sm text-secondary">
          Puede cargar o visualizar anexos y documentos relacionados con este caso
        </p>
        <p className="text-xs text-secondary">
        (Aquí no se deben subir documentos radicados)
        </p>
      </div>
      <div className="flex gap-5 flex-col md:flex-row">
        <div className="md:w-[35%] w-full">
          <DocumentDownloader
            caseId={caseId}
            refreshTrigger={refreshTrigger}
            isModalOpen={isModalOpen}
            onModalOpenChange={handleModalOpenChange}
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
