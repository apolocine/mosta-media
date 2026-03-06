// @mostajs/media — Types
// Author: Dr Hamid MADANI drmdh@msn.com

export interface CameraOptions {
  /** Camera facing mode (default: 'user') */
  facingMode?: 'user' | 'environment'
  /** Video width constraint */
  width?: number
  /** Video height constraint */
  height?: number
  /** Mirror the preview (default: true for 'user' facing) */
  mirror?: boolean
}

export interface ImageCaptureProps {
  /** Called with captured image as data URL */
  onCapture: (dataUrl: string) => void
  /** Called when capture is cleared */
  onClear?: () => void
  /** Current image to display (edit mode) */
  photo?: string
  /** Camera options */
  cameraOptions?: CameraOptions
  /** Max image width for resize (default: 800) */
  maxWidth?: number
  /** Max image height for resize (default: 800) */
  maxHeight?: number
  /** Image quality 0-1 (default: 0.85) */
  quality?: number
  /** Output format (default: 'image/jpeg') */
  format?: 'image/jpeg' | 'image/png' | 'image/webp'
  /** Accept file upload in addition to camera */
  allowUpload?: boolean
  /** Custom label for capture button */
  captureLabel?: string
  /** Custom label for upload button */
  uploadLabel?: string
  /** Error callback */
  onError?: (message: string) => void
}

export interface VideoCaptureProps {
  /** Called with recorded video as Blob */
  onCapture: (blob: Blob, url: string) => void
  /** Max recording duration in seconds (default: 60) */
  maxDuration?: number
  /** Camera options */
  cameraOptions?: CameraOptions
  /** Video MIME type (default: 'video/webm') */
  mimeType?: string
  /** Custom labels */
  startLabel?: string
  stopLabel?: string
  /** Error callback */
  onError?: (message: string) => void
}

export interface ImageEditorProps {
  /** Source image data URL */
  src: string
  /** Called with edited image as data URL */
  onSave: (dataUrl: string) => void
  /** Called when editor is closed without saving */
  onCancel?: () => void
  /** Available tools (default: all) */
  tools?: ('crop' | 'rotate' | 'brightness' | 'contrast' | 'flip')[]
  /** Output format */
  format?: 'image/jpeg' | 'image/png' | 'image/webp'
  /** Output quality */
  quality?: number
}

export interface MediaGalleryProps {
  /** Array of media items */
  items: MediaItem[]
  /** Called when an item is selected */
  onSelect?: (item: MediaItem) => void
  /** Called when an item is deleted */
  onDelete?: (item: MediaItem) => void
  /** Number of columns (default: 3) */
  columns?: number
  /** Show delete button (default: false) */
  deletable?: boolean
}

export interface MediaItem {
  id: string
  url: string
  type: 'image' | 'video'
  name?: string
  thumbnail?: string
  createdAt?: string
}

export interface UseCameraReturn {
  /** Ref to attach to video element */
  videoRef: React.RefObject<HTMLVideoElement | null>
  /** Whether camera is active */
  active: boolean
  /** Start camera stream */
  start: (options?: CameraOptions) => Promise<void>
  /** Stop camera stream */
  stop: () => void
  /** Capture current frame as data URL */
  capture: (options?: { maxWidth?: number; maxHeight?: number; quality?: number; format?: string }) => string | null
  /** Switch between front/back camera */
  switchCamera: () => Promise<void>
  /** Current facing mode */
  facingMode: 'user' | 'environment'
  /** Error message */
  error: string | null
}

export interface UseVideoRecorderReturn {
  /** Ref to attach to video element */
  videoRef: React.RefObject<HTMLVideoElement | null>
  /** Whether camera is active */
  cameraActive: boolean
  /** Whether recording */
  recording: boolean
  /** Recording duration in seconds */
  duration: number
  /** Start camera */
  startCamera: (options?: CameraOptions) => Promise<void>
  /** Stop camera */
  stopCamera: () => void
  /** Start recording */
  startRecording: () => void
  /** Stop recording and get blob */
  stopRecording: () => Promise<{ blob: Blob; url: string } | null>
  /** Error */
  error: string | null
}
