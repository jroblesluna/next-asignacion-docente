import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const PermisosRol = req.cookies.get('rol')?.value;
  // borrar
  if (req.nextUrl.pathname === '/reload-period') {
    return NextResponse.redirect(new URL('/home', req.url));
  }

  if (PermisosRol) {
    const permisos = PermisosRol.split(',');
    if (!permisos.includes('Administrador')) {
      return NextResponse.redirect(new URL('/home', req.url));
    }
  }

  return NextResponse.next();
}
export const config = {
  matcher: [
    '/new-period/:path*',
    '/loading',
    '/config-data',
    '/events-period/:path*',
    '/balance-report/:path*',
    '/reload-period',
  ],
};
