export interface MaintenanceInfo {
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  location?: string | null;
}

export interface MaintenanceResponse {
  success: boolean;
  nextMaintenance: MaintenanceInfo | null;
  error?: string;
}
