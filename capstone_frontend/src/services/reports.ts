import axios, { AxiosInstance, AxiosHeaders } from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error('VITE_API_URL is not defined in your environment');
}

export interface Report {
  id: number;
  reported_entity_type: 'user' | 'charity' | 'campaign' | 'donation';
  reported_entity_id: number;
  target_type?: 'user' | 'charity' | 'campaign' | 'donation';
  target_id?: number;
  reason: string;
  description: string;
  report_type?: string;
  severity?: 'low' | 'medium' | 'high';
  details?: string;
  evidence_path?: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed' | 'approved' | 'rejected';
  penalty_days?: number;
  admin_notes?: string;
  reviewed_by?: number;
  reviewed_at?: string;
  action_taken?: string;
  created_at: string;
  reporter?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface SubmitReportParams {
  target_type: 'user' | 'charity' | 'campaign' | 'donation';
  target_id: number;
  report_type: string;
  severity: 'low' | 'medium' | 'high';
  details: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

class ReportsService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        Accept: 'application/json',
      },
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      if (token) {
        const headers = config.headers ?? new AxiosHeaders();
        headers.set('Authorization', `Bearer ${token}`);
        config.headers = headers;
      }
      return config;
    });
  }

  async getMyReports(): Promise<PaginatedResponse<Report>> {
    const res = await this.api.get<PaginatedResponse<Report>>('/me/reports');
    return res.data;
  }

  async submitReport(form: FormData): Promise<{ message: string; report: Report }> {
    const res = await this.api.post<{ message: string; report: Report }>(
      '/reports',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data;
  }

  // New method for JSON-based report submission (for suspension system)
  async submitReportJSON(params: SubmitReportParams): Promise<{ message: string; report: Report }> {
    const res = await this.api.post<{ message: string; report: Report }>('/reports', params);
    return res.data;
  }

  // Admin: Get all reports with filters
  async getAllReports(filters?: {
    status?: string;
    entity_type?: string;
    reason?: string;
    search?: string;
    page?: number;
  }): Promise<any> {
    const res = await this.api.get('/admin/reports', { params: filters });
    return res.data;
  }

  // Admin: Get report statistics
  async getReportStatistics(): Promise<any> {
    const res = await this.api.get('/admin/reports/statistics');
    return res.data;
  }

  // Admin: Get single report details
  async getReport(reportId: number): Promise<any> {
    const res = await this.api.get(`/admin/reports/${reportId}`);
    return res.data;
  }

  // Admin: Approve report and suspend user
  async approveReport(reportId: number, params?: {
    penalty_days?: number;
    admin_notes?: string;
  }): Promise<any> {
    const res = await this.api.post(`/admin/reports/${reportId}/approve`, params);
    return res.data;
  }

  // Admin: Reject report
  async rejectReport(reportId: number, admin_notes: string): Promise<any> {
    const res = await this.api.post(`/admin/reports/${reportId}/reject`, { admin_notes });
    return res.data;
  }

  // Admin: Delete report
  async deleteReport(reportId: number): Promise<any> {
    const res = await this.api.delete(`/admin/reports/${reportId}`);
    return res.data;
  }
}

export const reportsService = new ReportsService();
