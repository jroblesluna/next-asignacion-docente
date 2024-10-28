'use client';
import { useEffect, useState } from 'react';
import assigmentService from '@/services/assigment';
// import periodService from '@/services/period';
// import teacherService from '@/services/teacher';

function Page() {
  const loadDataTest = async () => {
    const res = await assigmentService.execute('202409');
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
