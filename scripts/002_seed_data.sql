-- Seed data for development and testing
-- Run this after the initial schema

-- Insert sample user (replace with your actual Clerk user ID for testing)
INSERT INTO users (clerk_id, email, first_name, last_name) 
VALUES 
    ('user_test123', 'test@example.com', 'Test', 'User')
ON CONFLICT (clerk_id) DO NOTHING;

-- You can add more seed data here as needed
-- For example, sample documents or test summaries

-- Note: In production, you typically wouldn't seed user data
-- This is just for development/testing purposes
