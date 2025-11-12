import { useEffect, useState } from "react";
import { Download, Eye, Filter, Calendar, Search, Heart, TrendingUp, Award, Coins, FileText, FileSpreadsheet, AlertCircle, Upload, X, Building2, Clock, CreditCard, MessageSquare, Receipt, Image as ImageIcon, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import api from "@/lib/axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { authService } from "@/services/auth";
import { buildStorageUrl } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface APIDonation {
  id: number;
  amount: number;
  status: 'pending' | 'scheduled' | 'completed' | 'rejected';
  is_recurring: boolean;
  purpose: 'general' | 'project' | 'emergency';
  donated_at: string;
  receipt_no?: string | null;
  charity: { id: number; name: string; logo_path?: string };
  campaign?: { id: number; title: string; cover_image_path?: string } | null;
  donor_name?: string;
  donor_email?: string;
  is_anonymous: boolean;
  proof_path?: string | null;
  proof_type?: string | null;
  channel_used?: string | null;
  reference_number?: string | null;
  message?: string | null;
  recurring_type?: string | null;
  recurring_end_date?: string | null;
  next_donation_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface DonationRow {
  id: number;
  charity: string;
  charityLogo?: string;
  campaign: string;
  campaignImage?: string;
  amount: number;
  date: string;
  status: 'pending' | 'scheduled' | 'completed' | 'rejected';
  isRefunded: boolean;
  refundedAt?: string | null;
  type: 'one-time' | 'recurring';
  purpose: string;
  hasReceipt: boolean;
  receiptNo?: string | null;
  isAnonymous: boolean;
  proofPath?: string | null;
  proofType?: string | null;
  channelUsed?: string | null;
  referenceNumber?: string | null;
  message?: string | null;
  recurringType?: string | null;
  recurringEndDate?: string | null;
  nextDonationDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export default function DonationHistory() {
  const [donations, setDonations] = useState<DonationRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDonation, setSelectedDonation] = useState<DonationRow | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [refundDialog, setRefundDialog] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [refundMessage, setRefundMessage] = useState("");
  const [refundProof, setRefundProof] = useState<File | null>(null);
  const [refundProofPreview, setRefundProofPreview] = useState<string | null>(null);
  const [submittingRefund, setSubmittingRefund] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const token = authService.getToken();
      const res = await fetch(`${API_URL}/me/donations`, {
        headers: {
          Accept: 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      if (!res.ok) throw new Error('Failed to load donations');
      const payload = await res.json();
      const items: APIDonation[] = payload.data ?? payload; // handle paginate or array
      const rows: DonationRow[] = items.map((d) => ({
        id: d.id,
        charity: d.charity?.name ?? 'Unknown Charity',
        charityLogo: d.charity?.logo_path,
        campaign: d.campaign?.title ?? 'General Fund',
        campaignImage: d.campaign?.cover_image_path,
        amount: d.amount,
        date: d.donated_at ?? new Date().toISOString(),
        status: d.status,
        isRefunded: d.is_refunded ?? false,
        refundedAt: d.refunded_at,
        type: d.is_recurring ? 'recurring' : 'one-time',
        purpose: d.purpose ?? 'general',
        hasReceipt: !!d.receipt_no && d.status === 'completed',
        receiptNo: d.receipt_no,
        isAnonymous: d.is_anonymous ?? false,
        proofPath: d.proof_path,
        proofType: d.proof_type,
        channelUsed: d.channel_used,
        referenceNumber: d.reference_number,
        message: d.message,
        recurringType: d.recurring_type,
        recurringEndDate: d.recurring_end_date,
        nextDonationDate: d.next_donation_date,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }));
      setDonations(rows);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Unable to fetch donations');
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async (donationId: number) => {
    try {
      const token = authService.getToken();
      const res = await fetch(`${API_URL}/donations/${donationId}/receipt`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      if (res.status === 422) {
        const data = await res.json();
        throw new Error(data.message || 'Receipt not available');
      }
      if (!res.ok) throw new Error('Failed to download receipt');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `donation-receipt-${donationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Receipt download started');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Unable to download receipt');
    }
  };

  const filteredDonations = donations
    .filter(d => filterStatus === "all" || d.status === filterStatus)
    .filter(d => 
      searchQuery === "" ||
      d.charity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.campaign.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const completedDonations = donations.filter(d => d.status === 'completed');
  const totalDonated = completedDonations.reduce((sum, d) => sum + d.amount, 0);
  const totalCampaigns = new Set(donations.map(d => d.campaign)).size;
  const averageDonation = completedDonations.length > 0 
    ? totalDonated / completedDonations.length 
    : 0;

  const getStatusBadge = (status: string, isRefunded?: boolean) => {
    // Check status first for 'refunded', then fallback to isRefunded flag
    if (status === 'refunded' || isRefunded) {
      return <Badge className="bg-orange-600">Refunded</Badge>;
    }
    
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-green-600">Completed</Badge>;
      case 'scheduled':
        return <Badge variant="outline">Scheduled</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleViewDetails = (donation: DonationRow) => {
    setSelectedDonation(donation);
    setIsDetailsOpen(true);
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    setExporting(true);
    try {
      const response = await api.get(`/me/donations/export?format=${format}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `donation-history.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`Export downloaded successfully!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to export donations');
    } finally {
      setExporting(false);
    }
  };

  const handleRequestRefund = () => {
    setRefundDialog(true);
  };

  const submitRefund = async () => {
    if (!selectedDonation || !refundReason.trim()) {
      toast.error('Please provide a reason for the refund');
      return;
    }

    setSubmittingRefund(true);
    try {
      const formData = new FormData();
      formData.append('reason', refundReason);
      if (refundMessage.trim()) {
        formData.append('message', refundMessage);
      }
      if (refundProof) {
        formData.append('proof_image', refundProof);
      }

      await api.post(`/donations/${selectedDonation.id}/refund`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Refund request submitted successfully. Our team will review it within 24-48 hours.');
      setRefundDialog(false);
      setRefundReason('');
      setRefundMessage('');
      setRefundProof(null);
      setRefundProofPreview(null);
      setIsDetailsOpen(false);
      fetchDonations(); // Refresh the list
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit refund request');
    } finally {
      setSubmittingRefund(false);
    }
  };

  const canRequestRefund = (donation: DonationRow) => {
    if (donation.status !== 'completed') return false;
    const donationDate = new Date(donation.date);
    const daysSince = Math.floor((Date.now() - donationDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSince <= 30;
  };

  const getDaysRemaining = (donation: DonationRow) => {
    const donationDate = new Date(donation.date);
    const daysSince = Math.floor((Date.now() - donationDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, 7 - daysSince);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            My Donations
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-6">
            View and track your donation history and impact
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Donated</CardTitle>
                <Coins className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                ₱{totalDonated.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {completedDonations.length} completed donations
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Campaigns Supported</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{totalCampaigns}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across {new Set(donations.map(d => d.charity)).size} charities
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Donations</CardTitle>
                <Heart className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{donations.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {donations.filter(d => d.type === 'recurring').length} recurring
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Donation</CardTitle>
                <Award className="h-4 w-4 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">
                ₱{averageDonation.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Per completed donation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Impact Summary */}
        {completedDonations.length > 0 && (
          <Card className="bg-gradient-to-br from-primary/5 to-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Your Impact
              </CardTitle>
              <CardDescription>See how your generosity is making a difference</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Impact Message */}
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-lg font-semibold text-foreground mb-2">
                  🎉 Thank you for your generosity!
                </p>
                <p className="text-muted-foreground">
                  Your donations have supported <span className="font-bold text-primary">{totalCampaigns} campaigns</span> across{" "}
                  <span className="font-bold text-primary">{new Set(donations.map(d => d.charity)).size} charities</span>.
                  You've made a real difference in the lives of those in need!
                </p>
              </div>

              {/* Charity Distribution */}
              <div>
                <h3 className="font-semibold mb-3">Donation Distribution by Charity</h3>
                <div className="space-y-3">
                  {Object.entries(
                    completedDonations.reduce((acc, d) => {
                      acc[d.charity] = (acc[d.charity] || 0) + d.amount;
                      return acc;
                    }, {} as Record<string, number>)
                  )
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([charity, amount]) => {
                      const percentage = (amount / totalDonated) * 100;
                      return (
                        <div key={charity}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{charity}</span>
                            <span className="text-sm text-muted-foreground">
                              ₱{amount.toLocaleString()} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-primary to-primary/60 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Donations Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div>
                <CardTitle>All Donations</CardTitle>
                <CardDescription>Your complete donation history</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by charity or campaign..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleExport('csv')} disabled={exporting} className="flex-1 sm:flex-initial">
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">CSV</span>
                      <span className="sm:hidden">Export CSV</span>
                    </Button>
                    <Button variant="outline" onClick={() => handleExport('pdf')} disabled={exporting} className="flex-1 sm:flex-initial">
                      <FileText className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">PDF</span>
                      <span className="sm:hidden">Export PDF</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Logo</TableHead>
                  <TableHead>Charity</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead className="w-[120px]">Date & Time</TableHead>
                  <TableHead className="w-[100px]">Amount</TableHead>
                  <TableHead className="w-[100px]">Purpose</TableHead>
                  <TableHead className="w-[120px]">Payment Method</TableHead>
                  <TableHead className="w-[130px]">Reference</TableHead>
                  <TableHead className="w-[90px]">Type</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="text-right w-[180px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDonations.map((donation) => (
                  <TableRow key={donation.id} className="hover:bg-muted/50">
                    {/* Charity Logo */}
                    <TableCell>
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage 
                          src={donation.charityLogo ? buildStorageUrl(donation.charityLogo) || undefined : undefined} 
                          alt={donation.charity}
                        />
                        <AvatarFallback className="bg-primary/10">
                          <Building2 className="h-4 w-4 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>

                    {/* Charity Name */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{donation.charity}</span>
                        {donation.isAnonymous && (
                          <Badge variant="secondary" className="text-xs">
                            Anonymous
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* Campaign */}
                    <TableCell>
                      <span className="text-sm">{donation.campaign}</span>
                    </TableCell>

                    {/* Date & Time */}
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <div>
                          <div>{new Date(donation.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(donation.date).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Amount */}
                    <TableCell>
                      <span className="font-bold text-green-600 whitespace-nowrap">
                        ₱{donation.amount.toLocaleString()}
                      </span>
                    </TableCell>

                    {/* Purpose */}
                    <TableCell>
                      <Badge variant="secondary" className="capitalize text-xs">
                        {donation.purpose}
                      </Badge>
                    </TableCell>

                    {/* Payment Method */}
                    <TableCell>
                      {donation.channelUsed ? (
                        <div className="flex items-center gap-1 text-sm">
                          <CreditCard className="h-3 w-3 text-muted-foreground" />
                          <span className="capitalize">{donation.channelUsed}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </TableCell>

                    {/* Reference Number */}
                    <TableCell>
                      {donation.referenceNumber ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Receipt className="h-3 w-3 text-muted-foreground" />
                          <span className="font-mono text-xs truncate" title={donation.referenceNumber}>
                            {donation.referenceNumber.length > 12 
                              ? donation.referenceNumber.substring(0, 12) + '...' 
                              : donation.referenceNumber}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </TableCell>

                    {/* Type */}
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-xs whitespace-nowrap">
                        {donation.type === 'recurring' ? 'Recurring' : 'One-time'}
                      </Badge>
                    </TableCell>

                    {/* Status */}
                    <TableCell>{getStatusBadge(donation.status, donation.isRefunded)}</TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(donation)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        {donation.hasReceipt && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => downloadReceipt(donation.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Empty State */}
        {filteredDonations.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              No donations found matching your criteria.
            </p>
          </Card>
        )}
      </div>
      </div>

      {/* Donation Details Dialog - Comprehensive Information */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl">Donation Details</DialogTitle>
                <DialogDescription>Complete information about your donation</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          {selectedDonation && (
            <div className="space-y-6">
              {/* Header Card with Charity & Campaign */}
              <Card className="bg-gradient-to-br from-primary/5 to-background">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2">
                      <AvatarImage 
                        src={selectedDonation.charityLogo ? buildStorageUrl(selectedDonation.charityLogo) || undefined : undefined}
                        alt={selectedDonation.charity}
                      />
                      <AvatarFallback className="bg-primary/10">
                        <Building2 className="h-7 w-7 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold">{selectedDonation.charity}</h3>
                        {selectedDonation.isAnonymous && (
                          <Badge variant="secondary">
                            Anonymous Donation
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">{selectedDonation.campaign}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="capitalize">
                          {selectedDonation.purpose}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {selectedDonation.type}
                        </Badge>
                        {getStatusBadge(selectedDonation.status, selectedDonation.isRefunded)}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">Donation Amount</p>
                      <p className="text-3xl font-bold text-green-600">
                        ₱{selectedDonation.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Transaction Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Transaction Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Transaction ID</Label>
                    <p className="font-mono font-medium">#{selectedDonation.id}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Date & Time</Label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">
                        {new Date(selectedDonation.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  {selectedDonation.channelUsed && (
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Payment Method</Label>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium capitalize">{selectedDonation.channelUsed}</p>
                      </div>
                    </div>
                  )}
                  {selectedDonation.referenceNumber && (
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Reference Number</Label>
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        <p className="font-mono font-medium text-sm">{selectedDonation.referenceNumber}</p>
                      </div>
                    </div>
                  )}
                  {selectedDonation.receiptNo && (
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Receipt Number</Label>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <p className="font-mono font-medium text-sm">{selectedDonation.receiptNo}</p>
                      </div>
                    </div>
                  )}
                  {selectedDonation.createdAt && (
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Record Created</Label>
                      <p className="text-sm">{new Date(selectedDonation.createdAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recurring Information */}
              {selectedDonation.type === 'recurring' && (
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-900">
                      <TrendingUp className="h-5 w-5" />
                      Recurring Donation Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    {selectedDonation.recurringType && (
                      <div className="space-y-1">
                        <Label className="text-xs text-blue-700">Frequency</Label>
                        <p className="font-medium capitalize text-blue-900">{selectedDonation.recurringType}</p>
                      </div>
                    )}
                    {selectedDonation.nextDonationDate && (
                      <div className="space-y-1">
                        <Label className="text-xs text-blue-700">Next Donation</Label>
                        <p className="font-medium text-blue-900">
                          {new Date(selectedDonation.nextDonationDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {selectedDonation.recurringEndDate && (
                      <div className="space-y-1">
                        <Label className="text-xs text-blue-700">End Date</Label>
                        <p className="font-medium text-blue-900">
                          {new Date(selectedDonation.recurringEndDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Donor Message */}
              {selectedDonation.message && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Your Message
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm whitespace-pre-wrap">{selectedDonation.message}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Proof of Payment */}
              {selectedDonation.proofPath && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-primary" />
                      Proof of Payment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                      <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Proof Document</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {selectedDonation.proofType || 'Uploaded file'}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(buildStorageUrl(selectedDonation.proofPath!) || '#', '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Proof
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between gap-4 pt-4 border-t">
                <div className="flex gap-2">
                  {selectedDonation.hasReceipt && (
                    <Button variant="default" onClick={() => downloadReceipt(selectedDonation.id)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download Receipt
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  {canRequestRefund(selectedDonation) && (
                    <Button variant="destructive" onClick={handleRequestRefund}>
                      Request Refund
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>

              {/* Refund Window Notice */}
              {canRequestRefund(selectedDonation) && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-amber-900 mb-1">Refund Window Active</p>
                      <p className="text-sm text-amber-800">
                        You have {getDaysRemaining(selectedDonation)} day(s) remaining to request a refund (within 7 days of donation).
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Request Dialog */}
      <Dialog open={refundDialog} onOpenChange={setRefundDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Refund</DialogTitle>
            <DialogDescription>
              Please provide details for your refund request. Our team will review it within 24-48 hours.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="refundReason">Reason for Refund <span className="text-red-500">*</span></Label>
              <textarea
                id="refundReason"
                className="w-full min-h-[100px] p-3 border rounded-md mt-2 bg-background text-foreground"
                placeholder="Please explain why you're requesting a refund..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {refundReason.length}/1000 characters
              </p>
            </div>
            
            <div>
              <Label htmlFor="refundMessage">Additional Message (Optional)</Label>
              <textarea
                id="refundMessage"
                className="w-full min-h-[80px] p-3 border rounded-md mt-2 bg-background text-foreground"
                placeholder="Any additional information you'd like to provide..."
                value={refundMessage}
                onChange={(e) => setRefundMessage(e.target.value)}
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {refundMessage.length}/2000 characters
              </p>
            </div>

            <div>
              <Label htmlFor="refundProof">Supporting Document (Optional)</Label>
              <Input
                id="refundProof"
                type="file"
                accept="image/*,.pdf"
                className="mt-2"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error('File size must be less than 5MB');
                      return;
                    }
                    setRefundProof(file);
                    if (file.type.startsWith('image/')) {
                      setRefundProofPreview(URL.createObjectURL(file));
                    }
                    toast.success('Document uploaded');
                  }
                }}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Upload proof or supporting documents (JPG, PNG, PDF - Max 5MB)
              </p>
              {refundProofPreview && (
                <div className="mt-2">
                  <img src={refundProofPreview} alt="Preview" className="max-w-full h-32 object-cover rounded border" />
                </div>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-400">
                <strong>What happens next:</strong>
              </p>
              <ul className="list-disc list-inside text-xs text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                <li>Your refund request will be sent to both you and the charity</li>
                <li>Our team will review your request within 24-48 hours</li>
                <li>You'll receive an email with the decision</li>
                <li>If approved, the refund will be processed to your original payment method</li>
                <li>You can contact the charity admin directly through their profile page</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setRefundDialog(false);
              setRefundReason('');
              setRefundMessage('');
              setRefundProof(null);
              setRefundProofPreview(null);
            }} disabled={submittingRefund}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={submitRefund}
              disabled={submittingRefund || !refundReason.trim()}
            >
              {submittingRefund ? 'Submitting...' : 'Submit Refund Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
