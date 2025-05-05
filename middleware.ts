import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login']
const ADMIN_PATHS = ['/clientes', '/servidores-mcp']
const CLIENT_PATHS = ['/agentes', '/chat']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path))
  const isAdminPath = ADMIN_PATHS.some((path) => pathname.startsWith(path))
  const isClientPath = CLIENT_PATHS.some((path) => pathname.startsWith(path))

  // Lê o token do cookie (SSR seguro)
  const token = request.cookies.get('access_token')?.value
  // Lê o user do cookie (deve ser salvo como JSON serializado)
  let isAdmin = false
  const userCookie = request.cookies.get('user')?.value
  if (userCookie) {
    try {
      const user = JSON.parse(decodeURIComponent(userCookie))
      isAdmin = !!user.is_admin
    } catch {}
  }

  // Se for rota pública e usuário autenticado, redireciona para home
  if (isPublic && token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Se for rota privada e não autenticado, redireciona para login
  if (!isPublic && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Se for rota de admin e não for admin, redireciona para home
  if (isAdminPath && !isAdmin) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Se for rota de cliente e for admin, redireciona para servidores-mcp
  if (isClientPath && isAdmin) {
    return NextResponse.redirect(new URL('/servidores-mcp', request.url))
  }

  // Permite acesso normalmente
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
} 