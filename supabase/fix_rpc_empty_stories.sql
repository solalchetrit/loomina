CREATE OR REPLACE FUNCTION get_client_stories(phone_input text)
RETURNS TABLE (
  story_id bigint, 
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
  found_book_id uuid;
  found_book_title text;
  found_book_style text;
BEGIN
  -- 1. Find the client ID securely
  SELECT id INTO client_record_id
  FROM "Client"
  WHERE regexp_replace(phone_number, '[^\d]', '', 'g') = regexp_replace(phone_input, '[^\d]', '', 'g')
  LIMIT 1;

  IF client_record_id IS NULL THEN
    RETURN; -- Return empty (User not found)
  END IF;

  -- 2. Get Book Info
  SELECT id, title, style INTO found_book_id, found_book_title, found_book_style
  FROM "Books"
  WHERE client_id = client_record_id
  LIMIT 1;

  IF found_book_id IS NULL THEN
     RETURN; -- Return empty (No book found)
  END IF;

  -- 3. Return Data (LEFT JOIN behavior manual or explicit)
  -- We want to return at least one row with Book info if no stories exist.
  RETURN QUERY
  SELECT 
    s.id as story_id,
    s.title as story_title,
    s.content as story_content,
    s.created_at as story_date,
    found_book_id as book_id,
    found_book_title as book_title,
    found_book_style as book_style
  FROM "Stories" s
  WHERE s.book_id = found_book_id
  ORDER BY s.created_at ASC;
  
  -- Check if any rows were returned. If not (no stories), return a dummy row with NULL story fields
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      NULL::bigint as story_id,
      NULL::text as story_title,
      NULL::text as story_content,
      NULL::timestamptz as story_date,
      found_book_id as book_id,
      found_book_title as book_title,
      found_book_style as book_style;
  END IF;
END;
$$;
