import { type NextRequest, NextResponse } from "next/server"
import { db, documents, summaries } from "@/src/lib/db"
import { eq } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get("documentId")

    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
    }

    const docId = Number.parseInt(documentId, 10)
    if (isNaN(docId)) {
      return NextResponse.json({ error: "Invalid document ID" }, { status: 400 })
    }

    console.log("🔍 Checking status for documentId:", docId)

    // Get document info
    const [document] = await db.select().from(documents).where(eq(documents.id, docId)).limit(1)

    if (!document) {
      console.log("❌ Document not found:", docId)
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    console.log("📄 Document found:", {
      id: document.id,
      status: document.status,
      fileName: document.fileName,
    })

    // Check for summary - look by both summary.id and summary.documentId
    const [summary] = await db.select().from(summaries).where(eq(summaries.documentId, docId)).limit(1)

    console.log(
      "📊 Summary check result:",
      summary
        ? {
            id: summary.id,
            documentId: summary.documentId,
            title: summary.title,
            hasContent: !!summary.content,
          }
        : "No summary found",
    )

    const response = {
      document: {
        id: document.id,
        status: document.status,
        fileName: document.fileName,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      },
      summary: summary
        ? {
            id: summary.id,
            documentId: summary.documentId,
            title: summary.title,
            wordCount: summary.wordCount,
            createdAt: summary.createdAt,
          }
        : null,
      timestamp: new Date().toISOString(),
    }

    console.log("📤 Sending response:", response)
    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ API Error:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}
