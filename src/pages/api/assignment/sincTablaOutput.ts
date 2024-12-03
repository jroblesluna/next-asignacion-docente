import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../lib/db';
import sql from 'mssql';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    let pool;

    try {
      pool = await connectToDatabase();
      const { idPeriodo, correo } = req.query;

      const result = await pool
        .request()
        .input('id', idPeriodo)
        .query(`select * from [dbo].[ad_periodo] where idPeriodo=@id`);

      const periodoData = result.recordset[0];
      if (periodoData.estado != 'ACTIVO') {
        return res.status(200).json({
          message:
            'No se pudo sincronizar  la asignación para el periodo ' +
            periodoData.idPeriodo +
            ' por que su estado es: ' +
            periodoData.estado,
          data: false,
        });
      }

      // await pool
      //   .request()
      //   .input('id', idPeriodo)
      //   .input('estado', 'CARGANDO')
      //   .query('UPDATE ad_periodo SET estado = @estado WHERE idPeriodo = @id');

      await pool
        .request()
        .input('periodo', sql.Int, idPeriodo)
        .input('user', sql.VarChar, correo)
        .execute('ad_actualizarTablaOuput');

      // await pool
      //   .request()
      //   .input('id', idPeriodo)
      //   .input('estado', 'ACTIVO')
      //   .query('UPDATE ad_periodo SET estado = @estado WHERE idPeriodo = @id');

      return res.status(200).json({
        message: `TEST EVENTOS RETURN`,
        data: 'Se ha sincronizado exitosamente',
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
