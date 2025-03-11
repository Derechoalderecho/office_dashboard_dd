'use client';

import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Tabs,
  Tab,
  Button,
  Pagination,
} from '@heroui/react';
import { CheckIcon, TrashIcon } from 'lucide-react';
import NotificationItem from '@/components/notifications/NotificationItem';
import { useNotifications, Notification } from '@/context/NotificationsContext';
import { notificationService } from '@/services/notificationService';

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
  } = useNotifications();
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const filteredNotifications =
    activeTab === 'unread'
      ? notifications.filter((notification) => !notification.read)
      : notifications;

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE);

  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleMarkAllAsRead = async () => {
    setIsLoading(true);
    try {
      await notificationService.markAllAsRead();
      markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAll = async () => {
    setIsLoading(true);
    try {
      // In a real app, you would call an API here
      clearAllNotifications();
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full">
        <CardHeader className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Notificaciones</h1>
            <p className="text-muted-foreground">
              Administre sus notificaciones del sistema
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                color="primary"
                variant="flat"
                onClick={handleMarkAllAsRead}
                isDisabled={isLoading}
              >
                <CheckIcon className="w-4 h-4 mr-1" />
                Marcar todo como leído
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                color="danger"
                variant="flat"
                onClick={handleClearAll}
                isDisabled={isLoading}
              >
                <TrashIcon className="w-4 h-4 mr-1" />
                Limpiar todo
              </Button>
            )}
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <Tabs
            aria-label="Filtros de notificaciones"
            selectedKey={activeTab}
            onSelectionChange={setActiveTab as any}
            className="mb-6"
          >
            <Tab key="all" title="Todas" />
            <Tab
              key="unread"
              title={
                <div className="flex items-center gap-1">
                  No leídas
                  {unreadCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
              }
            />
          </Tabs>

          <div className="space-y-4">
            {paginatedNotifications.length > 0 ? (
              paginatedNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onClear={clearNotification}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No hay notificaciones {activeTab === 'unread' ? 'sin leer' : ''}
                </p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination
                total={totalPages}
                initialPage={1}
                page={currentPage}
                onChange={setCurrentPage}
              />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
} 