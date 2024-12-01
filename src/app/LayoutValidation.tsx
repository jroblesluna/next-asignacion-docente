'use client';
import React, { useState, useEffect, ReactNode } from 'react';
import { useMsal } from '@azure/msal-react';
import Image from 'next/image';

interface LayoutValidationProps {
  children: ReactNode;
}

const LayoutValidation: React.FC<LayoutValidationProps> = ({ children }) => {
  const { instance, inProgress, accounts } = useMsal();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shouldLogout, setShouldLogout] = useState(false);

  const clearCookies = () => {
    document.cookie.split(';').forEach((cookie) => {
      const cookieName = cookie.split('=')[0].trim();
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  };

  useEffect(() => {
    if (inProgress === 'none') {
      const accountsInstace = instance.getAllAccounts();
      const authenticated = accountsInstace.some((account) => !!account.idToken);
      setIsAuthenticated(authenticated);
      setLoading(false);

      if (!authenticated || !accounts[0]?.idTokenClaims?.roles) {
        setIsAuthenticated(false);
        setShouldLogout(true);
      }
    }
  }, [inProgress, instance, accounts]);

  useEffect(() => {
    if (shouldLogout) {
      console.log('hola');
      instance.clearCache();
      sessionStorage.clear();
      localStorage.clear();
      clearCookies();

      setInterval(() => {
        instance
          .logoutRedirect({
            onRedirectNavigate: () => true,
            logoutHint: accounts[0]?.username,
            postLogoutRedirectUri: '/welcome',
          })
          .catch((e) => {
            console.error(e);
          });
      }, 3000);
    }
  }, [shouldLogout, instance, accounts]);

  if (loading) {
    return (
      <div className="w-full h-[100vh] flex items-center justify-center">
        <span className="loading loading-spinner text-success loading-lg"></span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 max-w-[100vw]">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
          <div className="text-center flex flex-col gap-2 items-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Usuario No Autenticado
            </h2>
            <Image
              alt="img"
              src={'/locked-page.svg'}
              width={20}
              height={20}
              className="size-16"
            />
            <p className="text-gray-600">Usted no tiene permiso para ingresar</p>
            <p className="text-gray-600">Redirigiendo al Inicio</p>
            <span className="loading loading-dots loading-sm"></span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default LayoutValidation;
