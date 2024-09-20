'use client';
import React, { useState, useEffect, ReactNode } from 'react';
import { useMsal } from '@azure/msal-react';
import Image from 'next/image';

interface LayoutValidationProps {
  children: ReactNode;
}

const LayoutValidation: React.FC<LayoutValidationProps> = ({ children }) => {
  const { instance, inProgress } = useMsal();
  const accounts = instance.getAllAccounts();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (inProgress === 'none') {
      const authenticated = accounts.some((account) => !!account.idToken);
      setIsAuthenticated(authenticated);
      setLoading(false);
    }
  }, [accounts, inProgress]);

  if (loading) {
    return (
      <div className="w-full h-[100vh] flex items-center justify-center">
        <span className="loading loading-spinner text-success loading-lg"></span>
      </div>
    );
  }

  if (!isAuthenticated) {
    instance.clearCache();
    sessionStorage.clear();
    localStorage.clear();

    instance
      .logoutRedirect({
        onRedirectNavigate: () => false,
      })
      .then(() => {
        window.location.href = '/welcome';
      })
      .catch((e) => {
        console.error(e);
      });
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
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
            <p className="text-gray-600">Redirigiendo al Inicio...</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default LayoutValidation;
