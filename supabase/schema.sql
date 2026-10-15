-- =============================================================================
-- CHHOTE LAL PROPERTY DEALER - SUPABASE POSTGRESQL SCHEMA
-- Location: Near Sai Ideal Public Academy, Varanasi, UP, India
-- Phone: 9664280667 | WhatsApp: https://wa.me/919664280667
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. PROPERTIES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.properties (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Plot', 'House', 'Land')),
    type_hindi TEXT NOT NULL,
    locality TEXT NOT NULL,
    locality_area TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    price_text TEXT,
    price_on_request BOOLEAN DEFAULT FALSE,
    area NUMERIC NOT NULL DEFAULT 0,
    area_unit TEXT NOT NULL DEFAULT 'sq.ft',
    status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Under Discussion', 'Sold', 'Archived')),
    status_hindi TEXT NOT NULL,
    is_illustrative BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    description TEXT,
    facilities TEXT[] DEFAULT ARRAY[]::TEXT[],
    bedrooms INTEGER,
    bathrooms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Index for speedy search & filtering
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties (type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties (status);
CREATE INDEX IF NOT EXISTS idx_properties_locality ON public.properties USING gin (to_tsvector('english', locality));
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties (created_at DESC);

-- -----------------------------------------------------------------------------
-- 2. BUYER ENQUIRIES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.buyer_enquiries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    property_type TEXT,
    locality TEXT,
    budget TEXT,
    message TEXT,
    property_id TEXT REFERENCES public.properties(id) ON DELETE SET NULL,
    property_title TEXT,
    consent BOOLEAN NOT NULL DEFAULT TRUE,
    status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'In Progress', 'Closed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_buyer_enq_status ON public.buyer_enquiries (status);
CREATE INDEX IF NOT EXISTS idx_buyer_enq_created_at ON public.buyer_enquiries (created_at DESC);

-- -----------------------------------------------------------------------------
-- 3. SELLER ENQUIRIES / SUBMISSIONS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.seller_enquiries (
    id TEXT PRIMARY KEY,
    owner_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    property_type TEXT NOT NULL CHECK (property_type IN ('Plot', 'House', 'Land')),
    locality TEXT NOT NULL,
    area TEXT NOT NULL,
    area_unit TEXT NOT NULL DEFAULT 'sq.ft',
    expected_price TEXT,
    description TEXT,
    photos TEXT[] DEFAULT ARRAY[]::TEXT[],
    consent BOOLEAN NOT NULL DEFAULT TRUE,
    status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'In Progress', 'Listed', 'Rejected')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_seller_enq_status ON public.seller_enquiries (status);
CREATE INDEX IF NOT EXISTS idx_seller_enq_created_at ON public.seller_enquiries (created_at DESC);

-- -----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------
-- Enable RLS on all tables
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_enquiries ENABLE ROW LEVEL SECURITY;

-- PROPERTIES POLICIES:
-- Anyone (anons) can read public active properties
CREATE POLICY "Public can view active properties" 
ON public.properties FOR SELECT 
USING (status != 'Archived');

-- Only authenticated admins can insert/update/delete properties
CREATE POLICY "Admins full CRUD properties" 
ON public.properties FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- BUYER ENQUIRIES POLICIES:
-- Public can submit an enquiry
CREATE POLICY "Public can submit buyer enquiries" 
ON public.buyer_enquiries FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Public CANNOT view enquiries; only authenticated admin can view and update
CREATE POLICY "Admins view and manage buyer enquiries" 
ON public.buyer_enquiries FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- SELLER ENQUIRIES POLICIES:
-- Public can submit seller details
CREATE POLICY "Public can submit seller enquiries" 
ON public.seller_enquiries FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Only authenticated admin can view and update seller submissions
CREATE POLICY "Admins view and manage seller enquiries" 
ON public.seller_enquiries FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
