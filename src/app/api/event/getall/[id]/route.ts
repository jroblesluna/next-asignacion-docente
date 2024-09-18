import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: 'ID de periodo académico no proporcionado' },
        { status: 400 }
      );
    }
    const pool = await connectToDatabase();

    const result = await pool
      .request()
      .input('id', id)
      .query('SELECT * FROM Evento WHERE idPeriodo = @id');

    pool.close();

    return NextResponse.json({
      message: `Eventos del periodo ${id} encontrados correctamente`,
      data: result.recordset,
    });
  } catch (error) {
    console.error('Error en la API:', error);
    return NextResponse.json({ message: 'Error en la consulta', error }, { status: 500 });
  }
}
