import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    console.log('GET@/pages/api/assignment/getall.ts');
    let pool;

    try {
      pool = await connectToDatabase();

      let responseMessage = '';
      let responseData: object[] | null = null;

      const result = await pool
        .request()
        .query(`select * from [dbo].[ad_avanceAlgoritmo] where idSede is not null `);

      responseMessage = `Estado de avance de algoritmo `;
      responseData = !result.recordset[0] ? [] : result.recordset[0];

      return res.status(200).json({
        message: responseMessage,
        data: responseData,
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
