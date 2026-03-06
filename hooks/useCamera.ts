// @mostajs/media — useCamera hook
// Author: Dr Hamid MADANI drmdh@msn.com
'use client'

import { useState, useRef, useCallback } from 'react'
import type { CameraOptions, UseCameraReturn } from '../types/index'

/**
 * Hook for camera access, preview, and frame capture.
 *
 * @example
 * ```tsx
 * const { videoRef, active, start, stop, capture } = useCamera()
 *
 * <video ref={videoRef} autoPlay playsInline />
 * <button onClick={() => start()}>Start</button>
 * <button onClick={() => { const img = capture(); if (img) setPhoto(img) }}>Snap</button>
 * ```
 */
export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [active, setActive] = useState(false)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [error, setError] = useState<string | null>(null)

  const start = useCallback(async (options: CameraOptions = {}) => {
    setError(null)
    const mode = options.facingMode || 'user'
    setFacingMode(mode)

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: mode,
          width: options.width ? { ideal: options.width } : undefined,
          height: options.height ? { ideal: options.height } : undefined,
        },
        audio: false,
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setActive(true)
    } catch (err: any) {
      const msg = err?.name === 'NotAllowedError'
        ? 'Camera access denied'
        : err?.name === 'NotFoundError'
        ? 'No camera found'
        : `Camera error: ${err?.message || err}`
      setError(msg)
    }
  }, [])

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setActive(false)
  }, [])

  const capture = useCallback((options?: { maxWidth?: number; maxHeight?: number; quality?: number; format?: string }) => {
    if (!videoRef.current || !active) return null
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    let w = video.videoWidth
    let h = video.videoHeight
    const maxW = options?.maxWidth || w
    const maxH = options?.maxHeight || h
    if (w > maxW || h > maxH) {
      const ratio = Math.min(maxW / w, maxH / h)
      w = Math.round(w * ratio)
      h = Math.round(h * ratio)
    }
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!
    // Mirror if front camera
    if (facingMode === 'user') {
      ctx.translate(w, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(video, 0, 0, w, h)
    return canvas.toDataURL(options?.format || 'image/jpeg', options?.quality || 0.85)
  }, [active, facingMode])

  const switchCamera = useCallback(async () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user'
    stop()
    await start({ facingMode: newMode })
  }, [facingMode, stop, start])

  return { videoRef, active, start, stop, capture, switchCamera, facingMode, error }
}
