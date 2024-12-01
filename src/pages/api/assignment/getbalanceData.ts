import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  console.log('GET@/pages/api/assignment/getall.ts');
  let pool;

  try {
    const { idPeriod } = req.query;

    if (!idPeriod) {
      return res
        .status(400)
        .json({ message: 'Faltan campos en el query string', data: false });
    }

    pool = await connectToDatabase();

    const result = await pool.request().input('id', idPeriod).query(`
        SELECT TOP 1 idVersion
        FROM (SELECT DISTINCT idVersion FROM [dbo].[ad_programacionAcademica] WHERE idPeriodo = @id) AS DistinctVersions
        ORDER BY idVersion DESC;
      `);

    const selectedVersion = result.recordset.length > 0 ? result.recordset[0].idVersion : '0';

    const resultData = await pool
      .request()
      .input('id', idPeriod)
      .input('idVersion', selectedVersion).query(`
        IF EXISTS (SELECT 1 FROM [dbo].[ad_frecuencia] WHERE periodo = @id)
        BEGIN
          SELECT  D.idDocente, H.HorarioInicio, H.HorarioFin, F.NombreFrecuencia,  F.NombreAgrupFrecuencia,
           D.idSede AS idSedeAlojada, D.NombreSede AS nombreSedeAlojada,
           S.nombreSede , (H.MinutosReal * aux.NumDias) as minutosCurso  , (H.MinutosReal  * aux.NumDias)/(27*60.0) as carga
          FROM [dbo].[ad_programacionAcademica] AS PA  
          LEFT JOIN ad_docente AS D ON PA.idDocente = D.idDocente AND D.periodo = @id
          INNER JOIN ad_horario AS H ON H.idHorario = PA.idHorario AND H.periodo = @id
          INNER JOIN ad_frecuencia AS F ON F.idFrecuencia = PA.idFrecuencia AND F.periodo = @id
          INNER JOIN ad_sede AS S ON S.idSede = PA.idSede AND S.periodo = @id
          LEFT JOIN [dbo].[ad_curso] as C
             ON C.idCurso= PA.idCurso AND C.periodo=@id
		 OUTER APPLY ( SELECT CASE WHEN C.DuracionClase = 1 THEN 
              (SELECT SUM(aux.NumDias) FROM [dbo].[aux_intensidad_fase] AS aux
               WHERE PA.uidIdIntensidadFase = aux.uididintensidadfase AND PA.idPeriodo = aux.PeriodoAcademico) 
               ELSE 
               (SELECT TOP 1 aux.NumDias FROM [dbo].[aux_intensidad_fase] AS aux WHERE PA.uidIdIntensidadFase = aux.uididintensidadfase 
              	AND PA.idPeriodo = aux.Periodo)  
                END AS NumDias 
                ) AS aux 
          WHERE PA.idPeriodo = @id AND PA.idVersion = @idVersion AND PA.vigente = 1 AND PA.cancelado = 0 
          and S.nombreSede <> 'VECOR'
		  ORDER BY F.NombreFrecuencia ,H.HorarioInicio
        END
        ELSE
        BEGIN
         SELECT  D.idDocente, H.HorarioInicio, H.HorarioFin, F.NombreFrecuencia,   F.NombreAgrupFrecuencia,
           D.idSede AS idSedeAlojada, D.NombreSede AS nombreSedeAlojada,
           S.nombreSede , (H.MinutosReal  * aux.NumDias) as minutosCurso  , (H.MinutosReal  * aux.NumDias)/(27*60.0) as carga
          FROM [dbo].[ad_programacionAcademica] AS PA  
          LEFT JOIN ad_docente AS D ON PA.idDocente = D.idDocente AND D.periodo = 1
          INNER JOIN ad_horario AS H ON H.idHorario = PA.idHorario AND H.periodo = 1
          INNER JOIN ad_frecuencia AS F ON F.idFrecuencia = PA.idFrecuencia AND F.periodo = 1
          INNER JOIN ad_sede AS S ON S.idSede = PA.idSede AND S.periodo = 1
          LEFT JOIN [dbo].[ad_curso] as C
             ON C.idCurso= PA.idCurso AND C.periodo=1
		   OUTER APPLY ( SELECT CASE WHEN C.DuracionClase = 1 THEN 
              (SELECT SUM(aux.NumDias) FROM [dbo].[aux_intensidad_fase] AS aux
               WHERE PA.uidIdIntensidadFase = aux.uididintensidadfase AND PA.idPeriodo = aux.PeriodoAcademico) 
               ELSE 
               (SELECT TOP 1 aux.NumDias FROM [dbo].[aux_intensidad_fase] AS aux WHERE PA.uidIdIntensidadFase = aux.uididintensidadfase 
              	AND PA.idPeriodo = aux.Periodo)  
                END AS NumDias 
                ) AS aux 
          WHERE PA.idPeriodo = @id AND PA.idVersion = @idVersion AND PA.vigente = 1 
          AND PA.cancelado = 0  and S.nombreSede <> 'VECOR'
		  ORDER BY  F.NombreFrecuencia ,H.HorarioInicio
        END
      `);

    const responseMessage =
      'data de balance  del periodo ${idPeriod}, última versión encontrada correctamente';

    return res.status(200).json({
      message: responseMessage,
      data: resultData.recordset,
    });
  } catch (error) {
    console.error('Error en la API:', error);
    return res.status(500).json({ message: 'Error en la consulta', error });
  }
}
