"use client";

import CaseHeader from "@/components/cases/cases-id/CaseHeader";
import CaseOffices from "@/components/cases/cases-id/CaseOffices/CaseOffices";
import { useAuth } from "@/hooks/useAuth";
import { useParams } from "next/navigation";
import CaseSkeleton from "@/ui/caseSkeleton";
import { useConsultorioJuridicoCase } from "@/hooks/useConsultorioJuridicoCase";
import { useEffect } from "react";

interface CasePageProps {
  params: {
    id: string;
  };
}

export default function CasePage() {
  const { id } = useParams<{ id: string }>();
  const caseId = parseInt(id as string, 10);
  const { role, internalUserId } = useAuth();
  
  const {
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
  } = useConsultorioJuridicoCase(caseId, role, internalUserId!);

  useEffect(() => {
    if (isNaN(caseId)) {
      console.error('ID de caso inválido:', id);
      return;
    }
    
    loadCaseData();
  }, [caseId]);

  if (!caseData && !loading) {
    return <div className="p-8 text-center">No se encontró el caso o hubo un error al cargarlo</div>;
  }
  if (loading) {
    return (
    <CaseSkeleton />
    );
  }

  return (
    <>
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
      
      <CaseOffices
        caseData={caseData}
        caseId={caseId}
        notasList={notasList}
        historyLogs={historyLogs}
        role={role || ''}
        statusChangeLoading={statusChangeLoading}
        onApproveSubmission={handleApproveSubmission}
        onRejectSubmission={handleRejectSubmission}
        onViableSubmission={handleViableSubmission}
        onNotViableSubmission={handleNotViableSubmission}
        onRadicarClick={handleRadicarClick}
        onTutelaUploaded={handleTutelaUploaded}
        onChangeTutelaInEsperaJuez={handleChangeTutelaInEsperaJuez}
        canUploadTutela={canUploadTutela}
        showRadicarNotification={showRadicarNotification}
        onCloseRadicarNotification={handleCloseRadicarNotification}
        tutelaPreviewRef={tutelaPreviewRef}
        loadCaseData={loadCaseData}
      />
    </>
  );
}
