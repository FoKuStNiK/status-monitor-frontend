import { useEffect, useRef, useState } from 'react';

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:5000/ws';
const RECONNECT_DELAY = 3000;

export function useWebSocket({ enabled, onStatusUpdate, onReconnect }) {
  const [connectionStatus, setConnectionStatus] = useState('idle');
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const closedByReactRef = useRef(false);
  const hasConnectedOnceRef = useRef(false);
  const onStatusUpdateRef = useRef(onStatusUpdate);
  const onReconnectRef = useRef(onReconnect);

  useEffect(() => {
    onStatusUpdateRef.current = onStatusUpdate;
  }, [onStatusUpdate]);

  useEffect(() => {
    onReconnectRef.current = onReconnect;
  }, [onReconnect]);

  useEffect(() => {
    if (!enabled) return undefined;

    closedByReactRef.current = false;

    function connect() {
      if (closedByReactRef.current) return;

      setConnectionStatus(
        hasConnectedOnceRef.current ? 'reconnecting' : 'connecting'
      );

      const socket = new WebSocket(WS_URL);
      socketRef.current = socket;

      socket.onopen = () => {
        if (socketRef.current !== socket) return;

        const isReconnect = hasConnectedOnceRef.current;
        hasConnectedOnceRef.current = true;
        setConnectionStatus('connected');

        if (isReconnect) {
          onReconnectRef.current?.();
        }
      };

      socket.onmessage = event => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === 'status:updated' && message.data) {
            onStatusUpdateRef.current?.(message.data);
          }
        } catch (error) {
          console.error('Некорректное WebSocket сообщение:', error);
        }
      };

      socket.onerror = () => {
        // onclose отвечает за статус и повторное подключение.
      };

      socket.onclose = () => {
        if (socketRef.current === socket) {
          socketRef.current = null;
        }

        if (closedByReactRef.current) return;

        setConnectionStatus('reconnecting');
        reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY);
      };
    }

    connect();

    return () => {
      closedByReactRef.current = true;

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }

      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }

      setConnectionStatus('idle');
    };
  }, [enabled]);

  return connectionStatus;
}
