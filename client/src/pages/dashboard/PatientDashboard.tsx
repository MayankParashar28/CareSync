import { useAppointments } from "@/hooks/use-appointments";
import { useMedicalRecords } from "@/hooks/use-medical-records";
import { useUserProfiles } from "@/hooks/use-profiles";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Upload
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
  const firstVisit = typeof earliestVisitDate === "string" ? new Date(earliestVisitDate) : null; // Assuming simplified ordering for now

  if (isLoadingProfile || isLoadingAppts || isLoadingRecords) {
    return <div className="p-10 space-y-4"><Skeleton className="h-12 w-1/3" /><Skeleton className="h-64 w-full" /></div>;
  }

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto bg-slate-50/50 min-h-screen">
      <header className="flex items-center justify-between">
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
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-blue-600 mb-3">No follow-ups scheduled.</p>
                  <Link href="/dashboard/book"><Button size="sm" variant="secondary" className="w-full">Book Appointment</Button></Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Clinical Data */}
        <div className="lg:col-span-2 space-y-8">

          {/* 3. Visit Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
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

          {/* 6. Reports (Placeholder) */}
          <section>
            <h3 className="text-lg font-bold font-display text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Lab Reports & Documents
            </h3>
            <Card className="bg-slate-50 border-dashed">
              <CardContent className="py-8 text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Upload className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">No reports uploaded</p>
                  <p className="text-sm text-muted-foreground">Lab results and X-rays will appear here.</p>
                </div>
              </CardContent>
            </Card>
          </section>

        </div>
      </div>
    </div>
  );
}
