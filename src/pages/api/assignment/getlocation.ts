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

      const result = await pool.request().input('id', idPeriod).query(`
               IF EXISTS (SELECT 1 FROM [dbo].[ad_frecuencia] WHERE periodo =  @id)
                BEGIN
               SELECT Distinct S.nombreSede as NombreSede FROM [dbo].[ad_programacionAcademica] AS PA 
            INNER JOIN [dbo].[ad_sede] as S ON S.idSede=PA.idSede  and S.periodo=@id
             where PA.idPeriodo =@id
                END
              ELSE
                BEGIN
                SELECT Distinct S.nombreSede as NombreSede  FROM [dbo].[ad_programacionAcademica] AS PA 
            INNER JOIN [dbo].[ad_sede] as S ON S.idSede=PA.idSede   and S.periodo=1
             where PA.idPeriodo =@id
              END      
             `);
      //AND S.periodo=@id VERIFICAR

      responseMessage = `Sedes del periodo ${idPeriod} encontrados `;
      responseData = result.recordset;

      return res.status(200).json({
        message: responseMessage,
        data: responseData,
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
