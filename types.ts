
import { Type } from "@google/genai";

export { Type };

export enum Role {
  ADMIN = 'ADMIN',
  RECEPTION = 'RECEPTION',
  HOUSEKEEPING = 'HOUSEKEEPING',
  MAINTENANCE = 'TECHNICAL',
  WAREHOUSE = 'WAREHOUSE',
  ACCOUNTANT = 'ACCOUNTANT',
  SUPERVISOR = 'SUPERVISOR',
}

export enum CabinStatus {
  OCCUPIED = 'OCCUPIED',
  EMPTY_DIRTY = 'EMPTY_DIRTY',
  EMPTY_CLEAN = 'EMPTY_CLEAN',
  ISSUE_TECH = 'ISSUE_TECH',
  ISSUE_CLEAN = 'ISSUE_CLEAN',
  UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
}

export enum IssueType {
  TECHNICAL = 'TECHNICAL',
  CLEANING = 'CLEANING',
}

export enum IssueStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CANCELLED = 'CANCELLED'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  lastRestocked: string;
}

export interface User { 
  id: string; 
  username: string; 
  password?: string; 
  role: Role; 
  createdAt: string; 
  lastLogin?: string; 
}

export interface Cabin { 
  id: string; 
  name: string; 
  status: CabinStatus; 
  icon?: string; 
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH'; 
  pendingCleaningId?: string; 
}

export interface Stay { 
  id: string; 
  cabinId: string; 
  guestId?: string; 
  guestName?: string; 
  guestPhone?: string; 
  guestCount?: number; 
  nights?: number; 
  isActive: boolean; 
  stayDate: string; 
  checkInDate?: string; 
  checkOutDate?: string; 
  createdBy?: string; 
  createdAt: string;
  actualCheckoutAt?: string;
}

export interface Issue {
  id: string;
  cabinId?: string | null;
  title: string;
  type: IssueType;
  priority: Priority;
  description: string;
  reportedBy: string;
  status: IssueStatus;
  reportedAt: string;
  resolvedAt?: string;
  slaDeadline?: string;
  isSynced?: boolean;
}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface Log { id: string; userId: string; username: string; action: string; details: string; timestamp: string; }
export interface Notification { id: string; title: string; message: string; timestamp: string; read: boolean; link?: string; priority?: Priority; }
export interface Guest { id: string; firstName: string; lastName: string; phone: string; createdAt: string; }
export interface CleaningChecklist { id: string; cabinId: string; items: Record<string, boolean>; filledBy: string; approvedBy?: string; status: 'SUBMITTED' | 'APPROVED'; createdAt: string; approvedAt?: string; }
export interface AIChatMessage { id: string; role: 'user' | 'model'; text: string; timestamp: string; }

// Added missing interface for staff analytics
export interface StaffReward {
  id: string;
  staffId: string;
  username: string;
  period: string;
  baseSalary: number;
  performanceBonus: number;
  penalty: number;
  finalPay: number;
  explanation: string;
  status: 'PENDING' | 'PAID';
  createdAt: string;
}

// Added missing interface for staff training
export interface StaffTraining {
  id: string;
  staffId: string;
  topic: string;
  reason: string;
  content: string;
  status: 'ASSIGNED' | 'COMPLETED';
  createdAt: string;
}
