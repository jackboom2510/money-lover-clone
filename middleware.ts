import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define route matchers for better performance
const isPublicRoute = createRouteMatcher([
  '/signin(.*)',
  '/signup(.*)',
  '/signout(.*)',
  '/api/webhooks(.*)',
  '/api/categories(.*)',
  '/api/entities(.*)',
  '/api/budgets(.*)',
  '/api/goals(.*)',
  '/api/loans(.*)',
  '/api/hello(.*)',
  '/wizard(.*)',
  '/',
])

export default clerkMiddleware((auth, req) => {
  // Skip authentication for public routes
  if (isPublicRoute(req)) {
    return
  }

  // Protect all other routes
  auth().protect({
    unauthenticatedUrl: '/signin',
  })
})