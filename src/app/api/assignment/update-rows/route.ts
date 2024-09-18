// const { id } = req.query;
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/db';

export async function PATCH(request: Request) {
  try {
    const { id, data } = await request.json();

    if (!id || !data) {
      return NextResponse.json({ message: 'Faltan campos en el body', data: false });
    }

    const pool = await connectToDatabase();

    const checkResult = await pool
      .request()
      .input('id', id)
      .query('SELECT * FROM Periodo WHERE idPeriodo  = @id');

    if (!checkResult) {
      return NextResponse.json({ message: 'Período académico no encontrado', data: false });
    }

    for (const row of data) {
      await pool
        .request()
        .input('idAula', row.idAula)
        .input('idDocente', row.idDocente)
        .input('idVersion', row.idVersion)
        .input('id', id)
        .query(
          'UPDATE AsignacionDocente SET idAula = @idAula   idDocente = @idDocente  WHERE idPeriodo  = @id and idVersion= @idVersion'
        );
    }

    pool.close();

    return NextResponse.json({
      message: `Campos de asignación docente, para el periodo ${id} actualizado correctamente`,
      data: true,
    });
  } catch (error) {
    console.error('Error en la API:', error);
    return NextResponse.json({ message: 'Error en la consulta', error }, { status: 500 });
  }
}
