import { useState } from "react";
import { useCreateMedicalRecord } from "@/hooks/use-medical-records";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ConsultationFormProps {
    patientId: string;
    doctorId: string; // Current doctor
    appointmentId?: string;
    onSuccess?: () => void;
}

export default function ConsultationForm({ patientId, doctorId, appointmentId, onSuccess }: ConsultationFormProps) {
    const { toast } = useToast();
    const createRecordMutation = useCreateMedicalRecord();

    const [formData, setFormData] = useState({
        symptoms: "",
        diagnosis: "",
        prescription: "",
        notes: "",
        followUp: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        createRecordMutation.mutate({
            patientId,
            doctorId,
            appointmentId: appointmentId || undefined,
            symptoms: formData.symptoms,
            diagnosis: formData.diagnosis,
            prescription: formData.prescription,
            notes: formData.notes,
            followUpDate: formData.followUp ? new Date(formData.followUp).toISOString() : undefined,
        }, {
            onSuccess: () => {
                toast({ title: "Success", description: "Consultation record saved." });
                setFormData({ symptoms: "", diagnosis: "", prescription: "", notes: "", followUp: "" });
                if (onSuccess) onSuccess();
            },
            onError: (err) => {
                toast({ title: "Error", description: err.message, variant: "destructive" });
            }
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>New Consultation Record</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="symptoms">Symptoms</Label>
                        <Textarea
                            id="symptoms"
                            name="symptoms"
                            placeholder="e.g. Fever, Cough, Headache"
                            required
                            value={formData.symptoms}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="diagnosis">Diagnosis</Label>
                        <Input
                            id="diagnosis"
                            name="diagnosis"
                            placeholder="e.g. Viral Fever"
                            required
                            value={formData.diagnosis}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="prescription">Prescription</Label>
                        <Textarea
                            id="prescription"
                            name="prescription"
                            placeholder="e.g. Paracetamol 500mg - 1-0-1 for 3 days"
                            required
                            className="min-h-[100px]"
                            value={formData.prescription}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Clinical Notes</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            placeholder="Additional observations..."
                            value={formData.notes}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="followUp">Follow-up Date (Optional)</Label>
                        <Input
                            id="followUp"
                            name="followUp"
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            value={formData.followUp}
                            onChange={handleChange}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={createRecordMutation.isPending}>
                        {createRecordMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Record"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
