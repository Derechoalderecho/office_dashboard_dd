"use client";

import { Button, addToast, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import {
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState, useRef } from "react";
// Ya no necesitamos importar fetchCaseHistory porque los datos vienen en fetchCompleteCaseById
import { updateCaseStatus } from "@/services/updateCaseStatus";
import { fetchCompleteCaseById } from "@/services/completeUserCasesService";
import CaseHeader from "@/components/cases/cases-id/CaseHeader";
import CaseInfo from "@/components/cases/cases-id/CaseInfo";
import CasePreview from "@/components/cases/cases-id/CasePreview";
import DocumentsSection from "@/components/cases/cases-id/DocumentsSection";
import NotesSection from "@/components/cases/cases-id/NotesSection";
import CaseHistoryLogs from "@/components/cases/cases-id/CaseHistoryLogs";
import EditCaseModal from "@/components/cases/cases-id/EditCaseModal";
import { useAuth } from "@/hooks/useAuth";
import { CompleteCaseData } from "@/types/cases";
import { useParams } from "next/navigation";
import CaseSkeleton from "@/ui/caseSkeleton";

interface CasePageProps {
  params: {
    id: string;
  };
}

export default function CasePage() {
  const { id } = useParams<{ id: string }>();
  const caseId = parseInt(id as string, 10);
  const { role, internalUserId } = useAuth();
  
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
    console.log('Iniciando carga de datos para caso ID:', caseId);
    setLoading(true);
    
    try {
      console.log('Fetching case data for ID:', caseId);
      const casesData = await fetchCompleteCaseById(caseId);
      console.log('Received case data response:', casesData);
      
      // Los logs de historial vienen incluidos en los datos del caso
      
      if (!casesData || casesData.length === 0) {
        const errorMsg = `Caso con ID ${caseId} no encontrado`;
        console.error(errorMsg);
        addToast({
          title: "Error",
          description: "No se pudo cargar el caso",
          color: "danger",
        });
        return;
      }
      
      // Tomamos el primer elemento del array ya que solo necesitamos un caso
      const caseData = casesData[0];
      console.log('Procesando case data:', typeof caseData, caseData ? 'con datos' : 'sin datos');
      
      // Verificar que caseData sea un objeto válido
      if (!caseData) {
        console.error('Los datos del caso no son válidos');
        addToast({
          title: "Error",
          description: "Los datos del caso tienen un formato inválido",
          color: "danger",
        });
        return;
      }
      
      // Log para debug
      if (caseData) {
        console.log('Case data structure:', caseData);
        console.log('Case data properties:', Object.keys(caseData));
      }
      
      // Mostrar alerta para confirmar que los datos se cargaron
      addToast({
        title: "Éxito",
        description: "Datos del caso cargados correctamente",
        color: "success",
      });
      
      setCaseData(caseData);
      // Usar los logs de historial que vienen en los datos del caso
      if (caseData && 'historial_estados' in caseData && Array.isArray(caseData.historial_estados)) {
        console.log('History logs found in case data:', caseData.historial_estados.length, 'items');
        setHistoryLogs(caseData.historial_estados.filter(log => log.status === true));
      } else {
        console.log('No history logs found in case data');
        setHistoryLogs([]);
      }
      
      // Verificar si hay notas antes de acceder a la propiedad
      if (caseData && 'notas' in caseData && Array.isArray(caseData.notas)) {
        console.log('Notas encontradas:', caseData.notas.length, 'items');
        setNotasList(caseData.notas);
      } else {
        console.warn('No se encontraron notas en la respuesta del caso o el formato ha cambiado');
        // Asegurarse de no intentar llamar a Object.keys en un objeto nulo
        if (caseData) {
          console.log('Estructura de caseData:', Object.keys(caseData));
        } else {
          console.log('caseData es nulo o indefinido');
        }
        // Inicializar con un array vacío para evitar errores
        setNotasList([]);
      }
      
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
    
    // Cargar los datos del caso directamente
    loadCaseData();
  }, [caseId, id]);

  // Efecto para mostrar notificación cuando el caso está en estado 'Radicar'
  useEffect(() => {
    if (caseData && caseData.estado_actual === "Radicar") {
      // Mostrar la notificación siempre que el caso esté en estado 'Radicar'
      setShowRadicarNotification(true);
    } else {
      // Ocultar la notificación si el caso no está en estado 'Radicar'
      setShowRadicarNotification(false);
    }
  }, [caseData]);

  // Manejador para el botón de radicar tutela
  const handleRadicarClick = () => {
    if (!caseData) return;
    
    // Referencia al input de archivo en CasePreview
    const fileInput = document.querySelector('#tutela-file-input') as HTMLInputElement;
    
    if (fileInput) {
      // Simular clic en el input de archivo para abrir el explorador de archivos directamente
      fileInput.click();
      
      addToast({
        title: "Radicar tutela",
        description: "Seleccione el documento para radicar la tutela",
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
          description: "Desplácese hasta la sección de tutela para cargar el documento",
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
    if (caseData.estado_actual === "Radicar") {
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
      // Verificar que tenemos un userId válido
      if (!internalUserId) {
        addToast({
          title: "Error",
          description: "No se pudo identificar al usuario actual",
          color: "danger",
        });
        return;
      }
      
      // Ahora solo aplica al estado "Revisar tutela"
      const newStatus = caseData.estado_actual === "Revisar tutela" ? "Radicar" : "Espera del juez";
      const success = await updateCaseStatus(caseId, newStatus, internalUserId);
      
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
      // Verificar que tenemos un userId válido
      if (!internalUserId) {
        addToast({
          title: "Error",
          description: "No se pudo identificar al usuario actual",
          color: "danger",
        });
        return;
      }
      
      // Siempre vuelve a "Pendiente" al rechazar
      const newStatus = "Pendiente";
      const success = await updateCaseStatus(caseId, newStatus, internalUserId);
      
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
      
      switch (caseData.estado_actual) {
        case "Pendiente":
          newStatus = "Revisar tutela";
          break;
        case "Radicar":
          // Solo cambiar a "Espera del juez" si viene del botón de radicar
          newStatus = isFromRadicarButton ? "Espera del juez" : caseData.estado_actual;
          break;
        default:
          // Si no es ninguno de los casos específicos, mantener el estado actual
          newStatus = caseData.estado_actual;
          break;
      }
      
      // Verificar que tenemos un userId válido
      if (!internalUserId) {
        addToast({
          title: "Error",
          description: "No se pudo identificar al usuario actual",
          color: "danger",
        });
        return;
      }
      
      // Solo actualizar si hay un cambio de estado
      if (newStatus !== caseData.estado_actual) {
        const success = await updateCaseStatus(caseId, newStatus, internalUserId);
        
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
    
    const estado = caseData.estado_actual;
    
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
        return true;
      default:
        return false;
    }
  };

  // Manejador para aprobar viabilidad
  const handleViableSubmission = async () => {
    if (!caseData) return;
    
    setStatusChangeLoading(true);
    try {
      // Verificar que tenemos un userId válido
      if (!internalUserId) {
        addToast({
          title: "Error",
          description: "No se pudo identificar al usuario actual",
          color: "danger",
        });
        return;
      }
      
      const success = await updateCaseStatus(caseId, "Pendiente", internalUserId);
      
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
      // Verificar que tenemos un userId válido
      if (!internalUserId) {
        addToast({
          title: "Error",
          description: "No se pudo identificar al usuario actual",
          color: "danger",
        });
        return;
      }
      
      const newStatus = "No aprobado";
      const success = await updateCaseStatus(caseId, newStatus, internalUserId);
      
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
    <CaseSkeleton />
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
                { /* <EditCaseModal caseData={caseData!} onSuccess={loadCaseData} />*/}
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
                  caseState={caseData?.estado_actual}
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
