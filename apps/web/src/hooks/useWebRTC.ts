
import { useRef, useState } from "react";

export function useWebRTC() {
     const pcRef = useRef<RTCPeerConnection | null>(null);
     const wsRef = useRef<WebSocket | null>(null);
     const streamRef = useRef<MediaStream | null>(null);

     const [status, setStatus] = useState("disconnected");

     const startCall = async () => {
          try {
               setStatus("connecting");

               const ws = new WebSocket(
                    "ws://localhost:8000/ws/audio"
               );

               wsRef.current = ws;

               await new Promise<void>((resolve, reject) => {
                    ws.onopen = () => resolve();
                    ws.onerror = () => reject(
                         new Error("Signaling connection failed")
                    );
               });

               const pc = new RTCPeerConnection({
                    iceServers: [
                         { urls: "stun:stun.l.google.com:19302" },
                    ],
               });

               pcRef.current = pc;

               pc.onconnectionstatechange = () => {
                    setStatus(pc.connectionState);
               };

               const stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                         echoCancellation: true,
                         noiseSuppression: true,
                         autoGainControl: true,
                    },
                    video: false,
               });

               streamRef.current = stream;

               stream.getAudioTracks().forEach((track) => {
                    pc.addTrack(track, stream);
               });

               pc.ontrack = (event) => {
                    console.log("Remote track:", event.track.kind);
               };

               const offer = await pc.createOffer();

               await pc.setLocalDescription(offer);

               // Wait until browser ICE candidates are gathered.
               if (pc.iceGatheringState !== "complete") {
                    await new Promise<void>((resolve) => {
                         const checkState = () => {
                              if (pc.iceGatheringState === "complete") {
                                   pc.removeEventListener(
                                        "icegatheringstatechange",
                                        checkState
                                   );
                                   resolve();
                              }
                         };

                         pc.addEventListener(
                              "icegatheringstatechange",
                              checkState
                         );
                    });
               }

               ws.onmessage = async (event) => {
                    const message = JSON.parse(event.data);

                    if (message.type === "answer") {
                         await pc.setRemoteDescription({
                              type: "answer",
                              sdp: message.sdp,
                         });

                         console.log("WebRTC negotiation completed");
                    }

                    if (message.type === "error") {
                         console.error(message.message);
                         setStatus("error");
                    }
               };

               ws.send(
                    JSON.stringify({
                         type: "offer",
                         sdp: pc.localDescription?.sdp,
                    })
               );

          } catch (error) {
               console.error(error);
               setStatus("error");
               stopCall();
          }
     };

     const stopCall = () => {
          streamRef.current?.getTracks().forEach((track) => {
               track.stop();
          });

          pcRef.current?.close();
          wsRef.current?.close();

          pcRef.current = null;
          wsRef.current = null;
          streamRef.current = null;

          setStatus("disconnected");
     };

     return {
          status,
          startCall,
          stopCall,
     };
}
