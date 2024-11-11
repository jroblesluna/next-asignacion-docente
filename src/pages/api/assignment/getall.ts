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
          SELECT PA.*, D.NombreCompletoProfesor, H.HorarioInicio, H.HorarioFin, F.NombreFrecuencia, 
          F.NombreAgrupFrecuencia, 
            A.identificadorFisico, D.idSede AS idSedeAlojada, D.NombreSede AS nombreSedeAlojada,
            C.codigoCurso, S.nombreSede
          FROM [dbo].[ad_programacionAcademica] AS PA  
          LEFT JOIN ad_docente AS D ON PA.idDocente = D.idDocente AND D.periodo = @id
          LEFT JOIN ad_aula AS A ON A.idAula = PA.idAula AND A.periodo = @id
          INNER JOIN ad_curso AS C ON C.idCurso = PA.idCurso AND C.periodo = @id
          INNER JOIN ad_horario AS H ON H.idHorario = PA.idHorario AND H.periodo = @id
          INNER JOIN ad_frecuencia AS F ON F.idFrecuencia = PA.idFrecuencia AND F.periodo = @id
          INNER JOIN ad_sede AS S ON S.idSede = PA.idSede AND S.periodo = @id
          WHERE PA.idPeriodo = @id AND PA.idVersion = @idVersion AND PA.vigente = 1 AND PA.cancelado = 0
        END
        ELSE
        BEGIN
          SELECT PA.*, D.NombreCompletoProfesor, H.HorarioInicio, H.HorarioFin, F.NombreFrecuencia,
          F.NombreAgrupFrecuencia, 
            A.identificadorFisico, D.idSede AS idSedeAlojada, D.NombreSede AS nombreSedeAlojada,
            C.codigoCurso, S.nombreSede 
          FROM [dbo].[ad_programacionAcademica] AS PA  
          LEFT JOIN ad_docente AS D ON PA.idDocente = D.idDocente AND D.periodo = 1
          LEFT JOIN ad_aula AS A ON A.idAula = PA.idAula AND A.periodo = 1
          INNER JOIN ad_curso AS C ON C.idCurso = PA.idCurso AND C.periodo = 1
          INNER JOIN ad_horario AS H ON H.idHorario = PA.idHorario AND H.periodo = 1
          INNER JOIN ad_frecuencia AS F ON F.idFrecuencia = PA.idFrecuencia AND F.periodo = 1
          INNER JOIN ad_sede AS S ON S.idSede = PA.idSede AND S.periodo = 1
          WHERE PA.idPeriodo = @id AND PA.idVersion = @idVersion AND PA.vigente = 1 AND PA.cancelado = 0 
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
