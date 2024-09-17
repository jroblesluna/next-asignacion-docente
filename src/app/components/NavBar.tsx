'use client';
import { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';

import { TbUserSquareRounded } from 'react-icons/tb';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { msalInstance } from '../lib/msalConfig';

const NavBar = () => {
  const router = useRouter();
  const { accounts } = useMsal();
  const [userAccount, setUserAccount] = useState({ name: '', username: '' });

  useEffect(() => {
    if (accounts[0]) {
      setUserAccount({
        name: accounts[0].name || '',
        username: accounts[0].username || '',
      });
    }
  }, [accounts]);

  const logout = async () => {
    try {
      await msalInstance.logoutRedirect();
      router.push('/welcome');
    } catch (error) {
      console.error('Error during logout:', error);
      router.push('/error');
    }
  };

  return (
    <div className="w-full flex justify-around items-center">
      <div className="w-3/4 flex flex-row items-center gap-2">
        <div className="dropdown dropdown-bottom bg-transparent">
          <TbUserSquareRounded
            tabIndex={0}
            role="button"
            className="text-primary hover:opacity-80 cursor-pointer size-12"
          />
          <ul
            tabIndex={0}
            className="dropdown-content menu rounded-box z-[1] w-36 p-0.5 shadow bg-transparent hover:opacity-80"
          >
            <li>
              <button className="p-2" onClick={logout}>
                Cerrar sesión
              </button>
            </li>
          </ul>
        </div>

        <div className="text-[14px]">
          <div className="flex flex-row gap-1">
            <strong>Usuario:</strong>
            <p className={userAccount.name ? '' : 'skeleton h-4 w-[200px]'}>
              {userAccount.name}
            </p>
          </div>
          <div className="flex flex-row gap-2">
            <strong>Correo:</strong>
            <p className={userAccount.username ? '' : 'skeleton h-4 w-[200px]'}>
              {userAccount.username}
            </p>
          </div>
        </div>
      </div>
      <Image
        src="/icpna-icon.svg"
        alt="logo icpna"
        className="cursor-pointer hover:opacity-80 w-60 max-[600px]:mx-auto"
        onClick={() => router.push('/home')}
        width={80}
        height={80}
      />
    </div>
  );
};

export default NavBar;
