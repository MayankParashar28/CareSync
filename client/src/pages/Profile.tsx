
import { useAuth } from "@/hooks/use-auth";
import { useUserProfiles } from "@/hooks/use-profiles";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Calendar, MapPin, Building, GraduationCap, Stethoscope, Clock } from "lucide-react";
import { format } from "date-fns";

export default function Profile() {
    const { user } = useAuth();
    const { patientProfile, doctorProfile, isDoctor, isPatient } = useUserProfiles();

    if (!user) return null;

    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-4xl mx-auto">
            <header>
                <h1 className="text-3xl font-display font-bold text-slate-900">My Profile</h1>
                <p className="text-muted-foreground mt-2">Manage your account settings and personal information.</p>
            </header>

            <div className="grid gap-8">
                {/* Basic Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            Basic Information
                        </CardTitle>
                        <CardDescription>Your personal account details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-6 pb-6">
                            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold border-4 border-white shadow-sm ring-1 ring-slate-100">
                                {user.profileImageUrl ? (
                                    <img src={user.profileImageUrl} alt="Profile" className="h-full w-full rounded-full object-cover" />
                                ) : (
                                    user.firstName?.[0]
                                )}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold font-display">{user.firstName} {user.lastName}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide">
                                        {user.role}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>First Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input value={user.firstName || ''} readOnly className="pl-9 bg-slate-50" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Last Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input value={user.lastName || ''} readOnly className="pl-9 bg-slate-50" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input value={user.email || ''} readOnly className="pl-9 bg-slate-50" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input value={user.phone || ''} readOnly className="pl-9 bg-slate-50" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Patient Specific Information */}
                {isPatient && patientProfile && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-blue-500" />
                                Patient Details
                            </CardTitle>
                            <CardDescription>Your medical profile information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Age</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            value={patientProfile.dateOfBirth ?
                                                `${new Date().getFullYear() - new Date(patientProfile.dateOfBirth).getFullYear()} Years` :
                                                'Not set'}
                                            readOnly
                                            className="pl-9 bg-slate-50"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Date of Birth</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            value={patientProfile.dateOfBirth ? format(new Date(patientProfile.dateOfBirth), 'PPP') : 'Not set'}
                                            readOnly
                                            className="pl-9 bg-slate-50"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Gender</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            value={patientProfile.gender ? patientProfile.gender.charAt(0).toUpperCase() + patientProfile.gender.slice(1) : 'Not set'}
                                            readOnly
                                            className="pl-9 bg-slate-50"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Contact Number (Detailed)</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input value={patientProfile.contactNumber || ''} readOnly className="pl-9 bg-slate-50" />
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Address</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input value={patientProfile.address || 'No address provided'} readOnly className="pl-9 bg-slate-50" />
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Allergies</Label>
                                    <div className="relative">
                                        <Activity className="absolute left-3 top-2.5 h-4 w-4 text-rose-500" />
                                        <Input value={patientProfile.allergies || 'None known'} readOnly className="pl-9 bg-slate-50" />
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Other Diseases / Medical History</Label>
                                    <div className="p-3 bg-slate-50 rounded-md border min-h-[80px] text-sm text-slate-700">
                                        {patientProfile.medicalHistory || 'No other diseases or history recorded.'}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Doctor Specific Information (Keep ReadOnly) */}
                {isDoctor && doctorProfile && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Stethoscope className="h-5 w-5 text-emerald-500" />
                                Professional Details
                            </CardTitle>
                            <CardDescription>Your medical practice information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Specialization</Label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input value={doctorProfile.specialization || ''} readOnly className="pl-9 bg-slate-50" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Experience</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input value={`${doctorProfile.experienceYears} Years`} readOnly className="pl-9 bg-slate-50" />
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Qualifications</Label>
                                    <div className="relative">
                                        <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input value={doctorProfile.qualifications || ''} readOnly className="pl-9 bg-slate-50" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

// Helper component for icon
function Activity({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}
