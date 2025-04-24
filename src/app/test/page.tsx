'use client';
import { use, useEffect, useState } from 'react';

export default function Page() {
  const clientId = process.env.NEXT_PUBLIC_AZURE_WEBAPP_ID_CLIENT;
  let b = 'process.env.NEXT_PUBLIC_AZURE_WEBAPP_ID_CLIENT';
  let c = 'process.env.PUBLIC_AZURE_WEBAPP_ID_CLIENT';
  const [a, seta] = useState('process.env.NEXT_PUBLIC_AZURE_WEBAPP_ID_TENANT');

  useEffect(() => {
    callPipelineNames();
  }, []);

  const callPipelineNames = async () => {
    const res = await fetch('/api/getPipelineName');
    const data = await res.json();
    console.log('data', data);
    seta(data.NamePipelineSync || 'error');
    b = data.NamePipelineDelta || 'error';
    c = data.NamePipelineUpdateDisponibility || 'error';
  };

  return (
    <main className="flex flex-col gap-5 w-full min-h-[100vh] p-8 ">
      <p>a: {a}</p>
      <p>b: {b}</p>
      <p>PUBLIC_AZURE_WEBAPP_ID_CLIENT: {c}</p>
      <h1>Client ID: {clientId}</h1>
    </main>
  );
}
