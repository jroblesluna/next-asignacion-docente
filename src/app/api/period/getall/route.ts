import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/db';

export async function GET() {
  console.log("GET@/app/api/period/getall/route.ts");
  try {
    const pool = await connectToDatabase();
    const result = await pool
      .request()
      .query(`SELECT * FROM Periodo where estado in ('ACTIVO','CERRADO','CARGANDO')`);

    pool.close();
    return NextResponse.json({
      message: 'Períodos encontrados correctamente',
      data: result.recordset,
    });
  } catch (error) {
    console.error('Error en la API:', error);
    return NextResponse.json({ message: 'Error en la consulta', error }, { status: 500 });
  }
}
