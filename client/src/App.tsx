import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

// Pages
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/not-found";
import DashboardLayout from "@/pages/dashboard/DashboardLayout";
import PatientDashboard from "@/pages/dashboard/PatientDashboard";
import BookAppointment from "@/pages/dashboard/BookAppointment";
import MedicalRecords from "@/pages/dashboard/MedicalRecords";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import DoctorDashboard from "@/pages/dashboard/DoctorDashboard";
import ReceptionistDashboard from "@/pages/dashboard/ReceptionistDashboard";
import DoctorPatientView from "@/pages/dashboard/doctor/DoctorPatientView";
import Welcome from "@/pages/Welcome";
import Profile from "@/pages/Profile";

// Protected Route Wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <RedirectToAuth />;
  }

  return <>{children}</>;
}

function RedirectToAuth() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/auth");
  }, [setLocation]);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth" component={Auth} />

      {/* Dashboard Routes - Flattened for better matching reliability */}
      <Route path="/dashboard/records">
        <ProtectedRoute>
          <DashboardLayout>
            <MedicalRecords />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/dashboard/book">
        <ProtectedRoute>
          <DashboardLayout>
            <BookAppointment />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/dashboard">
        <ProtectedRoute>
          <DashboardLayout>
            <PatientDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/dashboard/doctor">
        <ProtectedRoute>
          <DashboardLayout>
            <DoctorDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/dashboard/doctor/patient/:id">
        <ProtectedRoute>
          <DashboardLayout>
            <DoctorPatientView />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/dashboard/receptionist">
        <ProtectedRoute>
          <DashboardLayout>
            <ReceptionistDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin">
        <ProtectedRoute>
          <DashboardLayout>
            <AdminDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/welcome" component={Welcome} />

      <Route path="/dashboard/profile">
        <ProtectedRoute>
          <DashboardLayout>
            <Profile />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
