import { useState, useEffect } from 'react';
import axios from 'axios';
import { buildApiUrl } from '@/lib/api';

export interface DonorDonation {
  id: number;
  amount: number;
  status: string;
  payment_method: string;
  is_anonymous: boolean;
  message: string | null;
  created_at: string;
  created_at_formatted: string;
  created_at_human: string;
  campaign?: {
    id: number;
    title: string;
    slug: string;
    image_url: string | null;
    charity: {
      id: number;
      name: string;
    };
  };
  charity?: {
    id: number;
    name: string;
    logo_url: string | null;
  };
  receipt_url: string | null;
  verified_at: string | null;
  verified_by: string | null;
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  has_more: boolean;
}

export const useDonorActivity = (donorId: string, perPage: number = 10) => {
  const [donations, setDonations] = useState<DonorDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchActivity = async (page: number = 1, append: boolean = false) => {
    if (!donorId) {
      setLoading(false);
      return;
    }

    try {
      if (!append) {
        setLoading(true);
      }

      const response = await axios.get(
        buildApiUrl(`/donors/${donorId}/activity`),
        {
          params: {
            per_page: perPage,
            page,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );

      const newDonations = response.data.data;
      
      if (append) {
        setDonations((prev) => [...prev, ...newDonations]);
      } else {
        setDonations(newDonations);
      }

      setPagination(response.data.pagination);
      setCurrentPage(page);
      setError(null);
    } catch (err: any) {
      // Fallback to empty array when API not available
      console.log('Activity API not available yet, showing empty state');
      if (!append) {
        setDonations([]);
      }
      setPagination({
        current_page: 1,
        last_page: 1,
        per_page: perPage,
        total: 0,
        has_more: false,
      });
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity(1, false);
  }, [donorId]);

  const loadMore = async () => {
    if (pagination && pagination.has_more) {
      await fetchActivity(currentPage + 1, true);
    }
  };

  return {
    donations,
    loading,
    error,
    hasMore: pagination?.has_more || false,
    loadMore,
    refetch: () => fetchActivity(1, false),
  };
};
