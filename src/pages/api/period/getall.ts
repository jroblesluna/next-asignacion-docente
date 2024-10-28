import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    console.log('GET@/pages/api/period/getall.ts');

    let pool;

    try {
      pool = await connectToDatabase();

      const result = await pool
        .request()
        .query(
          `SELECT * FROM [ad_periodo] WHERE estado IN ('ACTIVO', 'CERRADO', 'CARGANDO') ORDER BY idPeriodo DESC`
        );

      return res.status(200).json({
        message: 'Períodos encontrados correctamente',
        data: result.recordset,
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
