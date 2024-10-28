import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
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

      let responseMessage = '';
      let responseData: object[] | null = null;

      if (idVersion === '-1') {
        const result = await pool.request().input('id', idPeriod).query(`SELECT TOP 1 idVersion
                  FROM (SELECT DISTINCT idVersion FROM [dbo].[ad_programacionAcademica] WHERE idPeriodo = @id) 
                   AS DistinctVersions
                  ORDER BY idVersion DESC;`);

        const idLastVersion = result.recordset.length > 0 ? result.recordset[0].idVersion : 0;

        const resultLast = await pool
          .request()
          .input('id', idPeriod)
          .input('idVersion', idLastVersion).query(`
                 IF EXISTS (SELECT 1 FROM [dbo].[ad_frecuencia] WHERE periodo = @id)
                  BEGIN
                      SELECT PA.*, D.NombreCompletoProfesor, H.HorarioInicio, H.HorarioFin, F.NombreFrecuencia, 
                  A.identificadorFisico,D.idSede as idSedeAlojada ,D.NombreSede as nombreSedeAlojada,
                  C.codigoCurso, S.nombreSede 
                    FROM [dbo].[ad_programacionAcademica] AS PA  
                  LEFT JOIN ad_docente AS D ON PA.idDocente= D.idDocente AND D.periodo=@id
                  LEFT JOIN ad_aula AS A ON A.idAula= PA.idAula  AND A.periodo=@id
                  INNER JOIN ad_curso as C ON C.idCurso= PA.idCurso and C.periodo=@id
                  INNER JOIN ad_horario as H ON H.idHorario=PA.idHorario and H.periodo=@id
                  INNER JOIN ad_frecuencia as F ON F.idFrecuencia=PA.idFrecuencia and F.periodo=@id
                  INNER JOIN ad_sede as S ON S.idSede= PA.idSede and S.periodo=@id
                  where PA.idPeriodo=@id and PA.idVersion=@idVersion and  PA.vigente=1 and PA.cancelado=0 
                  END
                  ELSE
                  BEGIN
                      SELECT PA.*, D.NombreCompletoProfesor, H.HorarioInicio, H.HorarioFin, F.NombreFrecuencia, 
                  A.identificadorFisico,D.idSede as idSedeAlojada ,D.NombreSede as nombreSedeAlojada,
                  C.codigoCurso, S.nombreSede
                    FROM [dbo].[ad_programacionAcademica] AS PA  
                  LEFT JOIN ad_docente AS D ON PA.idDocente= D.idDocente AND D.periodo=1
                  LEFT JOIN ad_aula AS A ON A.idAula= PA.idAula  AND A.periodo=1
                  INNER JOIN ad_curso as C ON C.idCurso= PA.idCurso and C.periodo=1
                  INNER JOIN ad_horario as H ON H.idHorario=PA.idHorario and H.periodo=1
                  INNER JOIN ad_sede as S ON S.idSede= PA.idSede and S.periodo=1
                  INNER JOIN ad_frecuencia as F ON F.idFrecuencia=PA.idFrecuencia and F.periodo=1
                  where PA.idPeriodo=@id and PA.idVersion=@idVersion and  PA.vigente=1 and PA.cancelado=0  AND C.codigoCurso <>'PLEX'
                  END`);

        responseMessage = `Asignación docente del periodo ${idPeriod}, última versión encontrada correctamente`;
        responseData = resultLast.recordset;
      } else {
        const result = await pool.request().input('id', idPeriod).input('idVersion', idVersion)
          .query(`IF EXISTS (SELECT 1 FROM [dbo].[ad_frecuencia] WHERE periodo = @id)
                  BEGIN
                      SELECT PA.*, D.NombreCompletoProfesor, H.HorarioInicio, H.HorarioFin, F.NombreFrecuencia, 
                  A.identificadorFisico,D.idSede as idSedeAlojada ,D.NombreSede as nombreSedeAlojada,
                  C.codigoCurso, S.nombreSede
                    FROM [dbo].[ad_programacionAcademica] AS PA  
                  LEFT JOIN ad_docente AS D ON PA.idDocente= D.idDocente AND D.periodo=@id
                  LEFT JOIN ad_aula AS A ON A.idAula= PA.idAula  AND A.periodo=@id
                  INNER JOIN ad_curso as C ON C.idCurso= PA.idCurso and C.periodo=@id
                  INNER JOIN ad_horario as H ON H.idHorario=PA.idHorario and H.periodo=@id
                  INNER JOIN ad_frecuencia as F ON F.idFrecuencia=PA.idFrecuencia and F.periodo=@id
                  INNER JOIN ad_sede as S ON S.idSede= PA.idSede and S.periodo=@id
                  where PA.idPeriodo=@id and PA.idVersion=@idVersion and  PA.vigente=1 and PA.cancelado=0 
                  END
                  ELSE
                  BEGIN
                  SELECT PA.*, D.NombreCompletoProfesor, H.HorarioInicio, H.HorarioFin, F.NombreFrecuencia, 
                  A.identificadorFisico,D.idSede as idSedeAlojada ,D.NombreSede as nombreSedeAlojada,
                  C.codigoCurso, S.nombreSede
                    FROM [dbo].[ad_programacionAcademica] AS PA  
                  LEFT JOIN ad_docente AS D ON PA.idDocente= D.idDocente AND D.periodo=1
                  LEFT JOIN ad_aula AS A ON A.idAula= PA.idAula  AND A.periodo=1
                  INNER JOIN ad_curso as C ON C.idCurso= PA.idCurso and C.periodo=1
                  INNER JOIN ad_horario as H ON H.idHorario=PA.idHorario and H.periodo=1
                  INNER JOIN ad_sede as S ON S.idSede= PA.idSede and S.periodo=1
                  INNER JOIN ad_frecuencia as F ON F.idFrecuencia=PA.idFrecuencia and F.periodo=1
                  where PA.idPeriodo=@id and PA.idVersion=@idVersion and  PA.vigente=1 and PA.cancelado=0  AND C.codigoCurso<>'PLEX'
                  END`);

        responseMessage = `Asignación docente del periodo ${idPeriod} y la versión ${idVersion} encontrada correctamente`;
        responseData = result.recordset;
      }

      return res.status(200).json({
        message: responseMessage,
        data: responseData,
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
