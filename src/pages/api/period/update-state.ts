import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PATCH') {
    console.log('PATCH@/pages/api/period/update-state.ts');

    let pool;

    try {
      const { id, estado } = req.body;

      if (!id || !estado) {
        return res.status(400).json({ message: 'Faltan campos en el body', data: false });
      }

      if (
        estado !== 'ACTIVO' &&
        estado !== 'CARGANDO' &&
        estado !== 'NO ACTIVO' &&
        estado !== 'CERRADO'
      ) {
        return res.status(400).json({ message: 'Tipo de estado no válido', data: false });
      }

      pool = await connectToDatabase();

      // Verificar si el periodo existe
      const checkResult = await pool
        .request()
        .input('id', id)
        .query('SELECT estado FROM ad_periodo WHERE idPeriodo = @id');

      if (checkResult.recordset.length === 0) {
        return res
          .status(200)
          .json({ message: 'Período académico no encontrado', data: false });
      }
      // no puedo cerrarlo mientras esta cargando

      if (checkResult.recordset[0].estado == 'CARGANDO' && estado == 'CERRADO') {
        return res.status(200).json({
          message: 'No se puede cerrar el periodo Academico si su estado es cargando',
          data: false,
        });
      }

      if (estado == 'CERRADO') {
        console.log('BORRAR LAS VERSIONES ');
        await pool
          .request()
          .input('id', id)
          .query(
            ` DELETE ad_programacionAcademica WHERE idPeriodo = @id 
         and idVersion <> (SELECT Max(idVersion) as Lastversion FROM [dbo].[ad_programacionAcademica] where idPeriodo =@id)`
          );
      }

      // Actualizar el estado del periodo
      await pool
        .request()
        .input('id', id)
        .input('estado', estado)
        .query('UPDATE ad_periodo SET estado = @estado WHERE idPeriodo = @id');

      return res.status(200).json({
        message: `Estado del periodo ${id} actualizado correctamente`,
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
