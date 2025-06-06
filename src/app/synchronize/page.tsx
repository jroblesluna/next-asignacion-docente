'use client';
import NavBar from '../components/NavBar';
import { ReturnTitle } from '../components/Titles';
import { useEffect, useState } from 'react';
import LayoutValidation from '../LayoutValidation';
import {
  AsignacionOutputInterface,
  FechaHoraEjecucion,
  PeriodoAcademico,
} from '../interface/datainterface';
import periodService from '@/services/period';

import { convertirFormatoFecha } from '../utils/managmentDate';
import assigmentService from '@/services/assigment';
import { ModalConfirm } from '../components/Modals';
import { downloadExcelSync } from '../utils/downloadExcel';

type PipelineRun = {
  runId: string;
  status: string | undefined;
  runStart: string;
  runEnd?: string;
};

const Page = () => {
  const [dataPerido, setDataPeriodo] = useState<PeriodoAcademico>();
  const [dataVacia, setDataVacia] = useState(false);
  const [failPipeline, setFailPipeline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRuningPipeline, setIsRuningPipeline] = useState(false);
  const [typeActionPipeline, setTypeActionPipeline] = useState('monitor');
  const [runIds, setRunIds] = useState<{ runId: string; status: string }[]>([]);
  const [updateDataSync, setUpdateDataSync] = useState(false);
  const [pipelineName, setPipelineName] = useState(
    'process.env.NEXT_PUBLIC_INVOKE_PIPELINE_SYNC_NAME'
  );
  const [detalleSync, setDetalleSync] = useState<AsignacionOutputInterface[]>([]);
  const [changePipeline, setChangePipeline] = useState(false);
  const [lastRun, setLastRun] = useState<PipelineRun | undefined | null>(undefined);
  const [loadingLastRun, setLoadingLastRun] = useState(true);
  const callPipelineNames = async () => {
    const res = await fetch('/api/getPipelineName');
    const data = await res.json();
    setPipelineName(data.NamePipelineSync);
  };
  //cambiar para produccion
  const correoFinal = 'juan.navarro@icpna.edu.pe';
  const invokePipeline = async (action: 'run' | 'monitor') => {
    setLoading(true);
    setRunIds([]);

    // if (process.env.NEXT_PUBLIC_BUILD_DATE) {
    //   correoFinal = localStorage.getItem('user') || '';
    // } else {
    //   correoFinal = 'juan.navarro@icpna.edu.pe'; // for testing purposes
    // }

    try {
      // Send a POST request to invoke or monitor the pipeline
      const response = await fetch('/api/invokePipeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pipelineName: pipelineName, // Name of the pipeline to act upon
          action, // Action: either 'run' or 'monitor'
          userParams: correoFinal,
        }),
      });

      const data = await response.json(); // Parse the JSON response

      if (response.ok) {
        // Handling success for 'run' action
        if (action === 'run') {
          if (data.runningPipelines?.length) {
            // If pipeline is already running, show message and list running pipelines
            setRunIds(
              data.runningPipelines.map((runId: string) => ({ runId, status: 'Running' }))
            );
          } else {
            // If pipeline is not running, invoke the pipeline and show success message
            setRunIds([{ runId: data.runId, status: 'Running' }]);
          }
          setIsRuningPipeline(true);

          return false;
        }
        // Handling success for 'monitor' action
        else if (action === 'monitor') {
          if (data.runningPipelines?.length) {
            // If there are running pipelines, show monitoring message and list them
            console.log('Monitoring the pipeline...');
            setRunIds(
              data.runningPipelines.map((runId: string) => ({ runId, status: 'Running' }))
            );
            setIsRuningPipeline(true);
            return true;
          } else {
            console.log('No pipelines are running.');
            // If no pipelines are running, show a no running pipelines message
            setIsRuningPipeline(false);
            return false;
          }
        }
      } else {
        // Handle error if the response is not OK
        console.log(`Error: ${data.error}`);
        setIsRuningPipeline(false);
        setFailPipeline(true);
        return false;
      }
    } catch (error: unknown) {
      // Catch any unexpected errors and display the message
      const errorMessage = (error as Error).message || 'An unexpected error occurred';
      console.log(`Error: ${errorMessage}`);
      setIsRuningPipeline(false);
      setFailPipeline(true);
      return false;
    }
  };

  const invokePipelineRun = async () => {
    setIsRuningPipeline(true);
    const correo = localStorage.getItem('user');
    setTypeActionPipeline('Ejecutando');

    await assigmentService.sincronizarTablaOutput(
      (dataPerido?.idPeriodo || '').toString(),
      correo || ''
    );

    await invokePipeline('run');
    setChangePipeline((prev) => !prev);
    console.log('ejecutado');
    let isruning = true;

    assigmentService.sincronizarDespuesTablasAD(
      (dataPerido?.idPeriodo || '').toString(),
      correo || ''
    );

    do {
      setTypeActionPipeline('monitoreo');
      console.log('monitoreando');
      await new Promise((resolve) => setTimeout(resolve, 3000));
      isruning = (await invokePipeline('monitor')) || false;
    } while (isruning);
    setLoading(false);
    setChangePipeline((prev) => !prev);
    await loadLastSyncDataDetalle();
  };

  const loadDataTest = async () => {
    const resPerido = await periodService.verify();
    if (resPerido.data?.idPeriodo != '-1') {
      setDataVacia(false);
    } else {
      setDataVacia(true);
    }

    if (!resPerido.data || resPerido.data?.idPeriodo == '-1') {
      alert('No hay un periodo activo. Redirigiendo a la página principal.');
      window.location.href = '/home';
    }
    setDataPeriodo(resPerido.data);
  };

  const loadLastPipeline = async () => {
    try {
      const res = await fetch(`/api/lastPipelineRun?pipelineName=${pipelineName}`);
      const data = await res.json();
      if (!res.ok || data.message == 'No se encontraron ejecuciones de este pipeline') {
        const emptyPipelineRun: PipelineRun = {
          runId: '',
          status: undefined,
          runStart: '',
        };
        setLastRun(emptyPipelineRun);
        console.log(
          'Error: No se encontro la ultima fecha de ejecución del pipeline ' + pipelineName
        );
        return;
      }
      setLastRun(data.lastRun);
    } catch (err) {
      console.log(err);
    }
  };

  const loadLastSyncDataDetalle = async () => {
    setDetalleSync([]);
    try {
      const res = await fetch(`/api/getSyncData`);
      const data = await res.json();
      if (!res.ok) {
        console.log(data?.message);
        throw new Error(data.error || 'Error al obtener el pipeline');
      }
      if (data.data.length == 0) {
        setDetalleSync([]);
        return;
      }
      setDetalleSync(data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const loadVerify = async () => {
    let isruning = true;
    setTypeActionPipeline('monitoreo');
    do {
      if (dataPerido?.estado != 'ACTIVO') {
        console.log('monitoreando');
        isruning = (await invokePipeline('monitor')) || false;
      }
    } while (isruning);
    setChangePipeline((prev) => !prev);
    if (updateDataSync) {
      await loadLastSyncDataDetalle();
    }
    setLoading(false);
  };

  const loadLastRun = async () => {
    if (pipelineName !== 'process.env.NEXT_PUBLIC_INVOKE_PIPELINE_SYNC_NAME') {
      await loadLastPipeline();
      await setLoadingLastRun(false);
    }
  };

  useEffect(() => {
    callPipelineNames();
  }, []);

  useEffect(() => {
    loadDataTest();
    loadLastRun();
    loadLastSyncDataDetalle();
    loadVerify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipelineName]);

  useEffect(() => {
    loadLastRun();
  }, [changePipeline]);

  return (
    <LayoutValidation>
      <main className="flex flex-col gap-5 w-full min-h-[100vh] p-8 ">
        <NavBar></NavBar>
        <ReturnTitle name="Sincronizar a Inicio" link="/home" />
        {dataPerido?.idPeriodo === undefined || dataVacia ? (
          <div className="w-[90%] flex gap-5 justify-center mx-auto flex-col items-center min-h-[50vh]">
            <span className="loading loading-bars loading-lg"></span>
          </div>
        ) : (
          <div className="w-full flex flex-row">
            {!failPipeline ? (
              <>
                <div className="w-1/2 min-h-[400px]  p-5 flex  justify-center  items-start">
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
                      ● La función de sincronización con *Inicio* sube la última información de
                      las asignaciones del sistema de asignación docente al sistema *Inicio*
                      mediante la invocación de un pipeline (Transmisión de datos). Para ello,
                      se ejecutan las siguientes acciones:
                    </p>
                    <p className="text-[13px]">
                      ● Se limpia y actualiza la tabla{' '}
                      <strong>{'ad_asignacion_output'}</strong> a la última versión generada
                      con sus modificaciones correspondientes, preparándola para la invocación
                      del pipeline de sincronización.
                    </p>
                    <p className="text-[13px]">
                      ● Se invoca el pipeline de sincronización y se monitorea constantemente
                      hasta que finalice correctamente.
                    </p>
                    <h2 className="font-bold text-[18px]">Nota:</h2>
                    <p className="text-[13px]">
                      ● Asegúrese de revisar y confirmar los cambios antes de sincronizarlos
                      con el sistema *Inicio*. Si se realizan modificaciones posteriores,
                      deberá volver a ejecutar la sincronización.
                    </p>
                    <div className="  min-h-5 my-2 ">
                      {!loadingLastRun && (
                        <>
                          <h2 className="text-lg font-bold">
                            Datos del último pipeline de sincronización ejecutado:
                          </h2>

                          {lastRun?.status !== undefined ? (
                            <div className="flex flex-row gap-10 mt-1">
                              <p>
                                <strong>Estado de Actualización:</strong>{' '}
                                {lastRun?.status || ''}
                              </p>
                              <p>
                                <strong>Inicio:</strong>{' '}
                                {lastRun?.runStart
                                  ? new Date(lastRun?.runStart).toLocaleString()
                                  : ''}
                              </p>
                              <p>
                                <strong>Fin:</strong>{' '}
                                {lastRun?.runEnd
                                  ? new Date(lastRun?.runEnd).toLocaleString()
                                  : 'cargando...'}
                              </p>
                            </div>
                          ) : (
                            <div className="flex flex-row gap-10 mt-1">
                              <p>
                                <strong>
                                  {'Error: No se encontro la ultima fecha de ejecución del pipeline ' +
                                    pipelineName}
                                </strong>
                              </p>
                            </div>
                          )}
                        </>
                      )}

                      <div className="flex flex-col gap-2">
                        <h3 className="text-xs font-bold mt-2">Descargar</h3>
                        <div>
                          {!changePipeline ? (
                            <>
                              <button
                                className={` mt-2 py-2  px-4 text-white font-semibold  text-[10px] ${
                                  detalleSync.length == 0 ||
                                  lastRun?.status == 'InProgress' ||
                                  lastRun?.status == undefined
                                    ? 'bg-[#7C7C7C] cursor-not-allowed pointer-events-none '
                                    : 'bg-blue-600 hover:bg-blue-400 cursor-pointer '
                                } `}
                                onClick={() => {
                                  downloadExcelSync(detalleSync);
                                }}
                              >
                                Descargar Excel
                              </button>
                            </>
                          ) : (
                            <>
                              {' '}
                              <h2 className="text-xs font-bold text-gray-500 mt-2">
                                Cargando datos de sincronización...
                              </h2>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <ModalConfirm
                      subtitle={
                        'Esta acción es irreversible. Asegúrese de revisar y confirmar los cambios antes de sincronizarlos con el sistema Inicio.'
                      }
                      title="¿Está seguro de sincronizar los datos con sistema inicio?"
                      idModal={'sincronizar-' + dataPerido?.idPeriodo.toString()}
                      setFunction={invokePipelineRun}
                    />
                    <div className="w-1/2 mx-auto">
                      <button
                        className={`btn  py-2 px-10 text-white font-semibold  mt-10 ${
                          dataPerido?.estado != 'ACTIVO' ||
                          isRuningPipeline != false ||
                          loading == true
                            ? 'bg-[#7C7C7C] cursor-not-allowed pointer-events-none '
                            : 'bg-secundary hover:bg-secundary_ligth cursor-pointer '
                        } `}
                        onClick={() => {
                          const modal = document.getElementById(
                            'sincronizar-' + dataPerido?.idPeriodo.toString()
                          );
                          if (modal) {
                            (modal as HTMLDialogElement).showModal();
                          }
                        }}
                      >
                        Sincronizar con sistema Inicio
                      </button>
                    </div>
                  </div>
                </div>
                <div className="w-1/2 min-h-[50vh] max-h-[50vh]   flex flex-col  gap-3 p-2 mt-10 ">
                  <div className="p-6">
                    <h1 className="text-4xl font-bold mb-4 ">Estado de la sincronización</h1>
                    {loading == true || isRuningPipeline == true ? (
                      <div className="w-[100%] flex gap-5 justify-center mx-auto flex-col items-center min-h-[40vh]">
                        <span className="loading loading-spinner text-primary loading-lg"></span>
                        {typeActionPipeline == 'monitoreo' ? (
                          <p className="font-bold text-3xl">
                            Sincronización en progreso - Monitoreando pipeline
                          </p>
                        ) : (
                          <p className="font-bold text-3xl">
                            Sincronización iniciada. Por favor, espere mientras se completa la
                            llamada al pipeline.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="w-[90%] flex gap-5 justify-center mx-auto flex-col items-center min-h-[40vh]">
                        <p className="font-bold text-3xl">No hay sincronización en proceso</p>
                      </div>
                    )}
                    {/* 
                    {runIds.length > 0 && (
                      <div className="mt-4">
                        <h2 className="font-semibold">Run IDs:</h2>
                        <ul className="list-disc pl-6">
                          {runIds.map((run, index) => (
                            <li key={index} className="text-blue-500">
                              {run.runId || 'No Run ID Available'} -{' '}
                              <span className="text-gray-600">{run.status}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )} */}
                  </div>
                </div>
              </>
            ) : (
              <h1 className="font-bold text-5xl mx-auto h-full mt-36  w-[90%]">
                {
                  'La transmición de datos (pipeline) ha fallado. Por favor contactar con el equipo de TI.'
                }
              </h1>
            )}
          </div>
        )}
      </main>
    </LayoutValidation>
  );
};

export default Page;
