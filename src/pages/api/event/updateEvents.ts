import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../lib/db';
import sql from 'mssql';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  console.log('GET@/pages/api/event/updateEvent.ts');
  let pool;

  try {
    pool = await connectToDatabase();

    const result = await pool
      .request()
      .query(`SELECT TOP 1 * FROM ad_periodo WHERE estado in ( 'CARGANDO' ) `);

    if (result.recordset.length != 0) {
      return res.status(200).json({
        message: 'Período cargando encontrado, no se pudo actualizar los eventos ',
        data: false,
      });
    }

    const resultActivo = await pool
      .request()
      .query(`SELECT TOP 1 * FROM ad_periodo WHERE estado in ( 'ACTIVO' ) `);

    if (resultActivo.recordset.length == 0) {
      return res.status(200).json({
        message: 'Período activos no encontrado, nada que actualizar ',
        data: false,
      });
    }

    await pool
      .request()
      .input('periodo', sql.Int, Number(resultActivo.recordset[0].idPeriodo))
      .execute('ad_actualizarEventos');

    console.log(resultActivo.recordset[0].idPeriodo);

    return res.status(200).json({
      message:
        'Eventos actualizados del periodo ' +
        resultActivo.recordset[0].idPeriodo +
        ' exitosamente',
      data: true,
    });
  } catch (error) {
    console.error('Error en la API:', error);
    return res.status(500).json({ message: 'Error en la consulta', error });
  }
}
