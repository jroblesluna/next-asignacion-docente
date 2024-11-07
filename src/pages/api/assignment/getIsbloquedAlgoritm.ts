import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    console.log('GET@/pages/api/assignment/getIsbloquedAlgoritm.ts');
    let pool;

    try {
      pool = await connectToDatabase();

      const resultState1 = await pool
        .request()
        .query(`select * from [dbo].[ad_avanceAlgoritmo] where idSede is not null `);

      const responseData1 = !resultState1.recordset[0] ? [] : resultState1.recordset[0];

      if (responseData1.length === 0) {
        return res.status(200).json({
          message: 'No hay ningún script en ejecución',
          data: false,
        });
      }
      setTimeout(async () => {
        try {
          pool = await connectToDatabase();
          const resultState2 = await pool
            .request()
            .query(`SELECT * FROM [dbo].[ad_avanceAlgoritmo] WHERE idSede IS NOT NULL`);

          const responseData2 = !resultState2.recordset[0] ? [] : resultState2.recordset[0];

          if (responseData2.length === 0) {
            return res.status(200).json({
              message: 'El script finalizó la ejecución',
              data: false,
            });
          }

          if (responseData2.idSlot !== responseData1.idSlot) {
            return res.status(200).json({
              message: 'El script sigue en ejecución sin problemas',
              data: false,
            });
          }

          return res.status(200).json({
            message: 'El script se ha detenido por alguna razón- enviando datos ',
            data: responseData2,
          });
        } catch (error) {
          return res.status(500).json({
            message: 'Ocurrió un error durante la ejecución',
            error: error,
          });
        }
      }, 120000);
    } catch (error) {
      console.error('Error en la API:', error);
      return res.status(500).json({ message: 'Error en la consulta', error });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
