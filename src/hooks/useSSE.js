import { useState, useEffect, useRef, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';
const RECONNECT_DELAY = 3000;
const MAX_LOGS = 200;

export function useSSE(agentId = null) {
  const [metrics, setMetrics] = useState(null);
  const [containers, setContainers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [connected, setConnected] = useState(false);
  const esRef = useRef(null);
  const reconnectTimer = useRef(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (esRef.current) esRef.current.close();

    const url = agentId
      ? `${API_URL}/api/stream?agentId=${agentId}`
      : `${API_URL}/api/stream`;

    const es = new EventSource(url);
    esRef.current = es;

    es.onopen = () => {
      if (!mountedRef.current) return;
      setConnected(true);
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
    };

    es.onmessage = (event) => {
      if (!mountedRef.current) return;
      try {
        const payload = JSON.parse(event.data);

        if (payload.type === 'connected') { setConnected(true); return; }

        if (payload.type === 'metrics' && payload.data) {
          const { system, containers: c, recentLogs } = payload.data;
          if (system) setMetrics(system);
          if (c) setContainers(c);
          if (recentLogs) {
            setLogs(prev => {
              const merged = [...prev];
              for (const l of recentLogs) {
                const isDup = merged.find(x =>
                  (x.id != null && l.id != null && x.id === l.id) ||
                  (x.timestamp === l.timestamp && x.service === l.service && x.message === l.message)
                );
                if (!isDup) merged.push(l);
              }
              return merged.slice(-MAX_LOGS);
            });
          }
        }

        if (payload.type === 'log' && payload.data) {
          setLogs(prev => [...prev, payload.data].slice(-MAX_LOGS));
        }
      } catch { /* ignore parse errors */ }
    };

    es.onerror = () => {
      if (!mountedRef.current) return;
      setConnected(false);
      es.close();
      esRef.current = null;
      reconnectTimer.current = setTimeout(() => {
        if (mountedRef.current) connect();
      }, RECONNECT_DELAY);
    };
  }, [agentId]);

  useEffect(() => {
    mountedRef.current = true;
    // Reset state when switching agents
    setMetrics(null);
    setContainers([]);
    setLogs([]);
    connect();

    return () => {
      mountedRef.current = false;
      if (esRef.current) esRef.current.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [connect]);

  return { metrics, containers, logs, connected };
}
