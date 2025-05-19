'use client';
import NavBar from '../components/NavBar';
import { ReturnTitle } from '../components/Titles';
import { useEffect, useState } from 'react';
import LayoutValidation from '../LayoutValidation';
import { PeriodoAcademico } from '../interface/datainterface';
import periodService from '@/services/period';
import { ModalWarning } from '../components/Modals';
import { convertirFormatoFecha } from '../utils/managmentDate';

type PipelineRun = {
  runId: string;
  status: string | undefined;
  runStart: string;
};

const Page = () => {
  const [dataPerido, setDataPeriodo] = useState<PeriodoAcademico>();
  const [dataVaciaPeriodo, setDataVaciaPeriodo] = useState(false);
  const [lastRun, setLastRun] = useState<PipelineRun | undefined | null>(undefined);
  // cambiar al nombre real del pipeline
  const pipelineLastName = 'PL_PROCESAR_ACADEMICO_DELTA'; // for testing porpuse
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
    loadLastPipeline();
    loadDataTest();
  }, []);

  const loadLastPipeline = async () => {
    try {
      const res = await fetch(`/api/lastPipelineRun?pipelineName=${pipelineLastName}`);
      const data = await res.json();
      if (!res.ok || data.message == 'No se encontraron ejecuciones de este pipeline') {
        const emptyPipelineRun: PipelineRun = {
          runId: '',
          status: undefined,
          runStart: '',
        };
        setLastRun(emptyPipelineRun);
        console.log(
          'Error: No se encontro la ultima fecha de ejecución del pipeline ' + pipelineLastName
        );
        return;
      }
      setLastRun(data.lastRun);
    } catch (err) {
      console.log(err);
    }
  };

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
        {dataPerido?.idPeriodo === undefined ||
        dataVaciaPeriodo ||
        lastRun?.runStart == undefined ? (
          <div className="w-[90%] flex gap-5 justify-center mx-auto flex-col items-center min-h-[50vh]">
            <span className="loading loading-bars loading-lg"></span>
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
                    <p className={dataPerido?.fechaInicio ? '' : 'skeleton h-4 w-[200px] '}>
                      {dataPerido?.fechaInicio !== undefined &&
                        ` ${convertirFormatoFecha(
                          dataPerido?.fechaInicio
                        )} - ${convertirFormatoFecha(dataPerido?.fechaFinal)} `}
                    </p>
                  </div>
                </div>

                <div className="  min-h-5 my-2 ">
                  <h2 className="text-lg font-bold">Última actualización del Datamart</h2>
                  {lastRun?.status !== undefined ? (
                    <div className="flex flex-row gap-10 mt-1">
                      <p>
                        <strong>Estado de Actualización:</strong> {lastRun?.status || ''}
                      </p>
                      <p>
                        <strong>Fecha y hora:</strong>{' '}
                        {new Date(lastRun?.runStart || '').toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-row gap-10 mt-1">
                      <p>
                        <strong>
                          No se encontró la última fecha de ejecución del pipeline:{' '}
                          {pipelineLastName}{' '}
                        </strong>
                      </p>
                    </div>
                  )}
                </div>
                <h2 className="font-bold text-[18px]">Definición:</h2>
                <p className="text-[13px]">
                  ● La función de reinicio permite realizar un restablecimiento completo del
                  periodo actual. Al ejecutarla, se eliminarán todos los datos asociados al
                  periodo en curso, incluidos los snapshots almacenados. Posteriormente, se
                  ejecutará nuevamente la importación de datos proporcionados por el Data
                  Warehouse (DWH) desde el inicio. Esta función garantiza que los datos
                  reflejen la última información disponible en el DWH.
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
                  ● Es necesario ejecutar la sincronización con el sistema de inicio antes de
                  reiniciar el periodo, de lo contrario, podría perderse la información de
                  asignaciones.
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
      </main>
    </LayoutValidation>
  );
};

export default Page;
