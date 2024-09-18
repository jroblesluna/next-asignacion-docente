'use client';
import { useEffect, useState } from 'react';
import eventService from '../services/evento';

function Page() {
  const loadDataTest = async () => {
    const res = await eventService.getAll('2');
    setData(JSON.stringify(res, null, 2));
  };

  useEffect(() => {
    loadDataTest();
  }, []);

  const [data, setData] = useState('');

  return (
    <main className="flex flex-col gap-5 w-full min-h-[100vh] p-8 ">
      <p>{data}</p>
    </main>
  );
}

export default Page;
