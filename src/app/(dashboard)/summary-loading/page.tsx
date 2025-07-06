"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Progress } from "@/src/components/ui/progress"
import { ArrowLeft, FileText, Brain, Sparkles, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"

interface ProcessingStatus {
  status: "uploaded" | "processing" | "completed" | "error"
  progress: number
  message: string
  summaryId?: number
  debug?: any // Add debug info
}

export default function SummaryLoadingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const documentId = searchParams.get("documentId")

  const [status, setStatus] = useState<ProcessingStatus>({
    status: "uploaded",
    progress: 10,
    message: "Starting document processing...",
  })

  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    if (!documentId) {
      console.log("❌ No documentId found, redirecting to dashboard")
      router.push("/dashboard")
      return
    }

    console.log("🚀 Starting polling for documentId:", documentId)

    const checkStatus = async () => {
      try {
        console.log("📡 Checking status for documentId:", documentId)
        const res = await fetch(`/api/summary-status?documentId=${documentId}`)
        const data = await res.json()

        console.log("📊 API Response:", data)
        setDebugInfo(data) // Store for debugging

        // Check if summary exists and is completed
        if (data?.summary?.id) {
          console.log("✅ Summary found with ID:", data.summary.id)
          setStatus({
            status: "completed",
            progress: 100,
            message: "Summary generated successfully! Redirecting...",
            summaryId: data.summary.id,
            debug: data,
          })

          // Use documentId for redirect since it should equal summaryId
          console.log("🔄 Redirecting to /summary/" + documentId)
          setTimeout(() => {
            router.push(`/summary/${documentId}`)
          }, 1500)
        } else if (data?.document?.status === "completed") {
          // Alternative check: if document status is completed, try to find summary
          console.log("📄 Document completed, checking for summary...")
          setStatus({
            status: "completed",
            progress: 100,
            message: "Processing completed! Redirecting...",
            debug: data,
          })

          setTimeout(() => {
            router.push(`/summary/${documentId}`)
          }, 1500)
        } else if (data?.document?.status === "error" || data?.error) {
          console.log("❌ Error detected:", data.error || "Processing failed")
          setStatus({
            status: "error",
            progress: 0,
            message: data.error || "Processing failed. Please try again.",
            debug: data,
          })
        } else if (data?.document?.status === "processing") {
          console.log("⏳ Still processing...")
          setStatus({
            status: "processing",
            progress: 50,
            message: "Extracting text and generating AI summary...",
            debug: data,
          })
        } else {
          console.log("📋 Document uploaded, waiting for processing...")
          setStatus({
            status: "uploaded",
            progress: 25,
            message: "Document uploaded, starting processing...",
            debug: data,
          })
        }
      } catch (err) {
        console.error("❌ Error checking summary status:", err)
        setStatus({
          status: "error",
          progress: 0,
          message: "Failed to check processing status",
          debug: { error: err.message },
        })
      }
    }

    // Check immediately
    checkStatus()

    // Then poll every 2 seconds
    const interval = setInterval(checkStatus, 2000)

    return () => {
      console.log("🛑 Cleaning up polling interval")
      clearInterval(interval)
    }
  }, [documentId, router])

  const getStatusIcon = () => {
    switch (status.status) {
      case "uploaded":
        return <FileText className="h-8 w-8 text-blue-400" />
      case "processing":
        return <Loader2 className="h-8 w-8 text-yellow-400 animate-spin" />
      case "completed":
        return <CheckCircle className="h-8 w-8 text-green-400" />
      case "error":
        return <AlertCircle className="h-8 w-8 text-red-400" />
      default:
        return <Brain className="h-8 w-8 text-purple-400" />
    }
  }

  const handleManualRedirect = () => {
    console.log("🔄 Manual redirect to /summary/" + documentId)
    router.push(`/summary/${documentId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>

        {/* Processing Card */}
        <Card className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 border-white/20 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl">
                {getStatusIcon()}
              </div>
            </div>
            <CardTitle className="text-white text-2xl font-bold">Processing Your Document</CardTitle>
            <p className="text-gray-400 mt-2">Document ID: {documentId}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Progress</span>
                <span className="text-white font-medium">{status.progress}%</span>
              </div>
              <Progress value={status.progress} className="h-3 bg-slate-700" />
            </div>

            {/* Status Message */}
            <div className="text-center space-y-4">
              <p className="text-gray-300 text-lg">{status.message}</p>

              {status.status === "processing" && (
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
                  <div className="flex items-center">
                    <Brain className="h-4 w-4 mr-2 text-blue-400" />
                    <span>AI Analysis</span>
                  </div>
                  <div className="flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-yellow-400" />
                    <span>Text Extraction</span>
                  </div>
                </div>
              )}

              {status.status === "completed" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center text-green-400">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span>Summary generated successfully!</span>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={handleManualRedirect}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      View Summary
                    </Button>
                  </div>
                </div>
              )}

              {status.status === "error" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center text-red-400">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <span>Processing failed</span>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={() => window.location.reload()}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Retry
                    </Button>
                    <Link href="/upload">
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                        Upload New Document
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Debug Info Card - Remove this in production
        {debugInfo && (
          <Card className="bg-gradient-to-r from-slate-800/30 to-slate-700/30 border-white/10 backdrop-blur-sm mt-6">
            <CardHeader>
              <CardTitle className="text-white text-lg">Debug Info (Remove in Production)</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs text-gray-300 overflow-auto max-h-40">{JSON.stringify(debugInfo, null, 2)}</pre>
              <div className="mt-4 flex gap-2">
                <Button size="sm" onClick={handleManualRedirect} className="bg-blue-600 hover:bg-blue-700">
                  Force Redirect to /summary/{documentId}
                </Button>
              </div>
            </CardContent>
          </Card>
        )} */}

        {/* Processing Steps */}
        <Card className="bg-gradient-to-r from-slate-800/30 to-slate-700/30 border-white/10 backdrop-blur-sm mt-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className={`text-center p-4 rounded-lg ${status.progress >= 10 ? "bg-blue-500/20" : "bg-gray-500/20"}`}
              >
                <FileText
                  className={`h-6 w-6 mx-auto mb-2 ${status.progress >= 10 ? "text-blue-400" : "text-gray-400"}`}
                />
                <p className={`text-sm ${status.progress >= 10 ? "text-blue-300" : "text-gray-400"}`}>
                  Upload Complete
                </p>
              </div>
              <div
                className={`text-center p-4 rounded-lg ${status.progress >= 50 ? "bg-yellow-500/20" : "bg-gray-500/20"}`}
              >
                <Brain
                  className={`h-6 w-6 mx-auto mb-2 ${status.progress >= 50 ? "text-yellow-400" : "text-gray-400"}`}
                />
                <p className={`text-sm ${status.progress >= 50 ? "text-yellow-300" : "text-gray-400"}`}>
                  AI Processing
                </p>
              </div>
              <div
                className={`text-center p-4 rounded-lg ${status.progress >= 100 ? "bg-green-500/20" : "bg-gray-500/20"}`}
              >
                <Sparkles
                  className={`h-6 w-6 mx-auto mb-2 ${status.progress >= 100 ? "text-green-400" : "text-gray-400"}`}
                />
                <p className={`text-sm ${status.progress >= 100 ? "text-green-300" : "text-gray-400"}`}>
                  Summary Ready
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
