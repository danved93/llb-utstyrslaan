import axios, { AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  User,
  Loan,
  CreateLoanRequest,
  ReturnLoanRequest,
  ApproveUserRequest
} from '@/shared/types';

// Base URL for API
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Axios instans med base konfigurasjon
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for å legge til auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for feilhåndtering
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token utløpt eller ugyldig
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export async function login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
  try {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await api.post('/auth/login', {
      email,
      password,
    } as LoginRequest);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.response?.data?.error?.message || 'Innlogging feilet',
      },
    };
  }
}

export async function register(name: string, email: string, password: string): Promise<ApiResponse<AuthResponse>> {
  try {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await api.post('/auth/register', {
      name,
      email,
      password,
    } as RegisterRequest);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.response?.data?.error?.message || 'Registrering feilet',
      },
    };
  }
}

export async function getCurrentUser(token: string): Promise<ApiResponse<{ user: User }>> {
  try {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await api.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.response?.data?.error?.message || 'Kunne ikke hente brukerdata',
      },
    };
  }
}

export async function logout(token: string): Promise<ApiResponse> {
  try {
    const response: AxiosResponse<ApiResponse> = await api.post('/auth/logout', {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.response?.data?.error?.message || 'Utlogging feilet',
      },
    };
  }
}

// User API
export async function getUsers(): Promise<ApiResponse<{ users: User[] }>> {
  try {
    const response: AxiosResponse<ApiResponse<{ users: User[] }>> = await api.get('/users');
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.response?.data?.error?.message || 'Kunne ikke hente brukere',
      },
    };
  }
}

export async function getPendingUsers(): Promise<ApiResponse<{ users: User[] }>> {
  try {
    const response: AxiosResponse<ApiResponse<{ users: User[] }>> = await api.get('/users/pending');
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.response?.data?.error?.message || 'Kunne ikke hente ventende brukere',
      },
    };
  }
}

export async function approveUser(userId: string, approved: boolean): Promise<ApiResponse<{ user: User }>> {
  try {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await api.put(`/users/${userId}/approve`, {
      approved,
    } as ApproveUserRequest);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.response?.data?.error?.message || 'Kunne ikke oppdatere bruker',
      },
    };
  }
}

// Loan API
export async function getLoans(status?: string, page?: number, limit?: number): Promise<ApiResponse<{ loans: Loan[], pagination: any }>> {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());

    const response: AxiosResponse<ApiResponse<{ loans: Loan[], pagination: any }>> = await api.get(`/loans?${params}`);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.response?.data?.error?.message || 'Kunne ikke hente lån',
      },
    };
  }
}

export async function getLoan(loanId: string): Promise<ApiResponse<{ loan: Loan }>> {
  try {
    const response: AxiosResponse<ApiResponse<{ loan: Loan }>> = await api.get(`/loans/${loanId}`);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.response?.data?.error?.message || 'Kunne ikke hente lån',
      },
    };
  }
}

export async function createLoan(loanData: CreateLoanRequest, photos?: File[]): Promise<ApiResponse<{ loan: Loan }>> {
  try {
    const formData = new FormData();
    formData.append('itemName', loanData.itemName);
    if (loanData.description) formData.append('description', loanData.description);
    if (loanData.loanLocation) formData.append('loanLocation', loanData.loanLocation);

    if (photos) {
      photos.forEach((photo) => {
        formData.append('photos', photo);
      });
    }

    const response: AxiosResponse<ApiResponse<{ loan: Loan }>> = await api.post('/loans', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.response?.data?.error?.message || 'Kunne ikke opprette lån',
      },
    };
  }
}

export async function returnLoan(returnData: ReturnLoanRequest, photos?: File[]): Promise<ApiResponse<{ loan: Loan }>> {
  try {
    const formData = new FormData();
    if (returnData.returnLocation) formData.append('returnLocation', returnData.returnLocation);
    if (returnData.notes) formData.append('notes', returnData.notes);

    if (photos) {
      photos.forEach((photo) => {
        formData.append('photos', photo);
      });
    }

    const response: AxiosResponse<ApiResponse<{ loan: Loan }>> = await api.put(`/loans/${returnData.loanId}/return`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.response?.data?.error?.message || 'Kunne ikke registrere retur',
      },
    };
  }
}

export async function getStats(): Promise<ApiResponse<any>> {
  try {
    const response: AxiosResponse<ApiResponse<any>> = await api.get('/loans/stats');
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.response?.data?.error?.message || 'Kunne ikke hente statistikk',
      },
    };
  }
}