import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    console.log('GET@/pages/api/teacher/getall.ts');
    let pool;

    try {
      pool = await connectToDatabase();

      const { correo } = req.query;

      const result = await pool
        .request()
        .input('correo', correo)
        .query(
          `SELECT NombreSede  FROM [dbo].[dim_docente] where EmailCoorporativo = 'rocio.huaman@icpna.edu.pe'`
        );

      //  const result = await pool
      //    .request()
      //    .input('correo', correo)
      //    .query(
      //      `SELECT NombreSede  FROM [dbo].[dim_docente] where EmailCoorporativo = @correo`
      //    );

      return res.status(200).json({
        data: result.recordset[0]?.NombreSede,
        message: 'Sede obtenida exitosamente',
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
