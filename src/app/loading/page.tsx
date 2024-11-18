'use client';
import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import LayoutValidation from '../LayoutValidation';
import Link from 'next/link';
import Image from 'next/image';
import assigmentService from '@/services/assigment';
import periodService from '@/services/period';

function Page() {
  const [isloadingComplete, setIsLoadingComplete] = useState(false);
  const [isSafeClosed, setIsSafeClosed] = useState(false);

  const [reprocesoPeriodo, setReprocesoPeriodo] = useState('');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadData = async (p: string, correo: string, addEvents: string, tipo: string) => {
    const newPeriod = localStorage.getItem('newPeriod');
    const resPerido = await periodService.verify();
    if (resPerido.data.estado == 'ACTIVO' || newPeriod === 'true') {
      setIsSafeClosed(true);
      localStorage.setItem('newPeriod', 'false');
      const res = await assigmentService.execute(p, correo, addEvents, tipo);
      setIsLoadingComplete(res.data);
    } else {
      alert('Ya hay un procesamiento en ejecución. Por favor intentelo mas tarde.');
      localStorage.setItem('flagReproceso', 'false');
      window.location.href = '/home';
    }
  };

  useEffect(() => {
    const periodoId = localStorage.getItem('periodo');
    const correo = localStorage.getItem('user');
    const flagReproceso = localStorage.getItem('flagReproceso');
    const addEvents = localStorage.getItem('addEvents');
    const tipo = localStorage.getItem('tipo');

    if (periodoId && correo && flagReproceso === 'true' && addEvents && tipo) {
      localStorage.setItem('flagReproceso', 'false');
      setReprocesoPeriodo(periodoId);
      loadData(periodoId, correo, addEvents, tipo);
    } else {
      localStorage.setItem('flagReproceso', 'false');
      alert(
        'No  se esta permitido Ingresar directamente. Redirigiendo a la página principal.'
      );
      window.location.href = '/home';
    }
  }, []);

  return (
    <LayoutValidation>
      <main className="flex flex-col gap-5 w-full min-h-[100vh] py-8  ">
        <NavBar></NavBar>
        {!isloadingComplete ? (
          <div className="w-[90%]  mx-auto flex flex-col items-center min-h-[75vh]  gap-20 justify-end py-6 ">
            <span className="loading loading-spinner text-info w-52 "></span>
            {!isSafeClosed ? (
              <p className="text-5xl font-bold leading-tight  mx-auto  w-[90%]  ml-24 ">
                Estamos procesando la asignación docente. Por favor, espere y no cierre la
                pestaña hasta que el proceso se Inicie correctamente.
              </p>
            ) : (
              <p className="text-5xl font-bold leading-tight  mx-auto  w-[90%]  ml-24 ">
                Estamos procesando la asignación docente. Puede cerrar esta ventana; se le
                notificará por correo electrónico cuando el proceso esté finalizado.
              </p>
            )}
          </div>
        ) : (
          <div className="w-[90%]   mx-auto flex flex-col items-center min-h-[60vh]  gap-2 justify-end py-6 ">
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
              href={'/assignments-report/' + reprocesoPeriodo}
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
