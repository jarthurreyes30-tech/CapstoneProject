import { useState, useEffect } from 'react';
import axios from 'axios';
import { buildApiUrl, createAuthHeaders, getStorageUrl } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export interface DonorProfile {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  location: string | null;
  member_since: string;
  member_since_date: string;
  total_donated: number;
  campaigns_supported_count: number;
  recent_donations_count: number;
  liked_campaigns_count: number;
  is_owner: boolean;
  email_visible: boolean;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  cause_preferences: string[];
  created_at: string;
  updated_at: string;
}

export const useDonorProfile = (donorId: string) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DonorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!donorId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Try the new API endpoint first
      try {
        console.log('Fetching donor profile from API:', `/donors/${donorId}`);
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        const response = await axios.get(buildApiUrl(`/donors/${donorId}`), {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Accept': 'application/json',
          },
        });
        console.log('Donor profile fetched successfully:', response.data.data);
        setProfile(response.data.data);
        setError(null);
        setLoading(false);
        return;
      } catch (apiError: any) {
        // If new endpoint fails, fall back to user data from AuthContext
        console.log('API endpoint failed, using user from AuthContext. Error:', apiError.response?.status, apiError.message);
      }

      // Fallback: Use current user from AuthContext
      if (!user) {
        console.log('No user in context, cannot fetch profile');
        throw new Error('User not logged in');
      }
      
      console.log('Using user from AuthContext:', user.id, user.name);
      
      const userData = user;
      
      // Create profile from user data
      setProfile({
        id: typeof userData.id === 'string' ? parseInt(userData.id) : userData.id,
        name: userData.name,
        email: userData.email,
        avatar_url: userData.profile_image ? `${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${userData.profile_image}` : null,
        cover_url: userData.cover_image ? `${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${userData.cover_image}` : null,
        bio: userData.donor_profile?.bio || null,
        location: userData.address || null,
        member_since: new Date(userData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        member_since_date: userData.created_at,
        total_donated: 0,
        campaigns_supported_count: 0,
        recent_donations_count: 0,
        liked_campaigns_count: 0,
        is_owner: true,
        email_visible: true,
        phone: userData.phone || null,
        date_of_birth: userData.donor_profile?.date_of_birth || null,
        gender: userData.donor_profile?.gender || null,
        cause_preferences: userData.donor_profile?.cause_preferences || [],
        created_at: userData.created_at,
        updated_at: userData.updated_at,
      });
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile');
      console.error('Error fetching donor profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [donorId, user]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
  };
};

export const updateDonorProfile = async (
  donorId: number,
  data: {
    bio?: string;
    address?: string;
    phone?: string;
    date_of_birth?: string;
    gender?: string;
    cause_preferences?: string[];
  }
) => {
  try {
    const response = await axios.put(
      buildApiUrl(`/donors/${donorId}/profile`),
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      }
    );
    return { success: true, data: response.data.data };
  } catch (err: any) {
    return {
      success: false,
      error: err.response?.data?.message || 'Failed to update profile',
    };
  }
};

export const updateDonorImage = async (
  donorId: number,
  file: File,
  type: 'profile' | 'cover'
) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);

    const response = await axios.post(
      buildApiUrl(`/donors/${donorId}/image`),
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return { success: true, data: response.data.data };
  } catch (err: any) {
    return {
      success: false,
      error: err.response?.data?.message || 'Failed to update image',
    };
  }
};
