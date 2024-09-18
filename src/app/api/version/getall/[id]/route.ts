import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({
      message: 'ID del periodo académico no proporcionado',
      data: false,
    });
  }

  try {
    const pool = await connectToDatabase();

    const resultCheck = await pool
      .request()
      .input('id', id)
      .query('SELECT * FROM Periodo WHERE idPeriodo   = @id');

    if (!resultCheck) {
      return NextResponse.json({
        message: `Periodo con id ${id} no encontrado`,
        data: false,
      });
    }

    const result = await pool
      .request()
      .input('id', id)
      .query('SELECT * FROM Version WHERE idPeriodo   = @id');

    pool.close();

    return NextResponse.json({
      message: 'Versión encontrada correctamente',
      data: result.recordset,
    });
  } catch (error) {
    console.error('Error en la API:', error);
    return NextResponse.json({ message: 'Error en la consulta', error }, { status: 500 });
  }
}
