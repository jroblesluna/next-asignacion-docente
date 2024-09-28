import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/db';

export async function PATCH(request: Request) {
  console.log("PATCH@/app/api/period/update-state/route.ts");
  try {
    const { id, estado } = await request.json();

    if (!id || !estado) {
      return NextResponse.json({ message: 'Faltan campos en el body', data: false });
    }
    if (
      estado !== 'ACTIVO' &&
      estado !== 'CARGANDO' &&
      estado !== 'NO ACTIVO' &&
      estado !== 'CERRADO'
    ) {
      return NextResponse.json({ message: 'Tipo de estado no valido', data: false });
    }

    const pool = await connectToDatabase();

    // Verifica si el periodo existe
    const checkResult = await pool
      .request()
      .input('id', id)
      .query('SELECT estado FROM Periodo WHERE idPeriodo  = @id');

    if (!checkResult) {
      return NextResponse.json({ message: 'Período académico no encontrado', data: false });
    }

    // Actualiza el estado del periodo a Activo
    await pool
      .request()
      .input('id', id)
      .query(`UPDATE Periodo SET estado = '${estado}' WHERE idPeriodo  = @id`);

    pool.close();

    return NextResponse.json({
      message: `Estado del periodo ${id} actualizado correctamente`,
      data: true,
    });
  } catch (error) {
    console.error('Error en la API:', error);
    return NextResponse.json({ message: 'Error en la consulta', error }, { status: 500 });
  }
}
