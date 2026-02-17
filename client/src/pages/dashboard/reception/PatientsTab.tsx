import { useState } from "react";
import { usePatientsList, useDoctorsList } from "@/hooks/use-profiles";
import { useCreateVisit } from "@/hooks/use-visits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, UserPlus, Phone, Calendar, Stethoscope } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth } from "@/lib/api";

export default function PatientsTab() {
    const [searchQuery, setSearchQuery] = useState("");
    const { data: patients, isLoading } = usePatientsList(searchQuery);
    const { data: doctors } = useDoctorsList();
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);

    // Check-In State
    const [isCheckInOpen, setIsCheckInOpen] = useState(false);
    const [selectedPatientForCheckIn, setSelectedPatientForCheckIn] = useState<any>(null);
    type VisitType = "consultation" | "follow-up" | "emergency";
    const [checkInData, setCheckInData] = useState<{ doctorId: string; type: VisitType; reason: string }>({
        doctorId: "",
        type: "consultation",
        reason: ""
    });

    const { toast } = useToast();
    const queryClient = useQueryClient();
    const createVisitMutation = useCreateVisit();

    // Registration Form State
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        dateOfBirth: "",
        gender: "male",
    });

    const registerMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const res = await fetchWithAuth(api.patients.registerByReception.path, {
                method: api.patients.registerByReception.method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to register patient");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [api.patients.list.path] });
            setIsRegisterOpen(false);
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                phoneNumber: "",
                dateOfBirth: "",
                gender: "male",
            });
            toast({ title: "Success", description: "Patient registered successfully" });
        },
        onError: (err) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        registerMutation.mutate(formData);
    };

    const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const openCheckIn = (patient: any) => {
        setSelectedPatientForCheckIn(patient);
        setCheckInData({ doctorId: "", type: "consultation", reason: "" });
        setIsCheckInOpen(true);
    };

    const handleCheckInSubmit = () => {
        if (!selectedPatientForCheckIn || !checkInData.doctorId) return;

        createVisitMutation.mutate({
            patientId: selectedPatientForCheckIn.id,
            doctorId: checkInData.doctorId,
            date: new Date().toISOString(),
            status: "in-progress",
            type: checkInData.type,
            reason: checkInData.reason
        }, {
            onSuccess: () => {
                setIsCheckInOpen(false);
                toast({ title: "Checked In", description: `${selectedPatientForCheckIn.user.firstName} is now checked in.` });
            },
            onError: (err) => {
                toast({ title: "Error", description: err.message, variant: "destructive" });
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search patients by name or phone..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Register Patient
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Register New Patient</DialogTitle>
                            <DialogDescription>
                                Create a new patient profile. This will also create a user account.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleRegisterSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input id="firstName" name="firstName" required value={formData.firstName} onChange={handleRegisterChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" name="lastName" required value={formData.lastName} onChange={handleRegisterChange} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" required value={formData.email} onChange={handleRegisterChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber">Phone Number</Label>
                                <Input id="phoneNumber" name="phoneNumber" required value={formData.phoneNumber} onChange={handleRegisterChange} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                    <Input id="dateOfBirth" name="dateOfBirth" type="date" required value={formData.dateOfBirth} onChange={handleRegisterChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gender">Gender</Label>
                                    <select
                                        id="gender"
                                        name="gender"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.gender}
                                        onChange={handleRegisterChange}
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={registerMutation.isPending}>
                                    {registerMutation.isPending ? "Registering..." : "Register"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Check In Patient</DialogTitle>
                            <DialogDescription>
                                Start a visit for {selectedPatientForCheckIn?.user?.firstName} {selectedPatientForCheckIn?.user?.lastName}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Assign Doctor</Label>
                                <Select
                                    value={checkInData.doctorId}
                                    onValueChange={(val) => setCheckInData({ ...checkInData, doctorId: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Doctor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {doctors?.map((doc: any) => (
                                            <SelectItem key={doc.id} value={doc.id}>
                                                Dr. {doc.user?.lastName || doc.id} ({doc.specialization})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Visit Type</Label>
                                <Select
                                    value={checkInData.type}
                                    onValueChange={(val) => setCheckInData({ ...checkInData, type: val as VisitType })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="consultation">Consultation</SelectItem>
                                        <SelectItem value="emergency">Emergency</SelectItem>
                                        <SelectItem value="follow-up">Follow-up</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Reason (Optional)</Label>
                                <Input
                                    value={checkInData.reason}
                                    onChange={(e) => setCheckInData({ ...checkInData, reason: e.target.value })}
                                    placeholder="e.g. Fever, Headache"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCheckInSubmit} disabled={createVisitMutation.isPending || !checkInData.doctorId}>
                                {createVisitMutation.isPending ? "Checking In..." : "Confirm Check-In"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-xl" />
                    ))}
                </div>
            ) : patients && patients.length > 0 ? (
                <div className="space-y-4">
                    {patients.map((patient: any) => (
                        <Card key={patient.id} className="hover:shadow-md transition-all cursor-pointer border shadow-sm">
                            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                                        {patient.user?.firstName?.[0]}{patient.user?.lastName?.[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{patient.user?.firstName} {patient.user?.lastName}</h3>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                            <div className="flex items-center gap-1">
                                                <Phone className="h-3 w-3" />
                                                <span>{patient.user?.phoneNumber}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>DOB: {patient.dateOfBirth ? format(new Date(patient.dateOfBirth), "MMM d, yyyy") : 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">History</Button>
                                    <Button size="sm" onClick={() => openCheckIn(patient)}>Check-In</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    No patients found. Try a different search or register a new patient.
                </div>
            )}
        </div>
    );
}
