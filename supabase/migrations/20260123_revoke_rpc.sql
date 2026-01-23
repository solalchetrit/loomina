-- Migration to fix security vulnerability
-- Must be executed to apply changes
REVOKE EXECUTE ON FUNCTION get_client_stories(text) FROM anon;
REVOKE EXECUTE ON FUNCTION get_client_stories(text) FROM public;

-- Ensure authenticated users can still execute it
GRANT EXECUTE ON FUNCTION get_client_stories(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_client_stories(text) TO service_role;
