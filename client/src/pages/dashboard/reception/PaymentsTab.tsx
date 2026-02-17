import { useState } from "react";
import { usePayments, useCreatePayment } from "@/hooks/use-payments";
import { usePatientsList } from "@/hooks/use-profiles";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function PaymentsTab() {
    const { data: payments, isLoading } = usePayments();
    const { data: patients } = usePatientsList(); // Need list to select patient
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const { toast } = useToast();
    const createPaymentMutation = useCreatePayment();

    type PaymentMethod = "cash" | "card" | "upi";
    type PaymentStatus = "pending" | "paid" | "refunded";
    const [formData, setFormData] = useState({
        patientId: "",
        amount: "",
        method: "cash" as PaymentMethod,
        status: "paid" as PaymentStatus,
    });

    const handleSubmit = () => {
        if (!formData.patientId || !formData.amount) return;

        createPaymentMutation.mutate({
            patientId: formData.patientId,
            amount: parseInt(formData.amount),
            paymentDate: new Date().toISOString(),
            paymentMethod: formData.method,
            status: formData.status
        }, {
            onSuccess: () => {
                setIsCreateOpen(false);
                setFormData({ patientId: "", amount: "", method: "cash", status: "paid" });
                toast({ title: "Success", description: "Payment recorded successfully" });
            },
            onError: (err) => {
                toast({ title: "Error", description: err.message, variant: "destructive" });
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold font-display">Recent Transactions</h2>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Record Payment
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Record Payment</DialogTitle>
                            <DialogDescription>Enter payment details for a patient.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Select Patient</Label>
                                <Select
                                    value={formData.patientId}
                                    onValueChange={(val) => setFormData({ ...formData, patientId: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Patient" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {patients?.map((p: any) => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.user?.firstName} {p.user?.lastName} ({p.user?.phone})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Amount (₹)</Label>
                                <Input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Payment Method</Label>
                                <Select
                                    value={formData.method}
                                    onValueChange={(val) => setFormData({ ...formData, method: val as PaymentMethod })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="card">Card</SelectItem>
                                        <SelectItem value="upi">UPI</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(val) => setFormData({ ...formData, status: val as PaymentStatus })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="refunded">Refunded</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSubmit} disabled={createPaymentMutation.isPending || !formData.patientId || !formData.amount}>
                                {createPaymentMutation.isPending ? "Recording..." : "Record Payment"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            {isLoading ? (
                <Skeleton className="h-48 w-full rounded-xl" />
            ) : payments && payments.length > 0 ? (
                <div className="space-y-4">
                    {payments.map((payment: any) => (
                        <Card key={payment.id} className="hover:shadow-md transition-all">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold">{payment.patient?.user?.firstName} {payment.patient?.user?.lastName}</h3>
                                    <p className="text-sm text-muted-foreground">Amount: ₹{payment.amount}</p>
                                </div>
                                <div>
                                    <StatusBadge status={payment.status} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    No payments found.
                </div>
            )}
        </div>
    );
}
