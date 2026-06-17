export const AssetStatus = {
  Available: "Available",
  InUse: "InUse",
  Maintenance: "Maintenance",
  Retired: "Retired",
  Lost: "Lost"
} as const;

export const BorrowStatus = {
  Pending: "Pending",
  Approved: "Approved",
  Rejected: "Rejected",
  Returned: "Returned",
  Overdue: "Overdue"
} as const;

export const MaintenanceType = {
  Preventive: "Preventive",
  Corrective: "Corrective",
  Calibration: "Calibration",
  Cleaning: "Cleaning"
} as const;

export const MaintenancePlanStatus = {
  Active: "Active",
  Inactive: "Inactive"
} as const;

export const MaintenanceTodoStatus = {
  Pending: "Pending",
  InProgress: "InProgress",
  Completed: "Completed",
  Overdue: "Overdue",
  Cancelled: "Cancelled"
} as const;

export const CycleUnit = {
  Day: "Day",
  Week: "Week",
  Month: "Month",
  Year: "Year"
} as const;

export const ReturnCondition = {
  Good: "Good",
  Damaged: "Damaged",
  Lost: "Lost"
} as const;

export type AssetStatusValue = (typeof AssetStatus)[keyof typeof AssetStatus];
export type BorrowStatusValue = (typeof BorrowStatus)[keyof typeof BorrowStatus];
export type MaintenanceTypeValue = (typeof MaintenanceType)[keyof typeof MaintenanceType];
export type MaintenancePlanStatusValue = (typeof MaintenancePlanStatus)[keyof typeof MaintenancePlanStatus];
export type MaintenanceTodoStatusValue = (typeof MaintenanceTodoStatus)[keyof typeof MaintenanceTodoStatus];
export type CycleUnitValue = (typeof CycleUnit)[keyof typeof CycleUnit];
export type ReturnConditionValue = (typeof ReturnCondition)[keyof typeof ReturnCondition];
export type UserRole = "Admin" | "LabManager" | "Researcher" | "Student";
