import { ReactNode, useEffect } from "react";
import { useUserProfiles } from "@/hooks/use-profiles";
import { useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isDoctor, isPatient, isLoading } = useUserProfiles();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navigation />
      <main className="lg:pl-64 min-h-screen pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
