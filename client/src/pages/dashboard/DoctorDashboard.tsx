import { useState } from "react";
import { Link } from "wouter";
import { useAppointments } from "@/hooks/use-appointments";
import { useDoctorsList, usePatientsList } from "@/hooks/use-profiles";
import { useAuth } from "@/hooks/use-auth";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Calendar, Users, FileText, Clock, Stethoscope, Search, User, ArrowRight, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DoctorDashboard() {
    const { user } = useAuth();
    const { data: appointments, isLoading: isLoadingAppts } = useAppointments();
    const { data: patients, isLoading: isLoadingPatients } = usePatientsList();
    const [searchQuery, setSearchQuery] = useState("");

    // Filter patients based on search
    const filteredPatients = patients?.filter((p: any) => {
        const name = `${p.user?.firstName} ${p.user?.lastName}`.toLowerCase();
        return name.includes(searchQuery.toLowerCase());
    }) || [];

    // Stats
    const today = new Date();
    const todayAppointments = appointments?.filter((a: any) => {
        const d = new Date(a.dateTime);
        return d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear();
    }) || [];

    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
            <header>
                <h1 className="text-3xl font-display font-bold text-slate-900">
                    Dr. {user?.lastName}
                </h1>
                <p className="text-muted-foreground mt-2">Doctor's Dashboard</p>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-md bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                    <CardContent className="p-6 flex items-start justify-between">
                        <div>
                            <p className="text-emerald-100 font-medium mb-1">Total Appointments</p>
                            <h3 className="text-3xl font-bold">{appointments?.length || 0}</h3>
                        </div>
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Calendar className="h-6 w-6 text-white" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-start justify-between">
                        <div>
                            <p className="text-muted-foreground font-medium mb-1">Today's Schedule</p>
                            <h3 className="text-3xl font-bold text-slate-900">{todayAppointments.length}</h3>
                        </div>
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <Clock className="h-6 w-6 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-start justify-between">
                        <div>
                            <p className="text-muted-foreground font-medium mb-1">Total Patients</p>
                            <h3 className="text-3xl font-bold text-slate-900">{patients?.length || "--"}</h3>
                        </div>
                        <div className="bg-purple-100 p-2 rounded-lg">
                            <Users className="h-6 w-6 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="patients">My Patients</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Appointments List */}
                        <div className="lg:col-span-2 space-y-6">
                            <h2 className="text-xl font-bold font-display">Upcoming Appointments</h2>
                            {isLoadingAppts ? (
                                <Skeleton className="h-48 w-full rounded-xl" />
                            ) : appointments && appointments.length > 0 ? (
                                <div className="space-y-4">
                                    {appointments.slice(0, 5).map((appt: any) => (
                                        <div key={appt.id} className="flex items-center justify-between p-4 bg-white rounded-xl border shadow-sm hover:shadow-md transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-primary font-bold">
                                                    {format(new Date(appt.dateTime), "d")}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">Patient ID: {appt.patientId}</p>
                                                    <p className="text-xs text-muted-foreground">{appt.reason}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium">{format(new Date(appt.dateTime), "h:mm a")}</p>
                                                <StatusBadge status={appt.status} className="scale-90 origin-right" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Card className="border-dashed bg-muted/20">
                                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                        <h3 className="font-semibold text-lg">No appointments</h3>
                                        <p className="text-muted-foreground mb-4">Your schedule is clear.</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="patients" className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search patients..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {isLoadingPatients ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPatients.map((patient: any) => (
                                <Card key={patient.id} className="hover:shadow-md transition-all">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
                                                <User className="h-6 w-6" />
                                            </div>
                                            <Link href={`/dashboard/doctor/patient/${patient.id}`}>
                                                <Button size="sm" variant="outline" className="gap-2">
                                                    View Details <ArrowRight className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                        <h3 className="font-bold text-lg">{patient.user?.firstName} {patient.user?.lastName}</h3>
                                        <div className="text-sm text-muted-foreground mt-2 space-y-1">
                                            <p className="flex items-center gap-2"><Phone className="h-3 w-3" /> {patient.user?.phoneNumber}</p>
                                            <p className="flex items-center gap-2"><Calendar className="h-3 w-3" /> {patient.dateOfBirth ? format(new Date(patient.dateOfBirth), "PP") : "N/A"}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {filteredPatients.length === 0 && (
                                <div className="col-span-full text-center py-10 text-muted-foreground">
                                    No patients found.
                                </div>
                            )}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="schedule">
                    <div className="p-10 text-center text-muted-foreground border rounded-lg border-dashed">
                        Detailed schedule view coming soon.
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
