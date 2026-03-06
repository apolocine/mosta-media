// @mostajs/media — useScreenCapture hook
// Author: Dr Hamid MADANI drmdh@msn.com
'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

export interface UseScreenCaptureReturn {
  /** Ref to attach to video element for preview */
  videoRef: React.RefObject<HTMLVideoElement | null>
  /** Whether screen sharing is active */
  active: boolean
  /** Whether recording */
  recording: boolean
  /** Recording duration in seconds */
  duration: number
  /** Start screen sharing */
  startScreenShare: (options?: { audio?: boolean; webcamOverlay?: boolean }) => Promise<void>
  /** Stop screen sharing */
  stopScreenShare: () => void
  /** Capture current frame as image */
  captureFrame: (format?: string, quality?: number) => string | null
  /** Start recording screen */
  startRecording: () => void
  /** Stop recording and get blob */
  stopRecording: () => Promise<{ blob: Blob; url: string } | null>
  /** Error */
  error: string | null
  /** Webcam overlay ref (attach to small video element) */
  webcamRef: React.RefObject<HTMLVideoElement | null>
  /** Whether webcam overlay is active */
  webcamActive: boolean
}

/**
 * Hook for screen capture and recording, with optional webcam overlay.
 *
 * @example
 * ```tsx
 * const { videoRef, webcamRef, active, startScreenShare, captureFrame, startRecording, stopRecording } = useScreenCapture()
 *
 * <div style={{ position: 'relative' }}>
 *   <video ref={videoRef} autoPlay playsInline />
 *   <video ref={webcamRef} autoPlay playsInline muted
 *     style={{ position: 'absolute', bottom: 16, right: 16, width: 200, borderRadius: 8 }} />
 * </div>
 * <button onClick={() => startScreenShare({ webcamOverlay: true })}>Share Screen</button>
 * <button onClick={startRecording}>Record</button>
 * ```
 */
export function useScreenCapture(): UseScreenCaptureReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const webcamRef = useRef<HTMLVideoElement | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const webcamStreamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [active, setActive] = useState(false)
  const [webcamActive, setWebcamActive] = useState(false)
  const [recording, setRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const startScreenShare = useCallback(async (options?: { audio?: boolean; webcamOverlay?: boolean }) => {
    setError(null)
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: options?.audio ?? false,
      })
      screenStreamRef.current = screenStream
      if (videoRef.current) videoRef.current.srcObject = screenStream
      setActive(true)

      // Auto-stop when user stops sharing via browser UI
      screenStream.getVideoTracks()[0].addEventListener('ended', () => {
        stopScreenShare()
      })

      // Optional webcam overlay
      if (options?.webcamOverlay) {
        try {
          const webcamStream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: 'user' },
            audio: true,
          })
          webcamStreamRef.current = webcamStream
          if (webcamRef.current) webcamRef.current.srcObject = webcamStream
          setWebcamActive(true)
        } catch {
          // Webcam not available, continue without it
        }
      }
    } catch (err: any) {
      if (err?.name === 'NotAllowedError') {
        setError('Screen sharing cancelled')
      } else {
        setError(`Screen capture error: ${err?.message || err}`)
      }
    }
  }, [])

  const stopScreenShare = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop())
      screenStreamRef.current = null
    }
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach((t) => t.stop())
      webcamStreamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    if (webcamRef.current) webcamRef.current.srcObject = null
    if (timerRef.current) clearInterval(timerRef.current)
    setActive(false)
    setWebcamActive(false)
    setRecording(false)
    setDuration(0)
  }, [])

  const captureFrame = useCallback((format = 'image/png', quality = 0.9) => {
    if (!videoRef.current || !active) return null
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0)

    // Draw webcam overlay if active
    if (webcamRef.current && webcamActive) {
      const wv = webcamRef.current
      const overlayW = Math.round(canvas.width * 0.2)
      const overlayH = Math.round((wv.videoHeight / wv.videoWidth) * overlayW)
      const x = canvas.width - overlayW - 16
      const y = canvas.height - overlayH - 16
      // Round corners
      ctx.save()
      roundRect(ctx, x, y, overlayW, overlayH, 8)
      ctx.clip()
      ctx.drawImage(wv, x, y, overlayW, overlayH)
      ctx.restore()
      // Border
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      roundRect(ctx, x, y, overlayW, overlayH, 8)
      ctx.stroke()
    }

    return canvas.toDataURL(format, quality)
  }, [active, webcamActive])

  const startRecording = useCallback(() => {
    if (!screenStreamRef.current) return
    chunksRef.current = []
    setDuration(0)

    // Combine screen + webcam audio into single stream
    const tracks = [...screenStreamRef.current.getTracks()]
    if (webcamStreamRef.current) {
      const audioTracks = webcamStreamRef.current.getAudioTracks()
      tracks.push(...audioTracks)
    }
    const combinedStream = new MediaStream(tracks)

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm'

    const recorder = new MediaRecorder(combinedStream, { mimeType })
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }
    recorderRef.current = recorder
    recorder.start(1000)
    setRecording(true)

    timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000)
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
      if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach((t) => t.stop())
      if (webcamStreamRef.current) webcamStreamRef.current.getTracks().forEach((t) => t.stop())
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return {
    videoRef, webcamRef, active, webcamActive, recording, duration,
    startScreenShare, stopScreenShare, captureFrame,
    startRecording, stopRecording, error,
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
