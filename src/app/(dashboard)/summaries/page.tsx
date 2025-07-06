import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Input } from "@/src/components/ui/input"
import { ArrowLeft, FileText, Clock, Search, Filter, Eye, Download, Calendar, TrendingUp, Plus } from "lucide-react"
import Link from "next/link"
import { db, documents, summaries } from "@/src/lib/db"
import { eq, desc } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function SummariesPage() {
  const { userId } = await auth()   

  if (!userId) {
    redirect("/sign-in")
  }

  // Get all summaries for the user
  const userSummaries = await db
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
      fileName: documents.fileName,
      fileSize: documents.fileSize,
    })
    .from(summaries)
    .innerJoin(documents, eq(summaries.documentId, documents.id))
    .where(eq(documents.userId, userId))
    .orderBy(desc(summaries.createdAt))

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getReadingTime = (wordCount: number) => Math.ceil(wordCount / 200)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-4 mb-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Your Summaries</h1>
          <p className="text-gray-300 text-lg">
            Browse and manage your AI-generated document summaries ({userSummaries.length} total)
          </p>
        </div>
        <Link href="/upload">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Upload New PDF
          </Button>
        </Link>
      </div>

      {/* Search and Filter */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search summaries..."
                className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400"
              />
            </div>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summaries Grid */}
      {userSummaries.length === 0 ? (
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardContent className="text-center py-16">
            <FileText className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No Summaries Yet</h3>
            <p className="text-gray-400 mb-6">Upload your first PDF to get started with AI-powered summaries.</p>
            <Link href="/upload">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Upload Your First PDF
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userSummaries.map((summary) => (
            <Card
              key={summary.id}
              className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-200 group"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-white text-lg line-clamp-2 group-hover:text-purple-300 transition-colors">
                      {summary.title}
                    </CardTitle>
                    <CardDescription className="text-gray-400 mt-1">
                      {summary.fileName} • {formatFileSize(summary.fileSize)}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-400 mt-2">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(summary.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {getReadingTime(summary.wordCount || 0)} min
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm line-clamp-3 mb-4">{summary.content}</p>

                {/* Tags */}
                {summary.tags && summary.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {summary.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-white/5 border-white/20 text-gray-300">
                        {tag}
                      </Badge>
                    ))}
                    {summary.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs bg-white/5 border-white/20 text-gray-400">
                        +{summary.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                  <div className="flex items-center space-x-3">
                    <span>📝 {summary.wordCount} words</span>
                    <span>🤖 {summary.aiModel}</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {summary.processingTime}s
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Link href={`/summary/${summary.id}`} className="flex-1">
                    <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      {userSummaries.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-blue-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-center">📊 Your Summary Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-white">{userSummaries.length}</div>
                <div className="text-blue-200 text-sm">Total Summaries</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {userSummaries.reduce((acc, s) => acc + (s.wordCount || 0), 0).toLocaleString()}
                </div>
                <div className="text-blue-200 text-sm">Words Processed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {Math.round(userSummaries.reduce((acc, s) => acc + (s.processingTime || 0), 0))}s
                </div>
                <div className="text-blue-200 text-sm">Processing Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {Math.ceil(userSummaries.reduce((acc, s) => acc + (s.wordCount || 0), 0) / 200)}
                </div>
                <div className="text-blue-200 text-sm">Minutes Saved</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
