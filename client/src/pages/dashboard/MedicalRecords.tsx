import { useMedicalRecords } from "@/hooks/use-medical-records";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { FileText, Stethoscope, Calendar, Pill } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function MedicalRecords() {
    const { data: records, isLoading } = useMedicalRecords();

    if (isLoading) {
        return (
            <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6">
                <h1 className="text-3xl font-display font-bold text-slate-900">Medical Records</h1>
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-display font-bold text-slate-900">Medical Records</h1>
                <p className="text-muted-foreground mt-2">View your diagnosis history, prescriptions, and reports.</p>
            </header>

            {!records || records.length === 0 ? (
                <Card className="border-dashed bg-muted/20">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="bg-muted p-4 rounded-full mb-4">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-lg">No records found</h3>
                        <p className="text-muted-foreground">Medical records created by your doctor will appear here.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {records.map((record: any) => (
                        <Card key={record.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardHeader className="bg-slate-50 border-b pb-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                                            <Stethoscope className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">Dr. {record.doctor?.user?.firstName} {record.doctor?.user?.lastName}</CardTitle>
                                            <p className="text-sm text-muted-foreground">{record.doctor?.specialization}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="w-fit flex items-center gap-1.5 px-3 py-1 font-normal bg-white">
                                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                                        {format(new Date(record.visitDate), "MMMM d, yyyy")}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                                            <FileText className="h-4 w-4" /> Diagnosis
                                        </h4>
                                        <p className="text-slate-900 font-medium leading-relaxed">{record.diagnosis}</p>
                                    </div>
                                    {record.notes && (
                                        <div>
                                            <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-500 mb-2">Notes</h4>
                                            <p className="text-slate-700 text-sm">{record.notes}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100/50">
                                    <h4 className="font-semibold text-sm uppercase tracking-wider text-blue-600 mb-3 flex items-center gap-2">
                                        <Pill className="h-4 w-4" /> Prescription
                                    </h4>
                                    <p className="text-slate-800 whitespace-pre-wrap font-mono text-sm leading-relaxed">{record.prescription}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
