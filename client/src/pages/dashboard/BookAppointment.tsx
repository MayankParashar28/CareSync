import { useState } from "react";
import { useDoctorsList, usePatientsList, useUserProfiles } from "@/hooks/use-profiles";
import { useCreateAppointment } from "@/hooks/use-appointments";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Stethoscope, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function BookAppointment() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { patientProfile } = useUserProfiles();
  const { data: doctors } = useDoctorsList();
  const { data: patients } = usePatientsList();
  const createAppointment = useCreateAppointment();

  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>("");
  const [reason, setReason] = useState("");

  // Mock time slots - in real app would come from doctor availability
  const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const patientIdToBook = user?.role === 'receptionist' ? selectedPatientId : patientProfile?.id;

    if (!selectedDoctorId || !date || !time || !patientIdToBook) {
      if (!patientIdToBook) toast({ title: "Error", description: "Patient information missing", variant: "destructive" });
      return;
    }

    // Construct DateTime
    const [hours, minutes] = time.split(":").map(Number);
    const appointmentDateTime = new Date(date);
    appointmentDateTime.setHours(hours, minutes);

    try {
      const cleanPayload = {
        doctorId: selectedDoctorId,
        patientId: patientIdToBook,
        dateTime: appointmentDateTime.toISOString(),
        type: "consultation",
        reason,
      } as any;

      await createAppointment.mutateAsync(cleanPayload);
      toast({ title: "Appointment Requested", description: "Waiting for confirmation." });
      setLocation("/dashboard");
    } catch (error) {
      toast({ title: "Error", description: "Failed to book appointment", variant: "destructive" });
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-display font-bold mb-6">Book an Appointment</h1>

      <div className="grid gap-8">

        {/* Receptionist: Select Patient */}
        {user?.role === 'receptionist' && (
          <section>
            <Label className="text-base font-semibold mb-3 block">Select Patient</Label>
            <Select onValueChange={setSelectedPatientId} value={selectedPatientId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Search or select a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients?.map((patient: any) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.user?.firstName} {patient.user?.lastName} (ID: {patient.id.substring(0, 6)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>
        )}

        <section>
          <Label className="text-base font-semibold mb-3 block">Select a Specialist</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors?.map((doc: any) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDoctorId(doc.id.toString())}
                className={cn(
                  "cursor-pointer border rounded-xl p-4 flex items-center gap-4 transition-all hover:shadow-md",
                  selectedDoctorId === doc.id.toString() ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-white"
                )}
              >
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                  <Stethoscope className="h-6 w-6 text-slate-500" />
                </div>
                <div>
                  <p className="font-bold text-sm">Dr. {doc.user.firstName} {doc.user.lastName}</p>
                  <p className="text-xs text-muted-foreground">{doc.specialization}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {selectedDoctorId && (
          <section className="animate-fade-in-up">
            <Label className="text-base font-semibold mb-3 block">Choose Date & Time</Label>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="bg-white p-4 rounded-xl border shadow-sm inline-block">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="p-0"
                />
              </div>

              <div className="flex-1">
                <Label className="mb-2 block text-sm text-muted-foreground">Available Slots</Label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot}
                      variant={time === slot ? "default" : "outline"}
                      onClick={() => setTime(slot)}
                      className="w-full"
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {selectedDoctorId && date && time && (
          <section className="animate-fade-in-up">
            <Label className="text-base font-semibold mb-3 block">Reason for Visit</Label>
            <Textarea
              placeholder="Briefly describe your symptoms..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none"
              rows={4}
            />

            <Button
              size="lg"
              className="w-full mt-6 text-lg h-12"
              onClick={handleSubmit}
              disabled={createAppointment.isPending}
            >
              {createAppointment.isPending ? <Loader2 className="animate-spin mr-2" /> : "Confirm Booking"}
            </Button>
          </section>
        )}
      </div>
    </div>
  );
}
