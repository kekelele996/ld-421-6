export type AssetStatus = "Available" | "InUse" | "Maintenance" | "Retired" | "Lost";
export type BorrowStatus = "Pending" | "Approved" | "Rejected" | "Returned" | "Overdue";
export type MaintenanceType = "Preventive" | "Corrective" | "Calibration" | "Cleaning";
export type MaintenancePlanStatus = "Active" | "Inactive";
export type MaintenanceTodoStatus = "Pending" | "InProgress" | "Completed" | "Overdue" | "Cancelled";
export type CycleUnit = "Day" | "Week" | "Month" | "Year";
export type ReturnCondition = "Good" | "Damaged" | "Lost";
export type UserRole = "Admin" | "LabManager" | "Researcher" | "Student";
