import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Activity, Stethoscope, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Welcome() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl text-center space-y-8">
                {/* Animated Icon */}
                <div className="relative mx-auto w-24 h-24">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
                        <Stethoscope className="h-12 w-12 text-white" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 tracking-tight">
                        Welcome to CareSync!
                    </h1>
                    <p className="text-xl text-slate-600 max-w-lg mx-auto leading-relaxed">
                        We're glad to have you here. Your registration is almost complete.
                    </p>
                </div>

                <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-xl overflow-hidden">
                    <CardContent className="p-8 md:p-12 space-y-6">
                        <div className="bg-amber-100/50 border border-amber-200 rounded-xl p-6 flex flex-col items-center gap-3">
                            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                Next Step
                            </span>
                            <p className="text-lg font-medium text-amber-900">
                                Please proceed to the reception desk to complete your check-in with the doctor.
                            </p>
                        </div>

                        <div className="grid gap-3">
                            <Link href="/dashboard">
                                <Button size="lg" className="w-full h-14 text-lg gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25">
                                    I'm at the Reception
                                    <ArrowRight className="h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-sm text-slate-500">
                    Need help? <span className="text-blue-600 font-medium">Ask our staff</span>
                </p>
            </div>
        </div>
    );
}
