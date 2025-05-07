import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login']
const ADMIN_PATHS = ['/clients', '/mcp-servers']
const CLIENT_PATHS = ['/agents', '/chat']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path))
  const isAdminPath = ADMIN_PATHS.some((path) => pathname.startsWith(path))
  const isClientPath = CLIENT_PATHS.some((path) => pathname.startsWith(path))

  const token = request.cookies.get('access_token')?.value
  let isAdmin = false
  const userCookie = request.cookies.get('user')?.value
  if (userCookie) {
    try {
      const user = JSON.parse(decodeURIComponent(userCookie))
      isAdmin = !!user.is_admin
    } catch {}
  }

  if (isPublic && token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (!isPublic && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAdminPath && !isAdmin) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (isClientPath && isAdmin) {
    return NextResponse.redirect(new URL('/mcp-servers', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
} 