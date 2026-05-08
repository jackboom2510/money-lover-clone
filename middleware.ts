import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define route matchers for better performance
const isPublicRoute = createRouteMatcher([
  '/signin(.*)',
  '/signup(.*)',
  '/signout(.*)',
  '/api/(.*)',
  '/wizard(.*)',
  '/',
])

export default clerkMiddleware((auth, req) => {
  // Skip authentication for public routes
  if (isPublicRoute(req)) {
    return
  }

  // Protect all other routes
  auth().protect()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|png|gif|svg|webp|ttf|woff|woff2|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
