/*
  # Fix authentication trigger for new user profiles

  1. Database Functions
    - Drop and recreate `handle_new_user` function with proper permissions
    - Ensure function extracts username and full_name from user metadata
    - Use SECURITY DEFINER to bypass RLS policies

  2. Triggers
    - Ensure trigger exists on auth.users table
    - Trigger should fire after user insertion to create profile

  3. Security
    - Function runs with elevated privileges to create profiles
    - Handles potential username conflicts gracefully
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create the handle_new_user function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  username_value text;
  full_name_value text;
  counter integer := 0;
  base_username text;
BEGIN
  -- Extract values from user metadata
  username_value := NEW.raw_user_meta_data->>'username';
  full_name_value := NEW.raw_user_meta_data->>'full_name';
  
  -- If no username provided, use email prefix
  IF username_value IS NULL OR username_value = '' THEN
    username_value := split_part(NEW.email, '@', 1);
  END IF;
  
  -- Store base username for uniqueness handling
  base_username := username_value;
  
  -- Handle username uniqueness
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = username_value) LOOP
    counter := counter + 1;
    username_value := base_username || counter::text;
  END LOOP;
  
  -- Insert the new profile
  INSERT INTO public.profiles (id, username, full_name, created_at)
  VALUES (
    NEW.id,
    username_value,
    COALESCE(full_name_value, ''),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and re-raise it
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure the profiles table has the correct structure
DO $$
BEGIN
  -- Make sure username column allows empty strings as default
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'username' 
    AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE public.profiles ALTER COLUMN username SET DEFAULT '';
  END IF;
  
  -- Make sure full_name has a default
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'full_name' 
    AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE public.profiles ALTER COLUMN full_name SET DEFAULT '';
  END IF;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;