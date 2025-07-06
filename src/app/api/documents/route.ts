import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db, documents, summaries, processingLogs } from "@/src/lib/db"
import { eq, desc } from "drizzle-orm"

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("📊 Fetching documents for user:", userId)

    // Get user's documents with summaries
    const userDocuments = await db
      .select({
        id: documents.id,
        fileName: documents.fileName,
        fileUrl: documents.fileUrl,
        fileSize: documents.fileSize,
        status: documents.status,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
        summaryId: summaries.id,
        summaryTitle: summaries.title,
        summaryContent: summaries.content,
        keyPoints: summaries.keyPoints,
        actionItems: summaries.actionItems,
        tags: summaries.tags,
        wordCount: summaries.wordCount,
        processingTime: summaries.processingTime,
        aiModel: summaries.aiModel,
      })
      .from(documents)
      .leftJoin(summaries, eq(documents.id, summaries.documentId))
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.createdAt))

    // Get processing logs for each document
    const documentsWithLogs = await Promise.all(
      userDocuments.map(async (doc) => {
        const logs = await db
          .select()
          .from(processingLogs)
          .where(eq(processingLogs.documentId, doc.id))
          .orderBy(desc(processingLogs.createdAt))

        return {
          ...doc,
          processingLogs: logs,
        }
      }),
    )

    console.log(`✅ Found ${documentsWithLogs.length} documents for user`)

    return NextResponse.json({
      success: true,
      documents: documentsWithLogs,
      count: documentsWithLogs.length,
    })
  } catch (error) {
    console.error("❌ Failed to fetch documents:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
