import { equipment, maintenancePlans, maintenanceRecords, maintenanceTodos, users } from "../database/seeds/seed.ts";
import { CycleUnit, MaintenancePlanStatus, MaintenanceTodoStatus, MaintenanceType } from "../types/enums.ts";
import type { MaintenancePlan, MaintenanceTodo, User } from "../types/interfaces.ts";
import { ApiError } from "../utils/response.ts";

function addCycle(dateStr: string, value: number, unit: string): string {
  const date = new Date(dateStr);
  switch (unit) {
    case CycleUnit.Day:
      date.setDate(date.getDate() + value);
      break;
    case CycleUnit.Week:
      date.setDate(date.getDate() + value * 7);
      break;
    case CycleUnit.Month:
      date.setMonth(date.getMonth() + value);
      break;
    case CycleUnit.Year:
      date.setFullYear(date.getFullYear() + value);
      break;
  }
  return date.toISOString().slice(0, 10);
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const maintenancePlanService = {
  listPlans(categoryId?: string, status?: string) {
    let result = [...maintenancePlans];
    if (categoryId) result = result.filter((p) => p.categoryId === categoryId);
    if (status) result = result.filter((p) => p.status === status);
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getPlan(id: string) {
    const plan = maintenancePlans.find((p) => p.id === id);
    if (!plan) throw new ApiError(404, "PLAN_NOT_FOUND", "维护计划不存在");
    return plan;
  },

  createPlan(input: Partial<MaintenancePlan>, user: User) {
    if (!input.name) throw new ApiError(400, "NAME_REQUIRED", "计划名称必填");
    if (!input.categoryId) throw new ApiError(400, "CATEGORY_REQUIRED", "必须选择设备类别");
    if (!input.type) throw new ApiError(400, "TYPE_REQUIRED", "必须选择维护类型");
    if (!input.cycleValue || input.cycleValue <= 0) throw new ApiError(400, "CYCLE_REQUIRED", "周期值必须大于0");
    if (!input.cycleUnit) throw new ApiError(400, "CYCLE_UNIT_REQUIRED", "必须选择周期单位");

    const plan: MaintenancePlan = {
      id: generateId("mp"),
      name: input.name,
      categoryId: input.categoryId,
      type: input.type as MaintenanceType,
      cycleValue: input.cycleValue,
      cycleUnit: input.cycleUnit,
      remindDaysBefore: input.remindDaysBefore ?? 7,
      content: input.content ?? "例行维护",
      status: MaintenancePlanStatus.Active,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    maintenancePlans.unshift(plan);
    return plan;
  },

  updatePlan(id: string, input: Partial<MaintenancePlan>, user: User) {
    const plan = this.getPlan(id);
    if (input.name !== undefined) plan.name = input.name;
    if (input.categoryId !== undefined) plan.categoryId = input.categoryId;
    if (input.type !== undefined) plan.type = input.type;
    if (input.cycleValue !== undefined) plan.cycleValue = input.cycleValue;
    if (input.cycleUnit !== undefined) plan.cycleUnit = input.cycleUnit;
    if (input.remindDaysBefore !== undefined) plan.remindDaysBefore = input.remindDaysBefore;
    if (input.content !== undefined) plan.content = input.content;
    plan.updatedAt = new Date().toISOString();
    return plan;
  },

  deletePlan(id: string) {
    const index = maintenancePlans.findIndex((p) => p.id === id);
    if (index === -1) throw new ApiError(404, "PLAN_NOT_FOUND", "维护计划不存在");
    maintenancePlans.splice(index, 1);
    return { success: true };
  },

  togglePlanStatus(id: string) {
    const plan = this.getPlan(id);
    plan.status = plan.status === MaintenancePlanStatus.Active
      ? MaintenancePlanStatus.Inactive
      : MaintenancePlanStatus.Active;
    plan.updatedAt = new Date().toISOString();
    return plan;
  },

  generateTodosForPlan(planId: string) {
    const plan = this.getPlan(planId);
    if (plan.status !== MaintenancePlanStatus.Active) {
      throw new ApiError(400, "PLAN_INACTIVE", "计划未启用，无法生成待办");
    }

    const categoryEquipments = equipment.filter((e) => {
      if (e.categoryId === plan.categoryId) return true;
      const parentCat = equipment.find((eq) => eq.id === e.categoryId);
      return parentCat && (parentCat as unknown as { parentId?: string }).parentId === plan.categoryId;
    });

    const directEquipments = equipment.filter((e) => e.categoryId === plan.categoryId);

    const generated: MaintenanceTodo[] = [];
    const today = new Date().toISOString().slice(0, 10);

    directEquipments.forEach((eq) => {
      const lastTodo = maintenanceTodos
        .filter((t) => t.planId === planId && t.equipmentId === eq.id)
        .sort((a, b) => new Date(b.planDate).getTime() - new Date(a.planDate).getTime())[0];

      const lastRecord = maintenanceRecords
        .filter((r) => r.equipmentId === eq.id && r.planId === planId)
        .sort((a, b) => new Date(b.maintenanceDate).getTime() - new Date(a.maintenanceDate).getTime())[0];

      let nextDate: string;
      if (lastRecord) {
        nextDate = addCycle(lastRecord.maintenanceDate, plan.cycleValue, plan.cycleUnit);
      } else if (lastTodo) {
        nextDate = lastTodo.planDate;
      } else {
        nextDate = addCycle(today, plan.cycleValue, plan.cycleUnit);
      }

      const dueDate = addCycle(nextDate, -plan.remindDaysBefore, CycleUnit.Day);

      const existingPending = maintenanceTodos.find(
        (t) => t.planId === planId && t.equipmentId === eq.id &&
          (t.status === MaintenanceTodoStatus.Pending || t.status === MaintenanceTodoStatus.InProgress || t.status === MaintenanceTodoStatus.Overdue)
      );

      if (!existingPending && new Date(nextDate).getTime() > Date.now()) {
        const todo: MaintenanceTodo = {
          id: generateId("td"),
          planId: plan.id,
          equipmentId: eq.id,
          type: plan.type,
          content: plan.content,
          planDate: nextDate,
          dueDate: dueDate,
          status: MaintenanceTodoStatus.Pending,
          createdAt: new Date().toISOString()
        };
        maintenanceTodos.unshift(todo);
        generated.push(todo);
      }
    });

    return { generated, count: generated.length };
  },

  generateAllTodos() {
    const activePlans = maintenancePlans.filter((p) => p.status === MaintenancePlanStatus.Active);
    let totalGenerated = 0;
    activePlans.forEach((plan) => {
      const result = this.generateTodosForPlan(plan.id);
      totalGenerated += result.count;
    });
    return { totalGenerated };
  },

  listTodos(status?: string, equipmentId?: string, planId?: string) {
    let result = [...maintenanceTodos];
    if (status) result = result.filter((t) => t.status === status);
    if (equipmentId) result = result.filter((t) => t.equipmentId === equipmentId);
    if (planId) result = result.filter((t) => t.planId === planId);
    return result.sort((a, b) => new Date(a.planDate).getTime() - new Date(b.planDate).getTime());
  },

  getTodo(id: string) {
    const todo = maintenanceTodos.find((t) => t.id === id);
    if (!todo) throw new ApiError(404, "TODO_NOT_FOUND", "维护待办不存在");
    return todo;
  },

  updateTodoStatus(id: string, status: string, assigneeId?: string) {
    const todo = this.getTodo(id);
    todo.status = status as MaintenanceTodoStatus;
    if (assigneeId) todo.assigneeId = assigneeId;
    if (status === MaintenanceTodoStatus.Completed) {
      todo.completedAt = new Date().toISOString();
    }
    return todo;
  },

  executeTodo(id: string, payload: { cost?: number; result?: string; content?: string; maintainerId?: string }, user: User) {
    const todo = this.getTodo(id);
    const plan = maintenancePlans.find((p) => p.id === todo.planId);

    const nextDate = addCycle(todo.planDate, plan ? plan.cycleValue : 3, plan ? plan.cycleUnit : CycleUnit.Month);

    const record = {
      id: generateId("mt"),
      equipmentId: todo.equipmentId,
      type: todo.type,
      content: payload.content ?? todo.content,
      maintenanceDate: new Date().toISOString().slice(0, 10),
      nextMaintenanceDate: nextDate,
      cost: Number(payload.cost ?? 0),
      maintainerId: payload.maintainerId ?? user.id,
      result: payload.result ?? "Pass",
      planId: todo.planId,
      todoId: todo.id
    };
    maintenanceRecords.unshift(record);

    todo.status = MaintenanceTodoStatus.Completed;
    todo.completedAt = new Date().toISOString();

    if (plan && plan.status === MaintenancePlanStatus.Active) {
      const newDueDate = addCycle(nextDate, -(plan.remindDaysBefore || 7), CycleUnit.Day);
      const newTodo: MaintenanceTodo = {
        id: generateId("td"),
        planId: plan.id,
        equipmentId: todo.equipmentId,
        type: plan.type,
        content: plan.content,
        planDate: nextDate,
        dueDate: newDueDate,
        status: MaintenanceTodoStatus.Pending,
        createdAt: new Date().toISOString()
      };
      maintenanceTodos.unshift(newTodo);
    }

    return { record, todo };
  },

  getUpcomingTodos(days: number = 30) {
    const cutoff = new Date(Date.now() + days * 86400000).getTime();
    return maintenanceTodos
      .filter((t) => {
        const planTime = new Date(t.planDate).getTime();
        return planTime <= cutoff &&
          (t.status === MaintenanceTodoStatus.Pending || t.status === MaintenanceTodoStatus.Overdue || t.status === MaintenanceTodoStatus.InProgress);
      })
      .sort((a, b) => new Date(a.planDate).getTime() - new Date(b.planDate).getTime());
  },

  getOverdueTodos() {
    return maintenanceTodos
      .filter((t) => {
        const dueTime = new Date(t.dueDate).getTime();
        return dueTime < Date.now() &&
          (t.status === MaintenanceTodoStatus.Pending || t.status === MaintenanceTodoStatus.Overdue);
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  },

  dashboard() {
    const activePlans = maintenancePlans.filter((p) => p.status === MaintenancePlanStatus.Active).length;
    const pendingTodos = maintenanceTodos.filter((t) => t.status === MaintenanceTodoStatus.Pending).length;
    const overdueTodos = maintenanceTodos.filter((t) => t.status === MaintenanceTodoStatus.Overdue).length;
    const inProgressTodos = maintenanceTodos.filter((t) => t.status === MaintenanceTodoStatus.InProgress).length;
    const upcoming = this.getUpcomingTodos(30);
    const overdue = this.getOverdueTodos();

    const todoWithDetails = upcoming.slice(0, 10).map((todo) => {
      const eq = equipment.find((e) => e.id === todo.equipmentId);
      const plan = maintenancePlans.find((p) => p.id === todo.planId);
      const assignee = todo.assigneeId ? users.find((u) => u.id === todo.assigneeId) : undefined;
      return {
        ...todo,
        equipmentName: eq?.name ?? "",
        equipmentNo: eq?.equipmentNo ?? "",
        planName: plan?.name ?? "",
        assigneeName: assignee?.name ?? ""
      };
    });

    return {
      stats: {
        activePlans,
        pendingTodos,
        overdueTodos,
        inProgressTodos
      },
      upcoming: todoWithDetails,
      overdue: overdue.slice(0, 5).map((todo) => {
        const eq = equipment.find((e) => e.id === todo.equipmentId);
        return { ...todo, equipmentName: eq?.name ?? "" };
      })
    };
  }
};
