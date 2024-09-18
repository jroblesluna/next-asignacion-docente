import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/db';

export async function GET(request: Request) {
  try {
    const { idPeriod, idVersion } = await request.json();

    if (!idPeriod || !idVersion) {
      return NextResponse.json({ message: 'Faltan campos en el body', data: false });
    }

    const pool = await connectToDatabase();

    if (idVersion === '-1') {
      const result = await pool.request().input('id', idPeriod).query(`SELECT TOP 1 idVersion
            FROM Version
            WHERE idPeriodo = @id
            ORDER BY numeroVersion DESC`);
      pool.close();

      const idLastVersion = result.recordset.length > 0 ? result.recordset[0].idVersion : 1;

      const resultLast = await pool
        .request()
        .input('id', idPeriod)
        .input('idVersion', idLastVersion).query(`SELECT * 
            FROM AsignacionDocente
            WHERE idPeriodo = @id and idVersion = @idVersion`);

      return NextResponse.json({
        message: `Asignación docente del periodo ${idPeriod} , la ultima versión encontrada correctamente`,
        data: resultLast.recordset,
      });
    }

    const result = await pool.request().input('id', idPeriod).input('idVersion', idVersion)
      .query(`SELECT * 
            FROM AsignacionDocente
            WHERE idPeriodo = @id and idVersion = @idVersion`);

    pool.close();

    return NextResponse.json({
      message: `Asignación docente del periodo ${idPeriod} y la versión ${idVersion} encontrada correctamente`,
      data: result.recordset,
    });
  } catch (error) {
    console.error('Error en la API:', error);
    return NextResponse.json({ message: 'Error en la consulta', error }, { status: 500 });
  }
}
