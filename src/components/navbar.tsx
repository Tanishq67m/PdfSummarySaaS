import { UserButton } from '@clerk/nextjs'
import { FileText, Upload, LayoutDashboard, Settings } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/src/components/ui/button'

export default function Navbar() {
  return (
    <nav className="border-b border-white/10 backdrop-blur-md bg-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">SummaryAI</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link href="/upload" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </Link>
            <Link href="/settings" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <Link href="/upload">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Upload className="h-4 w-4 mr-2" />
                Upload PDF
              </Button>
            </Link>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "h-10 w-10",
                  userButtonPopoverCard: "bg-white",
                  userButtonPopoverActionButton: "hover:bg-gray-100",
                }
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  )
}