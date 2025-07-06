import { db } from "@/src/lib/db"
import { documents, summaries } from "@/src/lib/db/schema"
import { eq, desc, and, sql } from "drizzle-orm"

export interface DashboardStats {
  totalSummaries: number
  processingCount: number
  wordsSaved: number
}

export interface RecentSummary {
  id: number
  title: string
  fileName: string
  createdAt: string
  status: string
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  // Get total completed summaries
  const totalSummariesResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(summaries)
    .innerJoin(documents, eq(summaries.documentId, documents.id))
    .where(eq(documents.userId, userId))

  // Get processing documents count
  const processingCountResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(documents)
    .where(and(eq(documents.userId, userId), eq(documents.status, "processing")))

  // Get total words saved (sum of word counts)
  const wordsSavedResult = await db
    .select({ totalWords: sql<number>`coalesce(sum(${summaries.wordCount}), 0)` })
    .from(summaries)
    .innerJoin(documents, eq(summaries.documentId, documents.id))
    .where(eq(documents.userId, userId))

  return {
    totalSummaries: totalSummariesResult[0]?.count || 0,
    processingCount: processingCountResult[0]?.count || 0,
    wordsSaved: wordsSavedResult[0]?.totalWords || 0,
  }
}

export async function getRecentSummaries(userId: string, limit: number = 5): Promise<RecentSummary[]> {
  const recentSummaries = await db
    .select({
      id: summaries.id,
      title: summaries.title,
      fileName: documents.fileName,
      createdAt: summaries.createdAt,
      status: documents.status,
    })
    .from(summaries)
    .innerJoin(documents, eq(summaries.documentId, documents.id))
    .where(eq(documents.userId, userId))
    .orderBy(desc(summaries.createdAt))
    .limit(limit)

  return recentSummaries.map((summary) => ({
    id: summary.id,
    title: summary.title,
    fileName: summary.fileName,
    createdAt: formatTimeAgo(summary.createdAt),
    status: summary.status,
  }))
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "Just now"
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? "s" : ""} ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? "s" : ""} ago`
  }
} 