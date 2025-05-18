import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from './lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    console.log('GET@/pages/api/getSyncData.ts');
    let pool;
    try {
      pool = await connectToDatabase();

      const result = await pool.request().query(
        `   DECLARE @LastVersion INT;
            
            SELECT @LastVersion = MAX(idVersion)
            FROM [dbo].[ad_programacionAcademica]
            WHERE idPeriodo = (SELECT TOP 1 periodo FROM [dbo].[ad_asignacion_output]);
            
            
            SELECT 
                AO.periodo,
                AO.uididprograma,
                FORMAT( AO.fechaejecucion, 'dd-MM-yyyy') AS fecha,
                FORMAT( AO.fechaejecucion, 'HH:mm:ss') AS hora,
                AO.usuarioEjecutado,
                AO.estado,
                AO.detestado,
                D.NombreCompletoProfesor,
                D.NombreSede as NombreSedeProfesor,
                A.identificadorFisico,
                A.capacidad as CapacidadAula,
                C.codigoCurso,
                H.HorarioInicio,
                H.HorarioFin,
                F.NombreAgrupFrecuencia,
                S.nombreSede
            FROM 
                [dbo].[ad_asignacion_output] AO
            LEFT JOIN ad_docente AS D 
                ON AO.uididprofesor = D.uuidDocente AND D.periodo = AO.periodo
            LEFT JOIN ad_aula AS A 
                ON A.uidIdAula = AO.uididaula AND A.periodo = AO.periodo
            INNER JOIN ad_curso AS C 
                ON C.uidIdCurso = AO.uididcurso AND C.periodo = AO.periodo
            INNER JOIN ad_horario AS H 
                ON H.uidIdHorario = AO.uididhorario AND H.periodo = AO.periodo
            INNER JOIN ad_frecuencia AS F 
                ON F.uidIdFrecuencia = AO.uididfrecuencia AND F.periodo = AO.periodo
            INNER JOIN [dbo].[ad_programacionAcademica] AS PA 
                ON AO.uididprograma = PA.uuuidProgramacionAcademica 
                AND PA.idPeriodo = AO.periodo	 
                AND PA.idVersion = @LastVersion
            INNER JOIN ad_sede AS S 
                ON S.idSede = PA.idSede AND S.periodo = AO.periodo
            ORDER BY AO.Estado ASC ;
`
      );

      if (result.recordset.length === 0) {
        return res.status(200).json({
          message: 'No se encontraron datos de sincronización',
          data: [],
        });
      }

      return res.status(200).json({
        message: 'Data de sincronización obtenida correctamente',
        data: result.recordset,
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
