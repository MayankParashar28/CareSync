import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Activity, ShieldCheck, Clock, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col font-sans">
      {/* Navbar */}
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-slate-900">MediCare</span>
        </div>
        <div className="flex gap-4">
          <Link href="/auth">
            <Button variant="ghost" className="hidden sm:flex font-medium text-slate-600 hover:text-primary hover:bg-primary/5">
              Sign In
            </Button>
          </Link>
          <Link href="/auth">
            <Button className="rounded-full px-6 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 py-12 lg:py-24">
        <div className="flex-1 space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-blue-100/50 text-primary px-4 py-1.5 rounded-full text-sm font-medium border border-blue-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Accepting New Patients
          </div>

          <h1 className="font-display font-bold text-5xl lg:text-7xl leading-[1.1] text-slate-900">
            Healthcare <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Reimagined.</span>
          </h1>

          <p className="text-lg lg:text-xl text-slate-600 max-w-xl leading-relaxed">
            Connect with top specialists, manage appointments, and access your medical history securely from anywhere. Your health journey starts here.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/auth">
              <Button size="lg" className="rounded-full px-8 h-14 text-lg shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all">
                Book an Appointment
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-lg border-2 hover:bg-slate-50">
                For Doctors
              </Button>
            </Link>
          </div>

          <div className="pt-8 flex items-center gap-8 text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Top Specialists</span>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full max-w-[600px] relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-full blur-3xl opacity-30 transform -translate-y-12"></div>
          {/* Unsplash image: Doctor using tablet */}
          {/* <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2070" alt="Doctor with tablet" className="relative rounded-3xl shadow-2xl shadow-blue-900/10 border-4 border-white transform rotate-2 hover:rotate-0 transition-all duration-500" /> */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/10 border-4 border-white transform rotate-1 hover:rotate-0 transition-all duration-500 aspect-[4/3] bg-slate-200">
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2070"
              alt="Healthcare professional using a tablet in a modern medical setting"
              className="w-full h-full object-cover"
            />

            <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-white/50 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Health Stats</p>
                  <p className="text-xs text-slate-500">Updated just now</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
