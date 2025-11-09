import { render, screen } from '@testing-library/react';
import { MilestonesGrid } from './MilestonesGrid';
import { DonorMilestone } from '@/hooks/useDonorMilestones';

describe('MilestonesGrid', () => {
  const mockMilestones: DonorMilestone[] = [
    {
      id: 1,
      key: 'first_donation',
      title: 'First Donation',
      description: 'Made your first donation',
      icon: 'Heart',
      is_achieved: true,
      achieved_at: '2025-01-15T10:00:00Z',
      achieved_at_formatted: 'Jan 15, 2025',
      progress: 1,
      threshold: 1,
      meta: null,
      created_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 2,
      key: 'total_1000',
      title: 'Generous Supporter',
      description: 'Donated ₱1,000 or more',
      icon: 'Award',
      is_achieved: false,
      achieved_at: null,
      achieved_at_formatted: null,
      progress: 500,
      threshold: 1000,
      meta: null,
      created_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 3,
      key: 'supported_5_campaigns',
      title: 'Community Supporter',
      description: 'Supported 5 different campaigns',
      icon: 'Users',
      is_achieved: false,
      achieved_at: null,
      achieved_at_formatted: null,
      progress: 3,
      threshold: 5,
      meta: null,
      created_at: '2025-01-01T00:00:00Z',
    },
  ];

  it('renders correct number of milestone cards', () => {
    render(<MilestonesGrid milestones={mockMilestones} />);
    
    expect(screen.getByText('First Donation')).toBeInTheDocument();
    expect(screen.getByText('Generous Supporter')).toBeInTheDocument();
    expect(screen.getByText('Community Supporter')).toBeInTheDocument();
  });

  it('shows achieved badge for completed milestones', () => {
    render(<MilestonesGrid milestones={mockMilestones} />);
    
    const achievedBadge = screen.getByText('✅ Achieved');
    expect(achievedBadge).toBeInTheDocument();
  });

  it('shows in progress badge for incomplete milestones', () => {
    render(<MilestonesGrid milestones={mockMilestones} />);
    
    const inProgressBadges = screen.getAllByText('In Progress');
    expect(inProgressBadges).toHaveLength(2);
  });

  it('handles empty state properly', () => {
    render(<MilestonesGrid milestones={[]} />);
    
    expect(screen.getByText('No milestones yet')).toBeInTheDocument();
    expect(screen.getByText(/Start donating to unlock achievements/i)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<MilestonesGrid milestones={[]} loading={true} />);
    
    // Should show skeleton loaders
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays achievement date for completed milestones', () => {
    render(<MilestonesGrid milestones={mockMilestones} />);
    
    expect(screen.getByText(/Achieved on/i)).toBeInTheDocument();
  });

  it('displays progress information for incomplete milestones', () => {
    render(<MilestonesGrid milestones={mockMilestones} />);
    
    // Check for progress labels
    expect(screen.getByText(/₱500/)).toBeInTheDocument();
    expect(screen.getByText(/3 \/ 5 campaigns/)).toBeInTheDocument();
  });

  it('renders grid layout with correct responsive classes', () => {
    const { container } = render(<MilestonesGrid milestones={mockMilestones} />);
    
    const gridSection = container.querySelector('section');
    expect(gridSection).toHaveClass('grid');
    expect(gridSection).toHaveClass('sm:grid-cols-2');
    expect(gridSection).toHaveClass('lg:grid-cols-3');
    expect(gridSection).toHaveClass('xl:grid-cols-4');
  });

  it('displays milestone descriptions', () => {
    render(<MilestonesGrid milestones={mockMilestones} />);
    
    expect(screen.getByText('Made your first donation')).toBeInTheDocument();
    expect(screen.getByText('Donated ₱1,000 or more')).toBeInTheDocument();
    expect(screen.getByText('Supported 5 different campaigns')).toBeInTheDocument();
  });

  it('renders cards with proper styling classes', () => {
    const { container } = render(<MilestonesGrid milestones={mockMilestones} />);
    
    const cards = container.querySelectorAll('.rounded-2xl');
    expect(cards.length).toBe(3);
  });

  it('handles milestones without progress data', () => {
    const milestonesWithoutProgress: DonorMilestone[] = [
      {
        id: 4,
        key: 'verified_donor',
        title: 'Verified Donor',
        description: 'Verified your email',
        icon: 'ShieldCheck',
        is_achieved: true,
        achieved_at: '2025-01-10T10:00:00Z',
        achieved_at_formatted: 'Jan 10, 2025',
        progress: null,
        threshold: null,
        meta: null,
        created_at: '2025-01-01T00:00:00Z',
      },
    ];
    
    render(<MilestonesGrid milestones={milestonesWithoutProgress} />);
    expect(screen.getByText('Verified Donor')).toBeInTheDocument();
    expect(screen.getByText('✅ Achieved')).toBeInTheDocument();
  });
});

