import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    console.log('GET@/pages/api/version/getall/[id].ts');
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        message: 'ID del periodo académico no proporcionado',
        data: false,
      });
    }

    let pool;
    try {
      pool = await connectToDatabase();

      const resultCheck = await pool.request().input('id', id).query(`
              IF EXISTS (SELECT 1 FROM [dbo].[ad_version] WHERE idPeriodo = @id)
                BEGIN
                SELECT nombreCreador, Format(fechaCreacion,'yyyy-MM-dd') as fecha,idVersion FROM [dbo].[ad_version] where idPeriodo=@id 
                order by  idVersion desc
                END
              ELSE
                BEGIN
                  SELECT
                  'system' AS nombreCreador, 
                  (SELECT   top 1 FORMAT(CONVERT(DATETIME, tiempoModificado), 'yyyy-MM-dd')  FROM [dbo].[ad_frecuencia] 
                  where periodo=1) AS fecha,
                  0 AS idVersion
              END  `);

      return res.status(200).json({
        message: 'Versión encontrada correctamente',
        data: resultCheck.recordset,
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
