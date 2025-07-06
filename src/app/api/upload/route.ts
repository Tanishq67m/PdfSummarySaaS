import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db, documents, users } from "@/src/lib/db"
import { eq } from "drizzle-orm"
import { processDocument } from "@/src/lib/services/document-processor"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 })
    }

    // Validate file size (32MB limit)
    if (file.size > 32 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 32MB" }, { status: 400 })
    }

    console.log("📁 Processing upload for:", file.name, "Size:", Math.round(file.size / 1024), "KB")

    // Ensure user exists in database
    try {
      const [existingUser] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1)

      if (!existingUser) {
        await db.insert(users).values({
          clerkId: userId,
          email: "unknown@example.com", // Will be updated when we get user info
        })
      }
    } catch (error) {
      console.error("Error checking/creating user:", error)
      // Continue anyway - user creation is not critical for upload
    }

    // Create FormData for UploadThing
    const uploadFormData = new FormData()
    uploadFormData.append("files", file)

    // Upload to UploadThing using the existing endpoint
    const uploadResponse = await fetch(`${request.nextUrl.origin}/api/uploadthing`, {
      method: "POST",
      body: uploadFormData,
      headers: {
        // Forward the authorization
        cookie: request.headers.get("cookie") || "",
      },
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error("UploadThing upload failed:", errorText)
      throw new Error("File upload failed")
    }

    const uploadResult = await uploadResponse.json()
    console.log("📁 UploadThing response:", uploadResult)

    // Extract the uploaded file info
    const uploadedFile = uploadResult[0]
    if (!uploadedFile || !uploadedFile.ufsUrl) {
      throw new Error("Upload failed - no file URL returned")
    }

    // Save document to database
    const [savedDocument] = await db
      .insert(documents)
      .values({
        userId: userId,
        fileName: uploadedFile.name || file.name,
        fileUrl: uploadedFile.ufsUrl,
        fileSize: uploadedFile.size || file.size,
        uploadthingId: uploadedFile.key,
        fileKey: uploadedFile.key,
        status: "uploaded",
      })
      .returning()

    console.log("💾 Document saved to database with ID:", savedDocument.id)

    // Start background processing (don't await to avoid timeout)
    processDocument(savedDocument.id)
      .then(() => {
        console.log("✅ Background processing completed for document:", savedDocument.id)
      })
      .catch((error) => {
        console.error("❌ Background processing failed:", error)
      })

    return NextResponse.json({
      success: true,
      documentId: savedDocument.id, // Return the actual database ID
      fileUrl: uploadedFile.ufsUrl,
      fileName: uploadedFile.name || file.name,
      fileSize: uploadedFile.size || file.size,
    })
  } catch (error) {
    console.error("❌ Upload error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 },
    )
  }
}
