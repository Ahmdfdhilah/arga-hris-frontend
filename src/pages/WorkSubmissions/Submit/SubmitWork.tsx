import React, { useState, useRef, useEffect } from "react";
import {
  Calendar,
  FileText,
  Upload,
  X,
  Send,
  Save,
  File,
  AlertCircle,
  Download,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/redux/hooks";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Textarea,
  Alert,
  AlertDescription,
  Spinner,
  ConfirmDialog,
} from "@/components/common";
import { PageHeader } from "@/components/common/Header";
import {
  useCreateWorkSubmission,
  useUploadWorkSubmissionFiles,
  useUpdateWorkSubmission,
  useMyWorkSubmissions,
  useDeleteWorkSubmissionFile,
} from "@/hooks/tanstackHooks/useWorkSubmissions";
import {
  validateFiles,
  formatFileSize,
  getCurrentMonthFirstDay,
  getFirstDayOfMonth,
} from "@/services/work-submissions/utils";
import { SubmissionStatus } from "@/services/work-submissions/types";
import { useURLFilters } from "@/hooks/useURLFilters";
import type { WorkSubmissionFilterParams } from "@/services/work-submissions/types";

interface FileWithPreview {
  file: File;
  preview?: string;
  id: string;
}

const SubmitWork: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userData = useAppSelector((state) => state.auth.userData);

  const urlFiltersHook = useURLFilters<WorkSubmissionFilterParams>({
    defaults: {
      submission_month: getCurrentMonthFirstDay().substring(0, 7),
    },
  });
  const filters = urlFiltersHook.getCurrentFilters();
  const selectedMonth =
    filters.submission_month || getCurrentMonthFirstDay().substring(0, 7);

  const submissionMonthFilter = selectedMonth
    ? `${selectedMonth}-01`
    : undefined;

  const { data: existingSubmissionsData, isLoading: isCheckingExisting } =
    useMyWorkSubmissions({
      page: 1,
      limit: 1,
      submission_month: submissionMonthFilter,
    });

  const existingSubmission = existingSubmissionsData?.data[0] || null;
  const isEditMode = !!existingSubmission;

  const isSubmissionEditable = React.useMemo(() => {
    if (existingSubmission && existingSubmission.status === SubmissionStatus.SUBMITTED) {
      return false;
    }

    const today = new Date();
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const previousMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );

    const targetDate = existingSubmission
      ? new Date(existingSubmission.submission_month)
      : new Date(selectedMonth + "-01");

    const targetMonthStart = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      1
    );

    return (
      targetMonthStart.getTime() === currentMonth.getTime() ||
      targetMonthStart.getTime() === previousMonth.getTime()
    );
  }, [existingSubmission, selectedMonth]);

  // Helper function to generate title based on month and user name
  const generateTitle = (month: string) => {
    const date = new Date(month + "-01");
    const monthName = date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    const userName = userData?.full_name || userData?.first_name || "User";
    return `Laporan Kerja ${monthName} - ${userName}`;
  };

  // Form state
  const [title, setTitle] = useState(() => generateTitle(selectedMonth));
  const [description, setDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);

  // Confirmation dialogs state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);

  // Mutations
  const createMutation = useCreateWorkSubmission();
  const uploadFilesMutation = useUploadWorkSubmissionFiles();
  const updateMutation = useUpdateWorkSubmission();
  const deleteFileMutation = useDeleteWorkSubmissionFile();

  // Load existing submission data when available or generate title for new submission
  useEffect(() => {
    if (existingSubmission) {
      setTitle(existingSubmission.title);
      setDescription(existingSubmission.description || "");
    } else {
      setTitle(generateTitle(selectedMonth));
      setDescription("");
      setSelectedFiles([]);
    }
  }, [existingSubmission, selectedMonth, userData]);

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      selectedFiles.forEach((fileWithPreview) => {
        if (fileWithPreview.preview) {
          URL.revokeObjectURL(fileWithPreview.preview);
        }
      });
    };
  }, [selectedFiles]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const validation = validateFiles(fileArray, selectedFiles.length);

    if (!validation.valid) {
      setErrors({ files: validation.errors.join(", ") });
      return;
    }

    const newFiles: FileWithPreview[] = fileArray.map((file) => {
      const id = `${file.name}-${Date.now()}-${Math.random()}`;
      const isImage = file.type.startsWith("image/");
      const preview = isImage ? URL.createObjectURL(file) : undefined;

      return { file, preview, id };
    });

    setSelectedFiles([...selectedFiles, ...newFiles]);
    setErrors({ ...errors, files: "" });
  };

  const handleRemoveFile = (id: string) => {
    const fileToRemove = selectedFiles.find((f) => f.id === id);
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    setSelectedFiles(selectedFiles.filter((f) => f.id !== id));
  };

  const handleDeleteExistingFile = (filePath: string) => {
    setFileToDelete(filePath);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteFile = async () => {
    if (!existingSubmission || !fileToDelete) return;

    try {
      await deleteFileMutation.mutateAsync({
        submissionId: existingSubmission.id,
        filePath: fileToDelete,
      });
      setDeleteConfirmOpen(false);
      setFileToDelete(null);
    } catch (error) {
      console.error("Delete file error:", error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Judul wajib diisi";
    }

    if (!selectedMonth) {
      newErrors.submissionMonth = "Bulan pengumpulan wajib dipilih";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitClick = (isDraft: boolean) => {
    if (!isDraft) {
      const hasExistingFiles = existingSubmission && existingSubmission.files.length > 0;
      const hasNewFiles = selectedFiles.length > 0;

      if (!hasExistingFiles && !hasNewFiles) {
        setErrors({ ...errors, files: "Minimal 1 file harus diupload sebelum submit" });
        return;
      }

      // Show confirmation for submit action
      setSubmitConfirmOpen(true);
    } else {
      // Save as draft directly without confirmation
      handleSubmit(true);
    }
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!validateForm()) return;

    if (!userData?.employee_id && !isEditMode) {
      setErrors({ ...errors, submit: "Employee ID tidak ditemukan" });
      return;
    }

    try {
      let submissionId: number;

      if (isEditMode && existingSubmission) {
        // Edit mode: Update existing submission
        await updateMutation.mutateAsync({
          id: existingSubmission.id,
          data: {
            title: title.trim(),
            description: description.trim() || undefined,
            status: isDraft
              ? SubmissionStatus.DRAFT
              : SubmissionStatus.SUBMITTED,
          },
        });
        submissionId = existingSubmission.id;
      } else {
        const createResponse = await createMutation.mutateAsync({
          employee_id: userData?.employee_id ?? 0,
          title: title.trim(),
          description: description.trim() || undefined,
          submission_month: getFirstDayOfMonth(selectedMonth + "-01"),
          status: isDraft ? SubmissionStatus.DRAFT : SubmissionStatus.SUBMITTED,
        });
        submissionId = createResponse.data.id;
      }

      // Upload new files if any
      if (selectedFiles.length > 0) {
        const files = selectedFiles.map((f) => f.file);
        await uploadFilesMutation.mutateAsync({
          submissionId,
          files,
        });
      }

      setSubmitConfirmOpen(false);

      // Navigate back to my submissions
      navigate("/work-submissions/my-submissions");
    } catch (error) {

      console.error("Submit error:", error);
    }
  };

  const isProcessing =
    createMutation.isPending ||
    uploadFilesMutation.isPending ||
    updateMutation.isPending ||
    deleteFileMutation.isPending ||
    isCheckingExisting;

  const hasFiles = React.useMemo(() => {
    const hasExistingFiles = existingSubmission && existingSubmission.files.length > 0;
    const hasNewFiles = selectedFiles.length > 0;
    return hasExistingFiles || hasNewFiles;
  }, [existingSubmission, selectedFiles]);

  return (
     <div className="space-y-6">
      <PageHeader
        title={isEditMode ? "Edit Report" : "Buat Report Baru"}
        description={
          isEditMode
            ? "Edit submission dan kelola file hasil kerja Anda"
            : "Upload hasil kerja bulanan Anda"
        }
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          {
            label: "Pengumpulan Kerja",
            href: "/work-submissions/my-submissions",
          },
          { label: isEditMode ? "Edit" : "Submit" },
        ]}
      />

      <div className="grid gap-6">
        {existingSubmission?.status != SubmissionStatus.SUBMITTED && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {isEditMode
              ? "Edit informasi submission dan kelola file. Anda dapat menambah atau menghapus file, serta mengubah status submission."
              : "Lengkapi form di bawah dan upload file hasil kerja Anda. Anda dapat menyimpan sebagai draft atau langsung submit."}
          </AlertDescription>
        </Alert>

        )
        }

        {!isSubmissionEditable && (
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {existingSubmission?.status === SubmissionStatus.SUBMITTED
                ? "Report ini sudah disubmit dan tidak dapat diedit lagi."
                : isEditMode
                  ? "Report ini sudah terlalu lama dan tidak dapat diedit."
                  : "Tidak dapat membuat submission untuk bulan ini."}{" "}
              {existingSubmission?.status !== SubmissionStatus.SUBMITTED &&
                "Report hanya diperbolehkan untuk bulan ini dan bulan sebelumnya."}
            </AlertDescription>
          </Alert>
        )}

        <Card className="bg-card p-4 rounded-lg overflow-hidden">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-semibold text-foreground mb-2">
                Panduan Membuat Report
              </h4>
              <p className="text-sm text-muted-foreground break-words">
                Butuh bantuan? Lihat{" "}
                <a
                  href="https://docs.google.com/presentation/d/15IMupI8iOd6v4eiXqE3OKr-y8JBv4V1k/edit?slide=id.p1#slide=id.p1"
                  className="font-semibold text-primary underline underline-offset-2 hover:opacity-80 transition-opacity break-all"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contoh Report
                </a>{" "}
                dan{" "}

                <a
                  href="https://www.canva.com/design/DAGJaL-W4Cw/8b5_WOFBQ0VxwaNx3VTAAA/edit"
                  className="font-semibold text-primary underline underline-offset-2 hover:opacity-80 transition-opacity break-all"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Panduan Cara Membuat Report
                </a>
              </p>
            </div>
          </div>
        </Card>

        {/* Main Form */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Informasi Report</CardTitle>
            <CardDescription>Isi detail pengumpulan kerja Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <Field>
              <FieldLabel>
                Judul <span className="text-destructive">*</span>
              </FieldLabel>
              <FieldContent>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    type="text"
                    placeholder="Contoh: Laporan Kerja November 2025"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setErrors({ ...errors, title: "" });
                    }}
                    disabled
                    className={errors.title ? "border-destructive" : ""}
                  />
                </InputGroup>
              </FieldContent>
              {errors.title && <FieldError>{errors.title}</FieldError>}
            </Field>

            {/* Report Month */}
            <Field>
              <FieldLabel>
                Bulan Pengumpulan <span className="text-destructive">*</span>
              </FieldLabel>
              <FieldContent>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => {
                      urlFiltersHook.updateURL({
                        submission_month: e.target.value,
                      });
                      setErrors({ ...errors, submissionMonth: "" });
                    }}
                    className={
                      errors.submissionMonth ? "border-destructive" : ""
                    }
                  />
                </InputGroup>
              </FieldContent>
              {errors.submissionMonth && (
                <FieldError>{errors.submissionMonth}</FieldError>
              )}
              {isEditMode && (
                <div className="mt-2">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Report untuk bulan ini sudah ada. Anda dapat mengedit
                      judul, deskripsi, atau mengelola file.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </Field>

            {/* Description */}
            <Field>
              <FieldLabel>
                Deskripsi{" "}
                <span className="text-xs text-muted-foreground">
                  (Opsional)
                </span>
              </FieldLabel>
              <FieldContent>
                <Textarea
                  placeholder="Tambahkan deskripsi atau catatan terkait submission ini..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isEditMode && !isSubmissionEditable}
                  rows={4}
                  className="resize-none"
                />
              </FieldContent>
            </Field>
          </CardContent>
        </Card>

        {/* File Upload Section */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
            <CardDescription>
              Upload file hasil kerja (Max 10 file, maks 10MB per file)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drag & Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-lg p-4 sm:p-8 text-center transition-all
                ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
                ${selectedFiles.length > 0 ? "bg-muted/30" : "hover:border-primary hover:bg-muted/50"}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.zip"
                onChange={(e) => handleFileSelect(e.target.files)}
                disabled={isEditMode && !isSubmissionEditable}
                className="hidden"
              />

              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="rounded-full bg-primary/10 p-4">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    {isDragging
                      ? "Drop file di sini"
                      : "Drag & drop file di sini"}
                  </p>
                  <p className="text-sm text-muted-foreground">atau</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!isSubmissionEditable}
                  >
                    Pilih File
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Format: PDF, Word, Excel, PowerPoint, PNG, JPG, ZIP</p>
                  <p>Maksimal 10 file • 10MB per file</p>
                </div>
              </div>
            </div>

            {errors.files && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.files}</AlertDescription>
              </Alert>
            )}

            {/* Existing Files (Edit Mode) */}
            {isEditMode &&
              existingSubmission &&
              existingSubmission.files.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">
                      File yang Sudah Ada ({existingSubmission.files.length})
                    </h4>
                  </div>

                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                    {existingSubmission.files.map((file, index) => (
                      <div
                        key={index}
                        className="relative group flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors min-w-0"
                      >
                        <div className="w-12 h-12 rounded flex items-center justify-center bg-primary/10 flex-shrink-0">
                          <File className="h-6 w-6 text-primary" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {file.file_name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {formatFileSize(file.file_size)} • {file.file_type}
                          </p>
                        </div>

                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(file.file_url, "_blank")}
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeleteExistingFile(file.file_path)
                            }
                            disabled={
                              deleteFileMutation.isPending || !isSubmissionEditable
                            }
                            title="Hapus"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Selected Files List (New Files to Upload) */}
            {selectedFiles.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">
                    File Terpilih ({selectedFiles.length}/10)
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      selectedFiles.forEach((f) => {
                        if (f.preview) URL.revokeObjectURL(f.preview);
                      });
                      setSelectedFiles([]);
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Hapus Semua
                  </Button>
                </div>

                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                  {selectedFiles.map((fileWithPreview) => (
                    <div
                      key={fileWithPreview.id}
                      className="relative group flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors min-w-0"
                    >
                      {/* File Icon or Image Preview */}
                      {fileWithPreview.preview ? (
                        <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-muted">
                          <img
                            src={fileWithPreview.preview}
                            alt={fileWithPreview.file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded flex items-center justify-center bg-primary/10 flex-shrink-0">
                          <File className="h-6 w-6 text-primary" />
                        </div>
                      )}

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {fileWithPreview.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {formatFileSize(fileWithPreview.file.size)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        onClick={() => handleRemoveFile(fileWithPreview.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {isSubmissionEditable && (
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              {isSubmissionEditable && (
              <Button
                  variant="outline"
                  onClick={() => handleSubmitClick(true)}
                  disabled={isProcessing}
                  className="w-full sm:w-auto"
                >
                  {isProcessing ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {isEditMode
                        ? "Simpan Perubahan (Draft)"
                        : "Simpan sebagai Draft"}
                    </>
                  )}
                </Button>
              )}
              {(hasFiles && isSubmissionEditable)  && (
                <Button
                  onClick={() => handleSubmitClick(false)}
                  disabled={isProcessing}
                  className="w-full sm:w-auto"
                >
                  {isProcessing ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      {isEditMode ? "Simpan & Submit" : "Submit Sekarang"}
                    </>
                  )}
              </Button>
              )}

            </div>
          </CardContent>
        </Card>
        )}
      </div>
      {/* Delete File Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setFileToDelete(null);
        }}
        title="Hapus File?"
        description="Apakah Anda yakin ingin menghapus file ini? File yang dihapus tidak dapat dikembalikan."
        variant="danger"
        onConfirm={confirmDeleteFile}
        isProcessing={deleteFileMutation.isPending}
        confirmText="Hapus"
        cancelText="Batal"
      />

      <ConfirmDialog
        isOpen={submitConfirmOpen}
        onClose={() => setSubmitConfirmOpen(false)}
        title="Submit Work Report?"
        description="Apakah Anda yakin ingin submit work submission ini? Pastikan semua file sudah lengkap dan informasi sudah benar. Setelah disubmit, Anda tidak akan dapat mengubah submission ini lagi."
        variant="warning"
        onConfirm={() => handleSubmit(false)}
        isProcessing={isProcessing}
        confirmText="Ya, Submit"
        cancelText="Batal"
      />
    </div>
  );
};

export default SubmitWork;
