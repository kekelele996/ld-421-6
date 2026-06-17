import type { MaintenanceType, MaintenancePlanStatus, MaintenanceTodoStatus, CycleUnit } from "./enums";

export type MaintenanceRecord = {
  id: string;
  equipmentId: string;
  type: MaintenanceType;
  content: string;
  maintenanceDate: string;
  nextMaintenanceDate: string;
  cost: number;
  maintainerId: string;
  result: "Pass" | "Fail" | "NeedsFollowUp";
  planId?: string;
  todoId?: string;
};

export type MaintenancePlan = {
  id: string;
  name: string;
  categoryId: string;
  type: MaintenanceType;
  cycleValue: number;
  cycleUnit: CycleUnit;
  remindDaysBefore: number;
  content: string;
  status: MaintenancePlanStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type MaintenanceTodo = {
  id: string;
  planId: string;
  equipmentId: string;
  type: MaintenanceType;
  content: string;
  planDate: string;
  dueDate: string;
  status: MaintenanceTodoStatus;
  assigneeId?: string;
  createdAt: string;
  completedAt?: string;
  equipmentName?: string;
  equipmentNo?: string;
  planName?: string;
  assigneeName?: string;
};

export type MaintenanceDashboard = {
  stats: {
    activePlans: number;
    pendingTodos: number;
    overdueTodos: number;
    inProgressTodos: number;
  };
  upcoming: MaintenanceTodo[];
  overdue: MaintenanceTodo[];
};
