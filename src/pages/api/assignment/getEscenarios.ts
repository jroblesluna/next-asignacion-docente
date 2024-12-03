import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  console.log('GET@/pages/api/assignment/getEscenarios.ts');
  let pool;

  try {
    pool = await connectToDatabase();

    const result = await pool.request().query(`
        SELECT  * FROM [dbo].[ad_escenario] order by escenario
      `);

    return res.status(200).json({
      message: 'Escenarios encontrados exitosamente',
      data: result.recordset,
    });
  } catch (error) {
    console.error('Error en la API:', error);
    return res.status(500).json({ message: 'Error en la consulta', error });
  }
}
