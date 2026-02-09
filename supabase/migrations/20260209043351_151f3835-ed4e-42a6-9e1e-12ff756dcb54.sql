
-- Create business_analysis_leads table
CREATE TABLE public.business_analysis_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  company_size TEXT,
  monthly_revenue TEXT,
  years_in_operation TEXT,
  business_problems TEXT[] DEFAULT '{}',
  biggest_challenge TEXT,
  tools_software TEXT,
  kpi_tracking TEXT,
  interest_in_paid TEXT,
  preferred_time TEXT,
  consent BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'New',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_analysis_leads ENABLE ROW LEVEL SECURITY;

-- Public can INSERT only
CREATE POLICY "Anyone can submit a lead"
  ON public.business_analysis_leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated users can read all leads
CREATE POLICY "Authenticated users can read leads"
  ON public.business_analysis_leads
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can update leads
CREATE POLICY "Authenticated users can update leads"
  ON public.business_analysis_leads
  FOR UPDATE
  TO authenticated
  USING (true);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.business_analysis_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
