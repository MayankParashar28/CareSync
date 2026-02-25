import { useState } from "react";
import { useParams, Link } from "wouter";
import { useUserProfiles } from "@/hooks/use-profiles"; // We might need a specific hook to get patient by ID, not 'me'.
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useMedicalRecords } from "@/hooks/use-medical-records";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, Calendar, Phone, Activity } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import ConsultationForm from "./ConsultationForm";
import { useAuth } from "@/hooks/use-auth";
import { fetchWithAuth } from "@/lib/api";

// Temporary hook to fetch patient by ID for the doctor view
function usePatientDetails(patientId: string) {
    const { user } = useAuth();
    return useQuery({
        queryKey: [api.patients.get.path.replace(":id", patientId)],
        queryFn: async () => {
            const res = await fetchWithAuth(api.patients.get.path.replace(":id", patientId));
            if (!res.ok) throw new Error("Failed to fetch patient");
            return api.patients.get.responses[200].parse(await res.json());
        },
        enabled: !!patientId && !!user,
    });
}





export default function DoctorPatientView() {
    const params = useParams();
    const patientId = params.id as string;
    const { user: currentUser } = useAuth();
    // specific hooks
    const { data: patient, isLoading: isLoadingPatient } = usePatientDetails(patientId);
    const { data: records, isLoading: isLoadingRecords } = useMedicalRecords(patientId);

    // Get current doctor ID (assuming currentUser is linked to a Doctor profile)
    // We need the doctorId for the consultation form.
    const { data: doctorProfile } = useQuery({
        queryKey: [api.doctors.me.path],
        queryFn: async () => {
            const res = await fetchWithAuth(api.doctors.me.path);
            return res.json();
        }
    });

    if (isLoadingPatient) return <div className="p-10"><Skeleton className="h-96 w-full" /></div>;
    if (!patient) return <div className="p-10">Patient not found</div>;

    // We need to display User info (Name). 
    // If backend `getPatient` doesn't return populated user, we might see IDs. 
    // We will fix backend endpoint to populate 'user' for `getPatient` if needed.
    // Let's assume valid data for now. type casting to any to access potentially populated fields
    const patientAny = patient as any; // logic: if we populate in backend, it will be here.

    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-display font-bold text-slate-900">Patient Details</h1>
            </div>

            {/* Banner */}
            <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <div className="h-20 w-20 rounded-full bg-slate-200 flex items-center justify-center">
                        <User className="h-10 w-10 text-slate-500" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold">
                            {patientAny.user?.firstName || 'Patient'} {patientAny.user?.lastName || patientId}
                        </h2>
                        <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1"><Activity className="h-4 w-4" /> {patient.gender}</span>
                            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {patient.dateOfBirth ? format(new Date(patient.dateOfBirth), 'dd MMM yyyy') : 'N/A'}</span>
                            <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> {patient.contactNumber || patientAny.user?.phoneNumber}</span>
                        </div>
                    </div>
                    <div className="ml-auto flex gap-2">
                        {/* Actions like Edit Profile could go here */}
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="consultation" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="consultation">Consultation</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader><CardTitle>Medical History</CardTitle></CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap text-sm text-slate-700">{patient.medicalHistory || "None recorded."}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Allergies</CardTitle></CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap text-sm text-red-600">{patient.allergies || "None known."}</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="consultation">
                    <div className="max-w-3xl">
                        {doctorProfile?.id ? (
                            <ConsultationForm
                                patientId={patient.id}
                                doctorId={doctorProfile.id}
                            />
                        ) : (
                            <p>Loading doctor profile...</p>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    {isLoadingRecords ? (
                        <Skeleton className="h-40 w-full" />
                    ) : records && records.length > 0 ? (
                        records.map((record: any) => (
                            <Card key={record.id}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-base">
                                            {format(new Date(record.visitDate), "PPP")}
                                        </CardTitle>
                                        <span className="text-xs text-muted-foreground">Dr. {record.doctor?.user?.lastName || 'Unknown'}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div><span className="font-semibold">Diagnosis:</span> {record.diagnosis}</div>
                                    <div><span className="font-semibold">Symptoms:</span> {record.symptoms}</div>
                                    <div><span className="font-semibold">Prescription:</span> {record.prescription}</div>
                                    {record.notes && <div className="text-muted-foreground mt-2 italic">{record.notes}</div>}
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="p-8 text-center text-muted-foreground border rounded-lg border-dashed">
                            No medical records found.
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="reports">
                    <ReportsContainer patientId={patientId} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

import { useCreateMediaFile, useMediaFiles } from "@/hooks/use-medical-records";
import { Input } from "@/components/ui/input";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function ReportsContainer({ patientId }: { patientId: string }) {
    const createMediaMutation = useCreateMediaFile();
    const { data: mediaFiles, isLoading } = useMediaFiles(patientId);
    const { toast } = useToast();
    const [file, setFile] = useState<File | null>(null);

    const handleUpload = () => {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            createMediaMutation.mutate({
                patientId,
                fileName: file.name,
                fileType: file.type,
                url: base64,
                description: "Uploaded by doctor",
            }, {
                onSuccess: () => {
                    toast({ title: "Success", description: "Report uploaded" });
                    setFile(null);
                },
                onError: (err) => {
                    toast({ title: "Error", description: err.message, variant: "destructive" });
                }
            })
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Upload Report</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex w-full max-w-sm items-center space-x-2">
                        <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                        <Button disabled={!file || createMediaMutation.isPending} onClick={handleUpload}>
                            {createMediaMutation.isPending ? "..." : "Upload"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {isLoading ? (
                    <Skeleton className="h-32 w-full" />
                ) : mediaFiles && mediaFiles.length > 0 ? (
                    mediaFiles.map((file: any) => (
                        <Card key={file.id} className="overflow-hidden">
                            <CardContent className="p-4">
                                <div className="aspect-video bg-slate-100 rounded-md mb-2 flex items-center justify-center overflow-hidden relative group">
                                    {file.fileType.startsWith("image/") ? (
                                        <img src={file.url} alt={file.fileName} className="object-cover w-full h-full" />
                                    ) : (
                                        <FileText className="h-12 w-12 text-slate-400" />
                                    )}
                                    <a href={file.url} download={file.fileName} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-medium">
                                        Download
                                    </a>
                                </div>
                                <p className="font-medium truncate" title={file.fileName}>{file.fileName}</p>
                                <p className="text-xs text-muted-foreground">{format(new Date(file.uploadedAt), "PPP")}</p>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full p-8 text-center text-muted-foreground border rounded-lg border-dashed">
                        No reports uploaded.
                    </div>
                )}
            </div>
        </div>
    );
}
