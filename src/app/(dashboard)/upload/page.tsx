"use client"

import { useRouter } from "next/navigation"
import { useToast } from "@/src/components/ui/use-toast"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Upload, FileText, Brain, Sparkles } from "lucide-react"
import { UploadButton } from "@uploadthing/react"
import type { OurFileRouter } from "@/src/lib/uploadthing"

export default function UploadPage() {
  const router = useRouter()
  const { toast } = useToast()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-gradient-to-r from-purple-600/10 to-pink-600/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl">
                  <Upload className="h-8 w-8 text-purple-400" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">Upload Your Documents</h1>
              <p className="text-xl text-gray-300 mb-6">Transform your PDFs into intelligent summaries with AI</p>
              <div className="flex flex-wrap items-center justify-center gap-6 text-gray-400">
                <div className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-yellow-400" />
                  <span>AI-Powered Analysis</span>
                </div>
                <div className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-green-400" />
                  <span>LangChain Extraction</span>
                </div>
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-400" />
                  <span>PDF Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div>
          <Card className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 border-white/20 backdrop-blur-sm shadow-2xl mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col items-center gap-6">
                <UploadButton<OurFileRouter, "pdfUploader">
                  endpoint="pdfUploader"
                  onClientUploadComplete={(res) => {
                    if (res && res[0]) {
                      toast({
                        title: "Upload successful!",
                        description: "Your document is being processed...",
                      })
                      // Redirect to loading page for polling
                      const documentId = res[0].serverData?.pdfId
                      if (documentId) {
                        router.push(`/summary-loading?documentId=${documentId}`)
                      }
                    }
                  }}
                  onUploadError={(error) => {
                    toast({
                      title: "Upload failed",
                      description: error.message,
                      variant: "destructive",
                    })
                  }}
                  appearance={{
                    button:
                      "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105",
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white px-8 py-3 rounded-lg font-medium"
                >
                  View Dashboard
                </Button>
                <div className="text-sm text-gray-500 space-y-1 text-center">
                  <p>Maximum file size: 32MB</p>
                  <p>Supported format: PDF only</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 border-white/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-blue-500/20 rounded-full w-fit mx-auto mb-4">
                <Brain className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">AI-Powered Analysis</h3>
              <p className="text-gray-400 text-sm">
                Advanced AI algorithms extract key insights and generate comprehensive summaries
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 border-white/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-green-500/20 rounded-full w-fit mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Smart Extraction</h3>
              <p className="text-gray-400 text-sm">
                LangChain technology ensures accurate text extraction from complex PDF layouts
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 border-white/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-purple-500/20 rounded-full w-fit mx-auto mb-4">
                <FileText className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Secure Processing</h3>
              <p className="text-gray-400 text-sm">
                Your documents are processed securely and never stored permanently
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
