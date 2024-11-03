import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/db'; // Ajusta la ruta si es necesario

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { id } = req.query;

    // Validación de la presencia del ID en la query
    if (!id) {
      return res.status(400).json({ message: 'ID de periodo académico no proporcionado' });
    }

    let pool;

    try {
      pool = await connectToDatabase();

      // Consulta a la base de datos
      const result = await pool.request().input('id', id).query(`
                SELECT  FORMAT(fechaCambio, 'dd-MM-yyyy') AS "date",
       FORMAT(fechaCambio, 'HH:mm') AS "time",descripcion as description,tipoEvento as name,estado FROM  ad_evento WHERE periodo=@id`);

      return res.status(200).json({
        message: `Eventos del periodo ${id} encontrados correctamente`,
        data: result.recordset,
      });
    } catch (error) {
      console.error('Error en la API:', error);
      return res.status(500).json({ message: 'Error en la consulta', error });
    }
  } else {
    // Manejar el caso de método no permitido
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
