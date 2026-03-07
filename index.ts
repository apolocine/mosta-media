// @mostajs/media — Barrel exports
// Author: Dr Hamid MADANI drmdh@msn.com

// Components
export { default as ImageCapture } from './components/ImageCapture'
export { default as VideoCapture } from './components/VideoCapture'
export { default as ImageEditor } from './components/ImageEditor'
export { default as MediaGallery } from './components/MediaGallery'
export { default as ScreenRecorder } from './components/ScreenRecorder'

// Hooks
export { useCamera } from './hooks/useCamera'
export { useVideoRecorder } from './hooks/useVideoRecorder'
export { useScreenCapture } from './hooks/useScreenCapture'

// Utilities
export {
  resizeImage, rotateImage, flipImage, cropImage,
  adjustBrightness, adjustContrast,
  dataUrlToBlob, fileToDataUrl,
} from './lib/image-utils'

// Menu contribution
export { mediaMenuContribution } from './lib/menu'

// Types
export type {
  CameraOptions, ImageCaptureProps, VideoCaptureProps,
  ImageEditorProps, MediaGalleryProps, MediaItem,
  UseCameraReturn, UseVideoRecorderReturn,
} from './types/index'
