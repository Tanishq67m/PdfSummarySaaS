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

async function testConnection() {
  try {
    console.log("🔍 Testing database connection...")

    const sql = neon(process.env.DATABASE_URL!)
    const result = await sql`SELECT NOW() as current_time, version() as postgres_version`

    console.log("✅ Database connection successful!")
    console.log("📊 Connection details:")
    console.log(`   Time: ${result[0].current_time}`)
    console.log(`   Version: ${result[0].postgres_version}`)

    // Test if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    console.log("📋 Existing tables:")
    if (tables.length === 0) {
      console.log("   No tables found. Run 'npm run db:migrate' to create tables.")
    } else {
      tables.forEach((table) => console.log(`   - ${table.table_name}`))
    }
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    throw error
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testConnection().catch(console.error)
}

export { testConnection }
