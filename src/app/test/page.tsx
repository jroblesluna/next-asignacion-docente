'use client';
import { useEffect, useState } from 'react';
import teacherService from '../services/teacher';

function Page() {
  const loadDataTest = async () => {
    const res = await teacherService.getAll();
    setData(JSON.stringify(res, null, 2));
  };

  useEffect(() => {
    loadDataTest();
  });

  const [data, setData] = useState('');

  return (
    <main className="flex flex-col gap-5 w-full min-h-[100vh] p-8 ">
      <p>{data}</p>
    </main>
  );
}

export default Page;
