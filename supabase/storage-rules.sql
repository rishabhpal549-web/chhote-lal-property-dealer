-- =============================================================================
-- CHHOTE LAL PROPERTY DEALER - SUPABASE STORAGE CONFIGURATION & RULES
-- Bucket: property-images
-- =============================================================================

-- 1. Create the storage bucket if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies:
-- Allow anyone to view/download property images
CREATE POLICY "Public Read Property Images" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'property-images');

-- Allow authenticated admins to upload property images
CREATE POLICY "Admin Upload Property Images" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'property-images');

-- Allow authenticated admins to update/delete images
CREATE POLICY "Admin Modify Property Images" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'property-images');

CREATE POLICY "Admin Delete Property Images" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'property-images');
