import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, Calendar, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminStats {
    totalPatients: number;
    totalDoctors: number;
    totalAppointments: number;
    todayAppointments: number;
}

export default function AdminDashboard() {
    const { data: stats, isLoading } = useQuery<AdminStats>({
        queryKey: ["/api/admin/stats"],
    });

    if (isLoading) {
        return (
            <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6">
                <h1 className="text-3xl font-display font-bold text-slate-900">Admin Dashboard</h1>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    const statCards = [
        {
            title: "Total Patients",
            value: stats?.totalPatients || 0,
            icon: Users,
            desc: "Registered patients",
            color: "text-blue-600",
            bg: "bg-blue-100"
        },
        {
            title: "Total Doctors",
            value: stats?.totalDoctors || 0,
            icon: Award,
            desc: "Active Medical Specialists",
            color: "text-emerald-600",
            bg: "bg-emerald-100"
        },
        {
            title: "Today's Appointments",
            value: stats?.todayAppointments || 0,
            icon: Activity,
            desc: "Scheduled for today",
            color: "text-amber-600",
            bg: "bg-amber-100"
        },
        {
            title: "Total Appointments",
            value: stats?.totalAppointments || 0,
            icon: Calendar,
            desc: "All time records",
            color: "text-purple-600",
            bg: "bg-purple-100"
        }
    ];

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-display font-bold text-slate-900">Admin Overview</h1>
                <p className="text-muted-foreground mt-2">Welcome back, Admin. Here's what's happening today.</p>
            </header>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, index) => (
                    <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className={`${stat.bg} p-2 rounded-lg`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold font-display">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stat.desc}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* User Management Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">User Management</h2>
                    <CreateUserModal />
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <UserList />
                </div>
            </div>

            {/* System Health */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>System Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span className="text-sm font-medium">Operational</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">All systems running smoothly.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Subcomponents for User Management
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"; // Ensure these exist

// ... UserList and CreateUserModal components implementation ...
// I will need to provide full implementations for these to work.
// Since I can't do partial updates effectively if I don't define them, 
// I should probably rewrite the file or append them at the end and import them.
// Actually, I'll define them in the same file for simplicity as requested.

const createUserSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["patient", "doctor", "admin", "receptionist"]),
});

function CreateUserModal() {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof createUserSchema>>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            role: "patient"
        }
    });

    const mutation = useMutation({
        mutationFn: async (values: z.infer<typeof createUserSchema>) => {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            toast({ title: "User created successfully" });
            setOpen(false);
            form.reset();
        },
        onError: (err) => {
            toast({ title: "Error creating user", description: err.message, variant: "destructive" });
        }
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> Create User</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                        Create a new user account. They will be able to login with these credentials.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl><Input placeholder="john@example.com" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl><Input type="password" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="patient">Patient</SelectItem>
                                            <SelectItem value="doctor">Doctor</SelectItem>
                                            <SelectItem value="receptionist">Receptionist</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={mutation.isPending}>
                            {mutation.isPending ? "Creating..." : "Create User"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function UserList() {
    const { data: users, isLoading } = useQuery<any[]>({
        queryKey: ["/api/admin/users"],
    });

    if (isLoading) return <Skeleton className="h-40 w-full" />;

    if (!users?.length) return <div className="col-span-full text-center text-muted-foreground p-8 border rounded-lg border-dashed">No users found.</div>;

    return (
        <>
            {users.map((user) => (
                <Card key={user.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {user.firstName} {user.lastName}
                        </CardTitle>
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${user.role === 'admin' ? 'bg-red-100 text-red-800' :
                            user.role === 'doctor' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                            }`}>
                            {user.role}
                        </span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground break-all">{user.email}</div>
                        <div className="text-xs text-muted-foreground mt-1">ID: {user.id}</div>
                        <div className="mt-4 flex justify-end">
                            <EditRoleModal user={user} />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </>
    );
}

function EditRoleModal({ user }: { user: any }) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [role, setRole] = useState(user.role);

    const mutation = useMutation({
        mutationFn: async (newRole: string) => {
            const res = await fetch(`/api/admin/users/${user.id}/role`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole }),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            toast({ title: "Role updated successfully" });
            setOpen(false);
        },
        onError: (err) => {
            toast({ title: "Error updating role", description: err.message, variant: "destructive" });
        }
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">chng</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit User Role</DialogTitle>
                    <DialogDescription>
                        Change the role for <strong>{user.firstName} {user.lastName}</strong>.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="patient">Patient</SelectItem>
                                <SelectItem value="doctor">Doctor</SelectItem>
                                <SelectItem value="receptionist">Receptionist</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        onClick={() => mutation.mutate(role)}
                        className="w-full"
                        disabled={mutation.isPending || role === user.role}
                    >
                        {mutation.isPending ? "Updating..." : "Update Role"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
