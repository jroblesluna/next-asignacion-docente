'use client';

// eslint-disable-next-line @next/next/no-async-client-component
export default async function Page() {
  const clientId = process.env.NEXT_PUBLIC_AZURE_WEBAPP_ID_CLIENT;
  const a = process.env.NEXT_PUBLIC_AZURE_WEBAPP_ID_TENANT;
  const b = process.env.NEXT_PUBLIC_AZURE_WEBAPP_ID_CLIENT;
  return (
    <main className="flex flex-col gap-5 w-full min-h-[100vh] p-8 ">
      <p>a: {a}</p>
      <p>b:{b}</p>
      <h1>Client ID: {clientId}</h1>
    </main>
  );
}
