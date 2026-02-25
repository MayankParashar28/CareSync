import { useState, useRef } from "react";
import { useAppointments } from "@/hooks/use-appointments";
import { useMedicalRecords, useMediaFiles, useUploadFile } from "@/hooks/use-medical-records";
import { useUserProfiles } from "@/hooks/use-profiles";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Link } from "wouter";
import {
  User,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  FileText,
  Stethoscope,
  Pill,
  Printer,
  ChevronRight,
  Activity,
  Clock,
  Upload,
  Download,
  File,
  Loader2,
  X
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";



const CATEGORIES = [
  { value: "report", label: "Lab Report" },
  { value: "prescription", label: "Prescription" },
  { value: "scan", label: "Scan" },
  { value: "xray", label: "X-Ray" },
  { value: "mri", label: "MRI" },
  { value: "lab", label: "Lab Work" },
  { value: "other", label: "Other" },
];

function LabReportsSection({ patientId }: { patientId?: string }) {
  const { data: files, isLoading } = useMediaFiles(patientId);
  const uploadFile = useUploadFile();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState("other");
  const [description, setDescription] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!selectedFile || !patientId) return;
    try {
      await uploadFile.mutateAsync({
        file: selectedFile,
        patientId,
        category,
        description: description || undefined,
      });
      toast({ title: "File uploaded", description: `${selectedFile.name} uploaded successfully.` });
      setSelectedFile(null);
      setDescription("");
      setCategory("other");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message || "Something went wrong", variant: "destructive" });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setSelectedFile(file);
  };

  const formatFileSize = (bytes: number | null | undefined) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <section>
      <h3 className="text-lg font-bold font-display text-slate-900 mb-4 flex items-center gap-2">
        <FileText className="h-5 w-5 text-blue-600" />
        Lab Reports & Documents
      </h3>

      {/* Upload area */}
      <Card className="mb-4">
        <CardContent className="p-4 space-y-4">
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${isDragOver ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300"
              }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            {selectedFile ? (
              <div className="flex items-center justify-center gap-2">
                <File className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-sm">{selectedFile.name}</span>
                <span className="text-xs text-muted-foreground">({formatFileSize(selectedFile.size)})</span>
                <button onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }} className="text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div>
                <p className="font-medium text-slate-700 text-sm">Drop a file here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, JPEG, PNG, WebP — up to 10 MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
          </div>

          {selectedFile && (
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Description (optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  placeholder="Blood work results..."
                />
              </div>
              <Button
                size="sm"
                onClick={handleUpload}
                disabled={uploadFile.isPending}
                className="gap-2"
              >
                {uploadFile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Upload
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File list */}
      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : files && files.length > 0 ? (
        <div className="space-y-2">
          {files.map((file: any) => (
            <Card key={file.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-blue-50 rounded-lg flex items-center justify-center">
                    <File className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{file.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.category && <Badge variant="outline" className="text-[10px] mr-2">{file.category}</Badge>}
                      {formatFileSize(file.fileSize)}
                      {file.uploadedAt && ` · ${format(new Date(file.uploadedAt), "MMM d, yyyy")}`}
                    </p>
                  </div>
                </div>
                <a href={file.secureUrl || file.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-slate-50 border-dashed">
          <CardContent className="py-8 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
              <Upload className="h-5 w-5 text-slate-400" />
            </div>
            <p className="font-medium text-slate-900">No reports uploaded yet</p>
            <p className="text-sm text-muted-foreground">Upload lab results, X-rays, or prescriptions above.</p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}

export default function PatientDashboard() {
  const { user } = useAuth();

  const { patientProfile, isLoading: isLoadingProfile } = useUserProfiles();
  const { data: appointments, isLoading: isLoadingAppts } = useAppointments();
  const { data: records, isLoading: isLoadingRecords } = useMedicalRecords();

  const upcomingAppts = appointments?.filter((a: any) => a.status === "confirmed" || a.status === "pending") || [];
  const nextAppt = upcomingAppts.length > 0 ? upcomingAppts[0] : null;

  const dob = patientProfile?.dateOfBirth ? new Date(patientProfile.dateOfBirth) : null;

  // Derived stats
  const totalVisits = records?.length || 0;
  const latestVisitDate = records?.[0]?.visitDate;
  const earliestVisitDate = records?.[records.length - 1]?.visitDate;
  const lastVisit = typeof latestVisitDate === "string" ? new Date(latestVisitDate) : null;
  const firstVisit = typeof earliestVisitDate === "string" ? new Date(earliestVisitDate) : null;

  // Get latest follow-up recommendation
  const latestFollowUp = records?.[0]?.followUpDate;

  if (isLoadingProfile || isLoadingAppts || isLoadingRecords) {
    return (
      <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
        {/* Grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
          {/* Right column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto bg-slate-50/50 min-h-screen">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Medical File</h1>
          <p className="text-muted-foreground mt-1">Patient ID: {patientProfile?.id?.substring(0, 8).toUpperCase() || '---'}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" />
          Print Record
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Fixed Info */}
        <div className="space-y-6">

          {/* 1. Patient Basic Information */}
          <Card>
            <CardHeader className="bg-slate-100/50 pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wide">Name</span>
                <span className="font-semibold">{user?.firstName} {user?.lastName}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wide">Age / Gender</span>
                  <span className="font-medium">
                    {dob ? `${new Date().getFullYear() - dob.getFullYear()} Yrs` : '--'} / {patientProfile?.gender || '--'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wide">Phone</span>
                  <span className="font-medium">{patientProfile?.contactNumber || user?.phone}</span>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wide">Address</span>
                <span className="font-medium">{patientProfile?.address || 'Not Recorded'}</span>
              </div>
            </CardContent>
          </Card>

          {/* 2. Medical Alerts */}
          <Card className="border-rose-100 bg-rose-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-rose-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Medical Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-rose-800 uppercase">Allergies</span>
                <p className="text-sm font-medium text-slate-800">{patientProfile?.allergies || 'None Known'}</p>
              </div>
              <Separator className="bg-rose-200" />
              <div>
                <span className="text-xs font-semibold text-rose-800 uppercase">Chronic Conditions</span>
                <p className="text-sm font-medium text-slate-800">{patientProfile?.medicalHistory || 'None Recorded'}</p>
              </div>
              <p className="text-[10px] text-rose-600 italic mt-2">⚠️ Always visible to consulting doctor</p>
            </CardContent>
          </Card>

          {/* 7. Follow-Up Details */}
          <Card className="bg-blue-50/50 border-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-blue-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Next Follow-Up
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nextAppt ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-900">{format(new Date(nextAppt.dateTime), "MMM d")}</span>
                    <Badge variant="outline" className="bg-white text-blue-700">{format(new Date(nextAppt.dateTime), "h:mm a")}</Badge>
                  </div>
                  <p className="text-sm text-blue-800">Dr. {nextAppt.doctor?.user?.lastName} ({nextAppt.doctor?.specialization})</p>
                  <p className="text-xs text-blue-600 mt-1">{nextAppt.reason || 'Check-up'}</p>
                </div>
              ) : latestFollowUp ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-800">Doctor Recommended Date:</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-900">{format(new Date(latestFollowUp), "MMM d, yyyy")}</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">Please contact the clinic to confirm.</p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-blue-600 mb-3">No follow-ups scheduled.</p>
                  <p className="text-xs text-blue-400">Contact clinic for appointments.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Clinical Data */}
        <div className="lg:col-span-2 space-y-8">

          {/* 3. Visit Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-slate-900">{totalVisits}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mt-1">Total Visits</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-lg font-bold text-slate-900">{lastVisit ? format(lastVisit, "MMM d, yyyy") : '--'}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mt-1">Last Visit</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-lg font-bold text-slate-900">{firstVisit ? format(firstVisit, "MMM d, yyyy") : '--'}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mt-1">First Visit</div>
              </CardContent>
            </Card>
          </div>

          {/* 4. Visit History */}
          <section>
            <h3 className="text-lg font-bold font-display text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Visit History
            </h3>
            <div className="space-y-4">
              {records?.map((record: any) => (
                <Card key={record.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-start">
                      {/* Date Column */}
                      <div className="md:col-span-3 border-r pr-4">
                        <span className="block font-bold text-slate-900">{format(new Date(record.visitDate), "MMM d, yyyy")}</span>
                        <span className="text-xs text-muted-foreground">{format(new Date(record.visitDate), "EEEE")}</span>
                      </div>

                      {/* Clinical Info */}
                      <div className="md:col-span-6 space-y-2">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-xs text-muted-foreground block">Diagnosis</span>
                            <span className="font-semibold text-slate-800">{record.diagnosis}</span>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground block">Symptoms</span>
                            <span className="text-slate-700">{record.symptoms || 'Not recorded'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Doctor Info */}
                      <div className="md:col-span-3 flex items-center gap-2 md:justify-end pl-2">
                        <div className="text-right">
                          <span className="block text-sm font-medium">Dr. {record.doctor?.user?.lastName}</span>
                          <span className="text-xs text-muted-foreground">{record.doctor?.specialization}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!records?.length && (
                <div className="text-center py-12 border-2 border-dashed rounded-xl bg-slate-50">
                  <Stethoscope className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-muted-foreground">No visit history found.</p>
                </div>
              )}
            </div>
          </section>

          {/* 5. Prescriptions */}
          <section>
            <h3 className="text-lg font-bold font-display text-slate-900 mb-4 flex items-center gap-2">
              <Pill className="h-5 w-5 text-emerald-600" />
              Active Prescriptions
            </h3>
            <div className="space-y-3">
              {records?.map((record: any) => (
                <Card key={`rx-${record.id}`} className="bg-emerald-50/30 border-emerald-100">
                  <CardContent className="p-4 flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{record.prescription}</span>
                        <Badge variant="outline" className="text-[10px] bg-white">Rx</Badge>
                      </div>
                      <p className="text-sm text-slate-600">Prescribed on {format(new Date(record.visitDate), "MMM d, yyyy")} by Dr. {record.doctor?.user?.lastName}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100">Download</Button>
                  </CardContent>
                </Card>
              ))}
              {!records?.length && <p className="text-sm text-muted-foreground italic">No medical prescriptions on file.</p>}
            </div>
          </section>

          {/* 6. Lab Reports & Documents */}
          <LabReportsSection patientId={patientProfile?.id} />

        </div>
      </div>
    </div>
  );
}
