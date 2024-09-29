import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/db'; // Ajusta la ruta si es necesario

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { id } = req.query;

    // Validación de la presencia del ID en la query
    if (!id) {
      return res.status(400).json({ message: 'ID de periodo académico no proporcionado' });
    }

    let pool; // Declaración del pool fuera del try para cerrar la conexión en finally

    try {
      pool = await connectToDatabase();

      // Consulta a la base de datos
      const result = await pool.request().query('SELECT * FROM test');

      return res.status(200).json({
        message: `Eventos del periodo ${id} encontrados correctamente`,
        data: result.recordset,
      });

    } catch (error) {
      console.error('Error en la API:', error);
      return res.status(500).json({ message: 'Error en la consulta', error });

    } finally {
      // Cerrar la conexión al pool en caso de éxito o error
      if (pool) {
        pool.close();
      }
    }
  } else {
    // Manejar el caso de método no permitido
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
