import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Upload, FileText, Clock, TrendingUp, Plus } from "lucide-react"
import Link from "next/link"
import { currentUser } from "@clerk/nextjs/server"
import { getDashboardStats, getRecentSummaries } from "@/src/lib/services/dashboard-service"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const user = await currentUser()

  if (!user) {
    redirect("/sign-in")
  }

  console.log("📊 Dashboard Page - User:", user?.firstName || "Anonymous")

  // Fetch dynamic data
  const stats = await getDashboardStats(user.id)
  const recentSummaries = await getRecentSummaries(user.id, 3)

  // Format stats for display
  const statsData = [
    { 
      name: "Total Summaries", 
      value: stats.totalSummaries.toString(), 
      icon: FileText, 
      change: stats.totalSummaries > 0 ? "Active account" : "Get started!" 
    },
    { 
      name: "Processing", 
      value: stats.processingCount.toString(), 
      icon: Clock, 
      change: stats.processingCount > 0 ? "In progress" : "All caught up" 
    },
    { 
      name: "Words Saved", 
      value: stats.wordsSaved.toLocaleString(), 
      icon: TrendingUp, 
      change: stats.wordsSaved > 0 ? "Time saved reading" : "Start summarizing!" 
    },
  ]

  return (
    <div className="space-y-8">
      {/* Debug info */}
      <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-4">
        <p className="text-green-300 text-sm">
          ✅ Dashboard loaded successfully! User: {user?.firstName || "Anonymous"}
        </p>
      </div>

      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {user?.firstName || "there"}! 👋🏼</h1>
        <p className="text-gray-300 text-lg">Ready to transform more documents into brilliant summaries?</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsData.map((stat) => (
          <Card key={stat.name} className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload New Document */}
        <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Upload New Document
            </CardTitle>
            <CardDescription className="text-purple-200">
              Transform your next PDF into an intelligent summary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/upload">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Start New Summary
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Recent Summaries</CardTitle>
            <CardDescription className="text-gray-300">Your latest document summaries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentSummaries.length > 0 ? (
              recentSummaries.map((summary) => (
                <div key={summary.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{summary.title}</p>
                    <p className="text-xs text-gray-400">
                      {summary.fileName} • {summary.createdAt}
                    </p>
                  </div>
                  <div className="flex items-center ml-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        summary.status === "completed"
                          ? "bg-green-500/20 text-green-400"
                          : summary.status === "processing"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {summary.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-sm">No summaries yet</p>
                <p className="text-gray-500 text-xs">Upload your first document to get started</p>
              </div>
            )}
            <Link href="/summaries">
              <Button variant="outline" className="w-full border-gray-500/30 text-black hover:bg-gray-700/40">
                View All Summaries
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Tips Section */}
      <Card className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-blue-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">💡 Pro Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-blue-200">
            <li>• Upload PDFs up to 32MB for best results</li>
            <li>• Clearer text documents produce better summaries</li>
            <li>• Export summaries to Markdown for easy blog posting</li>
            <li>• Use tags to organize your summaries efficiently</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
