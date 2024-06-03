import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

const PUBLIC_ROUTES = ['/']

export default auth(req => {
  const isLoggedIn = !!req.auth
  const { nextUrl } = req
  const { pathname } = nextUrl
  if (pathname.startsWith('/api')) {
    return
  }
  if (pathname === '/auth/signin') {
    if (isLoggedIn) {
      console.log('already logged in')
      return NextResponse.redirect(new URL('/journal', nextUrl))
    }
    return
  }
  if (!isLoggedIn && !PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL('/auth/signin', nextUrl))
  }
  return
})

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
}
