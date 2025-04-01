"use client";

import { Chip, Button, Textarea, addToast } from "@heroui/react";
import { useRouter } from "next/navigation";
import {
  PencilSquareIcon,
  ClipboardDocumentCheckIcon,
  DocumentArrowUpIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  LinkIcon,
  CheckCircleIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { parseDateToLocal } from "@/utils/date";
import { fetchCaseById, fetchCaseHistory, updateCaseStatus } from "@/services/caseService";
import CaseHeader from "@/components/cases/cases-id/CaseHeader";
import CaseInfo from "@/components/cases/cases-id/CaseInfo";
import CasePreview from "@/components/cases/cases-id/CasePreview";
import DocumentsSection from "@/components/cases/cases-id/DocumentsSection";
import NotesSection from "@/components/cases/cases-id/NotesSection";
import CaseHistoryLogs from "@/components/cases/cases-id/CaseHistoryLogs";
import { useUserRole } from "@/hooks/useUserRole";
import { Cases } from "@/types/cases";
import { useParams } from "next/navigation";

interface CasePageProps {
  params: {
    id: string;
  };
}

export default function CasePage() {
  const { id } = useParams<{ id: string }>();
  const caseId = parseInt(id as string, 10);
  const router = useRouter();
  const { role } = useUserRole();
  
  const [caseData, setCaseData] = useState<Cases | null>(null);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [notasList, setNotasList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusChangeLoading, setStatusChangeLoading] = useState(false);

  // Cargar datos del caso
  const loadCaseData = async () => {
    setLoading(true);
    try {
      const caseData = await fetchCaseById(caseId);
      const historyLogs = await fetchCaseHistory(caseId);
      
      if (!caseData) {
        console.error(`Caso con ID ${caseId} no encontrado`);
        addToast({
          title: "Error",
          description: "No se pudo cargar el caso",
          color: "danger",
        });
        return;
      }
      
      setCaseData(caseData);
      setHistoryLogs(historyLogs || []);
      setNotasList(caseData.notas_list || []);
      
    } catch (error) {
      console.error("Error al cargar datos del caso:", error);
      addToast({
        title: "Error",
        description: "Ocurrió un error al cargar los datos del caso",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    if (isNaN(caseId)) {
      console.error(`ID de caso no válido: ${id}`);
      return;
    }
    
    loadCaseData();
  }, [caseId, id]);

  // Manejador para aprobar envío
  const handleApproveSubmission = async () => {
    if (!caseData) return;
    
    setStatusChangeLoading(true);
    try {
      const newStatus = "Espera del juez";
      const success = await updateCaseStatus(caseId, newStatus);
      
      if (success) {
        addToast({
          title: "Acción exitosa",
          description: "El caso ha sido aprobado y enviado al juez",
          color: "success",
        });
        
        // Actualizar datos del caso
        await loadCaseData();
      } else {
        addToast({
          title: "Error",
          description: "No se pudo cambiar el estado del caso",
          color: "danger",
        });
      }
    } catch (error) {
      console.error("Error al aprobar envío:", error);
      addToast({
        title: "Error",
        description: "Ocurrió un error al procesar la acción",
        color: "danger",
      });
    } finally {
      setStatusChangeLoading(false);
    }
  };

  // Manejador para rechazar envío
  const handleRejectSubmission = async () => {
    if (!caseData) return;
    
    setStatusChangeLoading(true);
    try {
      const newStatus = "Pendiente";
      const success = await updateCaseStatus(caseId, newStatus);
      
      if (success) {
        addToast({
          title: "Acción exitosa",
          description: "El caso ha sido rechazado y devuelto a estado pendiente",
          color: "warning",
        });
        
        // Actualizar datos del caso
        await loadCaseData();
      } else {
        addToast({
          title: "Error",
          description: "No se pudo cambiar el estado del caso",
          color: "danger",
        });
      }
    } catch (error) {
      console.error("Error al rechazar envío:", error);
      addToast({
        title: "Error",
        description: "Ocurrió un error al procesar la acción",
        color: "danger",
      });
    } finally {
      setStatusChangeLoading(false);
    }
  };

  // Manejador para cuando se sube una tutela
  const handleTutelaUploaded = async () => {
    if (!caseData) return;
    
    // Si la tutela se subió con éxito, cambiar el estado a "Radicar"
    setStatusChangeLoading(true);
    
    try {
      const newStatus = "Radicar";
      const success = await updateCaseStatus(caseId, newStatus);
      
      if (success) {
        addToast({
          title: "Estado actualizado",
          description: "Se ha cargado la tutela y el caso está listo para radicar",
          color: "success",
        });
        
        // Actualizar datos del caso
        await loadCaseData();
      } else {
        addToast({
          title: "Error",
          description: "No se pudo actualizar el estado del caso",
          color: "danger",
        });
      }
    } catch (error) {
      console.error("Error al actualizar estado después de subir tutela:", error);
      addToast({
        title: "Error",
        description: "Ocurrió un error al procesar la acción",
        color: "danger",
      });
    } finally {
      setStatusChangeLoading(false);
    }
  };
  
  // Determinar si se puede subir tutela basado en el rol y estado del caso
  const canUploadTutela = () => {
    if (!caseData) return false;
    
    const estado = caseData.estado;
    
    // Tanto estudiante como docente pueden subir tutela en estado "Pendiente"
    if (estado === "Pendiente") {
      return role === "Estudiante" || role === "Docente" || role === "Monitor";
    }
    
    return false;
  };

  // Si no hay datos o hay un error, mostrar un mensaje
  if (!caseData && !loading) {
    return <div className="p-8 text-center">No se encontró el caso o hubo un error al cargarlo</div>;
  }

  // UI cuando está cargando
  if (loading) {
    return (
      <main>
        <div className="space-y-6">
          {/* Skeleton para el encabezado */}
          <div className="animate-pulse mb-7 pb-4 border-b-1">
            <div className="flex justify-between items-center">
              <div>
                <div className="h-10 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
                <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
                <div className="h-10 bg-gray-200 rounded-lg w-10"></div>
              </div>
            </div>
          </div>
          
          {/* Skeleton para el contenido */}
          <section className="flex gap-6">
            {/* Columna principal */}
            <div className="w-[70%] shadow-custom bg-[#F9FAFB] rounded-lg">
              <div className="p-5">
                {/* Título */}
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                </div>
                <hr className="my-4" />
                
                {/* Info del caso */}
                <div className="animate-pulse flex justify-between mb-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                      <div className="w-32 h-4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                      <div className="w-40 h-4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                      <div className="w-36 h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-4 bg-gray-200 rounded"></div>
                      <div className="w-16 h-4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-4 bg-gray-200 rounded"></div>
                      <div className="w-28 h-4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-4 bg-gray-200 rounded"></div>
                      <div className="w-32 h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
                
                <hr className="my-4" />
                
                {/* Skeleton de previsualización de tutela */}
                <div className="mb-6">
                  <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                  <div className="rounded-xl border-2 border-dashed border-gray-300 p-8">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded w-56 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-72 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-40 mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded-lg w-40"></div>
                    </div>
                  </div>
                </div>
                
                {/* Skeleton de documentos */}
                <div className="mb-6">
                  <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="h-6 bg-gray-200 rounded w-48"></div>
                    <div className="h-8 bg-gray-200 rounded-lg w-32"></div>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="animate-pulse space-y-4">
                      <div className="h-16 bg-gray-200 rounded-lg"></div>
                      <div className="h-16 bg-gray-200 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Panel lateral */}
            <aside className="w-[30%]">
              {/* Skeleton de notas */}
              <div className="animate-pulse mb-5">
                <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="mb-4 border rounded-lg">
                  <div className="h-24 bg-gray-100 rounded-t-lg"></div>
                  <div className="h-10 bg-gray-50 rounded-b-lg flex items-center justify-end p-2">
                    <div className="h-8 bg-gray-200 rounded-lg w-32"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
              
              <hr className="my-5" />
              
              {/* Skeleton de registro de cambios */}
              <div className="h-6 bg-gray-200 rounded w-56 mb-8"></div>
              <div className="space-y-4">
                <div className="h-20 bg-gray-200 rounded-lg"></div>
                <div className="h-20 bg-gray-200 rounded-lg"></div>
              </div>
            </aside>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div key={caseData?.id_caso}>
        <CaseHeader 
          caseData={caseData!} 
          onApproveSubmission={handleApproveSubmission}
          onRejectSubmission={handleRejectSubmission}
          isStatusChangeLoading={statusChangeLoading}
        />
       
        <section className="flex gap-6">
          <div className="w-[70%] shadow-custom bg-[#F9FAFB] rounded-lg">
            <div className="p-5">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">
                  Caso n# - {caseData?.id_caso}
                </h2>
              </div>
              <hr className="my-4" />
         
              <CaseInfo caseData={caseData!} />

              <hr className="my-4" />
             <CasePreview 
                caseId={caseData?.id_caso || caseId} 
                onTutelaUploaded={handleTutelaUploaded}
                canUpload={canUploadTutela()}
             />
           
              <DocumentsSection caseId={caseData?.id_caso || caseId} />
           </div>
           </div>
          <aside className="w-[30%]">
            <NotesSection 
              caseId={caseData?.id_caso || caseId} 
              initialNotes={notasList}
              onNoteAdded={() => loadCaseData()}
            />

            <hr className="my-5" />
            <p className="font-medium mb-8">Registro de cambios de estado</p>

            <CaseHistoryLogs historyLogs={historyLogs} />
          </aside>
        </section>
       </div>
    </main>
  );
}
