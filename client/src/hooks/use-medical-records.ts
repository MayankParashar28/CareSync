import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type CreateMedicalRecordRequest, type CreateMediaFileRequest } from "@shared/contracts";

import { fetchWithAuth } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

export function useMedicalRecords(patientId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [api.medicalRecords.list.path, patientId],
    queryFn: async () => {
      const url = new URL(api.medicalRecords.list.path, window.location.origin);
      if (patientId) url.searchParams.append("patientId", patientId);

      const res = await fetchWithAuth(url.toString());
      if (!res.ok) throw new Error("Failed to fetch medical records");
      return api.medicalRecords.list.responses[200].parse(await res.json());
    },
    enabled: !!user,
  });
}

export function useCreateMedicalRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateMedicalRecordRequest) => {
      const res = await fetchWithAuth(api.medicalRecords.create.path, {
        method: api.medicalRecords.create.method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create medical record");
      return api.medicalRecords.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.medicalRecords.list.path, variables.patientId] });
    },
  });
}

export function useMediaFiles(patientId?: string) {
  return useQuery({
    queryKey: [api.mediaFiles.list.path, patientId],
    queryFn: async () => {
      const url = new URL(api.mediaFiles.list.path, window.location.origin);
      if (patientId) url.searchParams.append("patientId", patientId);

      const res = await fetchWithAuth(url.toString());
      if (!res.ok) throw new Error("Failed to fetch media files");
      return api.mediaFiles.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateMediaFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateMediaFileRequest) => {
      const res = await fetchWithAuth(api.mediaFiles.create.path, {
        method: api.mediaFiles.create.method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to upload media file");
      return api.mediaFiles.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.mediaFiles.list.path, variables.patientId] });
    },
  });
}
