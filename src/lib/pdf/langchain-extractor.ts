import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"

export interface PDFExtractionResult {
  text: string
  pageCount: number
  wordCount: number
  chunks: string[]
  metadata: {
    title?: string
    author?: string
    subject?: string
    creator?: string
    producer?: string
    creationDate?: string
    fileSize: number
    extractionMethod: string
  }
}

export interface ChunkingOptions {
  chunkSize: number
  chunkOverlap: number
  separators: string[]
}

// Main PDF extraction function using LangChain PDFLoader
export async function extractPDFWithLangChain(fileUrl: string, fileName: string): Promise<PDFExtractionResult> {
  try {
    console.log("🔍 Starting LangChain PDF extraction for:", fileName)
    console.log("📄 File URL:", fileUrl)

    // Fetch the PDF file
    const response = await fetch(fileUrl, {
      headers: {
        "User-Agent": "PDF-Extractor/1.0",
        Accept: "application/pdf",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const fileSize = arrayBuffer.byteLength

    console.log(`📄 Processing PDF (${Math.round(fileSize / 1024)}KB)...`)

    // Convert ArrayBuffer to Blob for LangChain PDFLoader
    const blob = new Blob([arrayBuffer], { type: "application/pdf" })

    console.log("🔧 Using LangChain PDFLoader for text extraction...")

    // Use LangChain PDFLoader with blob directly
    const loader = new PDFLoader(blob, {
      splitPages: false, // Get all text in one document
      parsedItemSeparator: " ", // Separate parsed items with space
    })

    const docs = await loader.load()

    if (!docs || docs.length === 0) {
      throw new Error("PDFLoader returned no documents")
    }

    // Combine all document content
    const extractedText = docs.map((doc) => doc.pageContent).join("\n\n")

    // Get metadata from the first document
    const docMetadata = docs[0].metadata || {}
    const pageCount = docMetadata.pdf?.totalPages || docs.length || 1

    console.log("✅ LangChain PDF extraction successful!")
    console.log("📊 Extraction details:", {
      documentsExtracted: docs.length,
      totalPages: pageCount,
      textLength: extractedText.length,
      firstFewChars: extractedText.substring(0, 200) + "...",
    })

    // Print the extracted text to terminal for debugging
    console.log("📝 EXTRACTED TEXT:")
    console.log("=".repeat(50))
    console.log(extractedText.substring(0, 1000)) // First 1000 characters
    console.log("=".repeat(50))

    // Validate extracted text
    if (!extractedText || extractedText.trim().length < 50) {
      throw new Error("Extracted text is too short or empty")
    }

    // Clean and process the text
    const cleanedText = preprocessText(extractedText)

    // Validate cleaned text
    if (!isValidText(cleanedText)) {
      throw new Error("Extracted text appears to be corrupted or invalid")
    }

    const chunks = chunkDocumentSafely(cleanedText, {
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ["\n\n", "\n", ". ", " "],
    })

    const wordCount = countWords(cleanedText)

    console.log("✅ PDF extraction completed successfully!")
    console.log("📊 Final stats:", {
      pageCount,
      wordCount,
      chunksCount: chunks.length,
      textLength: cleanedText.length,
      fileSizeKB: Math.round(fileSize / 1024),
      extractionMethod: "langchain-pdfloader",
    })

    return {
      text: cleanedText,
      pageCount,
      wordCount,
      chunks,
      metadata: {
        title: docMetadata.pdf?.info?.Title || fileName.replace(/\.(pdf|PDF)$/, ""),
        author: docMetadata.pdf?.info?.Author || "Unknown Author",
        subject: docMetadata.pdf?.info?.Subject || "PDF Document",
        creator: docMetadata.pdf?.info?.Creator || "PDF Creator",
        producer: docMetadata.pdf?.info?.Producer || "PDF Producer",
        creationDate: docMetadata.pdf?.info?.CreationDate || new Date().toISOString(),
        fileSize,
        extractionMethod: "langchain-pdfloader",
      },
    }
  } catch (error) {
    console.error("❌ LangChain PDF extraction failed:", error)

    // Fallback to pdf-parse if LangChain fails
    console.log("🔄 Falling back to pdf-parse...")
    try {
      const fallbackResult = await extractWithPDFParseFallback(fileUrl, fileName)
      return fallbackResult
    } catch (fallbackError) {
      console.error("❌ Fallback extraction also failed:", fallbackError)
      throw new Error(`PDF extraction failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }
}

// Fallback extraction using pdf-parse
async function extractWithPDFParseFallback(fileUrl: string, fileName: string): Promise<PDFExtractionResult> {
  try {
    console.log("🔧 Using pdf-parse fallback...")

    // Fetch the PDF file
    const response = await fetch(fileUrl)
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Dynamic import pdf-parse
    const pdfParse = (await import("pdf-parse")).default

    const options = {
      max: 0, // Parse all pages
    }

    const data = await pdfParse(buffer, options)

    if (!data || !data.text) {
      throw new Error("pdf-parse returned no text")
    }

    const cleanText = data.text
      .replace(/\0/g, "") // Remove null characters
      .replace(/\f/g, "\n") // Replace form feeds
      .replace(/\r\n/g, "\n") // Normalize line endings
      .replace(/\r/g, "\n")
      .trim()

    console.log("📝 PDF-PARSE EXTRACTED TEXT:")
    console.log("=".repeat(50))
    console.log(cleanText.substring(0, 1000)) // First 1000 characters
    console.log("=".repeat(50))

    if (cleanText.length < 50) {
      throw new Error("Extracted text too short")
    }

    if (!isValidText(cleanText)) {
      throw new Error("Extracted text appears to be corrupted")
    }

    const cleanedText = preprocessText(cleanText)
    const chunks = chunkDocumentSafely(cleanedText, {
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ["\n\n", "\n", ". ", " "],
    })

    const wordCount = countWords(cleanedText)

    console.log("✅ pdf-parse fallback successful:", {
      pageCount: data.numpages,
      wordCount,
      chunksCount: chunks.length,
      textLength: cleanedText.length,
    })

    return {
      text: cleanedText,
      pageCount: data.numpages || 1,
      wordCount,
      chunks,
      metadata: {
        title: fileName.replace(/\.(pdf|PDF)$/, ""),
        author: "Unknown Author",
        subject: "PDF Document",
        creator: "PDF Creator",
        producer: "PDF Producer",
        creationDate: new Date().toISOString(),
        fileSize: arrayBuffer.byteLength,
        extractionMethod: "pdf-parse-fallback",
      },
    }
  } catch (error) {
    console.error("pdf-parse fallback error:", error)
    throw error
  }
}

// Validate if extracted text is meaningful
function isValidText(text: string): boolean {
  if (!text || text.length < 10) return false

  // Check for minimum letter content
  const letterCount = (text.match(/[a-zA-Z]/g) || []).length
  const letterRatio = letterCount / text.length

  // Text should be at least 20% letters (more lenient for financial docs)
  if (letterRatio < 0.2) return false

  // Check for some common words or patterns
  const textLower = text.toLowerCase()
  const hasCommonWords = [
    "the",
    "and",
    "or",
    "to",
    "of",
    "in",
    "for",
    "with",
    "on",
    "at",
    "by",
    "from",
    "as",
    "is",
    "was",
    "are",
    "were",
    "company",
    "report",
    "year",
    "financial",
    "revenue",
    "income",
    "total",
    "million",
    "billion",
    "percent",
    "%",
    "december",
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
  ].some((word) => textLower.includes(word))

  return hasCommonWords
}

// Clean and preprocess text
function preprocessText(text: string): string {
  if (!text) return ""

  return text
    .replace(/\0/g, "") // Remove null characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Remove control characters
    .replace(/\f/g, "\n") // Replace form feeds
    .replace(/\r\n/g, "\n") // Normalize line endings
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ") // Replace tabs with spaces
    .replace(/ {2,}/g, " ") // Collapse multiple spaces
    .replace(/\n{3,}/g, "\n\n") // Collapse multiple newlines
    .trim()
}

// Safe document chunking
function chunkDocumentSafely(text: string, options: ChunkingOptions): string[] {
  const { chunkSize, chunkOverlap, separators } = options

  if (text.length <= chunkSize) {
    return [text]
  }

  const chunks: string[] = []
  let currentPosition = 0

  while (currentPosition < text.length) {
    let chunkEnd = Math.min(currentPosition + chunkSize, text.length)

    // Find good breaking point
    if (chunkEnd < text.length) {
      for (const separator of separators) {
        const lastSeparatorIndex = text.lastIndexOf(separator, chunkEnd)
        if (lastSeparatorIndex > currentPosition + chunkSize * 0.5) {
          chunkEnd = lastSeparatorIndex + separator.length
          break
        }
      }
    }

    const chunk = text.slice(currentPosition, chunkEnd).trim()
    if (chunk.length > 0) {
      chunks.push(chunk)
    }

    currentPosition = Math.max(currentPosition + 1, chunkEnd - chunkOverlap)
    if (currentPosition >= text.length) break
  }

  return chunks
}

// Utility functions
function countWords(text: string): number {
  if (!text || text.trim().length === 0) return 0
  return text.trim().split(/\s+/).length
}

// Validation
export function validatePDFContent(content: PDFExtractionResult): boolean {
  if (!content.text || content.text.trim().length < 50) {
    throw new Error("PDF content is too short or empty")
  }

  if (content.wordCount < 10) {
    throw new Error("PDF must contain at least 10 words")
  }

  return true
}
