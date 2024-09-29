import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from './lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    console.log("GET@/pages/api/mailer.ts");
    try {
      const pool = await connectToDatabase();
      //
      const result = await pool.request().query('SELECT * FROM test');

      pool.close();
      return res.status(200).json({ data: result.recordset });
    } catch (error) {
      console.error('Error en la API:', error);
      return res.status(500).json({ message: 'Error en la consulta', error });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

}
