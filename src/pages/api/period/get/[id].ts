import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    console.log('GET@/pages/api/period/get/[id].ts');
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        message: 'ID de periodo académico no proporcionado',
        data: false,
      });
    }

    let pool;

    try {
      pool = await connectToDatabase();

      const result = await pool
        .request()
        .input('id', id)
        .query('SELECT  * FROM [dbo].[ad_periodo] where idPeriodo=@id');

      if (result.recordset.length === 0) {
        return res.status(200).json({
          message: `Período con ID ${id} no encontrado`,
          data: null,
        });
      }

      return res.status(200).json({
        message: 'Período encontrado correctamente',
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
