'use client';
import Link from 'next/link';
import React, { useEffect } from 'react';
import { useState } from 'react';

function Page() {
  const [name, setName] = useState('');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    document.body.removeAttribute('cz-shortcut-listen');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      const data = await res.json();
      setGreeting(data.message);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <>
      <div>Prueba</div>

      <div className="w-fit text-black hover:text-white bg-green-300 hover:bg-green-600 border-green-800 rounded-xl p-2">
        <Link href={{ pathname: '/welcome', query: { getInputField1: 'getInputData1' } }}>
          Ir a Welcome
        </Link>
      </div>

      <div>
        <h1>Send Your Name</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="border"
          />
          <button type="submit">Send</button>
        </form>
        <p>{greeting}</p>
      </div>
    </>
  );
}

export default Page;
