import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type CreateVisitRequest, type UpdateVisitRequest } from "@shared/contracts";

import { fetchWithAuth } from "@/lib/api";

export function useVisits(params?: { date?: Date, doctorId?: string }) {
    return useQuery({
        queryKey: [api.visits.list.path, params?.date, params?.doctorId],
        queryFn: async () => {
            const url = new URL(api.visits.list.path, window.location.origin);
            if (params?.date) url.searchParams.append("date", params.date.toISOString());
            if (params?.doctorId) url.searchParams.append("doctorId", params.doctorId);

            const res = await fetchWithAuth(url.toString());
            if (!res.ok) throw new Error("Failed to fetch visits");
            return api.visits.list.responses[200].parse(await res.json());
        },
    });
}

export function useCreateVisit() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateVisitRequest) => {
            const res = await fetchWithAuth(api.visits.create.path, {
                method: api.visits.create.method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to create visit");
            return api.visits.create.responses[201].parse(await res.json());
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [api.visits.list.path] });
        },
    });
}

export function useUpdateVisit() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string, data: UpdateVisitRequest }) => {
            const url = api.visits.update.path.replace(":id", id);
            const res = await fetchWithAuth(url, {
                method: api.visits.update.method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update visit");
            return api.visits.update.responses[200].parse(await res.json());
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [api.visits.list.path] });
        },
    });
}
