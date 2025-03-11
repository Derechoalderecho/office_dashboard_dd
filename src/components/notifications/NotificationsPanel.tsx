import React, { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  Tabs,
  Tab,
  ScrollShadow,
  Divider,
  Badge,
} from "@heroui/react";
import { BellIcon, CheckIcon, TrashIcon, ExternalLinkIcon } from "lucide-react";
import NotificationItem from "./NotificationItem";
import { useNotifications, Notification } from "@/context/NotificationsContext";
import Link from "next/link";

export default function NotificationsPanel() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const filteredNotifications = 
    activeTab === "unread" 
      ? notifications.filter(notification => !notification.read) 
      : notifications;

  return (
    <Popover 
      isOpen={isOpen} 
      onOpenChange={(open) => setIsOpen(open)}
      placement="bottom-end"
    >
      <PopoverTrigger>
        <Button
          isIconOnly
          variant="light"
          radius="full"
          aria-label="Notificaciones"
          className="relative"
        >
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              content={unreadCount}
              color="danger"
              size="sm"
              className="absolute -top-1 -right-1"
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96">
        <div className="px-1 py-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Notificaciones</h3>
            <div className="flex gap-1">
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="flat"
                  color="primary"
                  onClick={markAllAsRead}
                >
                  <CheckIcon className="h-3 w-3 mr-1" />
                  Marcar todo como leído
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  size="sm"
                  variant="flat"
                  color="danger"
                  onClick={clearAllNotifications}
                >
                  <TrashIcon className="h-3 w-3 mr-1" />
                  Limpiar todo
                </Button>
              )}
            </div>
          </div>

          <Tabs 
            aria-label="Filtros de notificaciones" 
            selectedKey={activeTab}
            onSelectionChange={setActiveTab as any}
            className="mb-4"
          >
            <Tab key="all" title="Todas" />
            <Tab 
              key="unread" 
              title={
                <div className="flex items-center gap-1">
                  No leídas
                  {unreadCount > 0 && (
                    <Badge size="sm" color="primary">{unreadCount}</Badge>
                  )}
                </div>
              } 
            />
          </Tabs>

          <Divider className="my-2" />

          <ScrollShadow className="max-h-[350px] overflow-y-auto">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onClear={clearNotification}
                />
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <BellIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No hay notificaciones {activeTab === "unread" ? "sin leer" : ""}</p>
              </div>
            )}
          </ScrollShadow>
          
          <Divider className="my-2" />
          
          <div className="flex justify-center pt-2">
            <Link href="/notifications" className="inline-flex items-center text-sm text-primary-500 hover:underline">
              <span>Ver todas las notificaciones</span>
              <ExternalLinkIcon className="ml-1 h-3 w-3" />
            </Link>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 