import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    console.log("GET@/pages/api/assignment/getall.ts");
    let pool;

    try {
      const { idPeriod = '123', idVersion = '456' } = req.query;

      if (!idPeriod || !idVersion) {
        return res.status(400).json({ message: 'Faltan campos en el query string', data: false });
      }

      pool = await connectToDatabase();
      
      let responseMessage = '';
      let responseData: object[] | null = null;

      if (idVersion) {
        const result = await pool.request()
          .input('id', idPeriod)
          .query(`SELECT TOP 1 idVersion
                  FROM Version
                  WHERE idPeriodo = @id
                  ORDER BY numeroVersion DESC`);
        
        const idLastVersion = result.recordset.length > 0 ? result.recordset[0].idVersion : 1;

        const resultLast = await pool.request()
          .input('id', idPeriod)
          .input('idVersion', idLastVersion)
          .query(`SELECT * 
                  FROM AsignacionDocente
                  WHERE idPeriodo = @id and idVersion = @idVersion`);

        responseMessage = `Asignación docente del periodo ${idPeriod}, última versión encontrada correctamente`;
        responseData = resultLast.recordset;
      } else {
        const result = await pool.request()
          .input('id', idPeriod)
          .input('idVersion', idVersion)
          .query(`SELECT * 
                  FROM AsignacionDocente
                  WHERE idPeriodo = @id and idVersion = @idVersion`);

        responseMessage = `Asignación docente del periodo ${idPeriod} y la versión ${idVersion} encontrada correctamente`;
        responseData = result.recordset;
      }

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
