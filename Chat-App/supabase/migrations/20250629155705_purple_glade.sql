/*
  # Add message status tracking

  1. New Columns
    - `sent_at` (timestamp) - when message was successfully sent
    - `delivered_at` (timestamp) - when message was delivered to recipient
    - `seen_at` (timestamp) - when message was seen by recipient
    - `status` (enum) - current status of the message

  2. Security
    - Update existing RLS policies to handle new columns
    - Add policies for status updates

  3. Functions
    - Function to mark messages as seen
    - Function to update message status
*/

-- Create enum for message status
CREATE TYPE message_status AS ENUM ('sending', 'sent', 'delivered', 'seen');

-- Add new columns to messages table
DO $$
BEGIN
  -- Add sent_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'sent_at'
  ) THEN
    ALTER TABLE messages ADD COLUMN sent_at timestamptz DEFAULT now();
  END IF;

  -- Add delivered_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'delivered_at'
  ) THEN
    ALTER TABLE messages ADD COLUMN delivered_at timestamptz;
  END IF;

  -- Add seen_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'seen_at'
  ) THEN
    ALTER TABLE messages ADD COLUMN seen_at timestamptz;
  END IF;

  -- Add status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'status'
  ) THEN
    ALTER TABLE messages ADD COLUMN status message_status DEFAULT 'sent';
  END IF;
END $$;

-- Update existing messages to have 'sent' status
UPDATE messages 
SET status = 'sent', sent_at = created_at 
WHERE status IS NULL;

-- Create function to mark messages as seen
CREATE OR REPLACE FUNCTION mark_messages_as_seen(
  sender_id uuid,
  viewer_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mark all unread messages from sender to viewer as seen
  UPDATE messages 
  SET 
    seen_at = now(),
    status = 'seen'
  WHERE 
    user_id = sender_id 
    AND recipient_id = viewer_id 
    AND seen_at IS NULL;
END;
$$;

-- Create function to mark messages as delivered when recipient comes online
CREATE OR REPLACE FUNCTION mark_messages_as_delivered(
  recipient_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mark all undelivered messages to this recipient as delivered
  UPDATE messages 
  SET 
    delivered_at = now(),
    status = CASE 
      WHEN status = 'sent' THEN 'delivered'
      ELSE status
    END
  WHERE 
    recipient_id = mark_messages_as_delivered.recipient_id 
    AND delivered_at IS NULL
    AND status = 'sent';
END;
$$;

-- Create trigger to automatically mark messages as delivered when they're inserted
CREATE OR REPLACE FUNCTION auto_mark_delivered()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if recipient is recently active (within last 5 minutes)
  IF EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = NEW.recipient_id 
    AND last_seen > now() - interval '5 minutes'
  ) THEN
    NEW.delivered_at = now();
    NEW.status = 'delivered';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto-delivery
DROP TRIGGER IF EXISTS auto_mark_delivered_trigger ON messages;
CREATE TRIGGER auto_mark_delivered_trigger
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION auto_mark_delivered();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS messages_status_idx ON messages(status);
CREATE INDEX IF NOT EXISTS messages_sent_at_idx ON messages(sent_at);
CREATE INDEX IF NOT EXISTS messages_delivered_at_idx ON messages(delivered_at);
CREATE INDEX IF NOT EXISTS messages_seen_at_idx ON messages(seen_at);

-- Update RLS policies to allow status updates
CREATE POLICY "Users can update message status for their received messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);