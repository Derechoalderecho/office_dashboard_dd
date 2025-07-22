import { useState, useRef, useEffect } from 'react';
import { updateCaseStatus } from "@/services/updateCaseStatus";
import { fetchCompleteCaseById } from "@/services/completeUserCasesService";
import { addToast } from "@heroui/react";
import { CompleteCaseData } from "@/types/cases";

export function useConsultorioJuridicoCase(caseId: number, role: string | null, userId: number) {
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
      
      // Cargar notas si existen
      if (caseData && 'notas' in caseData && Array.isArray(caseData.notas)) {
        console.log('Notes found in case data:', caseData.notas.length, 'items');
        setNotasList(caseData.notas);
      } else {
        console.log('No notes found in case data');
        setNotasList([]);
      }
      
      // Verificar si el caso está en estado "Radicar" para mostrar notificación
      if (caseData && caseData.estado_actual === 'Radicar') {
        setShowRadicarNotification(true);
      }
      
    } catch (error) {
      console.error('Error al cargar datos del caso:', error);
      addToast({
        title: "Error",
        description: "Ocurrió un error al cargar los datos del caso",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

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
          description: "Ahora puede subir el documento de tutela. Haga clic en el botón 'Subir'.",
          color: "primary",
        });
      }
    }
  };

  // Manejador para aprobar envío
  const handleApproveSubmission = async () => {
    if (!caseData) return;
    
    setStatusChangeLoading(true);
    
    try {
      // Determinar el nuevo estado según el estado actual
      let newStatus = '';
      
      switch (caseData.estado_actual) {
        case 'Enviado':
          newStatus = 'Revisión';
          break;
        case 'Revisión':
          newStatus = 'Viabilidad';
          break;
        case 'Viabilidad':
          newStatus = 'Radicar';
          break;
        case 'Radicar':
          newStatus = 'Espera del juez';
          break;
        default:
          throw new Error(`Estado actual no válido para aprobación: ${caseData.estado_actual}`);
      }
      
      console.log(`Cambiando estado de ${caseData.estado_actual} a ${newStatus}`);
      
      const success = await updateCaseStatus(caseData.id_caso, newStatus, userId);
      
      if (success) {
        addToast({
          title: "Acción exitosa",
          description: `El caso ha sido aprobado y pasó a estado "${newStatus}"`,
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
      console.error("Error al aprobar caso:", error);
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
      // Determinar el nuevo estado según el estado actual
      let newStatus = '';
      
      switch (caseData.estado_actual) {
        case 'Enviado':
        case 'Revisión':
        case 'Viabilidad':
          newStatus = 'Rechazado';
          break;
        default:
          throw new Error(`Estado actual no válido para rechazo: ${caseData.estado_actual}`);
      }
      
      console.log(`Cambiando estado de ${caseData.estado_actual} a ${newStatus}`);
      
      const success = await updateCaseStatus(caseData.id_caso, newStatus, userId);
      
      if (success) {
        addToast({
          title: "Acción exitosa",
          description: `El caso ha sido rechazado y pasó a estado "${newStatus}"`,
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
      console.error("Error al rechazar caso:", error);
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
    
    // Si el estado actual es "Radicar" y la acción viene del botón de radicar,
    // cambiar automáticamente el estado a "Espera del juez"
    if (caseData.estado_actual === 'Radicar' && isFromRadicarButton) {
      setStatusChangeLoading(true);
      
      try {
        const newStatus = 'Espera del juez';
        console.log(`Cambiando estado de ${caseData.estado_actual} a ${newStatus} después de radicar tutela`);
        
        const success = await updateCaseStatus(caseData.id_caso, newStatus, userId);
        
        if (success) {
          addToast({
            title: "Tutela radicada",
            description: `El caso ha pasado a estado "${newStatus}"`,
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
        console.error("Error al cambiar estado después de radicar:", error);
        addToast({
          title: "Error",
          description: "Ocurrió un error al procesar la acción",
          color: "danger",
        });
      } finally {
        setStatusChangeLoading(false);
      }
    } else {
      // Si no es para radicar, simplemente recargar los datos para mostrar la tutela actualizada
      await loadCaseData();
      
      addToast({
        title: "Tutela actualizada",
        description: "El documento de tutela ha sido actualizado correctamente",
        color: "success",
      });
    }
  };

  // Determinar si se puede subir tutela basado en el rol y estado del caso
  const canUploadTutela = () => {
    if (!caseData) return false;
    
    // Si el rol es admin, siempre puede subir
    if (role === 'admin') return true;
    
    // Si es un abogado y el caso está en estado "Radicar", puede subir
    if (role === 'abogado' && caseData.estado_actual === 'Radicar') return true;
    
    // Si es un abogado y el caso está en "Espera del juez" pero se ha permitido el cambio
    if (role === 'abogado' && caseData.estado_actual === 'Espera del juez') {
      // Verificar si hay un flag en localStorage que permita el cambio
      const allowChange = localStorage.getItem(`case_${caseData.id_caso}_allow_change_tutela`);
      return allowChange === 'true';
    }
    
    return false;
  };

  // Manejador para aprobar viabilidad
  const handleViableSubmission = async () => {
    if (!caseData) return;
    
    setStatusChangeLoading(true);
    
    try {
      // Solo se puede marcar como viable desde el estado "Viabilidad"
      if (caseData.estado_actual !== 'Viabilidad') {
        throw new Error(`Estado actual no válido para marcar como viable: ${caseData.estado_actual}`);
      }
      
      const newStatus = 'Radicar';
      console.log(`Cambiando estado de ${caseData.estado_actual} a ${newStatus}`);
      
      const success = await updateCaseStatus(caseData.id_caso, newStatus, userId);
      
      if (success) {
        addToast({
          title: "Acción exitosa",
          description: "El caso ha sido marcado como viable y está listo para radicar",
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
      // Solo se puede marcar como no viable desde el estado "Viabilidad"
      if (caseData.estado_actual !== 'Viabilidad') {
        throw new Error(`Estado actual no válido para marcar como no viable: ${caseData.estado_actual}`);
      }
      
      const newStatus = 'No viable';
      console.log(`Cambiando estado de ${caseData.estado_actual} a ${newStatus}`);
      
      const success = await updateCaseStatus(caseData.id_caso, newStatus, userId);
      
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
      // Marcar que se permite el cambio para este caso
      localStorage.setItem(`case_${caseData.id_caso}_allow_change_tutela`, 'true');
      
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

  // Cargar datos del caso al montar el componente
  useEffect(() => {
    loadCaseData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  // Verificar si el caso está en estado "Radicar" para mostrar notificación
  useEffect(() => {
    if (caseData && caseData.estado_actual === 'Radicar') {
      setShowRadicarNotification(true);
    } else {
      setShowRadicarNotification(false);
    }
  }, [caseData]);

  // Limpiar bandera de cambio de tutela cuando se desmonta el componente
  useEffect(() => {
    return () => {
      if (caseData) {
        localStorage.removeItem(`case_${caseData.id_caso}_allow_change_tutela`);
      }
    };
  }, [caseData]);

  return {
    caseData,
    historyLogs,
    notasList,
    loading,
    statusChangeLoading,
    showRadicarNotification,
    tutelaPreviewRef,
    loadCaseData,
    handleRadicarClick,
    handleApproveSubmission,
    handleRejectSubmission,
    handleTutelaUploaded,
    canUploadTutela,
    handleViableSubmission,
    handleNotViableSubmission,
    handleChangeTutelaInEsperaJuez,
    handleCloseRadicarNotification
  };
}
