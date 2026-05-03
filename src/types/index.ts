// =====================================================
// TYPES ALERTSAPEUR — Dashboard Dispatcher
// =====================================================

export interface AlertMedia {
  file: string;
  media_type: 'IMAGE' | 'VIDEO' | 'AUDIO';
}

export type AlertStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED' | 'EXPIRED';

export interface UserInfo {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
}

export interface EmergencyAlert {
  id: number;
  type_nom?: string;
  type_alerte_info?: { nom: string };
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  description: string;
  severity_label?: string;
  severity?: number;
  statut: AlertStatus;
  statut_label?: string;
  medias?: AlertMedia[];
  date_creation: string;
  emetteur?: number;
  emetteur_info?: UserInfo;
  agent_assignee_info?: UserInfo | null;
}

export interface Agent {
  id: number;
  full_name: string;
  matricule: string;
  phone_number: string;
  role_label: string;
}

export interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  role: 'DISPATCHER' | 'AGENT' | 'CITIZEN';
  structure_nom: string;
  structure_type: 'POLICE' | 'POMPIERS' | 'SAMU';
}

export interface DashboardStats {
  total_alerts: number;
  pending_alerts: number;
  in_progress_alerts: number;
  resolved_alerts: number;
  available_agents: number;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}
