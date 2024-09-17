import { NextResponse } from 'next/server';
import { AuthenticationResult } from '@azure/msal-browser';
import { msalInstance } from '../../lib/msalConfig'; // Ajusta la ruta según tu estructura

export async function GET() {
  try {
    // Asegúrate de que la redirectUri sea correcta para tu entorno local
    const result: AuthenticationResult = await msalInstance.acquireTokenSilent({
      scopes: ['user.read'],
      redirectUri: 'http://localhost:3000/api/auth/callback', // Asegúrate de que coincida con la configuración en Azure AD
    });

    console.log(result);
    if (result.accessToken) {
      // Redirecciona a la página principal o a la ruta protegida
      return NextResponse.redirect('http://localhost:3000/home'); // Usa una URL absoluta
    }
  } catch (error) {
    console.error('Error during authentication:', error);
    return NextResponse.redirect('http://localhost:3000/error'); // Usa una URL absoluta para la página de error
  }

  return NextResponse.redirect('http://localhost:3000/'); // Usa una URL absoluta
}
