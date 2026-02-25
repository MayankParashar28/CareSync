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
            <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-display font-bold text-slate-900">Medical Records</h1>
                </div>
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-48 w-full rounded-xl" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8 bg-slate-50/30 min-h-screen">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900">Medical History</h1>
                    <p className="text-muted-foreground mt-1">A complete timeline of your visits, diagnoses, and treatments.</p>
                </div>
                {/* Search Placeholder */}
                <div className="relative w-full md:w-64">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search records..."
                        className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                        disabled
                    />
                </div>
            </header>

            {!records || records.length === 0 ? (
                <Card className="border-dashed bg-slate-50">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <FileText className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="font-semibold text-lg text-slate-900">No records found</h3>
                        <p className="text-slate-500 max-w-sm mt-2">
                            When you visit a doctor, they will create a digital record of your diagnosis and prescription which will appear here.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    {records.map((record: any) => (
                        <div key={record.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">

                            {/* Timeline Icon */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                <Stethoscope className="h-5 w-5 text-slate-400" />
                            </div>

                            {/* Card Content */}
                            <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="bg-slate-50/50 pb-3 border-b">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <Badge variant="outline" className="bg-white font-mono text-xs px-2 py-1">
                                            {format(new Date(record.visitDate), "MMM d, yyyy")}
                                        </Badge>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <span className="font-medium">Dr. {record.doctor?.user?.lastName}</span>
                                            <span className="text-xs px-1.5 py-0.5 bg-slate-100 rounded-full">{record.doctor?.specialization}</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-5 space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-slate-900 text-lg">{record.diagnosis}</h4>
                                        <p className="text-sm text-slate-600 mt-1">{record.symptoms}</p>
                                    </div>

                                    {record.prescription && (
                                        <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-lg p-3">
                                            <h5 className="text-xs font-bold uppercase text-emerald-700 mb-1 flex items-center gap-1">
                                                <Pill className="h-3 w-3" /> Prescription
                                            </h5>
                                            <p className="text-sm font-mono text-slate-800 whitespace-pre-wrap">{record.prescription}</p>
                                        </div>
                                    )}

                                    {record.notes && (
                                        <div className="text-xs text-muted-foreground italic border-l-2 pl-3 py-1">
                                            " {record.notes} "
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
