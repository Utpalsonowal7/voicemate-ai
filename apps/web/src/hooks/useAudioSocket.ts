
import { useCallback, useEffect, useRef, useState } from "react";

type SocketStatus =
     | "disconnected"
     | "connecting"
     | "connected"
     | "error";

export function useAudioSocket(url: string) {
     const socketRef = useRef<WebSocket | null>(null);
     const [status, setStatus] =
          useState<SocketStatus>("disconnected");

     const connect = useCallback(() => {
          if (
               socketRef.current?.readyState === WebSocket.OPEN ||
               socketRef.current?.readyState === WebSocket.CONNECTING
          ) {
               return;
          }

          setStatus("connecting");

          const socket = new WebSocket(url);
          socket.binaryType = "arraybuffer";

          socket.onopen = () => {
               setStatus("connected");
               console.log("WebSocket connected");
          };

          socket.onmessage = (event) => {
               console.log("Backend message:", event.data);
          };

          socket.onerror = () => {
               setStatus("error");
          };

          socket.onclose = () => {
               setStatus("disconnected");
          };

          socketRef.current = socket;
     }, [url]);

     const sendAudio = useCallback((chunk: Blob) => {
          const socket = socketRef.current;

          if (!socket || socket.readyState !== WebSocket.OPEN) {
               console.warn("WebSocket is not connected");
               return false;
          }

          if (socket.bufferedAmount > 1024 * 1024) {
               console.warn("Audio buffer is full; skipping chunk");
               return false;
          }

          socket.send(chunk);
          return true;
     }, []);

     const disconnect = useCallback(() => {
          const socket = socketRef.current;

          if (socket) {
               socket.close();
               socketRef.current = null;
          }

          setStatus("disconnected");
     }, []);

     useEffect(() => {
          return () => {
               socketRef.current?.close();
               socketRef.current = null;
          };
     }, []);

     return {
          status,
          connect,
          sendAudio,
          disconnect,
     };
}
