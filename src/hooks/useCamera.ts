import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseCameraOptions {
  /**
   * Preferred camera facing mode
   * @default 'user' (front camera)
   */
  facingMode?: 'user' | 'environment';

  /**
   * Image quality (0.0 to 1.0)
   * @default 0.92
   */
  quality?: number;

  /**
   * Image format
   * @default 'image/jpeg'
   */
  imageFormat?: 'image/jpeg' | 'image/png' | 'image/webp';

  /**
   * Auto-close camera after capture
   * @default true
   */
  autoCloseAfterCapture?: boolean;
}

export interface CameraState {
  /** Camera stream is active */
  isActive: boolean;

  /** Camera is being initialized */
  isLoading: boolean;

  /** Camera error */
  error: string | null;

  /** Captured image preview URL */
  preview: string | null;

  /** Captured image File object */
  file: File | null;
}

export interface CameraActions {
  /** Start camera stream */
  startCamera: () => Promise<void>;

  /** Stop camera stream */
  stopCamera: () => void;

  /** Capture photo from stream */
  capturePhoto: () => void;

  /** Clear captured photo */
  clearPhoto: () => void;

  /** Switch camera (front/back) */
  switchCamera: () => void;

  /** Video element ref (attach to <video> element) */
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export const useCamera = (options: UseCameraOptions = {}): CameraState & CameraActions => {
  const {
    facingMode = 'user',
    quality = 0.92,
    imageFormat = 'image/jpeg',
    autoCloseAfterCapture = true,
  } = options;

  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [currentFacingMode, setCurrentFacingMode] = useState<'user' | 'environment'>(facingMode);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  /**
   * Start camera stream
   */
  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: currentFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setIsActive(true);
      setIsLoading(false);
    } catch (err) {
      console.error('Error accessing camera:', err);

      let errorMessage = 'Gagal mengakses kamera';

      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Izin kamera ditolak. Mohon berikan izin untuk menggunakan kamera.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'Kamera tidak ditemukan. Pastikan perangkat Anda memiliki kamera.';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Kamera sedang digunakan oleh aplikasi lain.';
        } else if (err.name === 'OverconstrainedError') {
          errorMessage = 'Kamera tidak mendukung pengaturan yang diminta.';
        }
      }

      setError(errorMessage);
      setIsLoading(false);
      setIsActive(false);
    }
  }, [currentFacingMode]);

  /**
   * Stop camera stream
   */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
  }, []);

  /**
   * Capture photo from camera stream
   */
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !isActive) {
      setError('Kamera tidak aktif');
      return;
    }

    try {
      // Create canvas with video dimensions
      const canvas = document.createElement('canvas');
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('Gagal membuat canvas context');
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError('Gagal mengambil foto');
            return;
          }

          // Create File object
          const timestamp = new Date().getTime();
          const fileName = `selfie_${timestamp}.${imageFormat.split('/')[1]}`;
          const photoFile = new File([blob], fileName, { type: imageFormat });

          // Create preview URL
          const previewUrl = URL.createObjectURL(blob);

          setFile(photoFile);
          setPreview(previewUrl);
          setError(null);

          // Auto-close camera if enabled
          if (autoCloseAfterCapture) {
            stopCamera();
          }
        },
        imageFormat,
        quality,
      );
    } catch (err) {
      console.error('Error capturing photo:', err);
      setError('Gagal mengambil foto');
    }
  }, [isActive, imageFormat, quality, autoCloseAfterCapture, stopCamera]);

  /**
   * Clear captured photo
   */
  const clearPhoto = useCallback(() => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setFile(null);
  }, [preview]);

  /**
   * Switch between front and back camera
   */
  const switchCamera = useCallback(() => {
    const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    setCurrentFacingMode(newFacingMode);

    // Restart camera with new facing mode
    if (isActive) {
      stopCamera();
      // Small delay to ensure camera is fully released
      setTimeout(() => {
        startCamera();
      }, 100);
    }
  }, [currentFacingMode, isActive, stopCamera, startCamera]);

  /**
   * Attach stream to video element when camera becomes active
   */
  useEffect(() => {
    if (isActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((err) => {
        console.error('Error playing video:', err);
        setError('Gagal memutar video kamera');
      });
    }
  }, [isActive]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopCamera();
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [stopCamera, preview]);

  return {
    // State
    isActive,
    isLoading,
    error,
    preview,
    file,

    // Actions
    startCamera,
    stopCamera,
    capturePhoto,
    clearPhoto,
    switchCamera,
    videoRef,
  };
};
