import { db, documents, summaries, processingLogs } from "@/src/lib/db"
import { extractPDFWithLangChain, validatePDFContent } from "@/src/lib/pdf/langchain-extractor"
import { generateSummary } from "@/src/lib/ai/summarizer"
import { eq } from "drizzle-orm"

export interface ProcessingResult {
  success: boolean
  documentId: number
  summaryId?: number
  error?: string
  processingTime: number
  extractionMethod: string
  aiModel: string
}

export async function processDocument(documentId: number): Promise<ProcessingResult> {
  const startTime = Date.now()
  try {
    console.log("🚀 Starting document processing for ID:", documentId)

    // Get document from database
    const [document] = await db.select().from(documents).where(eq(documents.id, documentId)).limit(1)

    if (!document) {
      throw new Error("Document not found")
    }

    console.log("📄 Processing document:", document.fileName)

    // Log processing start
    await db.insert(processingLogs).values({
      documentId,
      stage: "extraction",
      status: "started",
      message: "Starting LangChain PDF text extraction",
    })

    // Update document status
    await db.update(documents).set({ status: "processing", updatedAt: new Date() }).where(eq(documents.id, documentId))

    // Step 1: PDF extraction using LangChain
    console.log("📄 Extracting PDF content with LangChain...")
    const extractedContent = await extractPDFWithLangChain(document.fileUrl, document.fileName)

    // Validate extracted content
    validatePDFContent(extractedContent)

    const extractionMethod = extractedContent.metadata.extractionMethod
    console.log("✅ PDF extraction successful:", {
      method: extractionMethod,
      pageCount: extractedContent.pageCount,
      wordCount: extractedContent.wordCount,
      textLength: extractedContent.text.length,
    })

    await db.insert(processingLogs).values({
      documentId,
      stage: "extraction",
      status: "completed",
      message: `PDF text extraction completed using ${extractionMethod}`,
      metadata: {
        pageCount: extractedContent.pageCount,
        wordCount: extractedContent.wordCount,
        textLength: extractedContent.text.length,
        chunksCount: extractedContent.chunks.length,
        extractionMethod,
        title: extractedContent.metadata.title,
        author: extractedContent.metadata.author,
      },
    })

    // Step 2: AI summarization
    console.log("🤖 Generating AI summary...")
    await db.insert(processingLogs).values({
      documentId,
      stage: "analysis",
      status: "started",
      message: "Starting AI analysis and summarization",
    })

    const summaryResult = await generateSummary(extractedContent.text, document.fileName, {
      model: "google/gemma-3n-e4b-it",
      maxLength: 1000,
      includeActionItems: true,
    })

    console.log("✅ AI summary generated:", {
      wordCount: summaryResult.wordCount,
      keyPointsCount: summaryResult.keyPoints.length,
      actionItemsCount: summaryResult.actionItems.length,
      tagsCount: summaryResult.tags.length,
    })

    await db.insert(processingLogs).values({
      documentId,
      stage: "analysis",
      status: "completed",
      message: "AI analysis and summarization completed",
      metadata: {
        wordCount: summaryResult.wordCount,
        keyPointsCount: summaryResult.keyPoints.length,
        actionItemsCount: summaryResult.actionItems.length,
        tagsCount: summaryResult.tags.length,
        title: summaryResult.title,
      },
    })

    // Step 3: Save summary to database with documentId as the summaryId
    console.log("💾 Saving summary to database...")
    const [savedSummary] = await db
      .insert(summaries)
      .values({
        id: documentId, // Use documentId as summaryId
        documentId,
        title: summaryResult.title,
        content: summaryResult.content,
        keyPoints: summaryResult.keyPoints,
        actionItems: summaryResult.actionItems,
        tags: summaryResult.tags,
        wordCount: summaryResult.wordCount,
        processingTime: Math.round((Date.now() - startTime) / 1000),
        aiModel: "google/gemma-3n-e4b-it",
      })
      .returning()

    // Update document status to completed
    await db.update(documents).set({ status: "completed", updatedAt: new Date() }).where(eq(documents.id, documentId))

    const finalProcessingTime = Math.round((Date.now() - startTime) / 1000)

    await db.insert(processingLogs).values({
      documentId,
      stage: "summary_generation",
      status: "completed",
      message: "Document processing completed successfully",
      metadata: {
        summaryId: savedSummary.id,
        processingTime: finalProcessingTime,
        extractionMethod,
        totalWordCount: extractedContent.wordCount,
        summaryWordCount: summaryResult.wordCount,
      },
    })

    console.log("✅ Document processing completed successfully:", {
      documentId,
      summaryId: savedSummary.id,
      processingTime: finalProcessingTime,
      extractionMethod,
    })

    return {
      success: true,
      documentId,
      summaryId: savedSummary.id,
      processingTime: finalProcessingTime,
      extractionMethod,
      aiModel: "google/gemma-3n-e4b-it",
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    const processingTime = Math.round((Date.now() - startTime) / 1000)

    console.error("❌ Document processing failed:", {
      documentId,
      error: errorMessage,
      processingTime,
    })

    // Update document status to error
    await db.update(documents).set({ status: "error", updatedAt: new Date() }).where(eq(documents.id, documentId))

    // Log the error with more details
    await db.insert(processingLogs).values({
      documentId,
      stage: "error",
      status: "error",
      message: errorMessage,
      metadata: {
        processingTime,
        errorType: error instanceof Error ? error.constructor.name : "UnknownError",
        stackTrace: error instanceof Error ? error.stack?.substring(0, 1000) : undefined,
      },
    })

    return {
      success: false,
      documentId,
      error: errorMessage,
      processingTime,
      extractionMethod: "failed",
      aiModel: "none",
    }
  }
}
