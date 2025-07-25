/*
  # Update Last Seen Functionality

  1. Functions
    - Create function to automatically update last_seen on profile updates
    - Create function to update last_seen when user is active

  2. Triggers
    - Add trigger to update last_seen when user signs in
    - Add trigger to update conversation timestamp

  3. Indexes
    - Add index for last_seen for better performance
*/

-- Function to update last_seen timestamp
CREATE OR REPLACE FUNCTION update_last_seen_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.last_seen = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update last_seen when profile is updated (optional)
DROP TRIGGER IF EXISTS update_last_seen_trigger ON profiles;
CREATE TRIGGER update_last_seen_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  WHEN (OLD.last_seen IS DISTINCT FROM NEW.last_seen)
  EXECUTE FUNCTION update_last_seen_timestamp();

-- Function to manually update last seen (called from application)
CREATE OR REPLACE FUNCTION update_user_last_seen(user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET last_seen = now() 
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION update_user_last_seen(uuid) TO authenticated;

-- Ensure last_seen index exists for performance
CREATE INDEX IF NOT EXISTS profiles_last_seen_idx ON profiles(last_seen DESC NULLS LAST);

-- Update existing profiles to have a last_seen value if they don't have one
UPDATE profiles 
SET last_seen = created_at 
WHERE last_seen IS NULL AND created_at IS NOT NULL;