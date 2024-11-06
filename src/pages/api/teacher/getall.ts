import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    console.log('GET@/pages/api/teacher/getall.ts');
    let pool;

    try {
      pool = await connectToDatabase();

      const { idPeriod } = req.query;
      const result = await pool.request().input('id', idPeriod).query(`WITH CTE_Docente AS (
                            SELECT  
                                D.*, 
                                TC.TipoJornada, 
                                ISNULL(DD.EstadoDisponible, 1) AS EstadoDisponible,
                                (CASE 
                                    WHEN EXISTS (SELECT 1 
                                                 FROM [dbo].[LibroPorDocente] 
                                                 WHERE [dbo].[LibroPorDocente].DocenteID = D.DocenteID) 
                                    THEN 1 
                                    ELSE 0 
                                 END) AS dictaClase
                            FROM 
                                [dbo].[dim_docente] AS D
                            INNER JOIN 
                                [dbo].[dim_tipo_contrato] AS TC ON D.TipoContratoID = TC.TipoContratoID
                            LEFT JOIN 
                                [dbo].[disponibilidad_docente] AS DD ON DD.DocenteID = D.DocenteID AND DD.PeriodoAcademico = @id
                            WHERE 
                                D.FlagVigente = 1
                        		AND D.FechaInicioContrato is not null
                        )
                        SELECT * 
                        FROM CTE_Docente
                        WHERE dictaClase = 1
                        ORDER BY FechaInicioContrato
                  `);

      return res.status(200).json({ data: result.recordset });
    } catch (error) {
      console.error('Error en la API:', error);
      return res.status(500).json({ message: 'Error en la consulta', error });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
