import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type CreatePaymentRequest, type UpdatePaymentStatusRequest } from "@shared/contracts";

import { fetchWithAuth } from "@/lib/api";

export function usePayments(params?: { date?: Date }) {
    return useQuery({
        queryKey: [api.payments.list.path, params?.date],
        queryFn: async () => {
            const url = new URL(api.payments.list.path, window.location.origin);
            if (params?.date) url.searchParams.append("date", params.date.toISOString());

            const res = await fetchWithAuth(url.toString());
            if (!res.ok) throw new Error("Failed to fetch payments");
            return api.payments.list.responses[200].parse(await res.json());
        },
    });
}

export function useCreatePayment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreatePaymentRequest) => {
            const res = await fetchWithAuth(api.payments.create.path, {
                method: api.payments.create.method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to create payment");
            return api.payments.create.responses[201].parse(await res.json());
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [api.payments.list.path] });
        },
    });
}

export function useUpdatePayment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string, data: UpdatePaymentStatusRequest }) => {
            const url = api.payments.update.path.replace(":id", id);
            const res = await fetchWithAuth(url, {
                method: api.payments.update.method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update payment");
            return api.payments.update.responses[200].parse(await res.json());
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [api.payments.list.path] });
        },
    });
}
