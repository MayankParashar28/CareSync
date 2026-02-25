import { Switch, Route, useLocation } from "wouter";
import { useEffect, lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

// Eager-loaded (small, always needed)
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/not-found";

// Lazy-loaded (code-split per route)
const DashboardLayout = lazy(() => import("@/pages/dashboard/DashboardLayout"));
const PatientDashboard = lazy(() => import("@/pages/dashboard/PatientDashboard"));
const BookAppointment = lazy(() => import("@/pages/dashboard/BookAppointment"));
const MedicalRecords = lazy(() => import("@/pages/dashboard/MedicalRecords"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const DoctorDashboard = lazy(() => import("@/pages/dashboard/DoctorDashboard"));
const ReceptionistDashboard = lazy(() => import("@/pages/dashboard/ReceptionistDashboard"));
const DoctorPatientView = lazy(() => import("@/pages/dashboard/doctor/DoctorPatientView"));
const Welcome = lazy(() => import("@/pages/Welcome"));
const Profile = lazy(() => import("@/pages/Profile"));

// Full-screen loading spinner (shared by Suspense + ProtectedRoute)
function PageLoader() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

// Protected Route Wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
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
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
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
