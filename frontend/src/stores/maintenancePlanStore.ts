import { create } from "zustand";
import { maintenancePlanApi } from "../api/maintenancePlan";
import type { MaintenancePlan, MaintenanceTodo, MaintenanceDashboard } from "../types/maintenance";

type State = {
  plans: MaintenancePlan[];
  todos: MaintenanceTodo[];
  dashboard: MaintenanceDashboard | null;
  loading: boolean;
  loadPlans: (params?: { categoryId?: string; status?: string }) => Promise<void>;
  loadTodos: (params?: { status?: string; equipmentId?: string; planId?: string }) => Promise<void>;
  loadDashboard: () => Promise<void>;
  createPlan: (payload: Partial<MaintenancePlan>) => Promise<MaintenancePlan>;
  updatePlan: (id: string, payload: Partial<MaintenancePlan>) => Promise<MaintenancePlan>;
  deletePlan: (id: string) => Promise<void>;
  togglePlanStatus: (id: string) => Promise<MaintenancePlan>;
  generateTodos: (planId?: string) => Promise<void>;
  executeTodo: (id: string, payload: { cost?: number; result?: string; content?: string; maintainerId?: string }) => Promise<void>;
  updateTodoStatus: (id: string, status: string, assigneeId?: string) => Promise<MaintenanceTodo>;
};

export const useMaintenancePlanStore = create<State>((set, get) => ({
  plans: [],
  todos: [],
  dashboard: null,
  loading: false,

  loadPlans: async (params) => {
    set({ loading: true });
    try {
      const data = await maintenancePlanApi.listPlans(params);
      set({ plans: data });
    } finally {
      set({ loading: false });
    }
  },

  loadTodos: async (params) => {
    set({ loading: true });
    try {
      const data = await maintenancePlanApi.listTodos(params);
      set({ todos: data });
    } finally {
      set({ loading: false });
    }
  },

  loadDashboard: async () => {
    set({ loading: true });
    try {
      const data = await maintenancePlanApi.dashboard();
      set({ dashboard: data });
    } finally {
      set({ loading: false });
    }
  },

  createPlan: async (payload) => {
    const plan = await maintenancePlanApi.createPlan(payload);
    set((state) => ({ plans: [plan, ...state.plans] }));
    return plan;
  },

  updatePlan: async (id, payload) => {
    const plan = await maintenancePlanApi.updatePlan(id, payload);
    set((state) => ({
      plans: state.plans.map((p) => (p.id === id ? plan : p))
    }));
    return plan;
  },

  deletePlan: async (id) => {
    await maintenancePlanApi.deletePlan(id);
    set((state) => ({
      plans: state.plans.filter((p) => p.id !== id)
    }));
  },

  togglePlanStatus: async (id) => {
    const plan = await maintenancePlanApi.togglePlanStatus(id);
    set((state) => ({
      plans: state.plans.map((p) => (p.id === id ? plan : p))
    }));
    return plan;
  },

  generateTodos: async (planId) => {
    await maintenancePlanApi.generateTodos(planId);
    await get().loadTodos();
  },

  executeTodo: async (id, payload) => {
    await maintenancePlanApi.executeTodo(id, payload);
    await get().loadTodos();
    await get().loadDashboard();
  },

  updateTodoStatus: async (id, status, assigneeId) => {
    const todo = await maintenancePlanApi.updateTodoStatus(id, status, assigneeId);
    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? todo : t))
    }));
    return todo;
  }
}));
