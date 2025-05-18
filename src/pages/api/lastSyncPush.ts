import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from './lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    console.log('GET@/pages/api/lastSyncPush.ts');
    let pool;
    try {
      pool = await connectToDatabase();

      const result = await pool.request().query(
        `SELECT TOP 1 
                FORMAT(fechaejecucion, 'dd-MM-yyyy') AS fecha,
                FORMAT(fechaejecucion, 'HH:mm:ss') AS hora,
            	periodo
            FROM ad_asignacion_output
            ORDER BY fechaejecucion DESC;`
      );

      if (result.recordset.length === 0) {
        return res.status(200).json({
          message:
            'No se encontraron registros de sincronización en la base de datos - tabla ad_asignacion_output',
          data: [],
        });
      }

      return res.status(200).json({
        message: 'Ultima fecha de sincronización encontrada',
        data: result.recordset,
      });
    } catch (error) {
      console.error('Error en la API:', error);
      return res.status(500).json({ message: 'Error en la consulta', error });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
