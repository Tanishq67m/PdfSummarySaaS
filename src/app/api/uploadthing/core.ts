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
    .middleware(async ({ req }) => {
      const { userId } = await auth()

      if (!userId) {
        throw new Error("Unauthorized - Please sign in to upload files")
      }

      console.log("📁 Upload middleware - User authenticated:", userId)
      return { userId }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        console.log("📁 Upload complete for userId:", metadata.userId)
        console.log("📄 File details:", {
          name: file.name,
          size: file.size,
          url: file.url,
          key: file.key,
        })

        // Save document to database
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

        console.log("💾 Document saved to database with ID:", savedDocument.id)

        // Start background processing (don't await to avoid timeout)
        processDocument(savedDocument.id)
          .then((result) => {
            if (result.success) {
              console.log("✅ Background processing completed for document:", savedDocument.id)
            } else {
              console.error("❌ Background processing failed:", result.error)
            }
          })
          .catch((error) => {
            console.error("❌ Background processing error:", error)
          })

        return {
          pdfId: savedDocument.id,
          uploadedBy: metadata.userId,
          status: "uploaded",
          fileName: file.name,
          fileSize: file.size,
        }
      } catch (error) {
        console.error("❌ Upload completion failed:", error)
        throw new Error(`Failed to save document: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
