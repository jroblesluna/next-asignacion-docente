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
    const { idPeriod, idVersion } = req.query;

    if (!idPeriod || !idVersion) {
      return res
        .status(400)
        .json({ message: 'Faltan campos en el query string', data: false });
    }

    pool = await connectToDatabase();

    let selectedVersion = idVersion;
    if (idVersion === '-1') {
      const result = await pool.request().input('id', idPeriod).query(`
        SELECT TOP 1 idVersion
        FROM (SELECT DISTINCT idVersion FROM [dbo].[ad_programacionAcademica] WHERE idPeriodo = @id) AS DistinctVersions
        ORDER BY idVersion DESC;
      `);
      selectedVersion = result.recordset.length > 0 ? result.recordset[0].idVersion : '0';
    }

    const resultData = await pool
      .request()
      .input('id', idPeriod)
      .input('idVersion', selectedVersion).query(`
        IF EXISTS (SELECT 1 FROM [dbo].[ad_frecuencia] WHERE periodo = @id)
        BEGIN
                      SELECT  D.uuidDocente,D.NombreCompletoProfesor, D.NombreSede,  TC.TipoJornada , PA.* ,
             H.HorarioInicio, H.HorarioFin ,F.NombreFrecuencia, F.NombreAgrupFrecuencia, C.codigoCurso
            FROM [dbo].[ad_docente] AS D 
            LEFT JOIN [dbo].[ad_programacionAcademica] AS PA  
            ON D.idDocente =PA.idDocente AND PA.idPeriodo=@id AND PA.idVersion=@idVersion
            INNER JOIN [dbo].[dim_tipo_contrato] AS TC     
            ON  D.idTipoContrato =TC.TipoContratoID
            LEFT JOIN [dbo].[ad_horario]as H
             ON H.idHorario= PA.idHorario AND H.periodo=@id
            LEFT JOIN [dbo].[ad_frecuencia] as F
             ON F.idFrecuencia= PA.idFrecuencia AND F.periodo=@id
            LEFT JOIN [dbo].[ad_curso] as C
             ON C.idCurso= PA.idCurso AND C.periodo=@id
            WHERE D.periodo=@id and D.vigente =1 AND D.FechaInicioContrato IS NOT NULL  AND D.dictaClase=1 
            ORDER BY FechaInicioContrato 
        END
        ELSE
        BEGIN
                      SELECT D.uuidDocente, D.NombreCompletoProfesor, D.NombreSede,  TC.TipoJornada , PA.* ,
                     H.HorarioInicio, H.HorarioFin ,F.NombreFrecuencia, F.NombreAgrupFrecuencia, C.codigoCurso
                    FROM [dbo].[ad_docente] AS D 
                    LEFT JOIN [dbo].[ad_programacionAcademica] AS PA  
                    ON D.idDocente =PA.idDocente AND PA.idPeriodo=@id AND PA.idVersion=@idVersion
                    INNER JOIN [dbo].[dim_tipo_contrato] AS TC     
                    ON  D.idTipoContrato =TC.TipoContratoID
                    LEFT JOIN [dbo].[ad_horario]as H
                     ON H.idHorario= PA.idHorario AND H.periodo=1
                    LEFT JOIN [dbo].[ad_frecuencia] as F
                     ON F.idFrecuencia= PA.idFrecuencia AND F.periodo=1
                    LEFT JOIN [dbo].[ad_curso] as C
                     ON C.idCurso= PA.idCurso AND C.periodo=1
                    WHERE D.periodo=1 and D.vigente =1 AND FechaInicioContrato IS NOT NULL AND D.dictaClase=1 
                    ORDER BY FechaInicioContrato 
        END
      `);

    const responseMessage =
      idVersion === '-1'
        ? `Asignación docente del periodo ${idPeriod}, última versión encontrada correctamente`
        : `Asignación docente del periodo ${idPeriod} y la versión ${idVersion} encontrada correctamente`;

    return res.status(200).json({
      message: responseMessage,
      data: resultData.recordset,
    });
  } catch (error) {
    console.error('Error en la API:', error);
    return res.status(500).json({ message: 'Error en la consulta', error });
  }
}
