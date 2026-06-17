import type { User } from "../types/interfaces.ts";
import { maintenancePlanService } from "../services/maintenancePlan.service.ts";
import { auditLogMiddleware } from "../middlewares/auditLog.middleware.ts";
import { rbacMiddleware } from "../middlewares/rbac.middleware.ts";

export const maintenancePlanController = {
  listPlans(query: URLSearchParams) {
    const categoryId = query.get("categoryId") ?? undefined;
    const status = query.get("status") ?? undefined;
    return maintenancePlanService.listPlans(categoryId, status);
  },

  getPlan(id: string) {
    return maintenancePlanService.getPlan(id);
  },

  createPlan(user: User, body: Record<string, unknown>) {
    rbacMiddleware(user, ["Admin", "LabManager"]);
    const plan = maintenancePlanService.createPlan(body, user);
    auditLogMiddleware(user, "CREATE_MAINTENANCE_PLAN", "MaintenancePlan", plan.id);
    return plan;
  },

  updatePlan(user: User, id: string, body: Record<string, unknown>) {
    rbacMiddleware(user, ["Admin", "LabManager"]);
    const plan = maintenancePlanService.updatePlan(id, body, user);
    auditLogMiddleware(user, "UPDATE_MAINTENANCE_PLAN", "MaintenancePlan", id);
    return plan;
  },

  deletePlan(user: User, id: string) {
    rbacMiddleware(user, ["Admin", "LabManager"]);
    const result = maintenancePlanService.deletePlan(id);
    auditLogMiddleware(user, "DELETE_MAINTENANCE_PLAN", "MaintenancePlan", id);
    return result;
  },

  togglePlanStatus(user: User, id: string) {
    rbacMiddleware(user, ["Admin", "LabManager"]);
    const plan = maintenancePlanService.togglePlanStatus(id);
    auditLogMiddleware(user, "TOGGLE_MAINTENANCE_PLAN", "MaintenancePlan", id);
    return plan;
  },

  generateTodos(user: User, planId?: string) {
    rbacMiddleware(user, ["Admin", "LabManager"]);
    if (planId) {
      return maintenancePlanService.generateTodosForPlan(planId);
    }
    return maintenancePlanService.generateAllTodos();
  },

  listTodos(query: URLSearchParams) {
    const status = query.get("status") ?? undefined;
    const equipmentId = query.get("equipmentId") ?? undefined;
    const planId = query.get("planId") ?? undefined;
    return maintenancePlanService.listTodos(status, equipmentId, planId);
  },

  getTodo(id: string) {
    return maintenancePlanService.getTodo(id);
  },

  updateTodoStatus(user: User, id: string, body: Record<string, unknown>) {
    rbacMiddleware(user, ["Admin", "LabManager"]);
    const todo = maintenancePlanService.updateTodoStatus(id, body.status as string, body.assigneeId as string | undefined);
    auditLogMiddleware(user, "UPDATE_TODO_STATUS", "MaintenanceTodo", id);
    return todo;
  },

  executeTodo(user: User, id: string, body: Record<string, unknown>) {
    rbacMiddleware(user, ["Admin", "LabManager"]);
    const result = maintenancePlanService.executeTodo(id, body, user);
    auditLogMiddleware(user, "EXECUTE_MAINTENANCE_TODO", "MaintenanceTodo", id);
    return result;
  },

  dashboard() {
    return maintenancePlanService.dashboard();
  },

  upcoming(query: URLSearchParams) {
    const days = Number(query.get("days") ?? 30);
    return maintenancePlanService.getUpcomingTodos(days);
  }
};
