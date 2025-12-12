-- 1. Add cover_image_url column to Books table if it doesn't exist
ALTER TABLE "Books" ADD COLUMN IF NOT EXISTS "cover_image_url" TEXT;

-- 2. Create a storage bucket for book covers
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('book-covers', 'book-covers', true);
EXCEPTION WHEN unique_violation THEN
    NULL; -- Bucket already exists
END $$;

-- 3. Set up Row Level Security (RLS) for the bucket
-- Allow public access to view images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'book-covers' );

-- Allow authenticated users to upload images
-- Note: You might want to restrict this further based on your auth setup. 
-- For now, we allow any authenticated upload to this bucket.
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'book-covers' );

-- Allow users to update their own images (optional, depends on file path strategy)
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'book-covers' );
