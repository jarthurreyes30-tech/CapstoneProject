import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Save, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

interface TaxInfo {
  taxpayer_name: string;
  tin: string;
  address: string;
  city: string;
  province: string;
  country: string;
  postal_code: string;
}

export default function TaxInfo() {
  const [taxInfo, setTaxInfo] = useState<TaxInfo>({
    taxpayer_name: "",
    tin: "",
    address: "",
    city: "",
    province: "",
    country: "Philippines",
    postal_code: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTaxInfo();
  }, []);

  const fetchTaxInfo = async () => {
    try {
      const response = await api.get("/me/tax-info");
      if (response.data) {
        setTaxInfo(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch tax info", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof TaxInfo, value: string) => {
    setTaxInfo({ ...taxInfo, [field]: value });
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.post("/me/tax-info", taxInfo);
      toast({
        title: "Success",
        description: "Tax information updated successfully. Check your email for confirmation.",
      });
      setHasChanges(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update tax information",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
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
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <FileText className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Tax Information</h1>
            <p className="text-muted-foreground">Manage your tax and billing details for receipts</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Taxpayer Information</CardTitle>
          <CardDescription>
            This information will be used for donation receipts and annual tax statements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <strong>Why we need this:</strong> This information is used to generate official donation receipts and annual statements for tax purposes. All data is kept secure and confidential.
              </AlertDescription>
            </Alert>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxpayer_name">Full Legal Name *</Label>
                <Input
                  id="taxpayer_name"
                  placeholder="Juan dela Cruz"
                  value={taxInfo.taxpayer_name}
                  onChange={(e) => handleChange("taxpayer_name", e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  As it appears on official documents
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tin">Tax Identification Number (TIN) *</Label>
                <Input
                  id="tin"
                  placeholder="123-456-789-000"
                  value={taxInfo.tin}
                  onChange={(e) => handleChange("tin", e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Your BIR TIN for tax-deductible donations
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  placeholder="123 Main Street, Brgy. Sample"
                  value={taxInfo.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City/Municipality *</Label>
                  <Input
                    id="city"
                    placeholder="Manila"
                    value={taxInfo.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Province *</Label>
                  <Input
                    id="province"
                    placeholder="Metro Manila"
                    value={taxInfo.province}
                    onChange={(e) => handleChange("province", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    placeholder="1000"
                    value={taxInfo.postal_code}
                    onChange={(e) => handleChange("postal_code", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={taxInfo.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Tax Benefits</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                <li>Get official receipts for all donations</li>
                <li>Claim tax deductions for charitable contributions</li>
                <li>Receive annual statements for easy tax filing</li>
                <li>Track your philanthropic impact</li>
              </ul>
            </div>

            {hasChanges && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  You have unsaved changes. Click "Save Changes" to update your information.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={saving || !hasChanges} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              {hasChanges && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    fetchTaxInfo();
                    setHasChanges(false);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              An email confirmation will be sent when your tax information is updated
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
