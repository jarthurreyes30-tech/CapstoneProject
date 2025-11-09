/**
 * Admin Service
 * 
 * Handles all admin-related API calls for managing users, charities, and system operations.
 */
import axios, { AxiosInstance } from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error('VITE_API_URL is not defined in your .env.local file');
}

// --- Types ---
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  profile_image?: string;
  profile_picture?: string;
  role: 'donor' | 'charity_admin' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  last_login?: string;
  
  // Donor-specific fields
  total_donations?: number;
  total_amount?: number;
  charities_supported?: number;
  campaigns_backed?: number;
  donorProfile?: DonorProfile;
  
  // Charity admin-specific fields
  charity_name?: string;
  charity_status?: 'pending' | 'approved' | 'rejected';
  charity_logo?: string;
  charity_account_status?: 'active' | 'inactive' | 'suspended';
  charity?: {
    id: number;
    name: string;
    verification_status: string;
    status?: 'active' | 'inactive' | 'suspended';
    logo_path?: string;
  };
}

export interface DonorProfile {
  id: number;
  user_id: number;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  gender?: string;
  date_of_birth?: string;
  street_address?: string;
  barangay?: string;
  city?: string;
  province?: string;
  region?: string;
  postal_code?: string;
  country?: string;
  full_address?: string;
  cause_preferences?: string[];
}

export interface Charity {
  id: number;
  owner_id: number;
  name: string;
  acronym?: string;
  legal_trading_name?: string;
  reg_no?: string;
  tax_id?: string;
  mission?: string;
  vision?: string;
  goals?: string;
  description?: string;
  website?: string;
  contact_email: string;
  contact_phone?: string;
  phone?: string;
  address?: string;
  street_address?: string;
  barangay?: string;
  city?: string;
  province?: string;
  region?: string;
  full_address?: string;
  category?: string;
  operating_hours?: string;
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  youtube_url?: string;
  logo_path?: string;
  logo?: string;
  cover_image?: string;
  background_image?: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  verified_at?: string;
  verification_notes?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  owner?: User;
  documents?: CharityDocument[];
  campaigns?: Campaign[];
  campaigns_count?: number;
  donations_count?: number;
  followers_count?: number;
}

export interface CharityDocument {
  id: number;
  charity_id: number;
  doc_type: string;
  document_type: string;
  file_path: string;
  file_url?: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  verified_at?: string;
  verified_by?: number;
  uploaded_at: string;
  created_at: string;
}

export interface Campaign {
  id: number;
  charity_id: number;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  goal?: number;
  raised?: number;
  status: string;
  start_date: string;
  end_date: string;
  donors?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface DashboardMetrics {
  total_users: number;
  total_donors: number;
  total_charity_admins: number;
  charities: number;
  pending_verifications: number;
  campaigns: number;
  donations: number;
}

// --- Admin Service Class ---
class AdminService {
  private apiClient: AxiosInstance;

  constructor() {
    this.apiClient = axios.create({
      baseURL: API_URL,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    // Interceptor to add auth token
    this.apiClient.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // --- Token Management ---
  private getToken(): string | null {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  }

  // --- Dashboard Metrics ---
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const response = await this.apiClient.get<DashboardMetrics>('/metrics');
    return response.data;
  }

  // --- Charity Verification ---
  async getPendingCharities(page: number = 1): Promise<PaginatedResponse<Charity>> {
    const response = await this.apiClient.get<PaginatedResponse<Charity>>('/admin/verifications', {
      params: { page }
    });
    return response.data;
  }

  async approveCharity(charityId: number, notes?: string): Promise<{ message: string }> {
    const response = await this.apiClient.patch(`/admin/charities/${charityId}/approve`, {
      notes
    });
    return response.data;
  }

  async rejectCharity(charityId: number, notes: string): Promise<{ message: string }> {
    const response = await this.apiClient.patch(`/admin/charities/${charityId}/reject`, {
      notes
    });
    return response.data;
  }

  // --- User Management ---
  async getUsers(page: number = 1, filters?: { role?: string; status?: string; search?: string }): Promise<PaginatedResponse<User>> {
    // Note: This endpoint needs to be added to the backend
    const response = await this.apiClient.get<PaginatedResponse<User>>('/admin/users', {
      params: { page, ...filters }
    });
    return response.data;
  }

  async suspendUser(userId: number): Promise<{ message: string }> {
    const response = await this.apiClient.patch(`/admin/users/${userId}/suspend`);
    return response.data;
  }

  async activateUser(userId: number): Promise<{ message: string }> {
    // Note: This endpoint needs to be added to the backend
    const response = await this.apiClient.patch(`/admin/users/${userId}/activate`);
    return response.data;
  }

  // --- Charity Management ---
  async getAllCharities(page: number = 1, filters?: { status?: string; search?: string }): Promise<PaginatedResponse<Charity>> {
    // Note: This endpoint needs to be added to the backend
    const response = await this.apiClient.get<PaginatedResponse<Charity>>('/admin/charities', {
      params: { page, ...filters }
    });
    return response.data;
  }

  async getCharityDetails(charityId: number): Promise<Charity> {
    const response = await this.apiClient.get<Charity>(`/admin/charities/${charityId}`);
    return response.data;
  }

  async activateCharity(charityId: number): Promise<{ message: string }> {
    const response = await this.apiClient.patch(`/admin/charities/${charityId}/activate`);
    return response.data;
  }

  // --- Document Verification ---
  async approveDocument(documentId: number): Promise<{ message: string; document: CharityDocument }> {
    const response = await this.apiClient.patch(`/admin/documents/${documentId}/approve`);
    return response.data;
  }

  async rejectDocument(documentId: number, reason: string): Promise<{ message: string; document: CharityDocument }> {
    const response = await this.apiClient.patch(`/admin/documents/${documentId}/reject`, {
      reason
    });
    return response.data;
  }
}

// Export singleton instance
export const adminService = new AdminService();
