import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { api, buildUrl } from "@shared/routes";
import type { CreateAppointmentRequest } from "@shared/contracts";
import { fetchWithAuth } from "@/lib/api";

export function useAppointments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [api.appointments.list.path],
    queryFn: async () => {
      const res = await fetchWithAuth(api.appointments.list.path);
      if (!res.ok) throw new Error("Failed to fetch appointments");
      // The API returns complex joined data which we typed as any in the route manifest for simplicity
      // In a strict setup, we would define a Zod schema for the joined response
      return await res.json();
    },
    enabled: !!user,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAppointmentRequest) => {
      const validated = api.appointments.create.input.parse(data);
      const res = await fetchWithAuth(api.appointments.create.path, {
        method: api.appointments.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      if (!res.ok) throw new Error("Failed to create appointment");
      return api.appointments.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.appointments.list.path] }),
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const url = buildUrl(api.appointments.updateStatus.path, { id });
      const res = await fetchWithAuth(url, {
        method: api.appointments.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return api.appointments.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.appointments.list.path] }),
  });
}
