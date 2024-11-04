import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PATCH') {
    console.log('PATCH@/pages/api/assignment/update-rows.ts');
    let pool;

    try {
      const { idPeriodo, idVersion, uuidFila, idDocente } = req.body;

      if (!idPeriodo || !idVersion || !uuidFila || !idDocente) {
        return res.status(400).json({ message: 'Faltan campos en el body', data: false });
      }

      pool = await connectToDatabase();

      if (idDocente === '-1') {
        await pool
          .request()
          .input('id', idPeriodo)
          .input('idVersion', idVersion)
          .input('uuidFila', uuidFila)
          .input('idDocente', idDocente).query(`
        UPDATE [dbo].[ad_programacionAcademica] 
        SET docenteModificado = 0, idDocente = NULL
        WHERE idPeriodo = @id 
        AND uuuidProgramacionAcademica = @uuidFila 
        AND idVersion = @idVersion
    `);
      } else {
        await pool
          .request()
          .input('id', idPeriodo)
          .input('idVersion', idVersion)
          .input('uuidFila', uuidFila)
          .input('idDocente', idDocente).query(`
        UPDATE [dbo].[ad_programacionAcademica] 
        SET docenteModificado = 1, idDocente = @idDocente
        WHERE idPeriodo = @id 
        AND uuuidProgramacionAcademica = @uuidFila 
        AND idVersion = @idVersion
    `);
      }

      return res.status(200).json({
        message: `Campos de asignación docente para el periodo ${idPeriodo} actualizados correctamente`,
        data: true,
      });
    } catch (error) {
      console.error('Error en la API:', error);
      return res.status(500).json({ message: 'Error en la consulta', error });
    }
  } else {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
