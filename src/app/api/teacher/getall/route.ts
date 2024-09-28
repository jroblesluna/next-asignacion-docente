import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/db';

export async function GET() {
  console.log("GET@/app/api/teacher/getall/route.ts");
  try {
    const pool = await connectToDatabase();

    const result = await pool.request().query('SELECT * FROM test');

    pool.close();
    return NextResponse.json({ data: result.recordset });
  } catch (error) {
    console.error('Error en la API:', error);
    return NextResponse.json({ message: 'Error en la consulta', error }, { status: 500 });
  }
}
