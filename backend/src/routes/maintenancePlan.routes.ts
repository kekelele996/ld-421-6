import { maintenancePlanController } from "../controllers/maintenancePlan.controller.ts";

export function maintenancePlanRoutes(method: string, path: string, query: URLSearchParams, user: never, body: Record<string, unknown>) {
  if (method === "GET" && path === "/api/maintenance/plans") return maintenancePlanController.listPlans(query);
  if (method === "POST" && path === "/api/maintenance/plans") return maintenancePlanController.createPlan(user, body);
  if (method === "GET" && path.startsWith("/api/maintenance/plans/")) {
    const id = path.split("/")[4];
    if (id === "dashboard") return maintenancePlanController.dashboard();
    if (id === "upcoming") return maintenancePlanController.upcoming(query);
    return maintenancePlanController.getPlan(id);
  }
  if (method === "PATCH" && path.startsWith("/api/maintenance/plans/")) {
    const id = path.split("/")[4];
    return maintenancePlanController.updatePlan(user, id, body);
  }
  if (method === "DELETE" && path.startsWith("/api/maintenance/plans/")) {
    const id = path.split("/")[4];
    return maintenancePlanController.deletePlan(user, id);
  }
  if (method === "POST" && path.startsWith("/api/maintenance/plans/") && path.endsWith("/toggle")) {
    const id = path.split("/")[4];
    return maintenancePlanController.togglePlanStatus(user, id);
  }
  if (method === "POST" && path === "/api/maintenance/plans/generate-todos") {
    return maintenancePlanController.generateTodos(user, body.planId as string | undefined);
  }

  if (method === "GET" && path === "/api/maintenance/todos") return maintenancePlanController.listTodos(query);
  if (method === "GET" && path.startsWith("/api/maintenance/todos/")) {
    const id = path.split("/")[4];
    return maintenancePlanController.getTodo(id);
  }
  if (method === "PATCH" && path.startsWith("/api/maintenance/todos/")) {
    const id = path.split("/")[4];
    if (path.endsWith("/execute")) {
      return maintenancePlanController.executeTodo(user, id, body);
    }
    return maintenancePlanController.updateTodoStatus(user, id, body);
  }

  return undefined;
}
