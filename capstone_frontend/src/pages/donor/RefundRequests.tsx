import { useEffect, useState } from "react";
import { ArrowLeft, FileText, Calendar, AlertCircle, CheckCircle2, XCircle, Clock, Eye, Building2 } from "lucide-react";
import api from "@/lib/axios";
import { useNavigate } from "react-router-dom";
import { buildStorageUrl } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface RefundRequest {
  id: number;
  donation_id: number;
  user_id: number;
  charity_id: number;
  reason: string;
  proof_url: string | null;
  status: 'pending' | 'approved' | 'denied' | 'cancelled';
  charity_response: string | null;
  refund_amount: number;
  created_at: string;
  reviewed_at: string | null;
  donation: {
    id: number;
    amount: number;
    donated_at: string;
    charity: {
      id: number;
      name: string;
      logo_path: string | null;
    };
    campaign: {
      id: number;
      title: string;
    } | null;
  };
  reviewer: {
    id: number;
    name: string;
  } | null;
}

export default function RefundRequests() {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const response = await api.get('/me/refunds');
      setRefunds(response.data.refunds || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load refund requests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'denied':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Denied</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredRefunds = refunds.filter(refund => {
    if (activeTab === 'all') return true;
    return refund.status === activeTab;
  });

  const stats = {
    total: refunds.length,
    pending: refunds.filter(r => r.status === 'pending').length,
    approved: refunds.filter(r => r.status === 'approved').length,
    denied: refunds.filter(r => r.status === 'denied').length,
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <Button
            variant="ghost"
            onClick={() => navigate('/donor/history')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Donation History
          </Button>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Refund Requests</h1>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            Track the status of your refund requests
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.denied}</div>
            </CardContent>
          </Card>
        </div>

        {/* Refunds List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Refund Requests</CardTitle>
            <CardDescription>View and track all your refund requests</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
                <TabsTrigger value="denied">Denied ({stats.denied})</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading refund requests...</p>
                  </div>
                ) : filteredRefunds.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                    <p className="text-muted-foreground">No refund requests found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRefunds.map((refund) => (
                      <Card key={refund.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                              {/* Charity Logo */}
                              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                {refund.donation.charity.logo_path ? (
                                  <img
                                    src={buildStorageUrl(refund.donation.charity.logo_path) || ''}
                                    alt={refund.donation.charity.name}
                                    className="h-full w-full object-cover rounded-lg"
                                  />
                                ) : (
                                  <Building2 className="h-6 w-6 text-muted-foreground" />
                                )}
                              </div>

                              {/* Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div>
                                    <h3 className="font-semibold text-lg line-clamp-1">
                                      {refund.donation.campaign?.title || 'General Donation'}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                      {refund.donation.charity.name}
                                    </p>
                                  </div>
                                  {getStatusBadge(refund.status)}
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">Amount</p>
                                    <p className="font-semibold">₱{refund.refund_amount.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Requested</p>
                                    <p className="font-semibold">{new Date(refund.created_at).toLocaleDateString()}</p>
                                  </div>
                                  {refund.reviewed_at && (
                                    <div>
                                      <p className="text-muted-foreground">Reviewed</p>
                                      <p className="font-semibold">{new Date(refund.reviewed_at).toLocaleDateString()}</p>
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-muted-foreground">Refund ID</p>
                                    <p className="font-semibold">#{refund.id}</p>
                                  </div>
                                </div>

                                {refund.reason && (
                                  <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-1">Reason:</p>
                                    <p className="text-sm line-clamp-2">{refund.reason}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* View Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedRefund(refund);
                                setDetailsOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Refund Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Refund Request Details</DialogTitle>
            <DialogDescription>
              Refund ID: #{selectedRefund?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedRefund && (
            <div className="space-y-6">
              {/* Status Banner */}
              <div className={`p-4 rounded-lg border-2 ${
                selectedRefund.status === 'approved' ? 'bg-green-50 border-green-200' :
                selectedRefund.status === 'denied' ? 'bg-red-50 border-red-200' :
                'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center gap-2">
                  {selectedRefund.status === 'approved' ? <CheckCircle2 className="h-5 w-5 text-green-600" /> :
                   selectedRefund.status === 'denied' ? <XCircle className="h-5 w-5 text-red-600" /> :
                   <Clock className="h-5 w-5 text-yellow-600" />}
                  <span className="font-semibold">
                    {selectedRefund.status === 'approved' ? 'Refund Approved' :
                     selectedRefund.status === 'denied' ? 'Refund Denied' :
                     'Pending Review'}
                  </span>
                </div>
              </div>

              {/* Donation Info */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold mb-2">Donation Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Charity</p>
                    <p className="font-semibold">{selectedRefund.donation.charity.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Campaign</p>
                    <p className="font-semibold">{selectedRefund.donation.campaign?.title || 'General Fund'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-semibold">₱{selectedRefund.refund_amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Donated On</p>
                    <p className="font-semibold">{new Date(selectedRefund.donation.donated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Refund Details */}
              <div className="space-y-3">
                <h3 className="font-semibold">Refund Request Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Requested On</p>
                    <p className="font-semibold">{new Date(selectedRefund.created_at).toLocaleDateString()}</p>
                  </div>
                  {selectedRefund.reviewed_at && (
                    <div>
                      <p className="text-muted-foreground">Reviewed On</p>
                      <p className="font-semibold">{new Date(selectedRefund.reviewed_at).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-muted-foreground text-sm mb-2">Reason for Refund:</p>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedRefund.reason}</p>
                  </div>
                </div>

                {selectedRefund.proof_url && (
                  <div>
                    <p className="text-muted-foreground text-sm mb-2">Proof Attached:</p>
                    <a
                      href={buildStorageUrl(selectedRefund.proof_url) || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      View Proof Document
                    </a>
                  </div>
                )}
              </div>

              {/* Charity Response */}
              {selectedRefund.charity_response && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2 text-blue-900">Charity Response</h3>
                  <p className="text-sm text-blue-800 whitespace-pre-wrap">{selectedRefund.charity_response}</p>
                </div>
              )}

              {/* Next Steps */}
              {selectedRefund.status === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-900">
                    <strong>Status:</strong> Your refund request is currently being reviewed by the charity. You will receive an email notification once they respond.
                  </p>
                </div>
              )}

              {selectedRefund.status === 'approved' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-900">
                    <strong>Next Steps:</strong> The charity will process your refund directly. Please expect to receive your refund within 5-7 business days through your original payment method.
                  </p>
                </div>
              )}

              {selectedRefund.status === 'denied' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-900">
                    If you believe this decision was made in error or have questions, please contact the charity directly through the CharityHub platform.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
