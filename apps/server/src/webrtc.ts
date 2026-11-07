import type { Server } from "node:http";
import { WebSocketServer } from "ws";
import { RTCPeerConnection } from "werift";

export function attachWebRTC(server: Server) {
     const wss = new WebSocketServer({
          server,
          path: "/ws/audio",
     });

     wss.on("connection", (ws) => {
          console.log("WebRTC signaling client connected");

          const pc = new RTCPeerConnection({
               iceServers: [
                    { urls: "stun:stun.l.google.com:19302" },
               ],
          });

          // Receive the remote microphone track
          pc.ontrack = (event) => {
               console.log("Remote media track received:", event.track.kind);

               if (event.track.kind === "audio") {
                    console.log("🎤 Incoming audio track is ready");
               }
          };

          pc.onconnectionstatechange = () => {
               console.log("Peer connection:", pc.connectionState);
          };

          ws.on("message", async (raw) => {
               try {
                    const message = JSON.parse(raw.toString());

                    if (message.type !== "offer") {
                         return;
                    }

                    console.log("Received SDP offer");

                    await pc.setRemoteDescription({
                         type: "offer",
                         sdp: message.sdp,
                    });

                    const answer = await pc.createAnswer();

                    // Wait for local ICE gathering to complete
                    await pc.setLocalDescription(answer);

                    ws.send(
                         JSON.stringify({
                              type: "answer",
                              sdp: pc.localDescription?.sdp,
                         })
                    );

                    console.log("SDP answer sent");
               } catch (error) {
                    console.error("WebRTC negotiation error:", error);

                    if (ws.readyState === ws.OPEN) {
                         ws.send(JSON.stringify({
                              type: "error",
                              message: "WebRTC negotiation failed",
                         }));
                    }
               }
          });

          ws.on("close", () => {
               console.log("Signaling connection closed");
               pc.close();
          });

          ws.on("error", (error) => {
               console.error("Signaling error:", error);
          });
     });

     return wss;
}