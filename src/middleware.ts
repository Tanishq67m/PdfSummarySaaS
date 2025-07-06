import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/upload(.*)", "/summaries(.*)", "/settings(.*)"])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  const pathname = req.nextUrl.pathname

  console.log(`🔍 Middleware - Path: ${pathname}, UserId: ${userId ? "EXISTS" : "NULL"}`)

  // Only protect routes, don't handle auth page redirects
  if (!userId && isProtectedRoute(req)) {
    console.log(`🚫 Redirecting unauthenticated user from ${pathname} to /sign-in`)
    return NextResponse.redirect(new URL("/sign-in", req.url))
  }

  console.log(`✅ Allowing access to ${pathname}`)
  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
