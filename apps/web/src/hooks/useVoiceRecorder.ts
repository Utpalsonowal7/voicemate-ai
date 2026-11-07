
import { useCallback, useEffect, useRef, useState } from "react";

export function useVoiceRecorder(onAudioChunk?: (chunk: Blob) => void) {
     const [isRecording, setIsRecording] = useState(false);
     const [audioLevel, setAudioLevel] = useState(0);
     const [chunks, setChunks] = useState<Blob[]>([]);
     const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
     const [error, setError] = useState<string | null>(null);

     const recorderRef = useRef<MediaRecorder | null>(null);
     const streamRef = useRef<MediaStream | null>(null);
     const chunksRef = useRef<Blob[]>([]);
     const audioContextRef = useRef<AudioContext | null>(null);
     const animationRef = useRef<number | null>(null);

     const startRecording = useCallback(async () => {
          try {
               setError(null);
               setChunks([]);
               setAudioBlob(null);
               chunksRef.current = [];

               const stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                         echoCancellation: true,
                         noiseSuppression: true,
                         autoGainControl: true,
                    },
               });

               streamRef.current = stream;

               const mimeType = [
                    "audio/webm;codecs=opus",
                    "audio/webm",
                    "audio/mp4",
               ].find((type) => MediaRecorder.isTypeSupported(type));

               const recorder = new MediaRecorder(
                    stream,
                    mimeType ? { mimeType } : undefined
               );

               recorderRef.current = recorder;

               recorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                         chunksRef.current.push(event.data);
                         setChunks([...chunksRef.current]);

                         onAudioChunk?.(event.data);
                    }
               };

               recorder.onstop = () => {
                    const blob = new Blob(chunksRef.current, {
                         type: recorder.mimeType || "audio/webm",
                    });

                    setAudioBlob(blob);
                    setIsRecording(false);

                    stream.getTracks().forEach((track) => track.stop());
                    streamRef.current = null;
               };

               recorder.onerror = () => {
                    setError("Recording failed.");
                    setIsRecording(false);
               };

               // Start generating audio chunks every 250ms
               recorder.start(250);

               // Audio level visualization
               const audioContext = new AudioContext();
               audioContextRef.current = audioContext;

               const source = audioContext.createMediaStreamSource(stream);
               const analyser = audioContext.createAnalyser();

               analyser.fftSize = 256;
               source.connect(analyser);

               const data = new Uint8Array(analyser.fftSize);

               const updateLevel = () => {
                    analyser.getByteTimeDomainData(data);

                    let sum = 0;

                    for (const value of data) {
                         const normalized = (value - 128) / 128;
                         sum += normalized * normalized;
                    }

                    const rms = Math.sqrt(sum / data.length);
                    setAudioLevel(Math.min(100, Math.round(rms * 300)));

                    animationRef.current =
                         requestAnimationFrame(updateLevel);
               };

               updateLevel();
               setIsRecording(true);
          } catch (err) {
               setError(
                    err instanceof Error
                         ? err.message
                         : "Unable to access microphone."
               );
          }
     }, []);

     const stopRecording = useCallback(() => {
          if (recorderRef.current?.state === "recording") {
               recorderRef.current.stop();
          }

          if (animationRef.current !== null) {
               cancelAnimationFrame(animationRef.current);
               animationRef.current = null;
          }

          if (audioContextRef.current) {
               void audioContextRef.current.close();
               audioContextRef.current = null;
          }

          setAudioLevel(0);
     }, []);

     useEffect(() => {
          return () => {
               if (recorderRef.current?.state === "recording") {
                    recorderRef.current.stop();
               }

               streamRef.current?.getTracks().forEach((track) => {
                    track.stop();
               });

               if (animationRef.current !== null) {
                    cancelAnimationFrame(animationRef.current);
               }

               if (audioContextRef.current) {
                    void audioContextRef.current.close();
               }
          };
     }, []);

     return {
          isRecording,
          audioLevel,
          chunks,
          audioBlob,
          error,
          startRecording,
          stopRecording,
     };
}
