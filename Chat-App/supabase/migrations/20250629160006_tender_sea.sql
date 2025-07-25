/*
  # Fix ambiguous column reference in mark_messages_as_delivered function

  1. Function Updates
    - Update `mark_messages_as_delivered` function to use prefixed parameter names
    - Explicitly qualify table columns to avoid ambiguity
    - Ensure proper parameter naming convention

  2. Changes Made
    - Rename function parameter from `recipient_id` to `p_recipient_id`
    - Qualify table column references with table name
    - Update all internal references to use the new parameter name
*/

-- Drop the existing function first
DROP FUNCTION IF EXISTS public.mark_messages_as_delivered(uuid);

-- Recreate the function with proper parameter naming
CREATE OR REPLACE FUNCTION public.mark_messages_as_delivered(p_recipient_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE messages 
  SET 
    status = 'delivered',
    delivered_at = now()
  WHERE 
    messages.recipient_id = p_recipient_id 
    AND messages.status = 'sent'
    AND messages.delivered_at IS NULL;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.mark_messages_as_delivered(uuid) TO authenticated;