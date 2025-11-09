import { useState, useEffect } from 'react';
import axios from 'axios';
import { buildApiUrl } from '@/lib/api';

export interface DonorBadge {
  name: string;
  description: string;
  icon: string;
  earned: boolean;
}

export const useDonorBadges = (donorId: string) => {
  const [badges, setBadges] = useState<DonorBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBadges = async () => {
    if (!donorId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        buildApiUrl(`/donors/${donorId}/badges`),
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );
      setBadges(response.data.data);
      setError(null);
    } catch (err: any) {
      // Fallback to empty array when API not available
      console.log('Badges API not available yet, showing empty state');
      setBadges([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, [donorId]);

  return {
    badges,
    loading,
    error,
    refetch: fetchBadges,
  };
};
