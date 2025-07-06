import { config } from "dotenv"
import { neon } from "@neondatabase/serverless"
import { readFileSync } from "fs"
import { join } from "path"

// Load environment variables from .env.local
config({ path: join(process.cwd(), ".env.local") })

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is required")
  console.log("💡 Make sure you have DATABASE_URL in your .env.local file")
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL!)

async function runMigration(filename: string) {
  try {
    console.log(`🔄 Running migration: ${filename}`)

    const migrationPath = join(process.cwd(), "scripts", filename)
    const migrationSQL = readFileSync(migrationPath, "utf-8")

    // Remove comments and split by semicolon
    const cleanSQL = migrationSQL
      .split("\n")
      .filter((line) => !line.trim().startsWith("--") && line.trim() !== "")
      .join("\n")

    // Split by semicolon and filter out empty statements
    const statements = cleanSQL
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0)

    console.log(`📝 Found ${statements.length} statements to execute`)

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        try {
          console.log(`   Executing statement ${i + 1}/${statements.length}`)
          await sql(statement)
        } catch (error) {
          console.error(`❌ Failed to execute statement ${i + 1}:`, statement.substring(0, 100) + "...")
          throw error
        }
      }
    }

    console.log(`✅ Migration completed: ${filename}`)
  } catch (error) {
    console.error(`❌ Migration failed: ${filename}`, error)
    throw error
  }
}

async function runSingleMigration(filename: string) {
  console.log(`🚀 Running single migration: ${filename}`)
  await runMigration(filename)
  console.log("🎉 Migration completed successfully!")
}

async function runAllMigrations() {
  const migrations = [
    "001_initial_schema.sql",
    "002_seed_data.sql",
    "003_add_user_preferences.sql",
    "004_add_document_analytics.sql",
  ]

  console.log("🚀 Starting database migrations...")

  for (const migration of migrations) {
    await runMigration(migration)
  }

  console.log("🎉 All migrations completed successfully!")
}

// Check if a specific migration file was passed as argument
const migrationFile = process.argv[2]

if (require.main === module) {
  if (migrationFile) {
    runSingleMigration(migrationFile).catch(console.error)
  } else {
    runAllMigrations().catch(console.error)
  }
}

export { runMigration, runAllMigrations, runSingleMigration }
