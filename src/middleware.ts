import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { isPublicPath } from '@/core/routes';

export async function middleware(request: NextRequest) {
  // Política de rotas públicas compartilhada com o AppShell (client)
  if (isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (token) {
    return NextResponse.next();
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = '/jogos';
  redirectUrl.searchParams.set('authRequired', '1');
  redirectUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ['/', '/cardapio/:path*', '/perfil/:path*', '/jogos/:path*', '/admin/:path*'],
};
