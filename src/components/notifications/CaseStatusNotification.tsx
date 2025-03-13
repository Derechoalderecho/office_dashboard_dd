"use client";

import React from 'react';
import { Button } from "@heroui/react";
import { BellIcon } from "lucide-react";
import { useNotifications } from '@/context/NotificationsContext';
import { CaseHistoryLog } from '@/services/caseService';

interface CaseStatusNotificationProps {
  historyLog: CaseHistoryLog;
  caseId: number;
}

export default function CaseStatusNotification({ historyLog, caseId }: CaseStatusNotificationProps) {
  const { addNotification } = useNotifications();

  const sendStatusChangeNotification = () => {
    // Determine notification type based on status
    let notificationType: "info" | "success" | "warning" | "error" = "info";
    
    switch (historyLog.estado_nuevo) {
      case "Aprobado":
        notificationType = "success";
        break;
      case "No aprobado":
        notificationType = "error";
        break;
      case "Acción necesaria":
        notificationType = "warning";
        break;
      case "Seguimiento":
      default:
        notificationType = "info";
        break;
    }

    // Create notification message
    const statusMessage = historyLog.estado_anterior !== historyLog.estado_nuevo
      ? `El caso #${caseId} ha cambiado de estado: ${historyLog.estado_anterior} → ${historyLog.estado_nuevo}`
      : `El caso #${caseId} tiene estado: ${historyLog.estado_nuevo}`;

    // Send notification
    addNotification({
      title: `Actualización de Caso #${caseId}`,
      message: statusMessage,
      type: notificationType,
      actionUrl: `/dashboard/cases/${caseId}`
    });
  };

  return (
    <Button 
      size="sm"
      variant="light"
      color="primary"
      startContent={<BellIcon size={16} />}
      onClick={sendStatusChangeNotification}
    >
      Notificar cambio de estado
    </Button>
  );
} 