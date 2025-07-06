-- Migration to add user preferences table
-- Run this to add user customization features

CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
    ai_model_preference TEXT DEFAULT 'gpt-4',
    summary_length_preference TEXT DEFAULT 'medium', -- short, medium, long
    include_action_items BOOLEAN DEFAULT true,
    export_format_preference TEXT DEFAULT 'markdown', -- markdown, pdf, txt
    theme_preference TEXT DEFAULT 'dark',
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

COMMENT ON TABLE user_preferences IS 'Stores user customization preferences';
