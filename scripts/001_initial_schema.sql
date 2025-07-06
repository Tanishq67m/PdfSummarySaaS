-- Initial database schema for PDF Summarizer
-- Run this first to create all tables

-- Users table to store Clerk user information
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    clerk_id TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Documents table to store uploaded PDF information
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    uploadthing_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'uploaded',
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Summaries table to store AI-generated summaries
CREATE TABLE IF NOT EXISTS summaries (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    key_points JSONB,
    action_items JSONB,
    tags JSONB,
    word_count INTEGER,
    processing_time INTEGER,
    ai_model TEXT NOT NULL DEFAULT 'gpt-4',
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Processing logs table to track document processing stages
CREATE TABLE IF NOT EXISTS processing_logs (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    stage TEXT NOT NULL,
    status TEXT NOT NULL,
    message TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_summaries_document_id ON summaries(document_id);
CREATE INDEX IF NOT EXISTS idx_processing_logs_document_id ON processing_logs(document_id);
CREATE INDEX IF NOT EXISTS idx_processing_logs_stage ON processing_logs(stage);

-- Add comments for documentation
COMMENT ON TABLE users IS 'Stores user information from Clerk authentication';
COMMENT ON TABLE documents IS 'Stores uploaded PDF document metadata';
COMMENT ON TABLE summaries IS 'Stores AI-generated summaries of documents';
COMMENT ON TABLE processing_logs IS 'Tracks document processing stages and status';

COMMENT ON COLUMN documents.status IS 'Document processing status: uploaded, processing, completed, error';
COMMENT ON COLUMN summaries.processing_time IS 'Time taken to process document in seconds';
COMMENT ON COLUMN processing_logs.stage IS 'Processing stage: extraction, analysis, summary_generation, error';
