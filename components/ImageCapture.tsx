// @mostajs/media — ImageCapture component
// Author: Dr Hamid MADANI drmdh@msn.com
'use client'

import { useState } from 'react'
import { Camera, Upload, X, SwitchCamera, MonitorUp } from 'lucide-react'
import { useCamera } from '../hooks/useCamera'
import { resizeImage } from '../lib/image-utils'
import type { ImageCaptureProps } from '../types/index'

/**
 * Image capture component with webcam, file upload, and screen capture support.
 *
 * @example
 * ```tsx
 * <ImageCapture
 *   photo={photo}
 *   onCapture={(dataUrl) => setPhoto(dataUrl)}
 *   onClear={() => setPhoto('')}
 *   allowUpload
 *   captureLabel="Take Photo"
 * />
 * ```
 */
export default function ImageCapture({
  onCapture,
  onClear,
  photo,
  cameraOptions,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.85,
  format = 'image/jpeg',
  allowUpload = true,
  captureLabel = 'Capture',
  uploadLabel = 'Upload',
  onError,
}: ImageCaptureProps) {
  const camera = useCamera()
  const [mode, setMode] = useState<'idle' | 'camera' | 'screen'>('idle')

  const handleCapture = async () => {
    const raw = camera.capture({ maxWidth, maxHeight, quality, format })
    if (!raw) return
    const resized = await resizeImage(raw, maxWidth, maxHeight, quality, format)
    camera.stop()
    setMode('idle')
    onCapture(resized)
  }

  const handleScreenCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
      const track = stream.getVideoTracks()[0]
      const imageCapture = new (window as any).ImageCapture(track)
      const bitmap = await imageCapture.grabFrame()
      track.stop()

      const canvas = document.createElement('canvas')
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      canvas.getContext('2d')!.drawImage(bitmap, 0, 0)
      const raw = canvas.toDataURL(format, quality)
      const resized = await resizeImage(raw, maxWidth, maxHeight, quality, format)
      onCapture(resized)
    } catch (err: any) {
      if (err?.name !== 'NotAllowedError') {
        onError?.(`Screen capture error: ${err?.message || err}`)
      }
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const raw = reader.result as string
      const resized = await resizeImage(raw, maxWidth, maxHeight, quality, format)
      onCapture(resized)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleClear = () => {
    camera.stop()
    setMode('idle')
    onClear?.()
  }

  if (camera.error) onError?.(camera.error)

  // Show captured photo
  if (photo) {
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <img src={photo} alt="" style={{ maxWidth: '100%', borderRadius: 8 }} />
        <button onClick={handleClear} style={{
          position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)',
          border: 'none', borderRadius: '50%', width: 32, height: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <X style={{ width: 16, height: 16, color: '#fff' }} />
        </button>
      </div>
    )
  }

  // Camera active
  if (mode === 'camera' && camera.active) {
    return (
      <div>
        <video
          ref={camera.videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', borderRadius: 8, transform: camera.facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button onClick={handleCapture} style={btnStyle('#0284c7')}>
            <Camera style={{ width: 16, height: 16 }} /> {captureLabel}
          </button>
          <button onClick={camera.switchCamera} style={btnStyle('#6b7280')}>
            <SwitchCamera style={{ width: 16, height: 16 }} />
          </button>
          <button onClick={handleClear} style={btnStyle('#dc2626')}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>
    )
  }

  // Idle — show action buttons
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <button onClick={async () => { setMode('camera'); await camera.start(cameraOptions) }} style={btnStyle('#0284c7')}>
        <Camera style={{ width: 16, height: 16 }} /> {captureLabel}
      </button>
      <button onClick={handleScreenCapture} style={btnStyle('#7c3aed')}>
        <MonitorUp style={{ width: 16, height: 16 }} /> Screen
      </button>
      {allowUpload && (
        <label style={{ ...btnStyle('#059669'), cursor: 'pointer' }}>
          <Upload style={{ width: 16, height: 16 }} /> {uploadLabel}
          <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>
      )}
    </div>
  )
}

const btnStyle = (bg: string): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
  backgroundColor: bg, color: '#fff', border: 'none', borderRadius: 6,
  fontSize: 13, fontWeight: 500, cursor: 'pointer',
})
