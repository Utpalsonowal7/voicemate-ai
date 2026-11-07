import { useWebRTC } from "../hooks/useWebRTC";

export default function VoiceChat() {
     const { status, startCall, stopCall } = useWebRTC();

     const connected = status === "connected";
     const connecting = status === "connecting";

     return (
          <div className="voice-chat">
               <h1>AI Voice Assistant</h1>

               <div className="status">
                    <span
                         className={`status-dot ${connected ? "online" : ""}`}
                    />

                    {status}
               </div>

               <div className="microphone">
                    <span>🎙️</span>
               </div>

               <div className="controls">
                    <button
                         onClick={startCall}
                         disabled={connecting || connected}
                    >
                         Start Voice
                    </button>

                    <button
                         onClick={stopCall}
                         disabled={!connected && !connecting}
                    >
                         End Call
                    </button>
               </div>
          </div>
     );
}
