import React, { useState, useEffect, useRef } from 'react';
import { Clock, Camera, FileText, CheckCircle, XCircle, SwitchCamera, Trash2, Eye, Upload } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Spinner,
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Alert,
  AlertDescription,
} from '@/components/common';
import { PageHeader } from '@/components/common/Header';
import {
  useMyAttendance,
  useCheckIn,
  useCheckOut,
  useAttendanceStatus,
} from '@/hooks/tanstackHooks/useAttendances';
import {
  formatAttendanceTime,
  formatAttendanceDate,
  isCheckedIn,
  isCheckedOut,
  canCheckOut,
} from '@/services/attendances/utils';
import { AttendanceDetailDialog } from '../AttendanceDetailDialog';
import { useCamera } from '@/hooks/useCamera';


const CheckInOut: React.FC = () => {
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'camera' | 'file'>('camera');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Location state
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const { data: attendanceData, isLoading, refetch } = useMyAttendance({
    page: 1,
    limit: 1,
    type: 'today',
  });

  const { data: attendanceStatusData, isLoading: isLoadingStatus } = useAttendanceStatus();

  const camera = useCamera({
    facingMode: 'user',
    quality: 0.9,
    imageFormat: 'image/jpeg',
    autoCloseAfterCapture: true,
  });

  const checkInMutation = useCheckIn({
    onSuccess: () => {
      setNotes('');
      camera.clearPhoto();
      setUploadedFile(null);
      setUploadedPreview(null);
      setErrors({});
      refetch();
    },
  });

  const checkOutMutation = useCheckOut({
    onSuccess: () => {
      setNotes('');
      camera.clearPhoto();
      setUploadedFile(null);
      setUploadedPreview(null);
      setErrors({});
      refetch();
    },
  });

  const todayAttendance = attendanceData?.data[0];
  const hasCheckedIn = todayAttendance ? isCheckedIn(todayAttendance) : false;
  const hasCheckedOut = todayAttendance ? isCheckedOut(todayAttendance) : false;
  const canDoCheckOut = todayAttendance ? canCheckOut(todayAttendance) : false;

  const attendanceStatus = attendanceStatusData?.data;
  const canAttend = attendanceStatus?.can_attend ?? true;
  const attendanceBlockReason = attendanceStatus?.reason;
  const isOnLeave = attendanceStatus?.is_on_leave ?? false;
  const leaveDetails = attendanceStatus?.leave_details;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors({ selfie: 'File harus berupa gambar' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ selfie: 'Ukuran file maksimal 5MB' });
      return;
    }

    setUploadedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setErrors({ ...errors, selfie: '' });
  };

  const clearUploadedFile = () => {
    setUploadedFile(null);
    setUploadedPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get user location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation tidak didukung oleh browser Anda');
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationLoading(false);
        setLocationError(null);
      },
      (error) => {
        setLocationLoading(false);
        let errorMessage = 'Gagal mendapatkan lokasi';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Izin akses lokasi ditolak. Silakan aktifkan izin lokasi di browser Anda.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Informasi lokasi tidak tersedia.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Permintaan lokasi timeout.';
            break;
        }

        setLocationError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Auto-get location on mount
  useEffect(() => {
    getUserLocation();
  }, []);

  const handleCheckIn = () => {
    const selfieFile = uploadMethod === 'camera' ? camera.file : uploadedFile;
    const validationErrors: Record<string, string> = {};

    if (!selfieFile) {
      validationErrors.selfie = 'Selfie wajib diambil untuk check-in';
    }

    if (!location) {
      validationErrors.location = 'Akses lokasi diperlukan untuk check-in';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    checkInMutation.mutate({
      request: {
        notes: notes || undefined,
        latitude: location!.latitude,
        longitude: location!.longitude,
      },
      selfie: selfieFile!,
    });
  };

  const handleCheckOut = () => {
    const selfieFile = uploadMethod === 'camera' ? camera.file : uploadedFile;
    const validationErrors: Record<string, string> = {};

    if (!selfieFile) {
      validationErrors.selfie = 'Selfie wajib diambil untuk check-out';
    }

    if (!location) {
      validationErrors.location = 'Akses lokasi diperlukan untuk check-out';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    checkOutMutation.mutate({
      request: {
        notes: notes || undefined,
        latitude: location!.latitude,
        longitude: location!.longitude,
      },
      selfie: selfieFile!,
    });
  };

  const currentTime = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const [displayTime, setDisplayTime] = useState(currentTime);

  useEffect(() => {
    const timer = setInterval(() => {
      setDisplayTime(
        new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (isLoading || isLoadingStatus) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Check In / Check Out"
          description="Catat kehadiran Anda"
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Check In / Check Out' },
          ]}
        />
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <Spinner className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Check In / Check Out"
        description="Catat kehadiran Anda"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Check In / Check Out' },
        ]}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Waktu Saat Ini</CardTitle>
            <CardDescription>{formatAttendanceDate(today)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary">{displayTime}</div>
                <div className="mt-2 text-sm text-muted-foreground">Waktu Server</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Status Hari Ini</CardTitle>
              <CardDescription>Status kehadiran Anda hari ini</CardDescription>
            </div>
            {todayAttendance && (hasCheckedIn || hasCheckedOut) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDetailDialogOpen(true)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  {hasCheckedIn ? (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <div className="font-medium">Check In</div>
                    <div className="text-sm text-muted-foreground">
                      {hasCheckedIn
                        ? formatAttendanceTime(todayAttendance?.check_in_time)
                        : 'Belum Check In'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  {hasCheckedOut ? (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <div className="font-medium">Check Out</div>
                    <div className="text-sm text-muted-foreground">
                      {hasCheckedOut
                        ? formatAttendanceTime(todayAttendance?.check_out_time)
                        : 'Belum Check Out'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {!canAttend && attendanceBlockReason && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{attendanceBlockReason}</AlertDescription>
        </Alert>
      )}

      {isOnLeave && leaveDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Status Cuti</CardTitle>
            <CardDescription>Anda sedang dalam periode cuti</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Tipe Cuti:</span>
                <span className="text-sm capitalize">{leaveDetails.leave_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Periode:</span>
                <span className="text-sm">
                  {new Date(leaveDetails.start_date).toLocaleDateString('id-ID')} -{' '}
                  {new Date(leaveDetails.end_date).toLocaleDateString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total Hari:</span>
                <span className="text-sm">{leaveDetails.total_days} hari</span>
              </div>
              <div className="mt-4">
                <span className="text-sm font-medium">Alasan:</span>
                <p className="text-sm text-muted-foreground mt-1">{leaveDetails.reason}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!hasCheckedIn && canAttend && (
        <Card>
          <CardHeader>
            <CardTitle>Check In</CardTitle>
            <CardDescription>
              Lakukan check in untuk mencatat waktu kedatangan Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {locationLoading && (
              <Alert>
                <Spinner className="h-4 w-4" />
                <AlertDescription>Mengambil lokasi Anda...</AlertDescription>
              </Alert>
            )}

            {locationError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {locationError}
                </AlertDescription>
              </Alert>
            )}

            {location && !locationError && (
              <Alert>
                <AlertDescription>
                  Lokasi terdeteksi: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </AlertDescription>
              </Alert>
            )}

            {errors.location && (
              <Alert variant="destructive">
                <AlertDescription>{errors.location}</AlertDescription>
              </Alert>
            )}

            <Field>
              <FieldLabel>
                Catatan <span className="text-xs text-muted-foreground">(Opsional)</span>
              </FieldLabel>
              <FieldContent>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    type="text"
                    placeholder="Catatan check in..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </InputGroup>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                Selfie <span className="text-destructive">*</span>
              </FieldLabel>
              <FieldContent>
                <div className="space-y-3">
                  <div className="flex gap-2 p-1 bg-muted rounded-lg">
                    <Button
                      type="button"
                      variant={uploadMethod === 'camera' ? 'default' : 'ghost'}
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setUploadMethod('camera');
                        clearUploadedFile();
                        setErrors({ ...errors, selfie: '' });
                      }}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Ambil Foto
                    </Button>
                    <Button
                      type="button"
                      variant={uploadMethod === 'file' ? 'default' : 'ghost'}
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setUploadMethod('file');
                        camera.stopCamera();
                        camera.clearPhoto();
                        setErrors({ ...errors, selfie: '' });
                      }}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload File
                    </Button>
                  </div>

                  {uploadMethod === 'camera' ? (
                    <>
                      {!camera.preview ? (
                        <div className="space-y-3">
                          {camera.isActive ? (
                            <div className="space-y-3">
                              <div className="relative overflow-hidden rounded-lg bg-black">
                                <video
                                  ref={camera.videoRef}
                                  autoPlay
                                  playsInline
                                  muted
                                  className="w-full aspect-video object-contain"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  onClick={camera.capturePhoto}
                                  className="flex-1"
                                  variant="default"
                                >
                                  <Camera className="mr-2 h-4 w-4" />
                                  Ambil Foto
                                </Button>
                                <Button
                                  type="button"
                                  onClick={camera.switchCamera}
                                  variant="outline"
                                >
                                  <SwitchCamera className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  onClick={camera.stopCamera}
                                  variant="outline"
                                >
                                  Batal
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              onClick={camera.startCamera}
                              disabled={camera.isLoading}
                              className="w-full"
                              variant="outline"
                            >
                              {camera.isLoading ? (
                                <>
                                  <Spinner className="mr-2 h-4 w-4" />
                                  Membuka Kamera...
                                </>
                              ) : (
                                <>
                                  <Camera className="mr-2 h-4 w-4" />
                                  Buka Kamera
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="rounded-lg border p-4">
                            <img
                              src={camera.preview}
                              alt="Selfie Preview"
                              className="w-full aspect-video rounded-md object-contain bg-black"
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={() => {
                              camera.clearPhoto();
                              setErrors({ ...errors, selfie: '' });
                            }}
                            variant="outline"
                            className="w-full"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus & Ambil Ulang
                          </Button>
                        </div>
                      )}
                      {camera.error && <FieldError>{camera.error}</FieldError>}
                    </>
                  ) : (
                    <>
                      {!uploadedPreview ? (
                        <div className="space-y-3">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full"
                            variant="outline"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Pilih File Gambar
                          </Button>
                          <p className="text-xs text-muted-foreground text-center">
                            Format: JPG, PNG, GIF. Maksimal 5MB
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="rounded-lg border p-4">
                            <img
                              src={uploadedPreview}
                              alt="Uploaded Preview"
                              className="w-full aspect-video rounded-md object-contain bg-black"
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={() => {
                              clearUploadedFile();
                              setErrors({ ...errors, selfie: '' });
                            }}
                            variant="outline"
                            className="w-full"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus & Pilih Ulang
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </FieldContent>
              {errors.selfie && <FieldError>{errors.selfie}</FieldError>}
            </Field>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleCheckIn}
              disabled={checkInMutation.isPending || !location || (uploadMethod === 'camera' ? !camera.file : !uploadedFile)}
              className="w-full"
            >
              {checkInMutation.isPending ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Memproses...
                </>
              ) : (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  Check In Sekarang
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {canDoCheckOut && canAttend && (
        <Card>
          <CardHeader>
            <CardTitle>Check Out</CardTitle>
            <CardDescription>
              Lakukan check out untuk mencatat waktu kepulangan Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Anda sudah check in pada pukul{' '}
                <span className="font-medium">
                  {formatAttendanceTime(todayAttendance?.check_in_time)}
                </span>
              </AlertDescription>
            </Alert>

            {locationLoading && (
              <Alert>
                <Spinner className="h-4 w-4" />
                <AlertDescription>Mengambil lokasi Anda...</AlertDescription>
              </Alert>
            )}

            {locationError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {locationError}
                  <Button
                    variant="link"
                    size="sm"
                    className="ml-2 h-auto p-0"
                    onClick={getUserLocation}
                  >
                    Coba Lagi
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {location && !locationError && (
              <Alert>
                <AlertDescription>
                  Lokasi terdeteksi: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </AlertDescription>
              </Alert>
            )}

            {errors.location && (
              <Alert variant="destructive">
                <AlertDescription>{errors.location}</AlertDescription>
              </Alert>
            )}

            <Field>
              <FieldLabel>
                Catatan <span className="text-xs text-muted-foreground">(Opsional)</span>
              </FieldLabel>
              <FieldContent>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    type="text"
                    placeholder="Catatan check out..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </InputGroup>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                Selfie <span className="text-destructive">*</span>
              </FieldLabel>
              <FieldContent>
                <div className="space-y-3">
                  <div className="flex gap-2 p-1 bg-muted rounded-lg">
                    <Button
                      type="button"
                      variant={uploadMethod === 'camera' ? 'default' : 'ghost'}
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setUploadMethod('camera');
                        clearUploadedFile();
                        setErrors({ ...errors, selfie: '' });
                      }}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Ambil Foto
                    </Button>
                    <Button
                      type="button"
                      variant={uploadMethod === 'file' ? 'default' : 'ghost'}
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setUploadMethod('file');
                        camera.stopCamera();
                        camera.clearPhoto();
                        setErrors({ ...errors, selfie: '' });
                      }}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload File
                    </Button>
                  </div>

                  {uploadMethod === 'camera' ? (
                    <>
                      {!camera.preview ? (
                        <div className="space-y-3">
                          {camera.isActive ? (
                            <div className="space-y-3">
                              <div className="relative overflow-hidden rounded-lg bg-black">
                                <video
                                  ref={camera.videoRef}
                                  autoPlay
                                  playsInline
                                  muted
                                  className="w-full aspect-video object-contain"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  onClick={camera.capturePhoto}
                                  className="flex-1"
                                  variant="default"
                                >
                                  <Camera className="mr-2 h-4 w-4" />
                                  Ambil Foto
                                </Button>
                                <Button
                                  type="button"
                                  onClick={camera.switchCamera}
                                  variant="outline"
                                >
                                  <SwitchCamera className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  onClick={camera.stopCamera}
                                  variant="outline"
                                >
                                  Batal
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              onClick={camera.startCamera}
                              disabled={camera.isLoading}
                              className="w-full"
                              variant="outline"
                            >
                              {camera.isLoading ? (
                                <>
                                  <Spinner className="mr-2 h-4 w-4" />
                                  Membuka Kamera...
                                </>
                              ) : (
                                <>
                                  <Camera className="mr-2 h-4 w-4" />
                                  Buka Kamera
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="rounded-lg border p-4">
                            <img
                              src={camera.preview}
                              alt="Selfie Preview"
                              className="w-full aspect-video rounded-md object-contain bg-black"
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={() => {
                              camera.clearPhoto();
                              setErrors({ ...errors, selfie: '' });
                            }}
                            variant="outline"
                            className="w-full"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus & Ambil Ulang
                          </Button>
                        </div>
                      )}
                      {camera.error && <FieldError>{camera.error}</FieldError>}
                    </>
                  ) : (
                    <>
                      {!uploadedPreview ? (
                        <div className="space-y-3">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full"
                            variant="outline"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Pilih File Gambar
                          </Button>
                          <p className="text-xs text-muted-foreground text-center">
                            Format: JPG, PNG, GIF. Maksimal 5MB
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="rounded-lg border p-4">
                            <img
                              src={uploadedPreview}
                              alt="Uploaded Preview"
                              className="w-full aspect-video rounded-md object-contain bg-black"
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={() => {
                              clearUploadedFile();
                              setErrors({ ...errors, selfie: '' });
                            }}
                            variant="outline"
                            className="w-full"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus & Pilih Ulang
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </FieldContent>
              {errors.selfie && <FieldError>{errors.selfie}</FieldError>}
            </Field>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleCheckOut}
              disabled={checkOutMutation.isPending || !location || (uploadMethod === 'camera' ? !camera.file : !uploadedFile)}
              className="w-full"
            >
              {checkOutMutation.isPending ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Memproses...
                </>
              ) : (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  Check Out Sekarang
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {hasCheckedIn && hasCheckedOut && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance Selesai</CardTitle>
            <CardDescription>Anda sudah melengkapi attendance hari ini</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Anda sudah check in pada{' '}
                <span className="font-medium">
                  {formatAttendanceTime(todayAttendance?.check_in_time)}
                </span>{' '}
                dan check out pada{' '}
                <span className="font-medium">
                  {formatAttendanceTime(todayAttendance?.check_out_time)}
                </span>
                . Terima kasih atas kedisiplinan Anda.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <AttendanceDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        attendance={todayAttendance || null}
      />
    </div>
  );
};

export default CheckInOut;
