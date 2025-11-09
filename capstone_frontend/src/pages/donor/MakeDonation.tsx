import { useEffect, useState } from "react";
import { Heart, Upload, CheckCircle, Gift, Building2, Target, CreditCard, FileText, Sparkles, TrendingUp, Shield, Scan } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth";
import { useAuth } from "@/context/AuthContext";
import ReceiptUploader from "@/components/ReceiptUploader";
import { buildStorageUrl } from "@/lib/api";

// Helper function to check if campaign has ended based on end_date
const isCampaignEnded = (endDate: string | undefined | null): boolean => {
  if (!endDate) return false;
  const now = new Date();
  const end = new Date(endDate);
  return end < now;
};

// Helper function to get accurate campaign status
const getCampaignStatus = (campaign: { end_date?: string; status?: string }): 'active' | 'completed' => {
  const hasEnded = isCampaignEnded(campaign.end_date);
  
  // If campaign date has ended, it's completed regardless of status field
  if (hasEnded) return 'completed';
  
  // If campaign status is closed/completed, it's completed
  if (campaign.status === 'closed' || campaign.status === 'completed') return 'completed';
  
  // Otherwise, if it's published/active and hasn't ended, it's active
  if (campaign.status === 'published' || campaign.status === 'active') return 'active';
  
  // Default to active for other statuses if not ended
  return 'active';
};

export default function MakeDonation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    charityId: "",
    campaignId: "",
    amount: "",
    customAmount: "",
    donationType: "one-time",
    frequency: "monthly",
    message: "",
    isAnonymous: false,
    proofOfPayment: null as File | null,
    channel_used: "",
    reference_number: ""
  });
  const [charities, setCharities] = useState<Array<{ id: number; name: string }>>([]);
  const [campaigns, setCampaigns] = useState<Array<{ id: number; title: string; donation_type?: string; status?: string; end_date?: string }>>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [channels, setChannels] = useState<Array<{ id:number; type:string; label:string; is_active:boolean; account_name?:string; account_number?:string; qr_code_path?:string; instructions?:string }>>([]);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [ocrDetectedAmount, setOcrDetectedAmount] = useState<string>("");
  const [amountMismatch, setAmountMismatch] = useState<boolean>(false);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchCharities();
  }, []);

  useEffect(() => {
    if (formData.charityId) fetchCampaigns(parseInt(formData.charityId, 10));
    else setCampaigns([]);
  }, [formData.charityId]);

  useEffect(() => {
    // Fetch campaign details and donation channels when a campaign is selected
    if (formData.campaignId && formData.campaignId !== "") {
      if (formData.campaignId === "direct") {
        // For direct donations, fetch charity-level channels
        setSelectedCampaign(null);
        if (formData.charityId) {
          fetchCharityDonationChannels(parseInt(formData.charityId, 10));
        }
      } else {
        const id = parseInt(formData.campaignId, 10);
        if (!isNaN(id)) {
          fetchCampaignDetails(id);
          fetchDonationChannels(id);
        }
      }
    } else {
      setChannels([]);
      setSelectedCampaign(null);
      setFormData(prev => ({ ...prev, channel_used: "", donationType: "one-time" }));
    }
  }, [formData.campaignId]);

  const fetchCharities = async () => {
    try {
      const res = await fetch(`${API_URL}/charities`);
      if (!res.ok) throw new Error('Failed to load charities');
      const data = await res.json();
      // backend returns { charities: { data: [...] } }
      const charitiesArray = data.charities?.data ?? data.charities ?? data.data ?? data;
      setCharities(Array.isArray(charitiesArray) ? charitiesArray : []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Unable to load charities');
    }
  };

  const fetchCampaignDetails = async (campaignId: number) => {
    try {
      const res = await fetch(`${API_URL}/campaigns/${campaignId}`);
      if (!res.ok) return;
      const data = await res.json();
      setSelectedCampaign(data);
      // Auto-set donation type from campaign
      const donationType = data.donation_type === 'recurring' ? 'recurring' : 'one-time';
      setFormData(prev => ({ ...prev, donationType }));
    } catch (e) {
      // silent fail
    }
  };

  const fetchDonationChannels = async (campaignId: number) => {
    try {
      const res = await fetch(`${API_URL}/campaigns/${campaignId}/donation-channels`);
      if (!res.ok) return;
      const data = await res.json();
      const list = (data.data || data || []).filter((c: any) => c.is_active);
      setChannels(list);
    } catch (e) {
      // silent fail
    }
  };

  const fetchCharityDonationChannels = async (charityId: number) => {
    try {
      const res = await fetch(`${API_URL}/charities/${charityId}/donation-channels`);
      if (!res.ok) return;
      const data = await res.json();
      const list = (data.data || data || []).filter((c: any) => c.is_active);
      setChannels(list);
    } catch (e) {
      // silent fail
    }
  };

  const fetchCampaigns = async (charityId: number) => {
    try {
      const url = new URL(`${API_URL}/charities/${charityId}/campaigns`);
      // Only show published campaigns for donors
      url.searchParams.set('status', 'published');
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to load campaigns');
      const data = await res.json();
      // Unwrap common pagination/data shapes
      // Possible shapes: { data: [...] } or paginator { data: [...], links: {...} }
      const raw = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.campaigns?.data)
            ? data.campaigns.data
            : [];
      setCampaigns(raw);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Unable to load campaigns');
      setCampaigns([]);
    }
  };

  const suggestedAmounts = [500, 1000, 2500, 5000, 10000];

  const handleSubmit = async () => {
    if (!formData.charityId || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate donation amount
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Donation amount must be greater than ₱0. Please enter a valid amount.');
      return;
    }
    if (amount < 1) {
      toast.error('Donation amount must be at least ₱1. Donations less than ₱1 are not accepted.');
      return;
    }

    try {
      const token = authService.getToken();
      if (!token) {
        toast.info('Please log in to donate');
        navigate('/auth/login');
        return;
      }

      // Require campaign selection to ensure channels can be used
      if (!formData.campaignId) {
        toast.error('Please select a campaign to proceed');
        setStep(1);
        return;
      }

      // Validate channel and reference and proof
      if (!formData.channel_used) {
        toast.error('Please select a donation channel');
        return;
      }
      if (!formData.reference_number.trim()) {
        toast.error('Please enter the transaction/reference number');
        return;
      }
      if (!formData.proofOfPayment) {
        toast.error('Please upload proof of payment');
        return;
      }

      // Submit via campaign or charity manual donation endpoint
      const fd = new FormData();
      fd.append('donor_name', user?.name || 'Donor');
      if (user?.email) fd.append('donor_email', user.email);
      fd.append('amount', formData.amount);
      fd.append('channel_used', formData.channel_used);
      fd.append('reference_number', formData.reference_number);
      if (formData.message) fd.append('message', formData.message);
      fd.append('is_anonymous', formData.isAnonymous ? '1' : '0');
      fd.append('proof_image', formData.proofOfPayment);

      const endpoint = formData.campaignId === "direct"
        ? `${API_URL}/charities/${formData.charityId}/donate`
        : `${API_URL}/campaigns/${formData.campaignId}/donate`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        
        // Handle duplicate reference number with detailed notification
        if (error.details && error.details.reference_number) {
          toast.error(
            <div className="space-y-2">
              <p className="font-bold text-red-600">{error.message || 'Duplicate Reference Number!'}</p>
              <p className="text-sm">{error.error}</p>
              <div className="bg-red-50 p-3 rounded-md mt-2 space-y-1">
                <p className="text-xs"><strong>Reference:</strong> {error.details.reference_number}</p>
                <p className="text-xs"><strong>Previous Donation:</strong> {error.details.previous_donation_amount}</p>
                <p className="text-xs"><strong>To:</strong> {error.details.previous_donation_to}</p>
                <p className="text-xs"><strong>Date:</strong> {error.details.previous_donation_date}</p>
                <p className="text-xs"><strong>Status:</strong> <span className="capitalize">{error.details.status}</span></p>
              </div>
              <p className="text-xs text-red-700 mt-2">Please verify your reference number or contact support if this is an error.</p>
            </div>,
            { duration: 10000 }
          );
        } else {
          throw new Error(error.message || 'Failed to submit donation');
        }
        return;
      }

      const result = await res.json();
      toast.success(result.message || 'Donation submitted successfully!');
      
      // Show thank you card instead of navigating
      setSubmitted(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Unable to submit donation');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file (JPG/PNG)');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image must be less than 2MB');
        return;
      }
      setFormData({ ...formData, proofOfPayment: file });
      setProofPreview(URL.createObjectURL(file));
      toast.success("Proof of payment uploaded");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 mb-4">
          <Heart className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">Make a Donation</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Your generosity creates lasting impact. Every contribution matters.</p>
      </div>

      {/* Thank You Card */}
      {submitted ? (
        <div className="flex items-center justify-center">
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 max-w-2xl w-full shadow-2xl">
            <CardContent className="pt-12 pb-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 mb-6 shadow-lg">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-3 text-green-700 dark:text-green-400">Thank You for Your Generosity!</h2>
              <p className="text-lg text-muted-foreground mb-2">
                Your donation has been submitted successfully.
              </p>
              <p className="text-muted-foreground mb-8">
                {formData.campaignId === "direct" 
                  ? "Your donation will support the charity's general operations and programs."
                  : "The charity will review your proof of donation and confirm it shortly."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <Button 
                  onClick={() => navigate("/donor")}
                  className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  <Building2 className="mr-2 h-5 w-5" />
                  Back to Dashboard
                </Button>
                {formData.campaignId !== "direct" && (
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(`/campaigns/${formData.campaignId}`)}
                    className="flex-1 h-12 text-base font-semibold border-primary/20"
                  >
                    <Target className="mr-2 h-5 w-5" />
                    View Campaign
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/donor/history")}
                  className="flex-1 h-12 text-base font-semibold border-primary/20"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  My Donations
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
      {/* Progress Steps */}
      <div className="mb-12">
        <div className="relative max-w-3xl mx-auto px-8">
          {/* Connector line - positioned at icon center */}
          <div className="absolute left-0 right-0 top-6 h-0.5 bg-muted" style={{ zIndex: 0 }} />
          <div
            className="absolute left-0 top-6 h-0.5 bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%', zIndex: 0 }}
          />

          <div className="relative grid grid-cols-3 items-center justify-items-center gap-8" style={{ zIndex: 1 }}>
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 cursor-default hover:scale-105 shadow-[0_0_0_4px] shadow-background ${
                  step >= 1
                    ? 'bg-gradient-to-br from-primary to-primary/80 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step > 1 ? <CheckCircle className="h-6 w-6" /> : <Building2 className="h-6 w-6" />}
              </div>
              <span className={`text-sm font-medium mt-3 ${step >= 1 ? '' : 'text-muted-foreground'}`}>Select Campaign</span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 cursor-default hover:scale-105 shadow-[0_0_0_4px] shadow-background ${
                  step >= 2
                    ? 'bg-gradient-to-br from-primary to-primary/80 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step > 2 ? <CheckCircle className="h-6 w-6" /> : <Gift className="h-6 w-6" />}
              </div>
              <span className={`text-sm font-medium mt-3 ${step >= 2 ? '' : 'text-muted-foreground'}`}>Donation Amount</span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 cursor-default hover:scale-105 shadow-[0_0_0_4px] shadow-background ${
                  step >= 3
                    ? 'bg-gradient-to-br from-primary to-primary/80 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <CreditCard className="h-6 w-6" />
              </div>
              <span className={`text-sm font-medium mt-3 ${step >= 3 ? '' : 'text-muted-foreground'}`}>Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: Select Charity & Campaign */}
      {step === 1 && (
        <Card className="border-primary/20 shadow-2xl backdrop-blur-sm bg-card/95 max-w-3xl mx-auto">
          <CardHeader className="text-center pb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4 mx-auto">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">Select Campaign to Support</CardTitle>
            <CardDescription className="text-base">Choose the cause you want to make an impact on</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            <div className="space-y-3">
              <Label htmlFor="charity" className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Select Charity Organization
              </Label>
              <Select value={formData.charityId} onValueChange={(value) => setFormData({ ...formData, charityId: value, campaignId: "", channel_used: "" })}>
                <SelectTrigger className="h-12 border-primary/20 hover:border-primary/40 transition-colors">
                  <SelectValue placeholder="🏢 Choose a charity organization" />
                </SelectTrigger>
                <SelectContent>
                  {charities.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.charityId && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                <Label htmlFor="campaign" className="text-base font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Select Campaign
                </Label>
                <Select value={formData.campaignId} onValueChange={(value) => setFormData({ ...formData, campaignId: value })}>
                  <SelectTrigger className="h-12 border-primary/20 hover:border-primary/40 transition-colors">
                    <SelectValue placeholder="🎯 Choose a specific campaign or donate directly" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">
                      💝 Donate Directly to Charity (General Fund)
                    </SelectItem>
                    {campaigns.map(c => {
                      // Get accurate campaign status based on end_date
                      const campaignStatus = getCampaignStatus(c);
                      const isCompleted = campaignStatus === 'completed';
                      const isActive = campaignStatus === 'active';
                      
                      return (
                        <SelectItem key={c.id} value={String(c.id)}>
                          <div className="flex items-center justify-between w-full gap-2">
                            <span className="flex-1">{c.title}</span>
                            {isCompleted && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-600 dark:text-gray-400 font-medium">
                                Completed
                              </span>
                            )}
                            {isActive && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 font-medium">
                                Active
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {formData.campaignId === "direct" ? (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Your donation will support the charity's general operations and programs
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Payment channels will be displayed in the next step
                  </p>
                )}
              </div>
            )}

            <div className="pt-6">
              <Button 
                onClick={() => setStep(2)} 
                disabled={!formData.charityId || !formData.campaignId} 
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Continue to Amount
                <TrendingUp className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Amount & Type */}
      {step === 2 && (
        <Card className="border-primary/20 shadow-2xl backdrop-blur-sm bg-card/95 max-w-3xl mx-auto">
          <CardHeader className="text-center pb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4 mx-auto">
              <Gift className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">Choose Your Contribution</CardTitle>
            <CardDescription className="text-base">Every amount makes a difference</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 px-8 pb-8">
            {/* Campaign Donation Type Info */}
            {selectedCampaign && formData.campaignId !== "direct" && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm mb-1">Campaign Type</p>
                    <p className="text-sm text-muted-foreground">
                      This campaign accepts <span className="font-semibold text-primary">{formData.donationType === 'recurring' ? 'Recurring' : 'One-time'}</span> donations
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Frequency (if recurring) */}
            {formData.donationType === 'recurring' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                <Label className="text-base font-semibold">Frequency</Label>
                <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
                  <SelectTrigger className="h-12 border-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">📅 Weekly</SelectItem>
                    <SelectItem value="monthly">📆 Monthly</SelectItem>
                    <SelectItem value="quarterly">🗓️ Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Suggested Amounts */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Quick Select Amount</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {suggestedAmounts.map(amount => (
                  <Button
                    key={amount}
                    type="button"
                    variant={formData.amount === amount.toString() ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, amount: amount.toString(), customAmount: "" })}
                    className={`h-16 text-lg font-bold transition-all duration-300 ${
                      formData.amount === amount.toString() 
                        ? 'bg-gradient-to-br from-primary to-primary/80 shadow-lg scale-105' 
                        : 'hover:border-primary/40 hover:scale-105'
                    }`}
                  >
                    ₱{amount.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="space-y-3">
              <Label htmlFor="customAmount" className="text-base font-semibold">Or Enter Custom Amount</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">₱</span>
                <Input
                  id="customAmount"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.customAmount}
                  onChange={(e) => setFormData({ ...formData, customAmount: e.target.value, amount: e.target.value })}
                  className="h-14 pl-10 pr-4 text-lg font-semibold border-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-3">
              <Label htmlFor="message" className="text-base font-semibold">Personal Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Share why you're supporting this cause..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="resize-none border-primary/20 focus:border-primary"
              />
            </div>

            {/* Anonymous */}
            <div className="p-4 rounded-xl border border-border/50 bg-muted/30">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="anonymous"
                  checked={formData.isAnonymous}
                  onCheckedChange={(checked) => setFormData({ ...formData, isAnonymous: checked as boolean })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="anonymous" className="cursor-pointer font-semibold block mb-1">
                    Make this donation anonymous
                  </Label>
                  <p className="text-sm text-muted-foreground">Your name will be hidden from public donation lists</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12 border-primary/20">
                ← Back
              </Button>
              <Button 
                onClick={() => setStep(3)} 
                disabled={!formData.amount} 
                className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Continue to Payment →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Payment */}
      {step === 3 && (
        <Card className="border-primary/20 shadow-2xl backdrop-blur-sm bg-card/95 max-w-3xl mx-auto">
          <CardHeader className="text-center pb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4 mx-auto">
              <CreditCard className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">Complete Your Donation</CardTitle>
            <CardDescription className="text-base">Upload proof and finalize your contribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 px-8 pb-8">
            {/* Summary */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 shadow-inner">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Donation Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Charity:</span>
                  <span className="font-semibold">{charities.find(c => c.id === parseInt(formData.charityId))?.name || 'N/A'}</span>
                </div>
                {formData.campaignId === "direct" ? (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Donation Type:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">Direct to Charity (General Fund)</span>
                </div>
              ) : formData.campaignId && formData.campaignId !== 'general' ? (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Campaign:</span>
                  <span className="font-semibold">{campaigns.find(c => c.id === parseInt(formData.campaignId))?.title || 'N/A'}</span>
                </div>
              ) : null}  
                {formData.campaignId !== "direct" && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-semibold capitalize">{formData.donationType}</span>
                </div>
              )}
                <div className="flex justify-between items-center pt-3 border-t border-primary/20">
                  <span className="text-lg font-semibold">Total Amount:</span>
                  <span className="text-2xl font-bold text-primary">₱{parseFloat(formData.amount).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Donation Channel */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                Payment Channel
              </Label>
              <Select 
                value={formData.channel_used} 
                onValueChange={(v) => {
                  setFormData({ ...formData, channel_used: v });
                  const channel = channels.find(ch => ch.label === v);
                  setSelectedChannel(channel || null);
                }}
              >
                <SelectTrigger className="h-12 border-primary/20">
                  <SelectValue placeholder={channels.length ? '💳 Select payment channel' : 'No channels available'} />
                </SelectTrigger>
                <SelectContent>
                  {channels.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">No channels available</div>
                  ) : (
                    channels.map((ch) => (
                      <SelectItem key={ch.id} value={ch.label}>{ch.label} ({ch.type})</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              {/* Display Selected Channel Details */}
              {selectedChannel && (
                <div className="mt-3 p-4 rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary" />
                      {selectedChannel.label}
                    </h4>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                      {selectedChannel.type}
                    </span>
                  </div>

                  {/* Two Column Layout: Info Left, Image Right */}
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Left Side - Account Information */}
                    <div className="flex-1 space-y-3">
                      {selectedChannel.account_name && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Account Name</p>
                          <p className="font-medium text-sm">{selectedChannel.account_name}</p>
                        </div>
                      )}
                      {selectedChannel.account_number && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Account Number</p>
                          <p className="font-mono font-medium text-sm">{selectedChannel.account_number}</p>
                        </div>
                      )}
                      {selectedChannel.instructions && (
                        <div className="space-y-1 pt-2 border-t border-primary/10">
                          <p className="text-xs text-muted-foreground font-semibold">Payment Instructions</p>
                          <p className="text-xs text-muted-foreground/80 leading-relaxed">{selectedChannel.instructions}</p>
                        </div>
                      )}
                    </div>

                    {/* Right Side - QR Code Image */}
                    {selectedChannel.qr_code_path && (
                      <div className="flex flex-col items-center md:items-end space-y-2">
                        <p className="text-xs text-muted-foreground">Scan to Pay</p>
                        <div className="relative group">
                          <img 
                            src={selectedChannel.qr_code_path.startsWith('http') 
                              ? selectedChannel.qr_code_path 
                              : buildStorageUrl(selectedChannel.qr_code_path) || ''}
                            alt="Payment QR Code"
                            className="w-40 h-40 md:w-48 md:h-48 object-contain bg-white p-2 border-2 border-primary/20 rounded-lg cursor-pointer hover:border-primary/40 hover:shadow-lg transition-all"
                            onClick={() => setShowChannelModal(true)}
                            onError={(e) => {
                              console.error('QR Code failed to load:', selectedChannel.qr_code_path);
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3EQR Code%3C/text%3E%3C/svg%3E';
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg cursor-pointer" onClick={() => setShowChannelModal(true)}>
                            <div className="text-center text-white">
                              <svg className="h-8 w-8 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                              <p className="text-xs font-medium">Click to enlarge</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Reference Number */}
            <div className="space-y-3">
              <Label htmlFor="reference" className="text-base font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Transaction Reference
              </Label>
              <Input 
                id="reference" 
                className="h-12 border-primary/20 focus:border-primary" 
                placeholder="Enter transaction/reference number" 
                value={formData.reference_number} 
                onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })} 
              />
            </div>

            {/* Upload Proof with OCR */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Scan className="h-4 w-4 text-primary" />
                Proof of Payment (with Auto-Detection)
              </Label>
              <div className="p-6 rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                <ReceiptUploader
                  onFileChange={(file) => {
                    setFormData({ ...formData, proofOfPayment: file });
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setProofPreview(reader.result as string);
                      reader.readAsDataURL(file);
                    } else {
                      setProofPreview(null);
                    }
                  }}
                  onOCRExtract={(result) => {
                    // Auto-fill reference number
                    if (result.refNumber) {
                      setFormData(prev => ({ ...prev, reference_number: result.refNumber || '' }));
                      toast.success('Reference number detected: ' + result.refNumber);
                    }
                    
                    // Validate amount matches donor's input
                    if (result.amount) {
                      setOcrDetectedAmount(result.amount);
                      const detectedAmount = parseFloat(result.amount);
                      const inputAmount = parseFloat(formData.amount);
                      
                      console.log('OCR Validation:', {
                        detectedAmount,
                        inputAmount,
                        detectedType: typeof detectedAmount,
                        inputType: typeof inputAmount,
                        difference: Math.abs(detectedAmount - inputAmount)
                      });
                      
                      if (!isNaN(detectedAmount) && !isNaN(inputAmount) && inputAmount > 0) {
                        // Allow small rounding differences (within 1 peso)
                        const difference = Math.abs(detectedAmount - inputAmount);
                        
                        if (difference <= 1) {
                          setAmountMismatch(false);
                          toast.success(`Amount verified: ₱${detectedAmount.toLocaleString()} matches your donation`);
                        } else {
                          setAmountMismatch(true);
                          toast.error(
                            `Amount mismatch! Receipt shows ₱${detectedAmount.toLocaleString()} but you entered ₱${inputAmount.toLocaleString()}. Please verify.`,
                            { duration: 8000 }
                          );
                        }
                      } else {
                        // If we can't validate, just show the detected amount without error
                        console.log('Cannot validate amounts - invalid numbers');
                      }
                    }
                    
                    if (result.confidence && result.confidence < 60) {
                      toast.warning('Low OCR confidence. Please verify the values.');
                    }
                  }}
                />
                {proofPreview && (
                  <div className="mt-4 relative rounded-lg overflow-hidden border border-primary/20">
                    <img src={proofPreview} alt="Receipt Preview" className="w-full h-48 object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, proofOfPayment: null });
                        setProofPreview(null);
                        setOcrDetectedAmount("");
                        setAmountMismatch(false);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-full hover:bg-destructive/90 shadow-lg text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
              
              {/* Amount Mismatch Error */}
              {amountMismatch && ocrDetectedAmount && (() => {
                const detected = parseFloat(ocrDetectedAmount);
                const input = parseFloat(formData.amount);
                const actualDifference = Math.abs(detected - input);
                // Only show error if there's actually a difference > 1
                return actualDifference > 1 ? (
                  <div className="p-4 rounded-lg bg-red-500/10 border-2 border-red-500/50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-red-500/20 shrink-0">
                        <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-red-600 dark:text-red-400 mb-1">Amount Mismatch Detected</h4>
                        <p className="text-sm text-red-600/90 dark:text-red-400/90 mb-2">
                          The amount on your receipt (₱{detected.toLocaleString()}) doesn't match your donation amount (₱{input.toLocaleString()}).
                        </p>
                        <p className="text-xs text-red-600/80 dark:text-red-400/80">
                          Please verify your receipt or go back to correct your donation amount.
                        </p>
                        <div className="mt-3 flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const detected = parseFloat(ocrDetectedAmount);
                              setFormData({ ...formData, amount: detected.toString() });
                              setAmountMismatch(false);
                              toast.success(`Donation amount updated to ₱${detected.toLocaleString()}`);
                            }}
                            className="text-xs"
                          >
                            Use Receipt Amount (₱{parseFloat(ocrDetectedAmount).toLocaleString()})
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setAmountMismatch(false);
                              toast.info('Mismatch warning dismissed. Please ensure your information is correct.');
                            }}
                            className="text-xs"
                          >
                            Proceed Anyway
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}
              
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-primary" />
                Upload your receipt and we'll automatically detect the reference number and amount
              </p>
            </div>

            <div className="flex gap-3 pt-6">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-12 border-primary/20">
                ← Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={(() => {
                  if (!formData.proofOfPayment) return true;
                  if (!amountMismatch || !ocrDetectedAmount) return false;
                  // Double-check: only disable if there's actually a mismatch > 1
                  const detected = parseFloat(ocrDetectedAmount);
                  const input = parseFloat(formData.amount);
                  return Math.abs(detected - input) > 1;
                })()} 
                className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Heart className="mr-2 h-5 w-5" />
                {(() => {
                  if (!amountMismatch || !ocrDetectedAmount) return 'Submit Donation';
                  const detected = parseFloat(ocrDetectedAmount);
                  const input = parseFloat(formData.amount);
                  return Math.abs(detected - input) > 1 ? 'Fix Amount Mismatch' : 'Submit Donation';
                })()}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      </>
      )}
      </div>

      {/* QR Code Modal */}
      {showChannelModal && selectedChannel?.qr_code_path && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowChannelModal(false)}
        >
          <div 
            className="relative max-w-2xl w-full bg-background rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowChannelModal(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 hover:bg-background text-foreground shadow-lg transition-all"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold">{selectedChannel.label}</h3>
                <p className="text-sm text-muted-foreground">Scan this QR code to make your donation</p>
              </div>

              {/* QR Code Image */}
              <div className="flex justify-center p-6 bg-white rounded-lg">
                <img 
                  src={selectedChannel.qr_code_path.startsWith('http') 
                    ? selectedChannel.qr_code_path 
                    : buildStorageUrl(selectedChannel.qr_code_path) || ''}
                  alt="QR Code - Full Size"
                  className="max-w-full max-h-[60vh] object-contain"
                  onError={(e) => {
                    console.error('Modal QR Code failed to load:', selectedChannel.qr_code_path);
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f0f0f0" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="20"%3EQR Code Not Available%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>

              {/* Channel Details */}
              <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                {selectedChannel.account_name && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Account Name:</span>
                    <span className="font-medium">{selectedChannel.account_name}</span>
                  </div>
                )}
                {selectedChannel.account_number && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Account Number:</span>
                    <span className="font-mono font-medium">{selectedChannel.account_number}</span>
                  </div>
                )}
                {selectedChannel.type && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Type:</span>
                    <span className="font-medium">{selectedChannel.type}</span>
                  </div>
                )}
              </div>

              {selectedChannel.instructions && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-xs font-semibold text-primary mb-2">Instructions:</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedChannel.instructions}</p>
                </div>
              )}

              <Button 
                onClick={() => setShowChannelModal(false)}
                className="w-full"
                size="lg"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
