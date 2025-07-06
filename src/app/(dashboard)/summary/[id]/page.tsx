import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import {
  ArrowLeft,
  FileText,
  Clock,
  Target,
  CheckSquare,
  Tag,
  Download,
  Share2,
  Sparkles,
  BookOpen,
  Zap,
  Calendar,
  User,
  BarChart3,
  Star,
  Copy,
  ExternalLink,
  Brain,
  Lightbulb,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import { db, documents, summaries } from "@/src/lib/db"
import { eq, or } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

interface SummaryPageProps {
  params: Promise<{ id: string }>
}

export default async function SummaryPage({ params }: SummaryPageProps) {
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }

  // Await params as required by Next.js 15
  const { id } = await params

  // Parse and validate the ID
  const idNumber = typeof id === "string" && id ? Number.parseInt(id, 10) : Number.NaN
  if (isNaN(idNumber)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"></div>
            <FileText className="h-20 w-20 text-red-400 mx-auto relative" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white">Invalid ID</h2>
            <p className="text-gray-400">The ID provided is not valid.</p>
          </div>
          <Link href="/dashboard">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Get summary with document info - search by both summaryId and documentId
  const [summaryData] = await db
    .select({
      id: summaries.id,
      title: summaries.title,
      content: summaries.content,
      keyPoints: summaries.keyPoints,
      actionItems: summaries.actionItems,
      tags: summaries.tags,
      wordCount: summaries.wordCount,
      processingTime: summaries.processingTime,
      aiModel: summaries.aiModel,
      createdAt: summaries.createdAt,
      documentId: summaries.documentId,
      fileName: documents.fileName,
      fileSize: documents.fileSize,
      fileUrl: documents.fileUrl,
    })
    .from(summaries)
    .innerJoin(documents, eq(summaries.documentId, documents.id))
    .where(
      or(
        eq(summaries.id, idNumber), // Search by summaryId
        eq(summaries.documentId, idNumber), // Search by documentId
      ),
    )
    .limit(1)

  if (!summaryData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl"></div>
            <FileText className="h-20 w-20 text-orange-400 mx-auto relative" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white">Summary Not Found</h2>
            <p className="text-gray-400">The summary you&apos;re looking for doesn&apos;t exist or is still being processed.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Link href={`/summary/loading?documentId=${idNumber}`}>
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-white/5 backdrop-blur-sm px-6 py-3"
              >
                Check Processing Status
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const readingTime = Math.ceil((summaryData.wordCount || 0) / 200)
  const createdDate = new Date(summaryData.createdAt)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
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
            <div className="h-6 w-px bg-gray-600" />
            <Link href="/summaries">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-sm"
              >
                <FileText className="h-4 w-4 mr-2" />
                All Summaries
              </Button>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10 bg-white/5 backdrop-blur-sm"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10 bg-white/5 backdrop-blur-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-6 mb-12">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-gradient-to-r from-purple-600/10 to-pink-600/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl">
                  <Brain className="h-8 w-8 text-purple-400" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">{summaryData.title}</h1>
              <p className="text-xl text-gray-300 mb-6">AI-Generated Document Summary</p>
              <div className="flex flex-wrap items-center justify-center gap-6 text-gray-400">
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-400" />
                  <span className="font-medium">{summaryData.wordCount}</span>
                  <span className="ml-1">words</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-green-400" />
                  <span className="font-medium">{readingTime}</span>
                  <span className="ml-1">min read</span>
                </div>
                <div className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-400" />
                  <span className="font-medium">{summaryData.processingTime}s</span>
                  <span className="ml-1">processed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Document Info Card */}
        <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-white/10 backdrop-blur-sm mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl">
                  <FileText className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-xl flex items-center">
                    {summaryData.fileName}
                    <ExternalLink className="h-4 w-4 ml-2 text-gray-400" />
                  </CardTitle>
                  <CardDescription className="text-gray-400 flex items-center space-x-4 mt-1">
                    <span>{formatFileSize(summaryData.fileSize)}</span>
                    <span>•</span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {createdDate.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {summaryData.aiModel}
                    </span>
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <Star className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tags */}
        {summaryData.tags && summaryData.tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {summaryData.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 px-4 py-2 text-sm"
              >
                <Tag className="h-3 w-3 mr-2" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Summary Content - Enhanced Styling */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 border-white/20 backdrop-blur-sm shadow-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg">
                      <Brain className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-2xl font-bold">Summary</CardTitle>
                      <CardDescription className="text-gray-400 flex items-center mt-1">
                        <Sparkles className="h-4 w-4 mr-1" />
                        AI-generated comprehensive analysis of your document
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Smart Analysis
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Decorative elements */}
                  <div className="absolute -top-2 -left-2 w-4 h-4 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-sm"></div>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-sm"></div>

                  {/* Content container with enhanced styling */}
                  <div className="relative bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl p-8 border border-white/10 backdrop-blur-sm">
                    {/* Content header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2">
                        <Lightbulb className="h-5 w-5 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-300">Key Insights</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>{readingTime} min read</span>
                      </div>
                    </div>

                    {/* Main content with beautiful typography */}
                    <div className="prose prose-invert prose-lg max-w-none">
                      <div className="relative">
                        {/* Quote-like styling */}
                        <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-purple-500 to-pink-500 rounded-full opacity-50"></div>
                        <p className="text-gray-200 leading-relaxed text-lg font-light whitespace-pre-wrap pl-6 relative">
                          {summaryData.content}
                        </p>
                      </div>
                    </div>

                    {/* Content footer */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center">
                          <BarChart3 className="h-4 w-4 mr-1" />
                          <span>{summaryData.wordCount} words analyzed</span>
                        </div>
                        <div className="flex items-center">
                          <Brain className="h-4 w-4 mr-1" />
                          <span>AI-powered insights</span>
                        </div>
                      </div>
                      <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/30">
                        <Star className="h-3 w-3 mr-1" />
                        High Quality
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Points */}
            {summaryData.keyPoints && summaryData.keyPoints.length > 0 && (
              <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center text-lg">
                    <Target className="h-5 w-5 mr-2 text-green-400" />
                    Key Points
                  </CardTitle>
                  <CardDescription className="text-green-200/70">Main highlights from your document</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {summaryData.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mt-0.5 border border-green-500/30">
                          <span className="text-green-400 text-xs font-bold">{index + 1}</span>
                        </div>
                        <span className="text-gray-300 text-sm leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Action Items */}
            {summaryData.actionItems && summaryData.actionItems.length > 0 && (
              <Card className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-500/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center text-lg">
                    <CheckSquare className="h-5 w-5 mr-2 text-orange-400" />
                    Action Items
                  </CardTitle>
                  <CardDescription className="text-orange-200/70">Recommended next steps</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {summaryData.actionItems.map((item, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <CheckSquare className="h-4 w-4 text-orange-400 mt-1 flex-shrink-0" />
                        <span className="text-gray-300 text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Processing Stats */}
            <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-lg">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-400" />
                  Processing Stats
                </CardTitle>
                <CardDescription className="text-blue-200/70">Analysis metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-500/5 rounded-lg">
                  <span className="text-blue-200 text-sm">Processing Time</span>
                  <span className="text-white font-medium">{summaryData.processingTime}s</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-500/5 rounded-lg">
                  <span className="text-blue-200 text-sm">Word Count</span>
                  <span className="text-white font-medium">{summaryData.wordCount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-500/5 rounded-lg">
                  <span className="text-blue-200 text-sm">AI Model</span>
                  <span className="text-white font-medium text-xs">{summaryData.aiModel}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-500/5 rounded-lg">
                  <span className="text-blue-200 text-sm">Reading Time</span>
                  <span className="text-white font-medium">{readingTime} min</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <Card className="bg-gradient-to-r from-slate-800/30 to-slate-700/30 border-white/10 backdrop-blur-sm mt-8">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 justify-center">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-white/5 backdrop-blur-sm px-6 py-3"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Summary
              </Button>
              <Link href="/upload">
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 bg-white/5 backdrop-blur-sm px-6 py-3"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Upload Another
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
