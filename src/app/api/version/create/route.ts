import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/db';

export async function POST(request: Request) {
  console.log("POST@/app/api/version/create/route.ts");
  try {
    const { id, creator } = await request.json();

    if (!id || !creator) {
      return NextResponse.json({ message: 'Faltan campos en el body', data: false });
    }

    const pool = await connectToDatabase();

    // Verifica si el periodo existe
    const checkResult = await pool
      .request()
      .input('id', id)
      .query('SELECT * FROM Periodo WHERE idPeriodo  = @id');

    if (!checkResult) {
      return NextResponse.json({ message: 'Período académico no encontrado', data: false });
    }

    // verifica su estado

    const currentStatus = checkResult.recordset[0].estado;

    if (currentStatus !== 'ACTIVO') {
      return NextResponse.json({
        message: `El período académico ${id} no se encuentra disponible- `,
        data: false,
      });
    }

    // Calcula el próximo número de versión
    const versionResult = await pool
      .request()
      .input('id', id)
      .query(
        'SELECT ISNULL(MAX(numeroVersion), 0) + 1 AS nextVersion FROM Version WHERE idPeriodo = @id'
      );

    const nextVersion = versionResult.recordset[0].nextVersion;

    await pool
      .request()
      .input('id', id)
      .input('numeroVersion', nextVersion)
      .input('nombreCreador', creator).query(`
        INSERT INTO Version (idPeriodo, numeroVersion, nombreCreador)
        VALUES (@id, @numeroVersion, @nombreCreador)
      `);

    pool.close();

    return NextResponse.json({
      message: `Versión creada  correctamente`,
      data: true,
    });
  } catch (error) {
    console.error('Error en la API:', error);
    return NextResponse.json({ message: 'Error en la consulta', error }, { status: 500 });
  }
}
