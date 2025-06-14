"use client";

import { Button, addToast, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { useRouter } from "next/navigation";
import {
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState, useRef } from "react";
import { fetchCaseById, fetchCaseHistory, updateCaseStatus } from "@/services/caseService";
import { fetchCompleteCaseById } from "@/services/completeUserCasesService";
import CaseHeader from "@/components/cases/cases-id/CaseHeader";
import CaseInfo from "@/components/cases/cases-id/CaseInfo";
import CasePreview from "@/components/cases/cases-id/CasePreview";
import DocumentsSection from "@/components/cases/cases-id/DocumentsSection";
import NotesSection from "@/components/cases/cases-id/NotesSection";
import CaseHistoryLogs from "@/components/cases/cases-id/CaseHistoryLogs";
import EditCaseModal from "@/components/cases/cases-id/EditCaseModal";
import { useUserRole } from "@/hooks/useUserRole";
import { CompleteCaseData } from "@/types/cases";
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
  
  const [caseData, setCaseData] = useState<CompleteCaseData | null>(null);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [notasList, setNotasList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusChangeLoading, setStatusChangeLoading] = useState(false);
  const [showRadicarNotification, setShowRadicarNotification] = useState(false);
  
  // Referencia para hacer scroll a la sección de tutela
  const tutelaPreviewRef = useRef<HTMLDivElement>(null);

  // Cargar datos del caso
  const loadCaseData = async () => {
    setLoading(true);
    try {
      const caseData = await fetchCompleteCaseById(caseId);
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
      setNotasList(caseData.notas || []);
      
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

  // Efecto para mostrar notificación cuando el caso está en estado 'Radicar'
  useEffect(() => {
    if (caseData && caseData.estado === "Radicar") {
      // Mostrar la notificación siempre que el caso esté en estado 'Radicar'
      setShowRadicarNotification(true);
    } else {
      // Ocultar la notificación si el caso no está en estado 'Radicar'
      setShowRadicarNotification(false);
    }
  }, [caseData]);

  // Manejador para el botón de radicar tutela
  const handleRadicarClick = () => {
    // Establecer una bandera en localStorage para indicar que la carga viene del botón de radicar
    localStorage.setItem(`case_${caseId}_radicar_action`, 'true');
    
    // Referencia al input de archivo en CasePreview
    const fileInput = document.querySelector('#tutela-file-input') as HTMLInputElement;
    
    if (fileInput) {
      // Simular clic en el input de archivo para abrir el explorador de archivos directamente
      fileInput.click();
      
      addToast({
        title: "Radicar tutela",
        description: "Seleccione el documento de tutela para radicar el caso",
        color: "primary",
      });
    } else {
      // Si no se encuentra el input, hacer scroll como fallback
      if (tutelaPreviewRef.current) {
        tutelaPreviewRef.current.scrollIntoView({ behavior: 'smooth' });
        
        // Resaltar la sección con un efecto visual
        tutelaPreviewRef.current.classList.add('highlight-section');
        setTimeout(() => {
          tutelaPreviewRef.current?.classList.remove('highlight-section');
        }, 2000);
        
        addToast({
          title: "Radicar tutela",
          description: "Por favor, cargue o actualice el documento de tutela para radicar el caso",
          color: "primary",
        });
      }
    }
  };

  // Manejador para aprobar envío
  const handleApproveSubmission = async () => {
    if (!caseData) return;
    
    // Si el estado es "Radicar", no permitir cambio directo a "Espera del juez"
    // Solo debe cambiar cuando se sube la tutela desde el botón de radicar
    if (caseData.estado === "Radicar") {
      addToast({
        title: "Acción requerida",
        description: "Para completar este caso debe radicar la tutela usando el botón 'Radicar Tutela'",
        color: "primary",
      });
      
      // Hacer scroll hacia la sección de tutela para facilitar la acción
      handleRadicarClick();
      return;
    }
    
    setStatusChangeLoading(true);
    try {
      // Ahora solo aplica al estado "Revisar tutela"
      const newStatus = caseData.estado === "Revisar tutela" ? "Radicar" : "Espera del juez";
      const success = await updateCaseStatus(caseId, newStatus);
      
      if (success) {
        addToast({
          title: "Acción exitosa",
          description: newStatus === "Radicar" 
            ? "La tutela ha sido aprobada y está lista para radicar" 
            : "El caso ha sido aprobado y enviado al juez",
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
      // Siempre vuelve a "Pendiente" al rechazar
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
  const handleTutelaUploaded = async (isFromRadicarButton = false) => {
    if (!caseData) return;
    
    setStatusChangeLoading(true);
    
    try {
      // Determinar el nuevo estado según el estado actual
      let newStatus = "";
      
      switch (caseData.estado) {
        case "Pendiente":
          newStatus = "Revisar tutela";
          break;
        case "Radicar":
          // Solo cambiar a "Espera del juez" si viene del botón de radicar
          newStatus = isFromRadicarButton ? "Espera del juez" : caseData.estado;
          break;
        default:
          // Si no es ninguno de los casos específicos, mantener el estado actual
          newStatus = caseData.estado;
          break;
      }
      
      // Solo actualizar si hay un cambio de estado
      if (newStatus !== caseData.estado) {
        const success = await updateCaseStatus(caseId, newStatus);
        
        if (success) {
          let message = "";
          
          if (newStatus === "Revisar tutela") {
            message = "La tutela ha sido cargada y está lista para revisión";
          } else if (newStatus === "Espera del juez") {
            message = "La tutela ha sido radicada y el caso ha pasado a espera del juez";
          }
          
          addToast({
            title: "Estado actualizado",
            description: message,
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
      } else {
        // Si no hay cambio de estado, sólo mostrar mensaje de éxito por la carga
        addToast({
          title: "Documento cargado",
          description: "La tutela ha sido cargada correctamente",
          color: "success",
        });
        
        // Actualizar datos del caso para refrescar la tutela
        await loadCaseData();
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
    
    // Permitir subir tutelas en varios estados
    switch (estado) {
      case "Pendiente":
        // En pendiente, sólo estudiantes, docentes o monitores pueden subir
        return role === "Estudiante" || role === "Docente" || role === "Monitor";
      case "Revisar tutela":
        // En revisión, permitir cambiar la tutela
        return true;
      case "Radicar":
        // En radicar, cualquier rol puede subir la tutela final
        return true;
      case "Espera del juez":
        // En espera del juez, permitir cambiar la tutela si se solicita explícitamente
        // La bandera se establecerá cuando se haga clic en el botón de cambiar tutela
        return localStorage.getItem(`case_${caseData.id_caso}_allow_change_tutela`) === 'true';
      default:
        return false;
    }
  };

  // Manejador para aprobar viabilidad
  const handleViableSubmission = async () => {
    if (!caseData) return;
    
    setStatusChangeLoading(true);
    try {
      const success = await updateCaseStatus(caseId, "Pendiente");
      
      if (success) {
        addToast({
          title: "Acción exitosa",
          description: "El caso ha sido marcado como viable y está pendiente de revisión",
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
      console.error("Error al marcar como viable:", error);
      addToast({
        title: "Error",
        description: "Ocurrió un error al procesar la acción",
        color: "danger",
      });
    } finally {
      setStatusChangeLoading(false);
    }
  };

  // Manejador para rechazar viabilidad
  const handleNotViableSubmission = async () => {
    if (!caseData) return;
    
    setStatusChangeLoading(true);
    try {
      const success = await updateCaseStatus(caseId, "No aprobado");
      
      if (success) {
        addToast({
          title: "Acción exitosa",
          description: "El caso ha sido marcado como no viable",
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
      console.error("Error al marcar como no viable:", error);
      addToast({
        title: "Error",
        description: "Ocurrió un error al procesar la acción",
        color: "danger",
      });
    } finally {
      setStatusChangeLoading(false);
    }
  };
  // Manejador para permitir cambiar tutela en estado "Espera del juez"
  const handleChangeTutelaInEsperaJuez = () => {
    if (!caseData) return;
    
    // Establecer bandera para permitir cambiar la tutela
    localStorage.setItem(`case_${caseId}_allow_change_tutela`, 'true');
    
    // Establecer bandera para indicar que la acción viene del botón de cambiar tutela en Espera del juez
    localStorage.setItem(`case_${caseId}_change_tutela_action`, 'true');
    
    // Referencia al input de archivo en CasePreview
    const fileInput = document.querySelector('#tutela-file-input') as HTMLInputElement;
    
    if (fileInput) {
      // Simular clic en el input de archivo para abrir el explorador de archivos directamente
      fileInput.click();
      
      addToast({
        title: "Cambiar radicado",
        description: "Seleccione el nuevo documento radicado para reemplazar el actual",
        color: "primary",
      });
    } else {
      // Si no se encuentra el input, hacer scroll como fallback
      if (tutelaPreviewRef.current) {
        tutelaPreviewRef.current.scrollIntoView({ behavior: 'smooth' });
        
        // Resaltar la sección con un efecto visual
        tutelaPreviewRef.current.classList.add('highlight-section');
        setTimeout(() => {
          tutelaPreviewRef.current?.classList.remove('highlight-section');
        }, 2000);
        
        addToast({
          title: "Cambiar radicado",
          description: "Ahora puede cambiar el documento radicado. Haga clic en el botón 'Cambiar'.",
          color: "primary",
        });
      }
    }
  };

  // Manejador para cerrar la notificación de radicar
  const handleCloseRadicarNotification = () => {
    setShowRadicarNotification(false);
  };

  // Limpiar bandera de cambio de tutela cuando se desmonta el componente
  useEffect(() => {
    return () => {
      if (caseData) {
        localStorage.removeItem(`case_${caseData.id_caso}_allow_change_tutela`);
      }
    };
  }, [caseData]);

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
        {/* Modal de notificación para casos en estado Radicar */}
        <Modal
          isOpen={showRadicarNotification}
          onClose={handleCloseRadicarNotification}
          placement="center"
          classNames={{
            base: "bg-white shadow-lg rounded-lg max-w-md mx-auto",
            header: "border-b border-gray-200 p-4",
            body: "p-6",
            footer: "border-t border-gray-200 p-4"
          }}
        >
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1 text-center">
              <div className="flex justify-center mb-2">
                <div className="bg-emerald-100 p-3 rounded-full">
                  <CheckCircleIcon className="w-8 h-8 text-emerald-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">¡Caso listo para radicar!</h3>
            </ModalHeader>
            <ModalBody>
              <div className="text-center space-y-4">
                <p className="text-gray-700">
                  La tutela ha sido aprobada y está lista para ser radicada. Para completar este proceso, haga clic en el botón "Radicar Tutela" en la parte superior de la página.
                </p>
                <p className="text-sm text-gray-500">
                  Una vez radicada, el caso pasará automáticamente al estado "Espera del juez".
                </p>
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-center">
              <Button
                color="primary"
                className="w-full"
                onPress={handleCloseRadicarNotification}
              >
                Entendido
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <CaseHeader 
          caseData={caseData!} 
          onApproveSubmission={handleApproveSubmission}
          onRejectSubmission={handleRejectSubmission}
          onViableSubmission={handleViableSubmission}
          onNotViableSubmission={handleNotViableSubmission}
          isStatusChangeLoading={statusChangeLoading}
          onRadicarClick={handleRadicarClick}
          onChangeTutelaInEsperaJuez={handleChangeTutelaInEsperaJuez}
          role={role}
        />
       
        <section className="flex gap-6">
          <div className="w-[70%] shadow-custom bg-[#F9FAFB] rounded-lg">
            <div className="p-5">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">
                  Caso n# - {caseData?.id_caso}
                </h2>
                <EditCaseModal caseData={caseData!} onSuccess={loadCaseData} />
              </div>
              <hr className="my-4" />
         
              <CaseInfo caseData={caseData!} />

              <hr className="my-4" />
              
              {/* Añadir la ref para poder hacer scroll a esta sección */}
              <div ref={tutelaPreviewRef} className="transition-all duration-300">
                <CasePreview 
                  caseId={caseData?.id_caso || caseId} 
                  onTutelaUploaded={handleTutelaUploaded}
                  canUpload={canUploadTutela()}
                  caseState={caseData?.estado}
                />
              </div>
           
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
