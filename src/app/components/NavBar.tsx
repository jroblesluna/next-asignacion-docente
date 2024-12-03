'use client';
import { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import Image from 'next/image';
import { msalInstance } from '../../pages/api/lib/msalConfig';
import Link from 'next/link';

const NavBar = () => {
  const { accounts } = useMsal();
  const [userAccount, setUserAccount] = useState({ name: '', username: '' });

  useEffect(() => {
    if (accounts[0]) {
      setUserAccount({
        name: accounts[0].name || '',
        username: accounts[0].username || '',
      });
      localStorage.setItem('user', accounts[0].username || '');

      document.cookie = `rol=${accounts[0]?.idTokenClaims?.roles} ; path=/; secure`;
    }
  }, [accounts]);

  const logout = async () => {
    try {
      await msalInstance.logoutRedirect();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="w-full flex justify-around items-center min-h-10">
      <div className="w-3/4 flex flex-row items-center gap-2">
        <div className="dropdown dropdown-bottom bg-transparent">
          <Image
            alt="img"
            src={'/user-icon.svg'}
            width={20}
            height={20}
            tabIndex={0}
            role="button"
            className="hover:opacity-80 cursor-pointer size-12"
          />

          <ul
            tabIndex={0}
            className="dropdown-content menu rounded-box z-[1] w-36 p-0.5 shadow bg-transparent hover:opacity-80"
          >
            <li>
              <Link className="p-2" onClick={logout} href={'/welcome'}>
                Cerrar sesión
              </Link>
            </li>
          </ul>
        </div>

        <div className="text-[14px]">
          <div className="flex flex-row gap-1">
            <strong>Usuario:</strong>
            <p className={userAccount.name ? '' : 'skeleton h-4 w-[200px]'}>
              {userAccount.name}
            </p>
            <p className="w-10"></p>
            <strong>Rol:</strong>{' '}
            {(accounts[0]?.idTokenClaims?.roles && accounts[0]?.idTokenClaims?.roles[0]) ||
              'No Info'}
          </div>
          <div className="flex flex-row gap-2">
            <strong>Correo:</strong>
            <p className={userAccount.username ? '' : 'skeleton h-4 w-[200px]'}>
              {userAccount.username}
            </p>
          </div>
        </div>
      </div>
      <Link href={'/home'}>
        <Image
          src="/icpna-icon.svg"
          alt="logo icpna"
          className="cursor-pointer hover:opacity-80 w-60 max-[600px]:mx-auto"
          width={80}
          height={80}
          priority={true}
        />
      </Link>
    </div>
  );
};

export default NavBar;
