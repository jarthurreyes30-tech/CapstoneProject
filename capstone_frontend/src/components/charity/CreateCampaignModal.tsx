import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { campaignService } from "@/services/campaigns";
import { buildApiUrl, getAuthToken } from "@/lib/api";
import { Wallet, MapPin, Users, X } from "lucide-react";
import LocationSelector, { LocationData } from "@/components/LocationSelector";
import { BENEFICIARY_CATEGORIES, getBeneficiaryLabel } from "@/constants/beneficiaryCategories";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";

interface CreateCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  charityId?: number;
  onSuccess?: () => void;
}

export function CreateCampaignModal({ open, onOpenChange, charityId, onSuccess }: CreateCampaignModalProps) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    problem: "",
    solution: "",
    outcome: "",
    beneficiary_category: [] as string[],
    targetAmount: "",
    donationType: "one_time" as "one_time" | "recurring",
    campaignType: "other" as "education" | "feeding_program" | "medical" | "disaster_relief" | "environment" | "animal_welfare" | "other",
    status: "draft" as "draft" | "published",
    startDate: "",
    endDate: "",
    street_address: "",
    barangay: "",
    city: "",
    province: "",
    region: "",
    full_address: "",
    image: null as File | null,
    // Amount mode
    amountBased: true,
    // Recurring campaign fields
    isRecurring: false,
    recurrenceType: "monthly" as "weekly" | "monthly" | "quarterly" | "yearly",
    recurrenceInterval: "1",
    recurrenceStartDate: "",
    recurrenceEndDate: "",
    autoPublish: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [availableChannels, setAvailableChannels] = useState<any[]>([]);
  const [selectedChannelIds, setSelectedChannelIds] = useState<number[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [beneficiaryPopoverOpen, setBeneficiaryPopoverOpen] = useState(false);

  const reset = () => {
    setForm({
      title: "",
      description: "",
      problem: "",
      solution: "",
      outcome: "",
      beneficiary_category: [],
      targetAmount: "",
      donationType: "one_time",
      campaignType: "other",
      status: "draft",
      startDate: "",
      endDate: "",
      street_address: "",
      barangay: "",
      city: "",
      province: "",
      region: "",
      full_address: "",
      image: null,
      amountBased: true,
      isRecurring: false,
      recurrenceType: "monthly",
      recurrenceInterval: "1",
      recurrenceStartDate: "",
      recurrenceEndDate: "",
      autoPublish: true,
    });
    setErrors({});
    setSelectedChannelIds([]);
    setBeneficiaryPopoverOpen(false);
  };

  // Fetch charity's donation channels when modal opens
  useEffect(() => {
    if (open) {
      fetchChannels();
    }
  }, [open]);

  // Auto-enable isRecurring when donation type is set to recurring
  useEffect(() => {
    if (form.donationType === "recurring" && !form.isRecurring) {
      setForm(prev => ({ ...prev, isRecurring: true }));
    }
  }, [form.donationType]);

  // If toggled to non-amount-based, clear targetAmount and reset donation/recurrence fields
  useEffect(() => {
    if (!form.amountBased && form.targetAmount) {
      setForm(prev => ({ ...prev, targetAmount: "" }));
    }
    if (!form.amountBased) {
      // Reset donation/recurrence to safe defaults when without amount
      setForm(prev => ({
        ...prev,
        donationType: 'one_time',
        isRecurring: false,
        recurrenceType: 'monthly',
        recurrenceInterval: '1',
        recurrenceStartDate: '',
        recurrenceEndDate: '',
        autoPublish: true,
      }));
    }
  }, [form.amountBased]);

  const fetchChannels = async () => {
    try {
      setLoadingChannels(true);
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(buildApiUrl("/charity/donation-channels"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableChannels(data || []);
      }
    } catch (error) {
      console.error("Error fetching donation channels:", error);
    } finally {
      setLoadingChannels(false);
    }
  };

  const toggleChannel = (channelId: number) => {
    setSelectedChannelIds((prev) =>
      prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [...prev, channelId]
    );
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.description.trim()) e.description = "About this campaign is required";
    if (!form.problem || form.problem.trim().length < 50) e.problem = "Problem must be at least 50 characters";
    if (!form.solution || form.solution.trim().length < 50) e.solution = "Solution must be at least 50 characters";
    if (form.outcome && (form.outcome.trim().length < 30 || form.outcome.trim().length > 300)) e.outcome = "Expected Outcome must be 30–300 characters";
    // If amount-based, target is required and must be > 0; otherwise ignore
    if (form.amountBased) {
      if (!form.targetAmount || Number(form.targetAmount) <= 0) e.targetAmount = "Target amount must be greater than 0";
    }
    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) e.endDate = "End date must be after start date";
    
    // Beneficiary category validation
    if (form.beneficiary_category.length === 0) e.beneficiary_category = "Please select at least one beneficiary category";
    
    // Location validation
    if (!form.region || !form.region.trim()) e.region = "Region is required";
    if (!form.province || !form.province.trim()) e.province = "Province is required";
    if (!form.city || !form.city.trim()) e.city = "City is required";
    if (!form.barangay || !form.barangay.trim()) e.barangay = "Barangay is required";
    
    // Recurring campaign validation
    if (form.donationType === "recurring" && form.isRecurring) {
      if (!form.recurrenceStartDate) e.recurrenceStartDate = "First occurrence date is required for recurring campaigns";
      if (!form.recurrenceEndDate) e.recurrenceEndDate = "Official end date is required to stop automatic posting";
      if (form.recurrenceEndDate && form.recurrenceStartDate && new Date(form.recurrenceEndDate) <= new Date(form.recurrenceStartDate)) {
        e.recurrenceEndDate = "Official end date must be after first occurrence date";
      }
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    try {
      if (!charityId) {
        toast({ title: "Error", description: "Charity not found", variant: "destructive" });
        return;
      }
      if (!validate()) {
        toast({ title: "Fix errors", description: "Please correct the highlighted fields", variant: "destructive" });
        return;
      }
      setSubmitting(true);
      
      // Prepare campaign data
      const campaignData: any = {
        title: form.title,
        description: form.description,
        // Amount-based vs without amount
        ...(form.amountBased
          ? { target_amount: Number(form.targetAmount), requires_target_amount: true }
          : { requires_target_amount: false }
        ),
        donation_type: form.amountBased ? form.donationType : 'one_time',
        campaign_type: form.campaignType,
        status: form.status,
        start_date: form.startDate || undefined,
        end_date: form.endDate || undefined,
        cover_image: form.image || undefined,
        problem: form.problem,
        solution: form.solution,
        outcome: form.outcome || undefined,
        beneficiary_category: form.beneficiary_category, // Required field
        region: form.region, // Required field
        province: form.province, // Required field
        city: form.city, // Required field
        barangay: form.barangay, // Required field
        // Recurring campaign fields
        is_recurring: form.amountBased ? form.isRecurring : false,
        recurrence_type: form.amountBased && form.isRecurring ? form.recurrenceType : undefined,
        recurrence_interval: form.amountBased && form.isRecurring ? Number(form.recurrenceInterval) : undefined,
        recurrence_start_date: form.amountBased && form.isRecurring ? form.recurrenceStartDate : undefined,
        recurrence_end_date: form.amountBased && form.isRecurring && form.recurrenceEndDate ? form.recurrenceEndDate : undefined,
        auto_publish: form.amountBased && form.isRecurring ? form.autoPublish : undefined,
      };
      
      console.log('Submitting campaign data:', campaignData);
      console.log('Beneficiary category:', campaignData.beneficiary_category);
      console.log('Location:', { region: campaignData.region, province: campaignData.province, city: campaignData.city });
      
      // Create campaign
      const response = await campaignService.createCampaign(charityId, campaignData as any);

      // Attach selected donation channels if any
      if (selectedChannelIds.length > 0 && response?.campaign?.id) {
        const token = getAuthToken();
        if (token) {
          try {
            await fetch(buildApiUrl(`/campaigns/${response.campaign.id}/donation-channels/attach`), {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ channel_ids: selectedChannelIds }),
            });
          } catch (attachError) {
            console.error("Error attaching channels:", attachError);
            // Don't fail the whole operation if channel attachment fails
          }
        }
      }

      toast({ title: "Success", description: "Campaign created successfully" });
      onOpenChange(false);
      reset();
      onSuccess && onSuccess();
    } catch (err: any) {
      console.error("Campaign creation error:", err);
      console.error("Error response:", err?.response?.data);
      
      // Extract validation errors if available
      const errors = err?.response?.data?.errors;
      if (errors) {
        const errorMessages = Object.entries(errors)
          .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
          .join('\n');
        console.error("Validation errors:", errorMessages);
        toast({ 
          title: "Validation Error", 
          description: errorMessages || "Please check your inputs", 
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "Error", 
          description: err?.response?.data?.message || "Failed to create campaign", 
          variant: "destructive" 
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="w-[90vw] max-w-[95vw] sm:w-full sm:max-w-[820px] max-h-[85vh] sm:max-h-[90vh] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Create New Campaign</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">Provide details for your fundraising campaign</DialogDescription>
        </DialogHeader>

        {/* Amount toggle */}
        <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/40">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Campaign Funding Mode</Label>
            <p className="text-xs text-muted-foreground">
              Toggle between a campaign with a target amount vs without a target amount.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${form.amountBased ? 'text-muted-foreground' : 'text-foreground'}`}>Without amount</span>
            <Switch
              checked={form.amountBased}
              onCheckedChange={(checked) => setForm({ ...form, amountBased: checked as boolean })}
              aria-label="Toggle amount-based campaign"
            />
            <span className={`text-xs ${form.amountBased ? 'text-foreground' : 'text-muted-foreground'}`}>With amount</span>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid gap-5 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="cc-title">Campaign Title *</Label>
            <Input id="cc-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Education Fund 2025" />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cc-about">About This Campaign *</Label>
            <Textarea id="cc-about" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your campaign goals and impact" />
            {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
          </div>

          <Separator />

          {/* Story Fields */}
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cc-problem">The Problem *</Label>
              <Textarea id="cc-problem" rows={4} value={form.problem} onChange={(e) => setForm({ ...form, problem: e.target.value })} placeholder="Explain the problem this campaign addresses (min 50 characters)" />
              {errors.problem && <p className="text-xs text-destructive mt-1">{errors.problem}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cc-solution">The Solution *</Label>
              <Textarea id="cc-solution" rows={4} value={form.solution} onChange={(e) => setForm({ ...form, solution: e.target.value })} placeholder="Describe your solution and plan (min 50 characters)" />
              {errors.solution && <p className="text-xs text-destructive mt-1">{errors.solution}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cc-outcome">Expected Outcome (optional)</Label>
              <Textarea id="cc-outcome" rows={3} value={form.outcome} onChange={(e) => setForm({ ...form, outcome: e.target.value })} placeholder="What positive outcomes do you expect? (30–300 characters)" />
              {errors.outcome && <p className="text-xs text-destructive mt-1">{errors.outcome}</p>}
            </div>
          </div>

          <Separator />

          {/* Beneficiary & Location */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <Label className="text-base font-semibold">Beneficiary Category *</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Select who will benefit from this campaign (required)
              </p>
              
              {/* Multi-select Popover */}
              <Popover open={beneficiaryPopoverOpen} onOpenChange={setBeneficiaryPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={beneficiaryPopoverOpen}
                    className="w-full justify-between h-auto min-h-[2.5rem] py-2"
                  >
                    <span className="flex flex-wrap gap-1">
                      {form.beneficiary_category.length === 0 ? (
                        <span className="text-muted-foreground">Select beneficiary categories...</span>
                      ) : (
                        form.beneficiary_category.map((value) => (
                          <Badge key={value} variant="secondary" className="gap-1">
                            {getBeneficiaryLabel(value)}
                            <X
                              className="h-3 w-3 cursor-pointer hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setForm({
                                  ...form,
                                  beneficiary_category: form.beneficiary_category.filter((v) => v !== value),
                                });
                              }}
                            />
                          </Badge>
                        ))
                      )}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search beneficiary categories..." />
                    <CommandEmpty>No categories found.</CommandEmpty>
                    <div className="max-h-[300px] overflow-y-auto">
                      {BENEFICIARY_CATEGORIES.map((group) => (
                        <CommandGroup key={group.group} heading={group.group}>
                          {group.options.map((option) => {
                            const isSelected = form.beneficiary_category.includes(option.value);
                            return (
                              <CommandItem
                                key={option.value}
                                onSelect={() => {
                                  if (isSelected) {
                                    setForm({
                                      ...form,
                                      beneficiary_category: form.beneficiary_category.filter(
                                        (v) => v !== option.value
                                      ),
                                    });
                                  } else {
                                    setForm({
                                      ...form,
                                      beneficiary_category: [...form.beneficiary_category, option.value],
                                    });
                                  }
                                }}
                              >
                                <Checkbox
                                  checked={isSelected}
                                  className="mr-2"
                                />
                                <span>{option.label}</span>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      ))}
                    </div>
                  </Command>
                </PopoverContent>
              </Popover>

              {form.beneficiary_category.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {form.beneficiary_category.length} categor{form.beneficiary_category.length > 1 ? "ies" : "y"} selected
                </p>
              )}
              {errors.beneficiary_category && (
                <p className="text-xs text-destructive mt-1">{errors.beneficiary_category}</p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <Label className="text-base font-semibold">Campaign Location *</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Where will this campaign take place or where are the beneficiaries located? (required)
              </p>
              
              {/* LocationSelector Component (includes street address) */}
              <LocationSelector
                value={{
                  street_address: form.street_address,
                  region: form.region,
                  province: form.province,
                  city: form.city,
                  barangay: form.barangay
                }}
                onChange={(location: LocationData) => {
                  console.log('Location changed:', location);
                  setForm(prev => ({
                    ...prev,
                    street_address: location.street_address,
                    region: location.region,
                    province: location.province,
                    city: location.city,
                    barangay: location.barangay
                  }));
                }}
                required={true}
                errors={{
                  street_address: errors.street_address,
                  region: errors.region,
                  province: errors.province,
                  city: errors.city,
                  barangay: errors.barangay
                }}
              />
            </div>
          </div>

          <Separator />

          {/* Financials & Media */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {form.amountBased && (
              <div className="space-y-1.5">
                <Label htmlFor="cc-target">Target Amount (₱) *</Label>
                <Input id="cc-target" type="number" inputMode="numeric" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} />
                {errors.targetAmount && <p className="text-xs text-destructive mt-1">{errors.targetAmount}</p>}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="cc-image">Campaign Image</Label>
              <Input id="cc-image" type="file" accept="image/*" onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })} />
            </div>
          </div>

          {/* Settings - Donation Type (only when with amount) */}
          {form.amountBased && (
            <div className="space-y-1.5">
              <Label htmlFor="cc-donation-type">Donation Type *</Label>
              <Select value={form.donationType} onValueChange={(v: any) => setForm({ ...form, donationType: v })}>
                <SelectTrigger id="cc-donation-type">
                  <SelectValue placeholder="Select donation type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one_time">One-Time</SelectItem>
                  <SelectItem value="recurring">Recurring</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose whether this campaign accepts one-time donations or recurring donations
              </p>
            </div>
          )}

          {/* Scheduling - Show when donation type is one-time (even without amount) */}
          {form.donationType && form.donationType === "one_time" && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label className="text-base font-semibold">Campaign Duration</Label>
                <p className="text-sm text-muted-foreground">
                  Set when your campaign will start and end
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="cc-start">Start Date</Label>
                    <Input id="cc-start" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cc-end">End Date</Label>
                    <Input id="cc-end" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                    {errors.endDate && <p className="text-xs text-destructive mt-1">{errors.endDate}</p>}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Campaign Type */}
          <div className="space-y-1.5">
            <Label htmlFor="cc-campaign-type">Type of Campaign *</Label>
            <Select value={form.campaignType} onValueChange={(v: any) => setForm({ ...form, campaignType: v })}>
              <SelectTrigger id="cc-campaign-type">
                <SelectValue placeholder="Select campaign type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="feeding_program">Feeding Program</SelectItem>
                <SelectItem value="medical">Medical</SelectItem>
                <SelectItem value="disaster_relief">Disaster Relief</SelectItem>
                <SelectItem value="environment">Environment</SelectItem>
                <SelectItem value="animal_welfare">Animal Welfare</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label htmlFor="cc-status">Status *</Label>
            <Select value={form.status} onValueChange={(v: any) => setForm({ ...form, status: v })}>
              <SelectTrigger id="cc-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Draft campaigns are not visible to donors. Publish when ready.
            </p>
          </div>

          {/* Recurring Campaign Settings */}
          {form.amountBased && form.donationType === "recurring" && (
            <>
              <Separator />
              <div className="space-y-4 bg-primary/5 p-4 rounded-lg border border-primary/20">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="cc-is-recurring"
                      checked={form.isRecurring}
                      onCheckedChange={(checked) => setForm({ ...form, isRecurring: checked as boolean })}
                    />
                    <Label htmlFor="cc-is-recurring" className="text-base font-semibold cursor-pointer">
                      Enable Recurring Campaign
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    A recurring campaign automatically creates and publishes new campaign instances at regular intervals (e.g., weekly food drive, monthly feeding program, quarterly medical mission).
                  </p>
                </div>

                {form.isRecurring && (
                  <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="cc-recurrence-type">Recurrence Pattern *</Label>
                        <Select value={form.recurrenceType} onValueChange={(v: any) => setForm({ ...form, recurrenceType: v })}>
                          <SelectTrigger id="cc-recurrence-type">
                            <SelectValue placeholder="Select pattern" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly (Every 3 months)</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          {form.recurrenceType === "weekly" && "Campaign will be posted every week"}
                          {form.recurrenceType === "monthly" && "Campaign will be posted every month"}
                          {form.recurrenceType === "quarterly" && "Campaign will be posted every 3 months"}
                          {form.recurrenceType === "yearly" && "Campaign will be posted every year"}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="cc-recurrence-interval">Repeat Every</Label>
                        <Input
                          id="cc-recurrence-interval"
                          type="number"
                          min="1"
                          max="12"
                          value={form.recurrenceInterval}
                          onChange={(e) => setForm({ ...form, recurrenceInterval: e.target.value })}
                          placeholder="1"
                        />
                        <p className="text-xs text-muted-foreground">
                          {form.recurrenceType === "weekly" && `Campaign will repeat every ${form.recurrenceInterval || 1} week(s)`}
                          {form.recurrenceType === "monthly" && `Campaign will repeat every ${form.recurrenceInterval || 1} month(s)`}
                          {form.recurrenceType === "quarterly" && `Campaign will repeat every ${form.recurrenceInterval || 1} quarter(s)`}
                          {form.recurrenceType === "yearly" && `Campaign will repeat every ${form.recurrenceInterval || 1} year(s)`}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="cc-recurrence-start">First Occurrence Date *</Label>
                        <Input
                          id="cc-recurrence-start"
                          type="date"
                          value={form.recurrenceStartDate}
                          onChange={(e) => setForm({ ...form, recurrenceStartDate: e.target.value })}
                        />
                        {errors.recurrenceStartDate && <p className="text-xs text-destructive mt-1">{errors.recurrenceStartDate}</p>}
                        <p className="text-xs text-muted-foreground">
                          The date when the first campaign will be automatically posted
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="cc-recurrence-end">Official End Date *</Label>
                        <Input
                          id="cc-recurrence-end"
                          type="date"
                          value={form.recurrenceEndDate}
                          onChange={(e) => setForm({ ...form, recurrenceEndDate: e.target.value })}
                        />
                        {errors.recurrenceEndDate && <p className="text-xs text-destructive mt-1">{errors.recurrenceEndDate}</p>}
                        <p className="text-xs text-muted-foreground">
                          Automatic posting will stop after this date. No new campaigns will be created after this date.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="cc-auto-publish"
                        checked={form.autoPublish}
                        onCheckedChange={(checked) => setForm({ ...form, autoPublish: checked as boolean })}
                      />
                      <Label htmlFor="cc-auto-publish" className="cursor-pointer">
                        Automatically publish new occurrences
                      </Label>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Donation Channels Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <Label className="text-base font-semibold">Select Donation Channels</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Choose which payment methods donors can use for this campaign
            </p>

            {loadingChannels ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : availableChannels.length === 0 ? (
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Wallet className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  No donation channels found. Add channels first to select them for campaigns.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Open add donation channel modal
                    window.dispatchEvent(new CustomEvent("open-add-donation-channel"));
                  }}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Add Donation Channel
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 max-h-[200px] overflow-y-auto border rounded-lg p-3">
                {availableChannels.map((channel) => (
                  <label
                    key={channel.id}
                    className={`flex items-start gap-3 p-3 rounded-md border-2 cursor-pointer transition-all ${
                      selectedChannelIds.includes(channel.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-accent"
                    }`}
                  >
                    <Checkbox
                      checked={selectedChannelIds.includes(channel.id)}
                      onCheckedChange={() => toggleChannel(channel.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {channel.type.toUpperCase()} - {channel.account_number}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {channel.account_name}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
            
            {selectedChannelIds.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {selectedChannelIds.length} channel{selectedChannelIds.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button className="bg-primary hover:bg-primary/90" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Creating..." : "Create Campaign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
