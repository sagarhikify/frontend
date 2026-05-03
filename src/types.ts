/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface Notice {
  id: string;
  userId: string;
  title: string;
  originalText: string;
  simplifiedSummary: string;
  kannadaSummary?: string;
  category: 'Legal' | 'Health' | 'Education' | 'Employment' | 'Other';
  status: 'Pending' | 'Processed' | 'Completed';
  deadlines: Deadline[];
  fees?: string;
  eligibility?: string;
  actions: ActionItem[];
  createdAt: string;
}

export interface Deadline {
  id: string;
  label: string;
  date: string;
  isUrgent: boolean;
}

export interface ActionItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: string;
}

export type Page = 
  | 'dashboard' 
  | 'upload' 
  | 'view' 
  | 'timeline' 
  | 'history' 
  | 'analytics' 
  | 'admin' 
  | 'profile' 
  | 'notifications';
