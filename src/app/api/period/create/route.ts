import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/db';

export async function POST(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ message: 'Faltan campos en el body', data: false });
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

    // verifica su estado

    const currentStatus = checkResult.recordset[0].estado;

    if (currentStatus !== 'NO ACTIVO') {
      return NextResponse.json({
        message: `El período académico ${id} ya ha sido activado con anterioridad`,
        data: false,
      });
    }

    // Actualiza el estado del periodo a Activo
    await pool
      .request()
      .input('id', id)
      .query(`UPDATE Periodo SET estado = 'CARGANDO' WHERE idPeriodo  = @id`);

    pool.close();

    // mandar la ejecución de la asignación docente para esos cursos , cuando se complete , actualiza, el estado

    return NextResponse.json({
      message: 'Período CREADO correctamente',
      data: true,
    });
  } catch (error) {
    console.error('Error en la API:', error);
    return NextResponse.json({ message: 'Error en la consulta', error }, { status: 500 });
  }
}
