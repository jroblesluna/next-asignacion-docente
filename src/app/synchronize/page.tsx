'use client';
import NavBar from '../components/NavBar';
import { ReturnTitle } from '../components/Titles';
import { useEffect, useState } from 'react';
import LayoutValidation from '../LayoutValidation';
import { PeriodoAcademico } from '../interface/datainterface';
import periodService from '@/services/period';

import { convertirFormatoFecha } from '../utils/managmentDate';
import assigmentService from '@/services/assigment';
const Page = () => {
  const [dataPerido, setDataPeriodo] = useState<PeriodoAcademico>();
  const [dataVacia, setDataVacia] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRuningPipeline, setIsRuningPipeline] = useState(false);
  const [typeActionPipeline, setTypeActionPipeline] = useState('monitor');
  const [runIds, setRunIds] = useState<{ runId: string; status: string }[]>([]);

  const pipelineName = process.env.NEXT_PUBLIC_INVOKE_PIPELINE_SYNC_NAME;

  const invokePipeline = async (action: 'run' | 'monitor') => {
    setLoading(true);
    setRunIds([]);

    try {
      // Send a POST request to invoke or monitor the pipeline
      const response = await fetch('/api/invokePipeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pipelineName, // Name of the pipeline to act upon
          action, // Action: either 'run' or 'monitor'
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
            // If no pipelines are running, show a no running pipelines message
            setIsRuningPipeline(false);
            return false;
          }
        }
      } else {
        // Handle error if the response is not OK
        console.log(`Error: ${data.error}`);
        setIsRuningPipeline(false);
        return false;
      }
    } catch (error: unknown) {
      // Catch any unexpected errors and display the message
      const errorMessage = (error as Error).message || 'An unexpected error occurred';
      console.log(`Error: ${errorMessage}`);
      setIsRuningPipeline(false);
      return false;
    } finally {
      setLoading(false);
    }
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

  const loadVerify = async () => {
    let isruning = false;
    setTypeActionPipeline('monitoreo');
    do {
      if (dataPerido?.estado != 'ACTIVO') {
        console.log('monitoreando');
        isruning = (await invokePipeline('monitor')) || false;
      }
    } while (isruning);
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
    console.log('ejecutado');
    let isruning = false;

    do {
      setTypeActionPipeline('monitoreo');
      console.log('monitoreando');
      isruning = (await invokePipeline('monitor')) || false;
    } while (isruning);
  };

  useEffect(() => {
    loadDataTest();
    loadVerify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LayoutValidation>
      <main className="flex flex-col gap-5 w-full min-h-[100vh] p-8 ">
        <NavBar></NavBar>
        <ReturnTitle name="Sincronizar a Inicio" />
        {dataPerido?.idPeriodo === undefined || dataVacia ? (
          <div className="w-[90%] flex gap-5 justify-center mx-auto flex-col items-center min-h-[50vh]">
            <span className="loading loading-bars loading-lg"></span>
          </div>
        ) : (
          <div className="w-full flex flex-row">
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
                    <p className={dataPerido?.fechaInicio ? '' : 'skeleton h-4 w-[200px] '}>
                      {dataPerido?.fechaInicio !== undefined &&
                        ` ${convertirFormatoFecha(
                          dataPerido?.fechaInicio
                        )} - ${convertirFormatoFecha(dataPerido?.fechaFinal)} `}
                    </p>
                  </div>
                </div>
                <h2 className="font-bold text-[18px]">Definición:</h2>
                <p className="text-[13px]">
                  ● La función de sincronización con *Inicio* sube la última información de las
                  asignaciones del sistema de asignación docente al sistema *Inicio* mediante
                  la invocación de un pipeline. Para ello, se ejecutan las siguientes acciones:
                </p>
                <p className="text-[13px]">
                  ● Se limpia y actualiza la tabla <strong>{'ad_asignacion_output'}</strong> a
                  la última versión generada con sus modificaciones correspondientes,
                  preparándola para la invocación del pipeline de sincronización.
                </p>
                <p className="text-[13px]">
                  ● Se invoca el pipeline de sincronización y se monitorea constantemente hasta
                  que finalice correctamente.
                </p>
                <h2 className="font-bold text-[18px]">Nota:</h2>
                <p className="text-[13px]">
                  ● Asegúrese de revisar y confirmar los cambios antes de sincronizarlos con el
                  sistema *Inicio*. Si se realizan modificaciones posteriores, deberá volver a
                  ejecutar la sincronización.
                </p>

                <div className="w-1/2 mx-auto">
                  <button
                    className={`btn  py-2 px-10 text-white font-semibold  mt-10 ${
                      dataPerido?.estado != 'ACTIVO' ||
                      isRuningPipeline != false ||
                      loading == true
                        ? 'bg-[#7C7C7C] cursor-not-allowed pointer-events-none '
                        : 'bg-secundary hover:bg-secundary_ligth cursor-pointer '
                    } `}
                    onClick={invokePipelineRun}
                  >
                    Sincronizar con sistema Inicio
                  </button>
                </div>
              </div>
            </div>
            <div className="w-1/2 min-h-[50vh] max-h-[50vh]   flex flex-col  gap-3 p-2 mt-10 ">
              <div className="p-6">
                <h1 className="text-4xl font-bold mb-4 ">Estado de Ejecución del pipeline</h1>
                {loading == true ? (
                  <div className="w-[100%] flex gap-5 justify-center mx-auto flex-col items-center min-h-[40vh]">
                    <span className="loading loading-spinner text-primary loading-lg"></span>
                    {typeActionPipeline == 'monitoreo' ? (
                      <p className="font-bold text-3xl">
                        Pipeline de Sincronización Ejecutandose - Monitoreando
                      </p>
                    ) : (
                      <p className="font-bold text-3xl">
                        Ejecutando Pipeline de Sincronización
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="w-[90%] flex gap-5 justify-center mx-auto flex-col items-center min-h-[40vh]">
                    <p className="font-bold text-3xl">No hay pipeline Ejecutandose</p>
                  </div>
                )}

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
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </LayoutValidation>
  );
};

export default Page;
