// Custom hook for audio recording using MediaRecorder API
// Provides a clean interface for microphone recording with error handling

import { useState, useRef, useCallback } from 'react';

export interface AudioRecorderError {
    type: 'permission' | 'unsupported' | 'recording' | 'unknown';
    message: string;
}

export interface AudioRecorderResult {
    blob: Blob;
    duration: number;
    mimeType: string;
}

export interface UseAudioRecorderReturn {
    isRecording: boolean;
    isPaused: boolean;
    duration: number;
    error: AudioRecorderError | null;
    audioLevel: number;
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<AudioRecorderResult | null>;
    pauseRecording: () => void;
    resumeRecording: () => void;
    cancelRecording: () => void;
    clearError: () => void;
}

export interface UseAudioRecorderOptions {
    maxDuration?: number; // Maximum recording duration in milliseconds
    preferredMimeType?: string; // Preferred MIME type (will fallback if unsupported)
    onMaxDuration?: () => void; // Callback when max duration is reached
    enableAudioLevel?: boolean; // Enable audio level monitoring
}

/**
 * Custom hook for audio recording using MediaRecorder API
 * Provides microphone recording with error handling, duration tracking, and audio level monitoring
 */
export function useAudioRecorder(options: UseAudioRecorderOptions = {}): UseAudioRecorderReturn {
    const {
        maxDuration = 60000, // Default 60 seconds
        preferredMimeType = 'audio/webm',
        onMaxDuration,
        enableAudioLevel = false
    } = options;

    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [duration, setDuration] = useState(0);
    const [error, setError] = useState<AudioRecorderError | null>(null);
    const [audioLevel, setAudioLevel] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const startTimeRef = useRef<number>(0);
    const durationIntervalRef = useRef<number | null>(null);
    const maxDurationTimeoutRef = useRef<number | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    // Get supported MIME type
    const getSupportedMimeType = useCallback((): string => {
        const types = [
            preferredMimeType,
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/ogg;codecs=opus',
            'audio/mp4',
            'audio/mpeg'
        ];

        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }

        return ''; // Browser will use default
    }, [preferredMimeType]);

    // Monitor audio levels
    const monitorAudioLevel = useCallback(() => {
        if (!analyserRef.current || !enableAudioLevel) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average volume
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        const normalizedLevel = Math.min(average / 128, 1); // Normalize to 0-1

        setAudioLevel(normalizedLevel);

        if (isRecording && !isPaused) {
            animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
        }
    }, [isRecording, isPaused, enableAudioLevel]);

    // Start recording
    const startRecording = useCallback(async () => {
        try {
            setError(null);
            audioChunksRef.current = [];

            // Check if MediaRecorder is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('MediaRecorder not supported in this browser');
            }

            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            streamRef.current = stream;

            // Set up audio level monitoring if enabled
            if (enableAudioLevel) {
                audioContextRef.current = new AudioContext();
                analyserRef.current = audioContextRef.current.createAnalyser();
                const source = audioContextRef.current.createMediaStreamSource(stream);
                source.connect(analyserRef.current);
                analyserRef.current.fftSize = 256;
                monitorAudioLevel();
            }

            // Get supported MIME type
            const mimeType = getSupportedMimeType();
            const options = mimeType ? { mimeType } : undefined;

            // Create MediaRecorder
            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onerror = () => {
                setError({
                    type: 'recording',
                    message: 'Recording failed. Please try again.'
                });
                cleanup();
            };

            // Start recording
            mediaRecorder.start();
            setIsRecording(true);
            startTimeRef.current = Date.now();

            // Start duration tracker
            durationIntervalRef.current = window.setInterval(() => {
                setDuration(Date.now() - startTimeRef.current);
            }, 100);

            // Set max duration timeout
            if (maxDuration > 0) {
                maxDurationTimeoutRef.current = window.setTimeout(() => {
                    stopRecording();
                    onMaxDuration?.();
                }, maxDuration);
            }

        } catch (err) {
            console.error('Failed to start recording:', err);

            if (err instanceof DOMException && err.name === 'NotAllowedError') {
                setError({
                    type: 'permission',
                    message: 'Microphone access denied. Please allow permissions in your browser settings.'
                });
            } else if (err instanceof Error && err.message.includes('not supported')) {
                setError({
                    type: 'unsupported',
                    message: 'Audio recording is not supported in this browser.'
                });
            } else {
                setError({
                    type: 'unknown',
                    message: 'Could not access microphone. Please check your settings.'
                });
            }

            cleanup();
        }
    }, [maxDuration, onMaxDuration, getSupportedMimeType, enableAudioLevel, monitorAudioLevel]);

    // Cleanup function
    const cleanup = useCallback(() => {
        // Stop media stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        // Stop duration tracker
        if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
        }

        // Clear max duration timeout
        if (maxDurationTimeoutRef.current) {
            clearTimeout(maxDurationTimeoutRef.current);
            maxDurationTimeoutRef.current = null;
        }

        // Stop audio level monitoring
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        // Close audio context
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        mediaRecorderRef.current = null;
        setIsRecording(false);
        setIsPaused(false);
        setDuration(0);
        setAudioLevel(0);
    }, []);

    // Stop recording and return the audio blob
    const stopRecording = useCallback(async (): Promise<AudioRecorderResult | null> => {
        return new Promise((resolve) => {
            if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
                cleanup();
                resolve(null);
                return;
            }

            const mediaRecorder = mediaRecorderRef.current;
            const recordingDuration = Date.now() - startTimeRef.current;

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, {
                    type: mediaRecorder.mimeType || 'audio/webm'
                });

                const result: AudioRecorderResult = {
                    blob: audioBlob,
                    duration: recordingDuration,
                    mimeType: mediaRecorder.mimeType || 'audio/webm'
                };

                cleanup();
                resolve(result);
            };

            mediaRecorder.stop();
        });
    }, [cleanup]);

    // Pause recording
    const pauseRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.pause();
            setIsPaused(true);

            if (durationIntervalRef.current) {
                clearInterval(durationIntervalRef.current);
                durationIntervalRef.current = null;
            }
        }
    }, []);

    // Resume recording
    const resumeRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
            mediaRecorderRef.current.resume();
            setIsPaused(false);

            // Resume duration tracker
            const pausedDuration = duration;
            startTimeRef.current = Date.now() - pausedDuration;
            durationIntervalRef.current = window.setInterval(() => {
                setDuration(Date.now() - startTimeRef.current);
            }, 100);

            // Resume audio level monitoring
            if (enableAudioLevel) {
                monitorAudioLevel();
            }
        }
    }, [duration, enableAudioLevel, monitorAudioLevel]);

    // Cancel recording without returning data
    const cancelRecording = useCallback(() => {
        audioChunksRef.current = [];
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        cleanup();
    }, [cleanup]);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        isRecording,
        isPaused,
        duration,
        error,
        audioLevel,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
        cancelRecording,
        clearError
    };
}
