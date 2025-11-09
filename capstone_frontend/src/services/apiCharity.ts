/**
 * Charity API Service
 *
 * Handles charity-related API calls including campaigns, fund usage, etc.
 */
import axios from 'axios';
import { campaignService } from './campaigns';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error('VITE_API_URL is not defined in your .env.local file');
}

// Types for charity operations
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ListCampaignsParams {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ListFundUsageParams {
  page?: number;
  pageSize?: number;
  category?: string;
}

// Campaign functions
export async function listCampaigns(params: ListCampaignsParams = {}): Promise<PaginatedResponse<any>> {
  // Use the new getMyCampaigns method that automatically gets campaigns for the authenticated charity admin
  const page = params.page || 1;
  const response = await campaignService.getMyCampaigns(page);
  
  // If status filter is provided, filter the results
  let filteredData = response.data;
  if (params.status && params.status !== 'all') {
    filteredData = response.data.filter((campaign: any) => campaign.status === params.status);
  }
  
  // If search is provided, filter by title
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredData = filteredData.filter((campaign: any) => 
      campaign.title.toLowerCase().includes(searchLower)
    );
  }
  
  return {
    data: filteredData,
    current_page: response.current_page,
    last_page: response.last_page,
    per_page: response.per_page,
    total: filteredData.length,
  };
}

export async function getCampaign(campaignId: string): Promise<any> {
  // Use the campaign service to get campaign details
  const response = await campaignService.getCampaign(parseInt(campaignId));
  return response;
}

export async function pauseCampaign(campaignId: string): Promise<void> {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  await axios.post(`${API_URL}/campaigns/${campaignId}/pause`, {}, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
}

export async function resumeCampaign(campaignId: string): Promise<void> {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  await axios.post(`${API_URL}/campaigns/${campaignId}/activate`, {}, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
}

export async function closeCampaign(campaignId: string): Promise<void> {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  await axios.put(`${API_URL}/campaigns/${campaignId}`, 
    { status: 'closed' },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }
  );
}

export async function deleteCampaign(campaignId: string): Promise<void> {
  await campaignService.deleteCampaign(parseInt(campaignId));
}

// Fund usage functions
export async function listFundUsage(params: ListFundUsageParams = {}): Promise<{
  data: any[];
  pagination: PaginatedResponse<any>;
}> {
  // For now, return mock data since we need backend implementation
  return {
    data: [],
    pagination: {
      data: [],
      current_page: 1,
      last_page: 1,
      per_page: 20,
      total: 0,
    }
  };
}

export async function createFundUsage(data: FormData): Promise<void> {
  // For now, this is a mock implementation
  // In a real implementation, this would call the create fund usage API
  console.log('Creating fund usage entry:', data);
}

// Dashboard function
export async function getDashboard(): Promise<any> {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  const response = await axios.get(`${API_URL}/charity/dashboard`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  return response.data;
}

export { campaignService };
