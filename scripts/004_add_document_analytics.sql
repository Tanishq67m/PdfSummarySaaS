-- Migration to add analytics and usage tracking
-- Run this to add analytics features

CREATE TABLE IF NOT EXISTS document_analytics (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    view_count INTEGER DEFAULT 0,
    export_count INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMP,
    last_exported_at TIMESTAMP,
    export_formats JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    UNIQUE(document_id)
);

-- Add summary ratings table
CREATE TABLE IF NOT EXISTS summary_ratings (
    id SERIAL PRIMARY KEY,
    summary_id INTEGER NOT NULL REFERENCES summaries(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    UNIQUE(summary_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_document_analytics_document_id ON document_analytics(document_id);
CREATE INDEX IF NOT EXISTS idx_document_analytics_user_id ON document_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_summary_ratings_summary_id ON summary_ratings(summary_id);

COMMENT ON TABLE document_analytics IS 'Tracks document usage and analytics';
COMMENT ON TABLE summary_ratings IS 'Stores user ratings and feedback for summaries';
