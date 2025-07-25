/*
  # Update profiles table schema

  1. Changes
    - Ensure created_at column exists and has proper default
    - Add any missing indexes for better performance
    - Update RLS policies if needed

  2. Security
    - Maintain existing RLS policies
    - Ensure proper access controls
*/

-- Ensure created_at column has proper default if it doesn't already
DO $$
BEGIN
  -- Check if created_at column exists and update its default if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'created_at'
  ) THEN
    -- Update the default value for created_at if it's not already set
    ALTER TABLE profiles ALTER COLUMN created_at SET DEFAULT now();
  END IF;
END $$;

-- Ensure we have proper indexes for profile queries
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON profiles(created_at);
CREATE INDEX IF NOT EXISTS profiles_last_seen_idx ON profiles(last_seen);

-- Update last_seen when user signs in (this would typically be handled by a trigger)
CREATE OR REPLACE FUNCTION update_user_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles 
  SET last_seen = now() 
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update last_seen (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_last_seen_trigger'
  ) THEN
    -- Note: This trigger would ideally be on auth.users table, but we'll handle it in the app
    -- CREATE TRIGGER update_last_seen_trigger
    --   AFTER UPDATE ON auth.users
    --   FOR EACH ROW
    --   EXECUTE FUNCTION update_user_last_seen();
  END IF;
END $$;