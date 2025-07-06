import { config } from "dotenv"
import { neon } from "@neondatabase/serverless"
import { join } from "path"

// Load environment variables from .env.local
config({ path: join(process.cwd(), ".env.local") })

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is required")
  console.log("💡 Make sure you have DATABASE_URL in your .env.local file")
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL!)

async function resetDatabase() {
  try {
    console.log("⚠️  WARNING: This will delete all data in the database!")
    console.log("🔄 Dropping all tables...")

    // Drop tables in reverse order due to foreign key constraints
    const dropStatements = [
      "DROP TABLE IF EXISTS summary_ratings CASCADE;",
      "DROP TABLE IF EXISTS document_analytics CASCADE;",
      "DROP TABLE IF EXISTS user_preferences CASCADE;",
      "DROP TABLE IF EXISTS processing_logs CASCADE;",
      "DROP TABLE IF EXISTS summaries CASCADE;",
      "DROP TABLE IF EXISTS documents CASCADE;",
      "DROP TABLE IF EXISTS users CASCADE;",
    ]

    for (const statement of dropStatements) {
      await sql(statement)
    }

    console.log("✅ Database reset completed!")
    console.log("💡 Run 'npm run db:migrate' to recreate tables")
  } catch (error) {
    console.error("❌ Database reset failed:", error)
    throw error
  }
}

// Run reset if this file is executed directly
if (require.main === module) {
  resetDatabase().catch(console.error)
}

export { resetDatabase }
