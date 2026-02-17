import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type CreatePatientRequest, type CreateDoctorRequest, type UpdatePatientRequest } from "@shared/contracts";
import { useAuth } from "@/hooks/use-auth";

import { fetchWithAuth } from "@/lib/api";

// Hook to check current user's role profile
export function useUserProfiles() {
  const { user } = useAuth();

  const patientQuery = useQuery({
    queryKey: [api.patients.me.path],
    queryFn: async () => {
      const res = await fetchWithAuth(api.patients.me.path);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch patient profile");
      return api.patients.me.responses[200].parse(await res.json());
    },
    enabled: !!user && user.role === "patient",
    retry: false,
  });

  const doctorQuery = useQuery({
    queryKey: [api.doctors.me.path],
    queryFn: async () => {
      const res = await fetchWithAuth(api.doctors.me.path);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch doctor profile");
      return api.doctors.me.responses[200].parse(await res.json());
    },
    enabled: !!user && user.role === "doctor",
    retry: false,
  });

  return {
    patientProfile: patientQuery.data,
    doctorProfile: doctorQuery.data,
    isLoading: (user?.role === "patient" ? patientQuery.isLoading : false) ||
      (user?.role === "doctor" ? doctorQuery.isLoading : false),
    isDoctor: !!doctorQuery.data,
    isPatient: !!patientQuery.data,
  };
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePatientRequest) => {
      const res = await fetchWithAuth(api.patients.create.path, {
        method: api.patients.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create profile");
      return api.patients.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.patients.me.path] });
    },
  });
}


export function useCreateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateDoctorRequest) => {
      const res = await fetchWithAuth(api.doctors.create.path, {
        method: api.doctors.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create profile");
      return api.doctors.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.doctors.me.path] });
    },
  });
}

export function useDoctorsList() {
  return useQuery({
    queryKey: [api.doctors.list.path],
    queryFn: async () => {
      const res = await fetchWithAuth(api.doctors.list.path);
      if (!res.ok) throw new Error("Failed to fetch doctors");
      return api.doctors.list.responses[200].parse(await res.json());
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdatePatientRequest) => {
      const res = await fetchWithAuth(api.patients.update.path, {
        method: api.patients.update.method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return api.patients.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.patients.me.path] });
    },
  });
}

export function usePatientsList(query?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [api.patients.list.path, query],
    queryFn: async () => {
      const url = new URL(api.patients.list.path, window.location.origin);
      if (query) url.searchParams.append("query", query);

      const res = await fetchWithAuth(url.toString());
      if (!res.ok) throw new Error("Failed to fetch patients");
      return api.patients.list.responses[200].parse(await res.json());
    },
    enabled: !!user,
  });
}
