import { useVisits } from "@/hooks/use-visits";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function VisitsTab() {
    const today = new Date();
    const { data: visits, isLoading } = useVisits({ date: today });

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold font-display">Active Visits Today</h2>
            {isLoading ? (
                <Skeleton className="h-48 w-full rounded-xl" />
            ) : visits && visits.length > 0 ? (
                <div className="space-y-4">
                    {visits.map((visit: any) => (
                        <Card key={visit.id} className="hover:shadow-md transition-all">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center text-green-700 font-bold">
                                        {format(new Date(visit.date), "HH:mm")}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{visit.patient?.user?.firstName} {visit.patient?.user?.lastName}</h3>
                                        <p className="text-sm text-muted-foreground">{visit.type} • Dr. {visit.doctor?.user?.lastName || 'Unknown'}</p>
                                    </div>
                                </div>
                                <div>
                                    <StatusBadge status={visit.status} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    No active visits found for today. Check-in a patient to start a visit.
                </div>
            )}
        </div>
    );
}
