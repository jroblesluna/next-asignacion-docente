import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../lib/db'; // Ajusta la ruta si es necesario

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    console.log('GET@/pages/api/period/verify-active.ts');
    let pool;

    try {
      pool = await connectToDatabase();

      const result = await pool
        .request()
        .query(`SELECT TOP 1 * FROM ad_periodo WHERE estado in (   'ACTIVO','CARGANDO' ) `);
      if (result.recordset.length === 0) {
        return res.status(200).json({
          message: 'Períodos activos o cargando no encontrados',
          data: { idPeriodo: -1 },
        });
      }

      return res.status(200).json({
        message: 'Períodos encontrados correctamente',
        data: result.recordset[0],
      });
    } catch (error) {
      console.error('Error en la API:', error);
      return res.status(500).json({ message: 'Error en la consulta', error });
    } finally {
      if (pool) {
        pool.close();
      }
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
