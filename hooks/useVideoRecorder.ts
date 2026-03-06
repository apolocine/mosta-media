// @mostajs/media — useVideoRecorder hook
// Author: Dr Hamid MADANI drmdh@msn.com
'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import type { CameraOptions, UseVideoRecorderReturn } from '../types/index'

/**
 * Hook for video recording with webcam.
 *
 * @example
 * ```tsx
 * const { videoRef, cameraActive, recording, duration, startCamera, startRecording, stopRecording } = useVideoRecorder()
 *
 * <video ref={videoRef} autoPlay playsInline muted />
 * <button onClick={() => startCamera()}>Camera</button>
 * <button onClick={startRecording}>Record</button>
 * <button onClick={async () => { const result = await stopRecording(); if (result) saveVideo(result.blob) }}>Stop</button>
 * ```
 */
export function useVideoRecorder(): UseVideoRecorderReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [cameraActive, setCameraActive] = useState(false)
  const [recording, setRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const startCamera = useCallback(async (options: CameraOptions = {}) => {
    setError(null)
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: options.facingMode || 'user',
          width: options.width ? { ideal: options.width } : undefined,
          height: options.height ? { ideal: options.height } : undefined,
        },
        audio: true,
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCameraActive(true)
    } catch (err: any) {
      setError(err?.name === 'NotAllowedError' ? 'Camera access denied' : `Camera error: ${err?.message || err}`)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    if (timerRef.current) clearInterval(timerRef.current)
    setCameraActive(false)
    setRecording(false)
    setDuration(0)
  }, [])

  const startRecording = useCallback(() => {
    if (!streamRef.current) return
    chunksRef.current = []
    setDuration(0)

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : MediaRecorder.isTypeSupported('video/webm')
      ? 'video/webm'
      : 'video/mp4'

    const recorder = new MediaRecorder(streamRef.current, { mimeType })
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }
    recorderRef.current = recorder
    recorder.start(1000) // collect data every second
    setRecording(true)

    timerRef.current = setInterval(() => {
      setDuration((d) => d + 1)
    }, 1000)
  }, [])

  const stopRecording = useCallback((): Promise<{ blob: Blob; url: string } | null> => {
    return new Promise((resolve) => {
      if (!recorderRef.current || recorderRef.current.state === 'inactive') {
        resolve(null)
        return
      }

      if (timerRef.current) clearInterval(timerRef.current)

      recorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorderRef.current!.mimeType })
        const url = URL.createObjectURL(blob)
        setRecording(false)
        resolve({ blob, url })
      }

      recorderRef.current.stop()
    })
  }, [])

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return { videoRef, cameraActive, recording, duration, startCamera, stopCamera, startRecording, stopRecording, error }
}
