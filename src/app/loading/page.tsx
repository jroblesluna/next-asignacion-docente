'use client';
import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import LayoutValidation from '../LayoutValidation';
import Link from 'next/link';
import Image from 'next/image';

function Page() {
  const [isloadingComplete, setIsLoadingComplete] = useState(false);

  useEffect(() => {
    setInterval(() => {
      setIsLoadingComplete(true);
    }, 10000);
  }, []);

  return (
    <LayoutValidation>
      <main className="flex flex-col gap-5 w-full min-h-[100vh] p-8 ">
        <NavBar></NavBar>
        {!isloadingComplete ? (
          <div className="w-[95%]  mx-auto flex flex-col items-center min-h-[75vh]  gap-20 justify-end p-6 ">
            <span className="loading loading-spinner text-info w-52 mx-auto"></span>
            <p className="text-5xl font-bold leading-tight  mx-auto w-[90%] ">
              Estamos procesando la asignación docente. Puede cerrar esta ventana; se le
              notificará por correo electrónico cuando el proceso esté finalizado.
            </p>
          </div>
        ) : (
          <div className="w-[95%]  mx-auto flex flex-col items-center min-h-[60vh]  gap-2 justify-end p-6 ">
            <Image
              alt="img"
              src={'/check-loading-icon.svg'}
              width={20}
              height={20}
              className="size-72"
            />

            <p className="text-5xl font-bold leading-tight  mx-auto w-[70%] ">
              La asignación docente se ha completado exitosamente.
            </p>
            <Link
              className="bg-secundary py-2 px-10 text-white font-semibold hover:bg-secundary_ligth mx-auto mt-5"
              href={'/assignments-report/123456'}
            >
              Ir al reporte de asignación
            </Link>
          </div>
        )}
      </main>
    </LayoutValidation>
  );
}

export default Page;
