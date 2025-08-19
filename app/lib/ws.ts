import ReconnectingWebSocket from 'reconnecting-websocket';

export function connectAuditWS(onMessage: (m: any)=>void) {
  const url = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/';
  const ws = new ReconnectingWebSocket(url);
  ws.addEventListener('message', (ev) => {
    try { onMessage(JSON.parse(ev.data)); }
    catch { /* ignore */ }
  });
  return ws;
}