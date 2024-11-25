import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  // Obtener la cookie 'rol' (si existe)
  const PermisosRol = req.cookies.get('rol')?.value;
  //   const { pathname } = req.nextUrl; // Obtiene el path de la URL actual
  // (pathname.includes('/new-period')

  if (PermisosRol) {
    const permisos = PermisosRol.split(',');
    if (!permisos.includes('Administrador')) {
      return NextResponse.redirect(new URL('/home', req.url));
    }
  }

  return NextResponse.next();
}
// , '/assignments-report/:path*'
export const config = {
  matcher: ['/new-period/:path*', '/loading', '/events-period/:path*'],
};
