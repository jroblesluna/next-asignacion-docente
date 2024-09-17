import { NextResponse } from 'next/server';

export async function POST(req) {
  const { name } = await req.json();
  return NextResponse.json({ message: `Hello, ${name}` });
}
