-- TOKUTEI Learning Authentication Schema Migration
-- Execute this in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_role enum
CREATE TYPE user_role AS ENUM ('student', 'teacher');

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ,
  
  -- Student specific fields
  preferred_language TEXT DEFAULT 'ja',
  learning_level TEXT,
  
  -- Teacher specific fields
  organization_name TEXT,
  teacher_code TEXT UNIQUE,
  max_students INTEGER DEFAULT 3,
  subscription_plan TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  
  -- Constraints
  CONSTRAINT teacher_fields_check CHECK (
    (role = 'teacher' AND teacher_code IS NOT NULL) OR
    (role = 'student' AND teacher_code IS NULL)
  ),
  CONSTRAINT organization_check CHECK (
    (role = 'teacher' AND organization_name IS NOT NULL) OR
    (role = 'student')
  )
);

-- Create teacher_students relationship table
CREATE TABLE IF NOT EXISTS public.teacher_students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invitation_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, active, inactive
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure teacher is actually a teacher
  CONSTRAINT teacher_role_check CHECK (
    teacher_id IN (SELECT id FROM profiles WHERE role = 'teacher')
  ),
  -- Ensure student is actually a student
  CONSTRAINT student_role_check CHECK (
    student_id IN (SELECT id FROM profiles WHERE role = 'student')
  ),
  -- No self-relationships
  CONSTRAINT no_self_relationship CHECK (teacher_id != student_id),
  -- Unique relationship
  CONSTRAINT unique_teacher_student UNIQUE (teacher_id, student_id)
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_teacher_code ON public.profiles(teacher_code) WHERE teacher_code IS NOT NULL;
CREATE INDEX idx_teacher_students_teacher ON public.teacher_students(teacher_id);
CREATE INDEX idx_teacher_students_student ON public.teacher_students(student_id);
CREATE INDEX idx_teacher_students_status ON public.teacher_students(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to profiles table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Apply updated_at trigger to teacher_students table
CREATE TRIGGER update_teacher_students_updated_at
  BEFORE UPDATE ON public.teacher_students
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- RLS (Row Level Security) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_students ENABLE ROW LEVEL SECURITY;

-- Profiles policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Teachers can view their students' profiles
CREATE POLICY "Teachers can view their students" ON public.profiles
  FOR SELECT USING (
    role = 'student' AND 
    id IN (
      SELECT student_id FROM public.teacher_students 
      WHERE teacher_id = auth.uid() AND status = 'active'
    )
  );

-- Teacher-Students policies
-- Teachers can view their relationships
CREATE POLICY "Teachers can view their relationships" ON public.teacher_students
  FOR SELECT USING (teacher_id = auth.uid());

-- Students can view their relationships
CREATE POLICY "Students can view their relationships" ON public.teacher_students
  FOR SELECT USING (student_id = auth.uid());

-- Teachers can insert new relationships (invitations)
CREATE POLICY "Teachers can create invitations" ON public.teacher_students
  FOR INSERT WITH CHECK (
    teacher_id = auth.uid() AND
    -- Check teacher hasn't exceeded student limit
    (
      SELECT COUNT(*) FROM public.teacher_students
      WHERE teacher_id = auth.uid() AND status = 'active'
    ) < COALESCE(
      (SELECT max_students FROM public.profiles WHERE id = auth.uid()),
      3
    )
  );

-- Teachers can update their relationships
CREATE POLICY "Teachers can update their relationships" ON public.teacher_students
  FOR UPDATE USING (teacher_id = auth.uid());

-- Students can update relationships they're part of (to accept invitations)
CREATE POLICY "Students can accept invitations" ON public.teacher_students
  FOR UPDATE USING (
    student_id = auth.uid() AND 
    status = 'pending'
  );

-- Teachers can delete their relationships
CREATE POLICY "Teachers can delete relationships" ON public.teacher_students
  FOR DELETE USING (teacher_id = auth.uid());

-- Function to generate unique teacher code
CREATE OR REPLACE FUNCTION public.generate_teacher_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  done BOOLEAN DEFAULT FALSE;
BEGIN
  WHILE NOT done LOOP
    -- Generate a 6-character alphanumeric code
    new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 6));
    
    -- Check if code already exists
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE teacher_code = new_code) THEN
      done := TRUE;
    END IF;
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Function to update teacher code for new teachers
CREATE OR REPLACE FUNCTION public.assign_teacher_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'teacher' AND NEW.teacher_code IS NULL THEN
    NEW.teacher_code := public.generate_teacher_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to assign teacher code
CREATE TRIGGER assign_teacher_code_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_teacher_code();

-- Verify tables were created
SELECT 'Migration completed successfully!' as message;