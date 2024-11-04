import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    console.log('POST@/pages/api/version/create.ts');
    try {
      const { id, creator } = req.body;

      if (!id || !creator) {
        return res.status(400).json({ message: 'Faltan campos en el body', data: false });
      }

      const pool = await connectToDatabase();

      const checkResult = await pool
        .request()
        .input('id', id)
        .query('SELECT * FROM Periodo WHERE idPeriodo = @id');

      if (checkResult.recordset.length === 0) {
        return res
          .status(404)
          .json({ message: 'Período académico no encontrado', data: false });
      }

      const currentStatus = checkResult.recordset[0].estado;

      if (currentStatus !== 'ACTIVO') {
        return res.status(400).json({
          message: `El período académico ${id} no se encuentra disponible.`,
          data: false,
        });
      }

      const versionResult = await pool
        .request()
        .input('id', id)
        .query(
          'SELECT ISNULL(MAX(numeroVersion), 0) + 1 AS nextVersion FROM Version WHERE idPeriodo = @id'
        );

      const nextVersion = versionResult.recordset[0].nextVersion;

      await pool
        .request()
        .input('id', id)
        .input('numeroVersion', nextVersion)
        .input('nombreCreador', creator).query(`
          INSERT INTO Version (idPeriodo, numeroVersion, nombreCreador)
          VALUES (@id, @numeroVersion, @nombreCreador)
        `);

      return res.status(201).json({
        message: 'Versión creada correctamente',
        data: true,
      });
    } catch (error) {
      console.error('Error en la API:', error);
      return res.status(500).json({ message: 'Error en la consulta', error });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
