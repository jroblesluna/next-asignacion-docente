import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../lib/db';

function getUniqueAcronyms(events: { NombreEvento: string }[]): string[] {
  const acronymMap: Record<string, string> = {
    vacaciones: 'VAC',
    'descanso médico': 'DM',
  };

  return Array.from(
    new Set(
      events.map((event) => {
        const normalizedEvent = event.NombreEvento.toLowerCase();

        if (normalizedEvent.includes('licencia')) {
          return 'LIC';
        }

        return acronymMap[normalizedEvent] || event.NombreEvento;
      })
    )
  );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    console.log('GET@/pages/api/teacher/getall.ts');
    let pool;

    try {
      pool = await connectToDatabase();

      const { periodo } = req.query;

      const result = await pool
        .request()
        .input('id', periodo)
        .query(
          `SELECT distinct NombreEvento  FROM [dbo].[disponibilidad_docente] where 
                    PeriodoAcademico =@id and NombreEvento is not null`
        );

      if (result.recordset.length == 0) {
        return res.status(200).json({
          data: [],
          message: 'No se encontraron Eventos de Indisponibilidad  para ese periodo',
        });
      }
      const resultEvents = result.recordset;

      const uniqueAcronyms = getUniqueAcronyms(resultEvents);

      return res.status(200).json({
        data: uniqueAcronyms,
        message: 'Eventos de Indisponibilidad  obtenidos exitosamente',
      });
    } catch (error) {
      console.error('Error en la API:', error);
      return res.status(500).json({ message: 'Error en la consulta', error });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
