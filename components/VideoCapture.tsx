// @mostajs/media — VideoCapture component
// Author: Dr Hamid MADANI drmdh@msn.com
'use client'

import { useState } from 'react'
import { Video, Square, Camera, MonitorUp, SwitchCamera } from 'lucide-react'
import { useVideoRecorder } from '../hooks/useVideoRecorder'
import { useScreenCapture } from '../hooks/useScreenCapture'
import type { VideoCaptureProps } from '../types/index'

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

/**
 * Video capture component with webcam recording, screen recording,
 * and combined screen+webcam overlay recording.
 *
 * @example
 * ```tsx
 * <VideoCapture
 *   onCapture={(blob, url) => { setVideoUrl(url); uploadVideo(blob) }}
 *   maxDuration={120}
 *   startLabel="Record"
 *   stopLabel="Stop"
 * />
 * ```
 */
export default function VideoCapture({
  onCapture,
  maxDuration = 60,
  cameraOptions,
  startLabel = 'Record',
  stopLabel = 'Stop',
  onError,
}: VideoCaptureProps) {
  const webcam = useVideoRecorder()
  const screen = useScreenCapture()
  const [mode, setMode] = useState<'idle' | 'webcam' | 'screen'>('idle')
  const [result, setResult] = useState<{ blob: Blob; url: string } | null>(null)

  // ── Webcam recording ──

  const startWebcam = async () => {
    setResult(null)
    setMode('webcam')
    await webcam.startCamera(cameraOptions)
  }

  const startWebcamRecording = () => {
    webcam.startRecording()
    // Auto-stop at maxDuration
    setTimeout(async () => {
      if (webcam.recording) {
        const r = await webcam.stopRecording()
        if (r) { setResult(r); onCapture(r.blob, r.url) }
      }
    }, maxDuration * 1000)
  }

  const stopWebcamRecording = async () => {
    const r = await webcam.stopRecording()
    if (r) { setResult(r); onCapture(r.blob, r.url) }
  }

  // ── Screen recording (with webcam overlay) ──

  const startScreenRecording = async () => {
    setResult(null)
    setMode('screen')
    await screen.startScreenShare({ audio: true, webcamOverlay: true })
  }

  const startScreenRec = () => {
    screen.startRecording()
    setTimeout(async () => {
      if (screen.recording) {
        const r = await screen.stopRecording()
        if (r) { setResult(r); onCapture(r.blob, r.url) }
      }
    }, maxDuration * 1000)
  }

  const stopScreenRec = async () => {
    const r = await screen.stopRecording()
    if (r) { setResult(r); onCapture(r.blob, r.url) }
  }

  const reset = () => {
    webcam.stopCamera()
    screen.stopScreenShare()
    setMode('idle')
    setResult(null)
  }

  if (webcam.error) onError?.(webcam.error)
  if (screen.error) onError?.(screen.error)

  // ── Show recorded result ──

  if (result) {
    return (
      <div>
        <video src={result.url} controls style={{ width: '100%', borderRadius: 8 }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button onClick={reset} style={btnStyle('#6b7280')}>New Recording</button>
        </div>
      </div>
    )
  }

  // ── Webcam mode ──

  if (mode === 'webcam') {
    return (
      <div>
        <div style={{ position: 'relative' }}>
          <video ref={webcam.videoRef} autoPlay playsInline muted
            style={{ width: '100%', borderRadius: 8 }} />
          {webcam.recording && (
            <div style={{
              position: 'absolute', top: 12, left: 12, display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', backgroundColor: 'rgba(220,38,38,0.9)', color: '#fff',
              borderRadius: 20, fontSize: 13, fontWeight: 600,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#fff', animation: 'pulse 1s infinite' }} />
              {formatDuration(webcam.duration)}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {!webcam.recording ? (
            <button onClick={startWebcamRecording} style={btnStyle('#dc2626')}>
              <Video style={{ width: 16, height: 16 }} /> {startLabel}
            </button>
          ) : (
            <button onClick={stopWebcamRecording} style={btnStyle('#374151')}>
              <Square style={{ width: 16, height: 16 }} /> {stopLabel}
            </button>
          )}
          <button onClick={reset} style={btnStyle('#6b7280')}>Cancel</button>
        </div>
      </div>
    )
  }

  // ── Screen mode ──

  if (mode === 'screen') {
    return (
      <div>
        <div style={{ position: 'relative' }}>
          <video ref={screen.videoRef} autoPlay playsInline muted
            style={{ width: '100%', borderRadius: 8, backgroundColor: '#111' }} />
          {screen.webcamActive && (
            <video ref={screen.webcamRef} autoPlay playsInline muted
              style={{
                position: 'absolute', bottom: 16, right: 16, width: 180, borderRadius: 8,
                border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }} />
          )}
          {screen.recording && (
            <div style={{
              position: 'absolute', top: 12, left: 12, display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', backgroundColor: 'rgba(220,38,38,0.9)', color: '#fff',
              borderRadius: 20, fontSize: 13, fontWeight: 600,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#fff' }} />
              {formatDuration(screen.duration)}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {!screen.recording ? (
            <button onClick={startScreenRec} style={btnStyle('#dc2626')}>
              <Video style={{ width: 16, height: 16 }} /> {startLabel}
            </button>
          ) : (
            <>
              <button onClick={stopScreenRec} style={btnStyle('#374151')}>
                <Square style={{ width: 16, height: 16 }} /> {stopLabel}
              </button>
              <button onClick={() => {
                const img = screen.captureFrame()
                if (img) {
                  const a = document.createElement('a')
                  a.href = img; a.download = `screenshot-${Date.now()}.png`; a.click()
                }
              }} style={btnStyle('#0284c7')}>
                <Camera style={{ width: 16, height: 16 }} /> Screenshot
              </button>
            </>
          )}
          <button onClick={reset} style={btnStyle('#6b7280')}>Cancel</button>
        </div>
      </div>
    )
  }

  // ── Idle — source selection ──

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <button onClick={startWebcam} style={btnStyle('#0284c7')}>
        <Camera style={{ width: 16, height: 16 }} /> Webcam
      </button>
      <button onClick={startScreenRecording} style={btnStyle('#7c3aed')}>
        <MonitorUp style={{ width: 16, height: 16 }} /> Screen + Webcam
      </button>
    </div>
  )
}

const btnStyle = (bg: string): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
  backgroundColor: bg, color: '#fff', border: 'none', borderRadius: 6,
  fontSize: 13, fontWeight: 500, cursor: 'pointer',
})
