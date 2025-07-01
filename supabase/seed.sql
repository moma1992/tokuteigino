-- Seed data for TOKUTEI Learning development
-- This file contains test data for development and testing

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE incorrect_questions ENABLE ROW LEVEL SECURITY;

-- Create test users
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at
) VALUES
    (
        '00000000-0000-0000-0000-000000000000',
        '550e8400-e29b-41d4-a716-446655440001',
        'authenticated',
        'authenticated',
        'teacher@test.com',
        crypt('password123', gen_salt('bf')),
        NOW(),
        NOW(),
        '',
        NOW(),
        '',
        NOW(),
        '',
        '',
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        FALSE,
        NOW(),
        NOW(),
        NULL,
        NULL,
        '',
        '',
        NOW(),
        '',
        0,
        NULL,
        '',
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        '550e8400-e29b-41d4-a716-446655440002',
        'authenticated',
        'authenticated',
        'student@test.com',
        crypt('password123', gen_salt('bf')),
        NOW(),
        NOW(),
        '',
        NOW(),
        '',
        NOW(),
        '',
        '',
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        FALSE,
        NOW(),
        NOW(),
        NULL,
        NULL,
        '',
        '',
        NOW(),
        '',
        0,
        NULL,
        '',
        NOW()
    );

-- Create test profiles
INSERT INTO profiles (id, email, full_name, role, language_preference) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'teacher@test.com', 'Test Teacher', 'teacher', 'ja'),
    ('550e8400-e29b-41d4-a716-446655440002', 'student@test.com', 'Test Student', 'student', 'ja');

-- Create teacher-student relationship
INSERT INTO teacher_students (teacher_id, student_id, joined_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', NOW());

-- Create test learning material
INSERT INTO learning_materials (id, teacher_id, title, description, processed_text, status) VALUES
    ('550e8400-e29b-41d4-a716-446655440003', 
     '550e8400-e29b-41d4-a716-446655440001', 
     'Sample Japanese Text', 
     'Basic Japanese vocabulary for beginners',
     'こんにちは。私の名前は田中です。今日は良い天気ですね。', 
     'ready');

-- Create sample questions
INSERT INTO questions (id, material_id, question_text, question_with_furigana, options, correct_answer, explanation, difficulty_level) VALUES
    ('550e8400-e29b-41d4-a716-446655440004',
     '550e8400-e29b-41d4-a716-446655440003',
     '「こんにちは」の意味は何ですか？',
     '「こんにちは」の意味（いみ）は何（なん）ですか？',
     '["Hello", "Goodbye", "Thank you", "Excuse me"]',
     0,
     '「こんにちは」は日本語の挨拶で、「Hello」という意味です。',
     1),
    ('550e8400-e29b-41d4-a716-446655440005',
     '550e8400-e29b-41d4-a716-446655440003',
     '「天気」の読み方は？',
     '「天気（てんき）」の読（よ）み方（かた）は？',
     '["てんき", "あまき", "そらき", "うてん"]',
     0,
     '「天気」は「てんき」と読みます。weatherという意味です。',
     1);

-- Create sample learning records
INSERT INTO learning_records (student_id, question_id, selected_answer, is_correct, time_spent) VALUES
    ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 0, TRUE, 15),
    ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 1, FALSE, 20);

-- Create incorrect question record for review
INSERT INTO incorrect_questions (student_id, question_id, review_count) VALUES
    ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 0);