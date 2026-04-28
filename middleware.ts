import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// 1. Định nghĩa các matcher bên ngoài để tối ưu hiệu năng
// middleware.ts
export default clerkMiddleware((auth, req) => {
  const isDashboardRoute = createRouteMatcher(['/dashboard(.*)'])

  // Nếu là TRANG dashboard thì mới ép redirect
  if (isDashboardRoute(req) && !req.nextUrl.pathname.startsWith('/api')) {
    auth().protect({
      unauthenticatedUrl: new URL('/signin', req.url).toString(),
    })
  }
})