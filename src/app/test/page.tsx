// import { useEffect, useState } from 'react';

// export default function Page() {
//   const clientId = process.env.NEXT_PUBLIC_AZURE_WEBAPP_ID_CLIENT;
//   let b = 'process.env.NEXT_PUBLIC_AZURE_WEBAPP_ID_CLIENT';
//   let c = 'process.env.PUBLIC_AZURE_WEBAPP_ID_CLIENT';
//   const [a, seta] = useState('process.env.NEXT_PUBLIC_AZURE_WEBAPP_ID_TENANT');

//   const callPipelineNames = async () => {
//     const res = await fetch('/api/getPipelineName');
//     const data = await res.json();
//     console.log('data', data);
//     seta(data.NamePipelineSync || 'error');
//     b = data.NamePipelineDelta || 'error';
//     c = data.NamePipelineUpdateDisponibility || 'error';
//   };
//   useEffect(() => {
//     callPipelineNames();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     <main className="flex flex-col gap-5 w-full min-h-[100vh] p-8 ">
//       <p>a: {a}</p>
//       <p>b: {b}</p>
//       <p>PUBLIC_AZURE_WEBAPP_ID_CLIENT: {c}</p>
//       <h1>Client ID: {clientId}</h1>
//     </main>
//   );
// }
'use client';
import { useEffect, useState } from 'react';

type PipelineRun = {
  runId: string;
  status: string;
  runStart: string;
  runEnd?: string;
};

export default function LastPipelineRunViewer() {
  const [lastRun, setLastRun] = useState<PipelineRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pipelineName = 'PL_PROCESAR_ACADEMICO_DELTA'; // ← reemplaza por el nombre real

  useEffect(() => {
    const fetchLastRun = async () => {
      try {
        const res = await fetch(`/api/lastPipelineRun?pipelineName=${pipelineName}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Error al obtener el pipeline');
        }

        setLastRun(data.lastRun);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchLastRun();
  }, []);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!lastRun) return <p>No se encontró ejecución reciente.</p>;

  return (
    <main className="flex flex-col gap-5 w-full min-h-[100vh] p-8 ">
      <div className="p-4 border rounded shadow">
        <h2 className="text-lg font-bold">Última ejecución del pipeline</h2>
        <p>
          <strong>Nombre Pipeline:</strong> {pipelineName}
        </p>
        <p>
          <strong>Run ID:</strong> {lastRun.runId}
        </p>

        <p>
          <strong>Estado:</strong> {lastRun.status}
        </p>
        <p>
          <strong>Inicio:</strong> {new Date(lastRun.runStart).toLocaleString()}
        </p>
        <p>
          <strong>Fin:</strong>{' '}
          {(lastRun.runEnd && new Date(lastRun.runEnd).toLocaleString()) || 'No disponible'}
        </p>
      </div>
    </main>
  );
}
