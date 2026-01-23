-- Function to check if a client exists by phone number
-- Returns the matched phone number if found, avoiding full row exposure
CREATE OR REPLACE FUNCTION check_client_exists(phone_input text)
RETURNS TABLE (client_found boolean, matched_phone text)
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with admin privileges to bypass RLS
AS $$
DECLARE
  final_phone text;
  digits_only text;
BEGIN
  -- Simple normalization (matches client-side logic roughly)
  digits_only := regexp_replace(phone_input, '[^\d]', '', 'g');
  
  -- Try to find a match
  SELECT phone_number INTO final_phone
  FROM "Client"
  WHERE 
    phone_number = phone_input
    OR phone_number = '+' || digits_only
    OR phone_number = digits_only
    OR replace(phone_number, ' ', '') = digits_only
  LIMIT 1;

  IF final_phone IS NOT NULL THEN
    RETURN QUERY SELECT true, final_phone;
  ELSE
    RETURN QUERY SELECT false, NULL::text;
  END IF;
END;
$$;

-- Grant execute access to anon (public)
GRANT EXECUTE ON FUNCTION check_client_exists TO anon;
GRANT EXECUTE ON FUNCTION check_client_exists TO authenticated;

-- Function to fetch stories for a client by phone number
-- This allows us to hide the Stories/Books tables from public select
CREATE OR REPLACE FUNCTION get_client_stories(phone_input text)
RETURNS TABLE (
  story_id uuid, 
  story_title text, 
  story_content text, 
  story_date timestamptz,
  book_id uuid,
  book_title text,
  book_style text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  client_record_id uuid;
BEGIN
  -- 1. Find the client ID securely
  SELECT id INTO client_record_id
  FROM "Client"
  WHERE regexp_replace(phone_number, '[^\d+]', '', 'g') = regexp_replace(phone_input, '[^\d+]', '', 'g')
  LIMIT 1;

  IF client_record_id IS NULL THEN
    RETURN; -- No results
  END IF;

  -- 2. Return the joined data from Chapters, falling back to Client preferences for style
  RETURN QUERY
  SELECT 
    c.id as story_id,
    c.title as story_title,
    c.content as story_content,
    c.created_at as story_date,
    b.id as book_id,
    b.title as book_title,
    COALESCE(b.style, cl.writing_style) as book_style
  FROM "Chapters" c
  JOIN "Books" b ON c.book_id = b.id
  JOIN "Client" cl ON b.client_id = cl.id
  WHERE b.client_id = client_record_id
  ORDER BY c.chapter_number ASC, c.created_at ASC;
END;
$$;

-- Grant execute access to authenticated users only (Service Role will bypass RLS/Auth)
-- REVOKED: GRANT EXECUTE ON FUNCTION get_client_stories TO anon;
GRANT EXECUTE ON FUNCTION get_client_stories TO authenticated;
