import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2 } from "lucide-react";
import { z } from "zod";

const leadSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().max(30).optional(),
  company_name: z.string().trim().min(1, "Company name is required").max(200),
  website: z.string().max(500).optional(),
  industry: z.string().optional(),
  company_size: z.string().optional(),
  monthly_revenue: z.string().optional(),
  years_in_operation: z.string().max(20).optional(),
  business_problems: z.array(z.string()).optional(),
  biggest_challenge: z.string().max(2000).optional(),
  tools_software: z.string().max(2000).optional(),
  kpi_tracking: z.string().optional(),
  interest_in_paid: z.string().optional(),
  preferred_time: z.string().max(200).optional(),
  consent: z.literal(true, { errorMap: () => ({ message: "You must agree to be contacted" }) }),
});

const INDUSTRIES = [
  "Technology", "Healthcare", "Finance", "Retail", "Manufacturing",
  "Education", "Real Estate", "Hospitality", "Consulting", "Other",
];

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];

const REVENUE_RANGES = [
  "Under ₹1 Lakh", "₹1 Lakh - ₹5 Lakh", "₹5 Lakh - ₹10 Lakh",
  "₹10 Lakh - ₹50 Lakh", "₹50 Lakh - ₹1 Crore", "₹1 Crore+", "Prefer not to say",
];

const BUSINESS_PROBLEMS = [
  "Cost cutting", "SOP gaps", "KPI issues", "Process inefficiencies",
  "Internal tools", "Competitor pressure", "Slow growth",
];

const LeadForm = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    company_name: "",
    website: "",
    industry: "",
    company_size: "",
    monthly_revenue: "",
    years_in_operation: "",
    business_problems: [] as string[],
    biggest_challenge: "",
    tools_software: "",
    kpi_tracking: "",
    interest_in_paid: "",
    preferred_time: "",
    consent: false,
  });

  const updateField = (field: string, value: string | boolean | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const toggleProblem = (problem: string) => {
    setForm((prev) => ({
      ...prev,
      business_problems: prev.business_problems.includes(problem)
        ? prev.business_problems.filter((p) => p !== problem)
        : [...prev.business_problems, problem],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = leadSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("business_analysis_leads").insert({
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone || null,
      company_name: form.company_name.trim(),
      website: form.website || null,
      industry: form.industry || null,
      company_size: form.company_size || null,
      monthly_revenue: form.monthly_revenue || null,
      years_in_operation: form.years_in_operation || null,
      business_problems: form.business_problems,
      biggest_challenge: form.biggest_challenge || null,
      tools_software: form.tools_software || null,
      kpi_tracking: form.kpi_tracking || null,
      interest_in_paid: form.interest_in_paid || null,
      preferred_time: form.preferred_time || null,
      consent: form.consent,
    });
    setLoading(false);

    if (error) {
      toast({ title: "Submission failed", description: "Please try again later.", variant: "destructive" });
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-bg mb-6">
          <CheckCircle2 className="w-8 h-8 text-primary-foreground" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your business analysis request has been submitted successfully. Our team will review your information and get back to you shortly.
        </p>
      </div>
    );
  }

  const fieldClass = "space-y-2";
  const errorClass = "text-sm text-destructive";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Contact Info */}
      <section className="bg-card rounded-xl p-6 sm:p-8 card-shadow space-y-6">
        <h3 className="text-xl font-bold gradient-text">Contact Information</h3>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className={fieldClass}>
            <Label htmlFor="full_name">Full Name *</Label>
            <Input id="full_name" value={form.full_name} onChange={(e) => updateField("full_name", e.target.value)} placeholder="Rahul Sharma" />
            {errors.full_name && <p className={errorClass}>{errors.full_name}</p>}
          </div>
          <div className={fieldClass}>
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="rahul@company.in" />
            {errors.email && <p className={errorClass}>{errors.email}</p>}
          </div>
          <div className={fieldClass}>
            <Label htmlFor="phone">Phone / WhatsApp</Label>
            <Input id="phone" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+91 98765 43210" />
          </div>
          <div className={fieldClass}>
            <Label htmlFor="preferred_time">Preferred Discussion Time</Label>
            <Input id="preferred_time" value={form.preferred_time} onChange={(e) => updateField("preferred_time", e.target.value)} placeholder="e.g. Weekdays 2-5 PM IST" />
          </div>
        </div>
      </section>

      {/* Company Info */}
      <section className="bg-card rounded-xl p-6 sm:p-8 card-shadow space-y-6">
        <h3 className="text-xl font-bold gradient-text">Company Details</h3>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className={fieldClass}>
            <Label htmlFor="company_name">Company Name *</Label>
            <Input id="company_name" value={form.company_name} onChange={(e) => updateField("company_name", e.target.value)} placeholder="Sharma Enterprises Pvt. Ltd." />
            {errors.company_name && <p className={errorClass}>{errors.company_name}</p>}
          </div>
          <div className={fieldClass}>
            <Label htmlFor="website">Website</Label>
            <Input id="website" value={form.website} onChange={(e) => updateField("website", e.target.value)} placeholder="https://company.in" />
          </div>
          <div className={fieldClass}>
            <Label>Industry</Label>
            <Select value={form.industry} onValueChange={(v) => updateField("industry", v)}>
              <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
              <SelectContent>{INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className={fieldClass}>
            <Label>Company Size</Label>
            <Select value={form.company_size} onValueChange={(v) => updateField("company_size", v)}>
              <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
              <SelectContent>{COMPANY_SIZES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className={fieldClass}>
            <Label>Monthly Revenue Range</Label>
            <Select value={form.monthly_revenue} onValueChange={(v) => updateField("monthly_revenue", v)}>
              <SelectTrigger><SelectValue placeholder="Select range" /></SelectTrigger>
              <SelectContent>{REVENUE_RANGES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className={fieldClass}>
            <Label htmlFor="years">Years in Operation</Label>
            <Input id="years" value={form.years_in_operation} onChange={(e) => updateField("years_in_operation", e.target.value)} placeholder="e.g. 5" />
          </div>
        </div>
      </section>

      {/* Business Analysis */}
      <section className="bg-card rounded-xl p-6 sm:p-8 card-shadow space-y-6">
        <h3 className="text-xl font-bold gradient-text">Business Analysis</h3>

        <div className={fieldClass}>
          <Label>Business Problems (select all that apply)</Label>
          <div className="grid sm:grid-cols-2 gap-3 mt-2">
            {BUSINESS_PROBLEMS.map((problem) => (
              <label key={problem} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/40 cursor-pointer transition-colors">
                <Checkbox checked={form.business_problems.includes(problem)} onCheckedChange={() => toggleProblem(problem)} />
                <span className="text-sm">{problem}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={fieldClass}>
          <Label htmlFor="challenge">Biggest Operational Challenge</Label>
          <Textarea id="challenge" value={form.biggest_challenge} onChange={(e) => updateField("biggest_challenge", e.target.value)} placeholder="Describe your biggest challenge..." rows={4} />
        </div>

        <div className={fieldClass}>
          <Label htmlFor="tools">Tools/Software Currently Used</Label>
          <Textarea id="tools" value={form.tools_software} onChange={(e) => updateField("tools_software", e.target.value)} placeholder="e.g. Tally, Zoho, WhatsApp Business, Slack..." rows={3} />
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className={fieldClass}>
            <Label>Do you track KPIs?</Label>
            <Select value={form.kpi_tracking} onValueChange={(v) => updateField("kpi_tracking", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className={fieldClass}>
            <Label>Interest in Paid Services</Label>
            <Select value={form.interest_in_paid} onValueChange={(v) => updateField("interest_in_paid", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="Maybe">Maybe</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Consent & Submit */}
      <section className="bg-card rounded-xl p-6 sm:p-8 card-shadow space-y-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox checked={form.consent} onCheckedChange={(v) => updateField("consent", v === true)} className="mt-0.5" />
          <span className="text-sm text-muted-foreground">
            I agree to be contacted by Aishnar Digital regarding my business analysis request. My information will be kept confidential. *
          </span>
        </label>
        {errors.consent && <p className={errorClass}>{errors.consent}</p>}

        <Button type="submit" disabled={loading} className="w-full sm:w-auto px-12 py-3 gradient-bg text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity">
          {loading ? "Submitting..." : "Submit Request"}
        </Button>
      </section>
    </form>
  );
};

export default LeadForm;
