import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    console.log("POST@/pages/api/period/create.ts");
    
    let pool;
    
    try {
      const { id } = req.body;

      // Verificar si el campo id está presente en el cuerpo de la solicitud
      if (!id) {
        return res.status(400).json({ message: 'Faltan campos en el body', data: false });
      }

      pool = await connectToDatabase();

      // Verifica si el periodo existe
      const checkResult = await pool
        .request()
        .input('id', id)
        .query('SELECT estado FROM Periodo WHERE idPeriodo = @id');

      // Verificamos si checkResult tiene registros
      if (checkResult.recordset.length === 0) {
        return res.status(404).json({ message: 'Período académico no encontrado', data: false });
      }

      // Verifica su estado
      const currentStatus = checkResult.recordset[0].estado;

      if (currentStatus !== 'NO ACTIVO') {
        return res.status(400).json({
          message: `El período académico ${id} ya ha sido activado con anterioridad`,
          data: false,
        });
      }

      // Actualiza el estado del periodo a 'CARGANDO'
      await pool
        .request()
        .input('id', id)
        .query(`UPDATE Periodo SET estado = 'CARGANDO' WHERE idPeriodo = @id`);

      // Mandar la ejecución de la asignación docente para esos cursos, cuando se complete, actualiza el estado
      return res.status(200).json({
        message: 'Período creado correctamente',
        data: true,
      });

    } catch (error) {
      console.error('Error en la API:', error);
      return res.status(500).json({ message: 'Error en la consulta', error });
      
    } finally {
      // Asegura que el pool de la base de datos se cierre en caso de error o éxito
      if (pool) {
        pool.close();
      }
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
