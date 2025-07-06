import { NextResponse } from "next/server"
import { db } from "@/src/lib/db"

export async function GET() {
  try {
    console.log("🔍 Testing database connection...")

    // Simple query to test connection
    const result = await db.execute("SELECT NOW() as current_time")

    console.log("✅ Database connection successful")

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      timestamp: result.rows[0]?.current_time,
    })
  } catch (error) {
    console.error("❌ Database connection failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
