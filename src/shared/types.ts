// Delte typer mellom client og server

export enum UserRole {
  ADMIN = 'ADMIN',
  BORROWER = 'BORROWER',
}

export enum LoanStatus {
  ACTIVE = 'ACTIVE',
  RETURNED = 'RETURNED',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export enum PhotoType {
  LOAN = 'LOAN',
  RETURN = 'RETURN',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Loan {
  id: string;
  userId: string;
  itemName: string;
  description?: string;
  loanLocation?: string;
  returnLocation?: string;
  loanedAt: Date;
  returnedAt?: Date;
  status: LoanStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  loanPhotos?: LoanPhoto[];
}

export interface LoanPhoto {
  id: string;
  loanId: string;
  photoUrl: string;
  type: PhotoType;
  caption?: string;
  uploadedAt: Date;
}

// API request/response typer
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CreateLoanRequest {
  itemName: string;
  description?: string;
  loanLocation?: string;
  photos?: File[];
}

export interface ReturnLoanRequest {
  loanId: string;
  returnLocation?: string;
  notes?: string;
  photos?: File[];
}

export interface ApproveUserRequest {
  userId: string;
  approved: boolean;
}

// API error typer
export interface ApiError {
  message: string;
  code?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
}