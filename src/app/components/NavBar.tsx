'use client';

import { TbUserSquareRounded } from 'react-icons/tb';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const NavBar = () => {
  const router = useRouter();

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
              <button className="p-2" onClick={() => router.push('/welcome')}>
                Cerrar sesión
              </button>
            </li>
          </ul>
        </div>

        <div className="text-[14px]">
          <p>
            <strong>Usuario:</strong> {'accounts[0]?.name' || 'No disponible'}
          </p>
          <p>
            <strong>Correo:</strong> {'accounts[0]?.username' || 'No disponible'}
          </p>
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
