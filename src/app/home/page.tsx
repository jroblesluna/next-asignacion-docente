'use client';
import React from 'react';
// import { useRouter } from 'next/navigation';
import { ButtonOptionMain } from '../components/Buttons';
import { GrDocumentTime } from 'react-icons/gr';
import { TiDocumentAdd } from 'react-icons/ti';
import { MdEditDocument } from 'react-icons/md';
import NavBar from '../components/NavBar';
import { BasicTitle } from '../components/Titles';
import LayoutValidation from '../LayoutValidation';
// import { useIsAuthenticated } from '@azure/msal-react';
// import { GrSecure } from 'react-icons/gr';

const Page = () => {
  // const router = useRouter();
  // const isAuthenticated = useIsAuthenticated();
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     setLoading(false);
  //   };

  //   checkAuth();
  // }, [isAuthenticated, router]);

  // if (loading) {
  //   return (
  //     <div className="w-full h-[100vh] flex items-center justify-center">
  //       <span className="loading loading-spinner text-success loading-lg"></span>
  //     </div>
  //   );
  // }

  // if (!isAuthenticated) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen bg-gray-100">
  //       <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
  //         <div className="text-center flex flex-col gap-2 items-center">
  //           <h2 className="text-2xl font-semibold text-gray-800 mb-2">
  //             Usuario No Autenticado
  //           </h2>
  //           <GrSecure className="size-16" />

  //           <p className="text-gray-600">{'Usted No tiene permiso de ingresar'}</p>
  //           <button className="bg-secundary py-2 text-white font-semibold hover:bg-secundary_ligth w-48">
  //             Ir al Inicio
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <LayoutValidation>
      <main className="flex flex-col gap-5 w-full min-h-[100vh] p-6">
        <NavBar />
        <BasicTitle name="Sistema de Asignación docente ICPNA" />
        <div className="grid grid-cols-4 gap-y-10 justify-items-center w-[90%] mx-auto mt-10">
          <ButtonOptionMain
            img={<GrDocumentTime className="size-[95px] text-white" />}
            isDisabled={false}
            title="Historial"
            linkTo="/history"
          />
          <ButtonOptionMain
            img={<TiDocumentAdd className="size-[120px] text-white" />}
            isDisabled={false}
            title="Nuevo Período"
            linkTo="/new-period"
          />
          <ButtonOptionMain
            img={<MdEditDocument className="size-[95px] text-white" />}
            isDisabled={true}
            title="Ver Periodo En curso"
            linkTo="/"
          />
          <ButtonOptionMain img={<></>} isDisabled={false} title="" linkTo="/" />
          <ButtonOptionMain img={<></>} isDisabled={false} title="" linkTo="/" />
          <ButtonOptionMain img={<></>} isDisabled={false} title="" linkTo="/" />
          <ButtonOptionMain img={<></>} isDisabled={false} title="" linkTo="/" />
          <ButtonOptionMain img={<></>} isDisabled={false} title="" linkTo="/" />
        </div>
      </main>
    </LayoutValidation>
  );
};

export default Page;
