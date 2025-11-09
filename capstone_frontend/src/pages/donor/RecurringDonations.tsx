import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Repeat, Pause, Play, X, Calendar, Coins, Building2, AlertTriangle, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

interface RecurringDonation {
  id: number;
  amount: number;
  interval: string;
  status: string;
  next_charge_at: string;
  started_at: string;
  campaign: {
    id: number;
    title: string;
  };
  charity: {
    id: number;
    name: string;
  };
  total_donations: number;
  total_amount: number;
}

export default function RecurringDonations() {
  const [donations, setDonations] = useState<RecurringDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionDialog, setActionDialog] = useState<{ open: boolean; donation: RecurringDonation | null; action: string }>({
    open: false,
    donation: null,
    action: "",
  });
  const [editDialog, setEditDialog] = useState<{ open: boolean; donation: RecurringDonation | null }>({
    open: false,
    donation: null,
  });
  const [editAmount, setEditAmount] = useState("");
  const [editInterval, setEditInterval] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchRecurringDonations();
  }, []);

  const fetchRecurringDonations = async () => {
    try {
      const response = await api.get("/me/recurring-donations");
      setDonations(response.data);
    } catch (error) {
      console.error("Failed to fetch recurring donations", error);
      toast({
        title: "Error",
        description: "Failed to load recurring donations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (donation: RecurringDonation, action: string) => {
    setActionDialog({ open: true, donation, action });
  };

  const handleEdit = (donation: RecurringDonation) => {
    setEditAmount(donation.amount.toString());
    setEditInterval(donation.interval);
    setEditDialog({ open: true, donation });
  };

  const confirmEdit = async () => {
    if (!editDialog.donation) return;

    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount < 10) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be at least ₱10",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.patch(`/recurring-donations/${editDialog.donation.id}`, {
        amount: amount,
        interval: editInterval,
      });
      toast({
        title: "Success",
        description: "Recurring donation updated successfully",
      });
      fetchRecurringDonations();
      setEditDialog({ open: false, donation: null });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update recurring donation",
        variant: "destructive",
      });
    }
  };

  const confirmAction = async () => {
    if (!actionDialog.donation) return;

    const { donation, action } = actionDialog;

    try {
      if (action === "cancel") {
        await api.delete(`/recurring-donations/${donation.id}`);
        toast({
          title: "Success",
          description: "Recurring donation cancelled successfully",
        });
      } else if (action === "pause") {
        await api.patch(`/recurring-donations/${donation.id}`, { status: "paused" });
        toast({
          title: "Success",
          description: "Recurring donation paused successfully",
        });
      } else if (action === "resume") {
        await api.patch(`/recurring-donations/${donation.id}`, { status: "active" });
        toast({
          title: "Success",
          description: "Recurring donation resumed successfully",
        });
      }

      fetchRecurringDonations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update recurring donation",
        variant: "destructive",
      });
    } finally {
      setActionDialog({ open: false, donation: null, action: "" });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      active: { variant: "default", label: "Active" },
      paused: { variant: "secondary", label: "Paused" },
      cancelled: { variant: "destructive", label: "Cancelled" },
    };
    const config = variants[status] || variants.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getIntervalText = (interval: string) => {
    const texts: any = {
      weekly: "Weekly",
      monthly: "Monthly",
      quarterly: "Quarterly",
      yearly: "Yearly",
    };
    return texts[interval] || interval;
  };

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
            <Repeat className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Recurring Donations</h1>
            <p className="text-muted-foreground">Manage your automatic recurring contributions</p>
          </div>
        </div>
      </div>

      {donations.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Repeat className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Recurring Donations</h3>
              <p className="text-muted-foreground mb-4">
                You don't have any recurring donations set up yet.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {donations.map((donation) => (
            <Card key={donation.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{donation.campaign.title}</CardTitle>
                      {getStatusBadge(donation.status)}
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {donation.charity.name}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">₱{donation.amount.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">{getIntervalText(donation.interval)}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Next Charge</p>
                    <p className="font-semibold flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {donation.next_charge_at
                        ? new Date(donation.next_charge_at).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Donations</p>
                    <p className="font-semibold">{donation.total_donations}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Contributed</p>
                    <p className="font-semibold">₱{donation.total_amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Started</p>
                    <p className="font-semibold">
                      {new Date(donation.started_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {donation.status !== "cancelled" && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(donation)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    {donation.status === "active" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(donation, "pause")}
                      >
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(donation, "resume")}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Resume
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleAction(donation, "cancel")}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ ...editDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Recurring Donation</DialogTitle>
            <DialogDescription>
              Update the amount or frequency of your recurring donation to{" "}
              <strong>{editDialog.donation?.campaign.title}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Donation Amount (₱)</Label>
              <Input
                id="edit-amount"
                type="number"
                min="10"
                step="0.01"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder="100.00"
              />
              <p className="text-xs text-muted-foreground">Minimum amount: ₱10</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-interval">Frequency</Label>
              <Select value={editInterval} onValueChange={setEditInterval}>
                <SelectTrigger id="edit-interval">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly (Every 3 months)</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Alert>
              <Coins className="h-4 w-4" />
              <AlertDescription>
                Changes will take effect on your next scheduled donation.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog({ open: false, donation: null })}
            >
              Cancel
            </Button>
            <Button onClick={confirmEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action === "cancel" && "Cancel Recurring Donation?"}
              {actionDialog.action === "pause" && "Pause Recurring Donation?"}
              {actionDialog.action === "resume" && "Resume Recurring Donation?"}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.action === "cancel" && (
                <>
                  <Alert variant="destructive" className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Warning:</strong> This will permanently cancel your recurring donation to{" "}
                      <strong>{actionDialog.donation?.campaign.title}</strong>. This action cannot be undone.
                    </AlertDescription>
                  </Alert>
                </>
              )}
              {actionDialog.action === "pause" && (
                <p className="mt-2">
                  Your recurring donation to <strong>{actionDialog.donation?.campaign.title}</strong> will be
                  paused. You can resume it at any time.
                </p>
              )}
              {actionDialog.action === "resume" && (
                <p className="mt-2">
                  Your recurring donation to <strong>{actionDialog.donation?.campaign.title}</strong> will be
                  resumed and the next charge will be processed as scheduled.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog({ open: false, donation: null, action: "" })}
            >
              Cancel
            </Button>
            <Button
              variant={actionDialog.action === "cancel" ? "destructive" : "default"}
              onClick={confirmAction}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
