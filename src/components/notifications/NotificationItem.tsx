import React from "react";
import { Notification } from "@/context/NotificationsContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Card,
  CardBody,
  Button,
  Chip,
} from "@heroui/react";
import {
  CheckIcon,
  XIcon,
  BellIcon,
  InfoIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "lucide-react";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClear: (id: string) => void;
}

export default function NotificationItem({
  notification,
  onMarkAsRead,
  onClear,
}: NotificationItemProps) {
  const { id, title, message, type, read, timestamp, actionUrl } = notification;

  const getTypeIcon = () => {
    switch (type) {
      case "info":
        return <InfoIcon className="w-5 h-5 text-primary" />;
      case "success":
        return <CheckCircleIcon className="w-5 h-5 text-success" />;
      case "warning":
        return <AlertTriangleIcon className="w-5 h-5 text-warning" />;
      case "error":
        return <XCircleIcon className="w-5 h-5 text-danger" />;
      default:
        return <BellIcon className="w-5 h-5 text-primary" />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case "info":
        return "primary";
      case "success":
        return "success";
      case "warning":
        return "warning";
      case "error":
        return "danger";
      default:
        return "default";
    }
  };

  const formattedTime = format(new Date(timestamp), "d MMM, h:mm a", {
    locale: es,
  });

  return (
    <Card 
      className={`mb-2 ${!read ? "border-l-4 border-l-primary" : ""}`}
      isPressable={!!actionUrl}
    >
      <CardBody className="p-4">
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 mt-1">{getTypeIcon()}</div>
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-foreground">{title}</h3>
              <div className="flex items-center">
                {!read && (
                  <Chip 
                    color="primary" 
                    variant="flat" 
                    size="sm" 
                    className="mr-2"
                  >
                    Nuevo
                  </Chip>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{message}</p>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>{formattedTime}</span>
              <div className="flex gap-2">
                {!read && (
                  <Button
                    size="sm"
                    variant="light"
                    onClick={() => onMarkAsRead(id)}
                    className="text-xs"
                  >
                    <CheckIcon className="w-3 h-3 mr-1" />
                    Marcar como leído
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="light"
                  onClick={() => onClear(id)}
                  className="text-xs text-danger"
                >
                  <XIcon className="w-3 h-3 mr-1" />
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
} 