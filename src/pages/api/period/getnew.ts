import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    console.log('GET@/pages/api/period/getall.ts');

    let pool;

    try {
      pool = await connectToDatabase();

      // verificar si hay un periodo abierto

      const resultVerificar = await pool
        .request()
        .query(
          `SELECT top 1  * FROM [dbo].[ad_periodo] where estado = 'ACTIVO' OR estado = 'CARGANDO'`
        );

      console.log(resultVerificar.recordset);
      if (resultVerificar.recordset.length !== 0) {
        return res.status(200).json({
          message:
            'Períodos ACTIVOS O CARGANDO encontrados correctamente, NO SE PUEDE ABRIR OTRO NUEVO',
          data: null,
        });
      }

      const result = await pool
        .request()
        .query(`SELECT top 1  * FROM [dbo].[ad_periodo] where estado = 'NO ACTIVO' `);

      return res.status(200).json({
        message: 'Períodos encontrados correctamente',
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
