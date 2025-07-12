import { useEffect, useCallback } from 'react';
import { webSocketManager } from '@/lib/websocket';
import { useNotificationStore } from '@/store/notificationStore';
import { WebSocketMessage } from '@/types/auth';
import { useAuth } from './useAuth';

export const useWebSocket = () => {
  const { user } = useAuth();
  const { showInfo, showSuccess } = useNotificationStore();

  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'swap_update':
        showInfo('Swap Updated', `Your swap request has been ${message.data.status}`);
        break;
      
      case 'new_request':
        showInfo('New Swap Request', `${message.data.requester_name} wants to swap skills`);
        break;
      
      case 'rating_received':
        showSuccess('Rating Received', `You received a ${message.data.stars}-star rating!`);
        break;
      
      default:
        break;
    }
  }, [showInfo, showSuccess]);

  useEffect(() => {
    if (user?.id) {
      const token = document.cookie
        .split(';')
        .find(c => c.trim().startsWith('access_token='))
        ?.split('=')[1];
      
      if (token) {
        webSocketManager.connect(user.id, token);
        webSocketManager.addMessageHandler(handleMessage);
      }
    }

    return () => {
      webSocketManager.removeMessageHandler(handleMessage);
    };
  }, [user?.id, handleMessage]);

  useEffect(() => {
    return () => {
      webSocketManager.disconnect();
    };
  }, []);

  return {
    isConnected: webSocketManager.isConnected(),
  };
};