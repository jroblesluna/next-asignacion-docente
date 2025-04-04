'use client';
import NavBar from '../components/NavBar';
import { ReturnTitle } from '../components/Titles';
import { useEffect, useState } from 'react';

import LayoutValidation from '../LayoutValidation';
import { DocentesActivos, PeriodoAcademico } from '../interface/datainterface';
import periodService from '@/services/period';
import teacherService from '@/services/teacher';
import assigmentService from '@/services/assigment';
import { ModalWarning } from '../components/Modals';
import { convertirFormatoFecha } from '../utils/managmentDate';
const Page = () => {
  const [dataPerido, setDataPeriodo] = useState<PeriodoAcademico>();
  const [dataDocentesActivos, setDataDocentesActivos] = useState<DocentesActivos[]>([]);
  const [nombresSedesData, setNombresSedeData] = useState<{ NombreSede: string }[]>([]);
  const [dataVacia, setDataVacia] = useState(false);
  const [dataVaciaPeriodo, setDataVaciaPeriodo] = useState(false);

  const loadDataTest = async () => {
    const resPerido = await periodService.verify();
    if (resPerido.data?.idPeriodo != '-1') {
      setDataVaciaPeriodo(false);
    } else {
      setDataVaciaPeriodo(true);
    }

    if (!resPerido.data || resPerido.data?.idPeriodo == '-1') {
      alert('No  hay un periodo activo . Redirigiendo a la página principal.');
      window.location.href = '/home';
    }

    setDataPeriodo(resPerido.data);
  };

  useEffect(() => {
    loadDataTest();
  }, []);

  const loadDataDocentes = async (id: string) => {
    const resSedesData = await assigmentService.getLocationTac('-1');
    setNombresSedeData(resSedesData.data);
    const resDocentes = await teacherService.getAll(id);
    setDataVacia(false);
    setDataDocentesActivos(resDocentes.data);
  };

  useEffect(() => {
    if (dataPerido?.idPeriodo !== undefined) {
      loadDataDocentes(dataPerido.idPeriodo.toString());
    }
  }, [dataPerido]);

  const reiniciarPeriodo = async (idPeriodo: string) => {
    localStorage.setItem('flagReproceso', 'true');
    localStorage.setItem('tipo', 'reinicio');
    localStorage.setItem('addEvents', 'false');
    localStorage.setItem('periodo', idPeriodo);
  };

  return (
    <LayoutValidation>
      <main className="flex flex-col gap-5 w-full min-h-[100vh] p-8 ">
        <NavBar></NavBar>
        <ReturnTitle name="Reiniciar Período - Sincronizar desde Inicio" link="/home" />
        {(dataPerido?.idPeriodo === undefined &&
          dataDocentesActivos[0]?.DocenteID === undefined &&
          nombresSedesData.length === 0 &&
          !dataVacia) ||
        dataVaciaPeriodo ? (
          <div className="w-[90%] flex gap-5 justify-center mx-auto flex-col items-center min-h-[50vh]">
            <span className="loading loading-bars loading-lg"></span>
          </div>
        ) : (
          <>
            {dataVacia === true ? (
              <div className="w-[90%] flex gap-5 justify-center mx-auto flex-col items-center min-h-[50vh]">
                <h1 className="font-bold text-5xl">
                  {'Datos No Encontrados para el nuevo periodo '}
                </h1>
              </div>
            ) : (
              <div className="w-full flex flex-row">
                <div className="w-1/2 min-h-[400px]  p-5 flex   justify-start mt-10">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-10 items-center">
                      <div className="flex flex-row gap-2">
                        <strong>Codigo de Periodo: </strong> {dataPerido?.idPeriodo}
                      </div>
                      <div className="flex flex-row gap-2">
                        <strong>Estado: </strong> {dataPerido?.estado}
                      </div>
                      <div className="flex flex-row gap-2">
                        <strong>Fecha:</strong>
                        <p
                          className={dataPerido?.fechaInicio ? '' : 'skeleton h-4 w-[200px] '}
                        >
                          {dataPerido?.fechaInicio !== undefined &&
                            ` ${convertirFormatoFecha(
                              dataPerido?.fechaInicio
                            )} - ${convertirFormatoFecha(dataPerido?.fechaFinal)} `}
                        </p>
                      </div>
                    </div>
                    <h2 className="font-bold text-[18px]">Definición:</h2>
                    <p className="text-[13px]">
                      ● La función de reinicio permite realizar un restablecimiento completo
                      del periodo actual. Al ejecutarla, se eliminarán todos los datos
                      asociados al periodo en curso, incluidos los snapshots almacenados.
                      Posteriormente, se ejecutará nuevamente la importación de datos
                      proporcionados por el Data Warehouse (DWH) desde el inicio. Esta función
                      garantiza que los datos reflejen la última información disponible en el
                      DWH.
                    </p>
                    <p className="text-[13px]">
                      ● Las versiones creadas para visualización se conservarán, y el proceso
                      continuará desde la última versión generada.
                    </p>
                    <p className="text-[13px]">
                      {` ● Toda la información proveniente del sistema de inicio se mostrará con
                      un candado e indicará que viene de "SISTEMA INICIO" .`}
                    </p>
                    <h2 className="font-bold text-[18px]">Nota:</h2>
                    <p className="text-[13px]">
                      ● Es necesario ejecutar la sincronización con el sistema de inicio antes
                      de reiniciar el periodo, de lo contrario, podría perderse la información
                      de asignaciones.
                    </p>

                    <ModalWarning
                      linkTo={'/loading'}
                      subtitle="Esta acción realizará un restablecimiento completo
                      del periodo actual."
                      title="¿Está seguro de reiniciar el período?"
                      idModal={'ReiniciarPeriodo-' + dataPerido?.idPeriodo.toString()}
                      setFunction={reiniciarPeriodo}
                    />
                  </div>
                </div>
                <div className="w-1/2 min-h-[72vh] max-h-[72vh] justify-center   flex flex-col  gap-3 p-2 -mt-10 ">
                  <div className="w-1/2 mx-auto">
                    <button
                      className={`btn  py-3 px-5 text-white font-semibold text-2xl  h-20 w-96 -ml-16 mt-4 ${
                        dataPerido?.estado != 'ACTIVO'
                          ? 'bg-[#7C7C7C] cursor-not-allowed pointer-events-none '
                          : 'bg-secundary hover:bg-secundary_ligth cursor-pointer '
                      } `}
                      onClick={() => {
                        const modal = document.getElementById(
                          'ReiniciarPeriodo-' + dataPerido?.idPeriodo.toString()
                        );
                        if (modal) {
                          (modal as HTMLDialogElement).showModal();
                        }
                      }}
                    >
                      Reiniciar asignación docente
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </LayoutValidation>
  );
};

export default Page;
