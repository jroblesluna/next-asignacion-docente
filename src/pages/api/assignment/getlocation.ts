import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    console.log('GET@/pages/api/assignment/getall.ts');
    let pool;

    try {
      const { idPeriod } = req.query;

      if (!idPeriod) {
        return res
          .status(400)
          .json({ message: 'Faltan campos en el query string', data: false });
      }

      pool = await connectToDatabase();

      let responseMessage = '';
      let responseData: object[] | null = null;

      const result = await pool.request().input('id', idPeriod)
        .query(`SELECT Distinct S.nombreSede FROM [dbo].[ad_programacionAcademica] AS PA 
            INNER JOIN [dbo].[ad_sede] as S ON S.idSede=PA.idSede AND S.periodo=@id and s.nombreSede <> 'VECOR'
             where PA.idPeriodo =@id `);

      responseMessage = `Sedes del periodo ${idPeriod} encontrados `;
      responseData = result.recordset;

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
