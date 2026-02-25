
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Stethoscope, UserPlus } from "lucide-react";
import { Link, useLocation, useSearch } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppointments } from "@/hooks/use-appointments";
import { useDoctorsList } from "@/hooks/use-profiles";
import PatientsTab from "./reception/PatientsTab";
import VisitsTab from "./reception/VisitsTab";
import PaymentsTab from "./reception/PaymentsTab";

export default function ReceptionistDashboard() {
    const { user } = useAuth();
    const [, setLocation] = useLocation();
    const search = useSearch();
    const query = new URLSearchParams(search);
    const currentTab = query.get("tab") || "patients";
    const { data: appointments } = useAppointments();
    const { data: doctors } = useDoctorsList();

    // Stats calculation (simplified)
    const today = new Date();
    const todayAppointments = appointments?.filter((a: any) => {
        const d = new Date(a.dateTime);
        return d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear();
    }) || [];

    const activeDoctorsCount = doctors?.length || 0; // Simplified for now

    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900">
                        Hello, {user?.firstName}
                    </h1>
                    <p className="text-muted-foreground mt-2">Receptionist Dashboard - Clinic Overview</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/dashboard/book">
                        <Button className="flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            New Appointment
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-md bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                    <CardContent className="p-6 flex items-start justify-between">
                        <div>
                            <p className="text-indigo-100 font-medium mb-1">Total Appointments</p>
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
                            <p className="text-muted-foreground font-medium mb-1">Active Doctors</p>
                            <h3 className="text-3xl font-bold text-slate-900">{activeDoctorsCount}</h3>
                        </div>
                        <div className="bg-emerald-100 p-2 rounded-lg">
                            <Stethoscope className="h-6 w-6 text-emerald-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={currentTab} onValueChange={(val) => setLocation(`/dashboard/receptionist?tab=${val}`)} className="space-y-6">
                <TabsList className="bg-slate-100 p-1 rounded-xl">
                    <TabsTrigger value="patients" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Patients</TabsTrigger>
                    <TabsTrigger value="visits" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Visits & Check-Ins</TabsTrigger>
                    <TabsTrigger value="payments" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Billing & Payments</TabsTrigger>
                </TabsList>

                <TabsContent value="patients" className="space-y-4">
                    <PatientsTab />
                </TabsContent>

                <TabsContent value="visits" className="space-y-4">
                    <VisitsTab />
                </TabsContent>

                <TabsContent value="payments" className="space-y-4">
                    <PaymentsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
