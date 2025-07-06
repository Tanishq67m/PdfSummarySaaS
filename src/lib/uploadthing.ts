import { createUploadthing, type FileRouter } from "uploadthing/next"
import { auth } from "@clerk/nextjs/server"
import { db, documents } from "@/src/lib/db"
import { processDocument } from "@/src/lib/services/document-processor"

const f = createUploadthing()

export const ourFileRouter = {
  pdfUploader: f({
    pdf: {
      maxFileSize: "32MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      // Authenticate user
      const { userId } = await auth()
      if (!userId) {
        throw new Error("Unauthorized - Please sign in to upload files")
      }

      // Return metadata for onUploadComplete
      return { userId }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        // Save document to database using file.url
        const [savedDocument] = await db
          .insert(documents)
          .values({
            userId: metadata.userId,
            fileName: file.name,
            fileUrl: file.url,
            fileSize: file.size,
            uploadthingId: file.key,
            status: "uploaded",
          })
          .returning()

        // Start background processing (don't await to avoid timeout)
        processDocument(savedDocument.id).catch(() => {})

        return {
          pdfId: savedDocument.id,
          uploadedBy: metadata.userId,
          status: "uploaded",
          fileName: file.name,
          fileSize: file.size,
          summaryId: savedDocument.id, // Now summaryId will be the same as documentId
        }
      } catch (error) {
        throw new Error(`Failed to save document: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
