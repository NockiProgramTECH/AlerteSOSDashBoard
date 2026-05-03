import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertService, agentService, authService } from '../services/api';
import { EmergencyAlert, Agent, UserProfile } from '../types';

export const useAlerts = () =>
  useQuery<EmergencyAlert[]>({
    queryKey: ['alerts'],
    queryFn: async () => {
      const { data } = await alertService.getAll();
      return data;
    },
    refetchInterval: 30000, // Rafraîchissement auto toutes les 30s
  });

export const useAlert = (id?: number) =>
  useQuery<EmergencyAlert>({
    queryKey: ['alert', id],
    queryFn: async () => {
      const { data } = await alertService.getById(id!);
      return data;
    },
    enabled: typeof id === 'number' && id > 0,
  });

export const useAgents = () =>
  useQuery<Agent[]>({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data } = await agentService.getAll();
      return data;
    },
  });

export const useMe = () =>
  useQuery<UserProfile>({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await authService.getMe();
      return data;
    },
  });

export const useAssignAgent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ alertId, agentId }: { alertId: number; agentId: number }) =>
      alertService.assign(alertId, agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
};
