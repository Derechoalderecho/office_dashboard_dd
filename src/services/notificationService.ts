import { Notification } from '@/context/NotificationsContext';

// Mock function to generate a random ID
const generateId = () => {
  return Math.random().toString(36).substring(2, 15);
};

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: generateId(),
    title: 'Nuevo caso asignado',
    message: 'Se te ha asignado el caso #12345 para su revisión.',
    type: 'info',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
    actionUrl: '/cases/12345',
  },
  {
    id: generateId(),
    title: 'Caso actualizado',
    message: 'El caso #12340 ha sido actualizado por Juan Pérez.',
    type: 'info',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 35), // 35 minutes ago
    actionUrl: '/cases/12340',
  },
  {
    id: generateId(),
    title: 'Aprobación requerida',
    message: 'El caso #12339 requiere tu aprobación para continuar.',
    type: 'warning',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    actionUrl: '/cases/12339/approval',
  },
  {
    id: generateId(),
    title: 'Caso completado',
    message: 'El caso #12330 ha sido completado exitosamente.',
    type: 'success',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    actionUrl: '/cases/12330',
  },
  {
    id: generateId(),
    title: 'Error en el sistema',
    message: 'Hubo un error al procesar el caso #12320. Por favor, revisa el log.',
    type: 'error',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    actionUrl: '/logs/error-12320',
  },
];

// Service functions
export const notificationService = {
  // Get all notifications
  getNotifications: async (): Promise<Notification[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockNotifications];
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockNotifications.filter(n => !n.read).length;
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    // In a real app, you would call an API endpoint here
    console.log(`Marked notification ${notificationId} as read`);
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    // In a real app, you would call an API endpoint here
    console.log('Marked all notifications as read');
  },

  // Subscribe to real-time notifications (mock implementation)
  subscribeToNotifications: (callback: (notification: Notification) => void) => {
    // In a real app, this would set up a WebSocket or SSE connection
    const interval = setInterval(() => {
      // Randomly decide whether to send a new notification (20% chance)
      if (Math.random() < 0.2) {
        const newNotification: Notification = {
          id: generateId(),
          title: 'Nueva actualización',
          message: `Actualización generada a las ${new Date().toLocaleTimeString()}`,
          type: ['info', 'success', 'warning', 'error'][Math.floor(Math.random() * 4)] as any,
          read: false,
          timestamp: new Date(),
          actionUrl: '/dashboard',
        };
        callback(newNotification);
      }
    }, 30000); // Check every 30 seconds

    // Return the cleanup function
    return () => clearInterval(interval);
  },
}; 