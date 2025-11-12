import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { donationsService, Donation } from "@/services/donations";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

// Component imports
import DonationsTable from "./DonationsTable";
import DonationFilters from "./DonationFilters";
import DonationDetailsModal from "./DonationDetailsModal";
import DonationStatsSidebar from "./DonationStatsSidebar";
import ReconciliationModal from "./ReconciliationModal";
import ExportMenu from "./ExportMenu";

export interface DonationFilters {
  status?: string;
  campaign?: string;
  paymentMethod?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  amountMin?: number;
  amountMax?: number;
}

export default function DonationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  
  // Modal states
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isReconciliationModalOpen, setIsReconciliationModalOpen] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState<DonationFilters>({
    status: 'all',
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDonations, setTotalDonations] = useState(0);

  // Load donations
  useEffect(() => {
    loadDonations();
  }, [currentPage, filters]);

  const loadDonations = async () => {
    try {
      if (!user?.charity?.id) {
        toast.error("No charity found for your account");
        setLoading(false);
        return;
      }

      setLoading(true);
      const response = await donationsService.getCharityDonations(user.charity.id, currentPage);
      
      setDonations(response.data);
      setTotalPages(response.last_page);
      setTotalDonations(response.total);
    } catch (error: any) {
      console.error("Failed to load donations:", error);
      toast.error(error.response?.data?.message || "Failed to load donations");
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleViewDetails = (donation: Donation) => {
    setSelectedDonation(donation);
    setIsDetailsModalOpen(true);
  };

  const handleConfirmDonation = async (donationId: number) => {
    try {
      await donationsService.confirmDonation(donationId, 'completed');
      toast.success("Donation confirmed successfully");
      loadDonations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to confirm donation");
    }
  };

  const handleRejectDonation = async (donationId: number, reason: string) => {
    try {
      await donationsService.updateDonationStatus(donationId, 'rejected', reason);
      toast.success("Donation rejected");
      loadDonations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject donation");
    }
  };

  const handleBulkAction = async (action: 'confirm' | 'reject' | 'export') => {
    if (selectedRows.length === 0) {
      toast.error("Please select donations first");
      return;
    }

    // TODO: Implement bulk actions
    toast.info(`Bulk ${action} for ${selectedRows.length} donations`);
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    // TODO: Implement export functionality
    toast.info(`Exporting donations as ${format.toUpperCase()}`);
  };

  const handleFilterChange = (newFilters: DonationFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Calculate stats
  const stats = {
    totalReceived: donations
      .filter(d => d.status === 'completed')
      .reduce((sum, d) => sum + Number(d.amount), 0),
    totalThisMonth: donations
      .filter(d => {
        const donationDate = new Date(d.donated_at);
        const now = new Date();
        return donationDate.getMonth() === now.getMonth() && 
               donationDate.getFullYear() === now.getFullYear() &&
               d.status === 'completed';
      })
      .reduce((sum, d) => sum + Number(d.amount), 0),
    pendingCount: donations.filter(d => d.status === 'pending').length,
    confirmedCount: donations.filter(d => d.status === 'completed').length,
    rejectedCount: donations.filter(d => d.status === 'rejected').length,
    averageDonation: donations.filter(d => d.status === 'completed').length > 0 
      ? donations.filter(d => d.status === 'completed').reduce((sum, d) => sum + Number(d.amount), 0) / donations.filter(d => d.status === 'completed').length 
      : 0,
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden" style={{ scrollbarGutter: 'stable both-edges' }}>
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">Donations</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">Review, verify, and manage incoming donations</p>
            </div>
            <div className="flex flex-row flex-nowrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-start sm:justify-end overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] min-w-max">
              <Button
                variant="outline"
                onClick={() => navigate('/charity/refunds')}
                className="gap-2 h-10 shrink-0 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap"
              >
                <FileText className="h-4 w-4" />
                Refunds
              </Button>
              <div className="shrink-0 inline-flex">
                <ExportMenu 
                  onExport={handleExport}
                  selectedCount={selectedRows.length}
                  onBulkAction={handleBulkAction}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Filters + Table (3 columns) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Filters */}
            <DonationFilters 
              filters={filters}
              onFilterChange={handleFilterChange}
              totalCount={totalDonations}
            />

            {/* Table */}
            <DonationsTable
              donations={donations}
              loading={loading}
              selectedRows={selectedRows}
              onSelectRows={setSelectedRows}
              onViewDetails={handleViewDetails}
              onConfirm={handleConfirmDonation}
              onReject={(id) => {
                const donation = donations.find(d => d.id === id);
                if (donation) {
                  setSelectedDonation(donation);
                  setIsDetailsModalOpen(true);
                }
              }}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>

          {/* Right: Stats Sidebar (1 column) */}
          <div className="lg:col-span-1">
            <DonationStatsSidebar
              stats={stats}
              donations={donations}
              onOpenReconciliation={() => setIsReconciliationModalOpen(true)}
              onRefresh={loadDonations}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <DonationDetailsModal
        donation={selectedDonation}
        open={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedDonation(null);
        }}
        onConfirm={handleConfirmDonation}
        onReject={handleRejectDonation}
        onRefresh={loadDonations}
      />

      <ReconciliationModal
        open={isReconciliationModalOpen}
        onClose={() => setIsReconciliationModalOpen(false)}
        donations={donations}
      />
    </div>
  );
}
