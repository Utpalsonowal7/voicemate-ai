// import { useVoiceRecorder } from "./hooks/useVoiceRecorder";
// import { useAudioSocket } from "./hooks/useAudioSocket";

// const WS_URL = "ws://localhost:8000/ws/audio";

// function App() {
//      const { status, connect, sendAudio, disconnect } = useAudioSocket(WS_URL);

//      const { isRecording, startRecording, stopRecording, audioLevel, error } =
//           useVoiceRecorder(sendAudio);

//      const start = async () => {
//           connect();

//           // Wait for WebSocket connection before recording.
//           // The socket connection handler below can be used
//           // to coordinate recording in production.
//      };

//      return (
//           <main>
//                <h1>AI Voice Chat</h1>

//                <p>WebSocket: {status}</p>

//                <p>Microphone: {isRecording ? "Recording" : "Stopped"}</p>

//                <p>Audio level: {audioLevel}</p>

//                {!isRecording ? (
//                     <button
//                          disabled={status !== "connected"}
//                          onClick={startRecording}
//                     >
//                          Start Voice
//                     </button>
//                ) : (
//                     <button onClick={stopRecording}>Stop Voice</button>
//                )}

//                <button onClick={start}>Connect Backend</button>

//                <button onClick={disconnect}>Disconnect</button>

//                {error && <p>{error}</p>}
//           </main>
//      );
// }

// export default App;

import VoiceChat from "./components/VoiceChat";
import "./App.css";

function App() {
     return <VoiceChat />;
}

export default App;