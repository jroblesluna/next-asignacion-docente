import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PATCH') {
    console.log("PATCH@/pages/api/event/execute.ts");
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Faltan campos en el body', data: false });
    }

    let pool;

    try {
      pool = await connectToDatabase();

      const result = await pool
        .request()
        .input('id', id)
        .query(
          `UPDATE Evento SET estado = 'EJECUTADO' WHERE idPeriodo = @id AND estado = 'NO INICIADO'`
        );

      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({
          message: `No se encontraron eventos para el período ${id} que estén en estado 'NO INICIADO'`,
          data: false,
        });
      }

      return res.status(200).json({
        message: `Los eventos del período ${id} se han ejecutado correctamente`,
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
