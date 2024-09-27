import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/db';

export async function PATCH(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ message: 'Faltan campos en el body', data: false });
    }
    //
    const pool = await connectToDatabase();

    await pool
      .request()
      .input('id', id)
      .query(
        `UPDATE Evento SET estado = 'EJECUTADO' WHERE idPeriodo  = @id and estado = 'NO INICIADO'`
      );

    pool.close();

    // ejecutar eventos

    return NextResponse.json({
      message: `Los Eventos se han ${id} ejecutado correctamente`,
      data: true,
    });
  } catch (error) {
    console.error('Error en la API:', error);
    return NextResponse.json({ message: 'Error en la consulta', error }, { status: 500 });
  }
}
