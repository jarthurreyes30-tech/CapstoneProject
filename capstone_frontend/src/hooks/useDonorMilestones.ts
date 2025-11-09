import { useState, useEffect } from 'react';
import axios from 'axios';
import { buildApiUrl } from '@/lib/api';

export interface DonorMilestone {
  id: number;
  key: string;
  title: string;
  description: string;
  icon: string;
  is_achieved: boolean;
  achieved_at: string | null;
  achieved_at_formatted: string | null;
  progress: number | null;
  threshold?: number | null; // Goal value for the milestone
  meta: any;
  created_at: string;
}

export const useDonorMilestones = (donorId: string) => {
  const [milestones, setMilestones] = useState<DonorMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMilestones = async () => {
    if (!donorId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        buildApiUrl(`/donors/${donorId}/milestones`),
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );
      setMilestones(response.data.data);
      setError(null);
    } catch (err: any) {
      // Fallback to empty array when API not available
      console.log('Milestones API not available yet, showing empty state');
      setMilestones([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, [donorId]);

  return {
    milestones,
    loading,
    error,
    refetch: fetchMilestones,
  };
};
