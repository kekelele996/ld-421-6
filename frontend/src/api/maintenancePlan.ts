import { API_PATHS } from "../constants/apiPaths";
import { request } from "../utils/request";
import type { MaintenancePlan, MaintenanceTodo, MaintenanceDashboard, MaintenanceRecord } from "../types/maintenance";

export const maintenancePlanApi = {
  listPlans: (params?: { categoryId?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.categoryId) query.set("categoryId", params.categoryId);
    if (params?.status) query.set("status", params.status);
    const queryStr = query.toString() ? `?${query.toString()}` : "";
    return request<MaintenancePlan[]>(`${API_PATHS.maintenancePlans}${queryStr}`);
  },

  getPlan: (id: string) =>
    request<MaintenancePlan>(`${API_PATHS.maintenancePlans}/${id}`),

  createPlan: (payload: Partial<MaintenancePlan>) =>
    request<MaintenancePlan>(API_PATHS.maintenancePlans, {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  updatePlan: (id: string, payload: Partial<MaintenancePlan>) =>
    request<MaintenancePlan>(`${API_PATHS.maintenancePlans}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),

  deletePlan: (id: string) =>
    request<{ success: boolean }>(`${API_PATHS.maintenancePlans}/${id}`, {
      method: "DELETE"
    }),

  togglePlanStatus: (id: string) =>
    request<MaintenancePlan>(`${API_PATHS.maintenancePlans}/${id}/toggle`, {
      method: "POST"
    }),

  generateTodos: (planId?: string) =>
    request<{ totalGenerated?: number; generated?: MaintenanceTodo[]; count?: number }>(
      API_PATHS.maintenanceGenerateTodos,
      {
        method: "POST",
        body: JSON.stringify({ planId })
      }
    ),

  listTodos: (params?: { status?: string; equipmentId?: string; planId?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.equipmentId) query.set("equipmentId", params.equipmentId);
    if (params?.planId) query.set("planId", params.planId);
    const queryStr = query.toString() ? `?${query.toString()}` : "";
    return request<MaintenanceTodo[]>(`${API_PATHS.maintenanceTodos}${queryStr}`);
  },

  getTodo: (id: string) =>
    request<MaintenanceTodo>(`${API_PATHS.maintenanceTodos}/${id}`),

  updateTodoStatus: (id: string, status: string, assigneeId?: string) =>
    request<MaintenanceTodo>(`${API_PATHS.maintenanceTodos}/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status, assigneeId })
    }),

  executeTodo: (id: string, payload: { cost?: number; result?: string; content?: string; maintainerId?: string }) =>
    request<{ record: MaintenanceRecord; todo: MaintenanceTodo }>(
      `${API_PATHS.maintenanceTodos}/${id}/execute`,
      {
        method: "PATCH",
        body: JSON.stringify(payload)
      }
    ),

  dashboard: () =>
    request<MaintenanceDashboard>(API_PATHS.maintenanceDashboard),

  upcoming: (days: number = 30) =>
    request<MaintenanceTodo[]>(`${API_PATHS.maintenanceUpcoming}?days=${days}`)
};
