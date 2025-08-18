-- Create enum for user types
CREATE TYPE public.user_type AS ENUM ('usuario', 'colaborador');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  user_type user_type NOT NULL DEFAULT 'usuario',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add trigger for timestamps
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update existing tables to require authentication
ALTER TABLE public.eventos ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.servicos ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies for eventos
DROP POLICY IF EXISTS "Todos podem visualizar eventos" ON public.eventos;
DROP POLICY IF EXISTS "Todos podem criar eventos" ON public.eventos;

CREATE POLICY "Authenticated users can view events" 
ON public.eventos 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create events" 
ON public.eventos 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events" 
ON public.eventos 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events" 
ON public.eventos 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Update RLS policies for servicos
DROP POLICY IF EXISTS "Todos podem visualizar servicos" ON public.servicos;
DROP POLICY IF EXISTS "Todos podem criar servicos" ON public.servicos;

CREATE POLICY "Authenticated users can view services" 
ON public.servicos 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create services" 
ON public.servicos 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own services" 
ON public.servicos 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own services" 
ON public.servicos 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);