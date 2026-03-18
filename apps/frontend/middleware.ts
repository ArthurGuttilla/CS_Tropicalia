import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

// If Clerk keys are not configured, skip auth entirely (demo mode)
const clerkEnabled =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !!process.env.CLERK_SECRET_KEY

export default clerkEnabled
  ? clerkMiddleware((auth, req) => {
      if (!isPublicRoute(req)) {
        auth().protect()
      }
    })
  : (_req: NextRequest) => NextResponse.next()

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
