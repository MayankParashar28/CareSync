import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUserProfiles } from "@/hooks/use-profiles";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Users,
  LogOut,
  Stethoscope,
  Activity,
  Menu,
  X,
  Shield,
  User,
  ChevronDown,
  Phone,
  Settings
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navigation() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { isDoctor } = useUserProfiles();
  // Role Switcher State
  const [currentRole, setCurrentRole] = useState<string>('patient');
  const isAdmin = user?.role === 'admin';
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user?.role) {
      setCurrentRole(user.role);
    }
  }, [user?.role]);

  // Use currentRole to determine links, but only allow switching if real user is admin
  const isViewAsAdmin = currentRole === 'admin';
  const isViewAsDoctor = currentRole === 'doctor';
  const isViewAsReceptionist = currentRole === 'receptionist';

  let navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/book", label: "Book Appointment", icon: Stethoscope },
    { href: "/dashboard/records", label: "Medical Records", icon: FileText },
  ];

  if (isViewAsDoctor) {
    navItems = [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/appointments", label: "Appointments", icon: Calendar },
      { href: "/dashboard/patients", label: "My Patients", icon: Users },
    ];
  } else if (isViewAsAdmin) {
    navItems = [
      { href: "/admin", label: "Admin Dashboard", icon: LayoutDashboard },
    ];
  } else if (isViewAsReceptionist) {
    navItems = [
      { href: "/dashboard/receptionist", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/book", label: "Book Appointment", icon: Calendar },
      { href: "/dashboard/records", label: "Records", icon: FileText },
    ];
  }
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl tracking-tight">CareSync</h1>
            <p className="text-xs text-muted-foreground">Patient Portal</p>
          </div>
        </div>

        {/* Admin Role Switcher */}
        {user?.role === 'admin' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between mb-2">
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {currentRole === 'admin' ? 'Admin View' : (currentRole === 'doctor' ? 'Doctor View' : (currentRole === 'receptionist' ? 'Receptionist' : 'Patient View'))}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              <DropdownMenuItem onClick={() => {
                setCurrentRole('admin');
                setLocation('/admin');
              }}>
                <Shield className="mr-2 h-4 w-4" />
                <span>Admin View</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setCurrentRole('doctor');
                setLocation('/dashboard/doctor');
              }}>
                <Stethoscope className="mr-2 h-4 w-4" />
                <span>Doctor View</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setCurrentRole('receptionist');
                setLocation('/dashboard/receptionist');
              }}>
                <Phone className="mr-2 h-4 w-4" />
                <span>Receptionist</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setCurrentRole('patient');
                setLocation('/dashboard');
              }}>
                <User className="mr-2 h-4 w-4" />
                <span>Patient View</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div >

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <Link href="/dashboard/profile">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="Profile" className="h-8 w-8 rounded-full ring-2 ring-primary/20" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {user?.firstName?.[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-muted-foreground truncate">
                {isAdmin ? "Administrator" : (isDoctor ? "Doctor" : "Patient")}
                <span className="ml-1 opacity-50">({user?.role})</span>
              </p>
            </div>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </div>
        </Link>
        <Button
          variant="outline"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20 transition-colors"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div >
  );

  return (
    <>
      {/* Mobile Trigger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b z-50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <span className="font-display font-bold text-lg">CareSync</span>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 border-r bg-card/50 backdrop-blur-xl z-50">
        <SidebarContent />
      </aside>
    </>
  );
}
