import { useEffect, useState } from "react";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";

export default function VoiceRecorder() {
     const {
          isRecording,
          audioLevel,
          chunks,
          audioBlob,
          error,
          startRecording,
          stopRecording,
     } = useVoiceRecorder();

     const [audioUrl, setAudioUrl] = useState<string | null>(null);

     useEffect(() => {
          if (!audioBlob) {
               setAudioUrl(null);
               return;
          }

          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);

          return () => URL.revokeObjectURL(url);
     }, [audioBlob]);

     return (
          <div className="voice-container">
               <h2>AI Voice Chat</h2>

               <div className="voice-visualizer">
                    {Array.from({ length: 24 }).map((_, i) => (
                         <div
                              key={i}
                              className={`voice-bar ${isRecording ? "active" : ""}`}
                              style={{
                                   height: isRecording
                                        ? `${Math.max(
                                               5,
                                               audioLevel *
                                                    (0.4 +
                                                         Math.abs(Math.sin(i)) *
                                                              0.6),
                                          )}px`
                                        : "5px",
                              }}
                         />
                    ))}
               </div>

               <p>{isRecording ? "Listening..." : "Microphone is off"}</p>

               <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={isRecording ? "stop-button" : "start-button"}
               >
                    {isRecording ? "Stop Recording" : "Start Recording"}
               </button>

               <p>Audio chunks captured: {chunks.length}</p>

               {error && <p className="error">{error}</p>}

               {audioUrl && (
                    <div className="audio-preview">
                         <h3>Recorded Audio</h3>
                         <audio controls src={audioUrl} />
                         <p>Size: {(audioBlob!.size / 1024).toFixed(2)} KB</p>
                    </div>
               )}
          </div>
     );
}
