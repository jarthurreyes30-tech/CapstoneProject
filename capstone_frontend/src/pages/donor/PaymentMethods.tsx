import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Plus, Trash2, Star, Wallet, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

interface PaymentMethod {
  id: number;
  type: string;
  provider: string;
  last4: string;
  expiry_month?: string;
  expiry_year?: string;
  is_default: boolean;
  created_at: string;
}

export default function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; method: PaymentMethod | null }>({
    open: false,
    method: null,
  });
  const { toast } = useToast();

  // Add payment method form state
  const [newMethod, setNewMethod] = useState({
    type: "credit_card",
    provider: "",
    last4: "",
    expiry_month: "",
    expiry_year: "",
    is_default: false,
  });

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await api.get("/me/payment-methods");
      setPaymentMethods(response.data);
    } catch (error) {
      console.error("Failed to fetch payment methods", error);
      toast({
        title: "Error",
        description: "Failed to load payment methods",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMethod = async () => {
    try {
      await api.post("/me/payment-methods", newMethod);
      toast({
        title: "Success",
        description: "Payment method added successfully. Check your email for confirmation.",
      });
      setShowAddDialog(false);
      setNewMethod({
        type: "credit_card",
        provider: "",
        last4: "",
        expiry_month: "",
        expiry_year: "",
        is_default: false,
      });
      fetchPaymentMethods();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add payment method",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMethod = async () => {
    if (!deleteDialog.method) return;

    try {
      await api.delete(`/me/payment-methods/${deleteDialog.method.id}`);
      toast({
        title: "Success",
        description: "Payment method removed successfully",
      });
      setDeleteDialog({ open: false, method: null });
      fetchPaymentMethods();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove payment method",
        variant: "destructive",
      });
    }
  };

  const getCardIcon = (type: string) => {
    if (type === "wallet") return <Wallet className="h-6 w-6" />;
    return <CreditCard className="h-6 w-6" />;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Payment Methods</h1>
              <p className="text-muted-foreground">Manage your cards and payment options</p>
            </div>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Method
          </Button>
        </div>
      </div>

      {paymentMethods.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <CreditCard className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Payment Methods</h3>
              <p className="text-muted-foreground mb-4">
                You haven't added any payment methods yet.
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Method
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {paymentMethods.map((method) => (
            <Card key={method.id} className={method.is_default ? "border-primary border-2" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                      {getCardIcon(method.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">
                          {method.provider} •••• {method.last4}
                        </CardTitle>
                        {method.is_default && (
                          <Badge variant="default" className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            Default
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="capitalize">{method.type.replace("_", " ")}</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteDialog({ open: true, method })}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              {method.expiry_month && method.expiry_year && (
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Expires {method.expiry_month}/{method.expiry_year}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Added {new Date(method.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Add Payment Method Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="w-[90vw] max-w-[95vw] sm:w-full sm:max-w-md p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>Add a new payment method for donations</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Payment Type</Label>
              <Select value={newMethod.type} onValueChange={(value) => setNewMethod({ ...newMethod, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="wallet">E-Wallet (GCash, PayMaya)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider">Card Provider / Wallet Name</Label>
              <Input
                id="provider"
                placeholder="e.g., Visa, Mastercard, GCash"
                value={newMethod.provider}
                onChange={(e) => setNewMethod({ ...newMethod, provider: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last4">Last 4 Digits</Label>
              <Input
                id="last4"
                placeholder="1234"
                maxLength={4}
                value={newMethod.last4}
                onChange={(e) => setNewMethod({ ...newMethod, last4: e.target.value.replace(/\D/g, "") })}
              />
            </div>

            {newMethod.type !== "wallet" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="month">Expiry Month</Label>
                  <Input
                    id="month"
                    placeholder="MM"
                    maxLength={2}
                    value={newMethod.expiry_month}
                    onChange={(e) => setNewMethod({ ...newMethod, expiry_month: e.target.value.replace(/\D/g, "") })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Expiry Year</Label>
                  <Input
                    id="year"
                    placeholder="YY"
                    maxLength={2}
                    value={newMethod.expiry_year}
                    onChange={(e) => setNewMethod({ ...newMethod, expiry_year: e.target.value.replace(/\D/g, "") })}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="default"
                checked={newMethod.is_default}
                onChange={(e) => setNewMethod({ ...newMethod, is_default: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="default" className="cursor-pointer">Set as default payment method</Label>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> For security, we only store the last 4 digits. Your full card details are never stored on our servers.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddMethod}
              disabled={!newMethod.provider || !newMethod.last4}
            >
              Add Payment Method
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Payment Method?</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this payment method?
            </DialogDescription>
          </DialogHeader>
          {deleteDialog.method && (
            <div className="bg-gray-50 border rounded-lg p-4">
              <div className="flex items-center gap-3">
                {getCardIcon(deleteDialog.method.type)}
                <div>
                  <p className="font-medium">
                    {deleteDialog.method.provider} •••• {deleteDialog.method.last4}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {deleteDialog.method.type.replace("_", " ")}
                  </p>
                </div>
              </div>
            </div>
          )}
          {deleteDialog.method?.is_default && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                <AlertTriangle className="inline h-4 w-4 mr-1" />
                This is your default payment method. You may want to set another as default before removing this.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, method: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteMethod}>
              Remove Method
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
