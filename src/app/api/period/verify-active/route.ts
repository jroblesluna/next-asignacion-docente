import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/db';

export async function GET() {
  try {
    const pool = await connectToDatabase();

    const result = await pool
      .request()
      .query(`SELECT * FROM Periodo WHERE  estado= 'CARGANDO'`);

    if (result.recordset.length > 0) {
      return NextResponse.json({
        message: 'Período académico procesandose encontrado',
        data: {
          response: true,
          estado: 'CARGANDO',
        },
      });
    }

    const resultActive = await pool
      .request()
      .query(`SELECT * FROM Periodo WHERE  estado= 'ACTIVO'`);

    if (resultActive.recordset.length > 0) {
      return NextResponse.json({
        message: 'Período académico ACTIVO encontrado',
        data: {
          response: true,
          estado: 'ACTIVO',
        },
      });
    }

    pool.close();
    return NextResponse.json({
      message: 'No hay periodos activos ni cargando',
      data: {
        response: true,
        estado: 'NONE',
      },
    });
  } catch (error) {
    console.error('Error en la API:', error);
    return NextResponse.json({ message: 'Error en la consulta', error }, { status: 500 });
  }
}
