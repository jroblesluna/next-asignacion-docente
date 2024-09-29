import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PATCH') {
    console.log("PATCH@/pages/api/assignment/update-rows.ts");
    let pool;

    try {
      const { id, data } = req.body;

      if (!id || !data) {
        return res.status(400).json({ message: 'Faltan campos en el body', data: false });
      }

      pool = await connectToDatabase();

      const checkResult = await pool
        .request()
        .input('id', id)
        .query('SELECT * FROM Periodo WHERE idPeriodo = @id');

      if (checkResult.recordset.length === 0) {
        return res.status(404).json({ message: 'Período académico no encontrado', data: false });
      }

      for (const row of data) {
        await pool
          .request()
          .input('idAula', row.idAula)
          .input('idDocente', row.idDocente)
          .input('idVersion', row.idVersion)
          .input('id', id)
          .query(
            'UPDATE AsignacionDocente SET idAula = @idAula, idDocente = @idDocente WHERE idPeriodo = @id AND idVersion = @idVersion'
          );
      }

      return res.status(200).json({
        message: `Campos de asignación docente para el periodo ${id} actualizados correctamente`,
        data: true,
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
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
