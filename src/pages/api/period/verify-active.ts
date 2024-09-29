import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../lib/db'; // Ajusta la ruta si es necesario

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    console.log("GET@/pages/api/period/verify-active.ts");
    let pool;

    try {
      pool = await connectToDatabase();

      const resultCargando = await pool
        .request()
        .query(`SELECT * FROM Periodo WHERE estado = 'CARGANDO'`);

      if (resultCargando.recordset.length > 0) {
        return res.status(200).json({
          message: 'Período académico procesándose encontrado',
          data: {
            response: true,
            estado: 'CARGANDO',
          },
        });
      }

      const resultActivo = await pool
        .request()
        .query(`SELECT * FROM Periodo WHERE estado = 'ACTIVO'`);

      if (resultActivo.recordset.length > 0) {
        return res.status(200).json({
          message: 'Período académico ACTIVO encontrado',
          data: {
            response: true,
            estado: 'ACTIVO',
          },
        });
      }

      return res.status(200).json({
        message: 'No hay períodos activos ni cargando',
        data: {
          response: true,
          estado: 'NONE',
        },
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
