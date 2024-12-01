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
        IF EXISTS (SELECT 1 FROM [dbo].[ad_sede] WHERE periodo = @id)
                    BEGIN
                    	select idSede from [dbo].[ad_sede] WHERE periodo = @id and uidIdSede='28894d3f-e9e1-476c-9314-764dc0bcd003'
                    END
                    ELSE
                    BEGIN
                    	select idSede from [dbo].[ad_sede] WHERE periodo = 1 and uidIdSede='28894d3f-e9e1-476c-9314-764dc0bcd003'
                    END
      `);
    const idSedeVirtual = result.recordset[0].idSede;

    const resultData = await pool
      .request()
      .input('id', idPeriod)
      .input('idVirtual', idSedeVirtual).query(`
        IF EXISTS (SELECT 1 FROM [dbo].[ad_frecuencia] WHERE periodo = @id)
        BEGIN
          SELECT
            S.idSede,
            S.NombreSede,
            SUM(CASE WHEN TC.TipoJornada = 'FT' THEN 1 ELSE 0 END) AS FT,
            SUM(CASE WHEN TC.TipoJornada = 'PT' THEN 1 ELSE 0 END)  AS PT,
            ROUND((((SUM(CASE WHEN TC.TipoJornada = 'PT' THEN 1 ELSE 0 END) / 3.0) +
            SUM(CASE WHEN TC.TipoJornada = 'FT' THEN 1 ELSE 0 END)) /
            (((SELECT COUNT(TC2.TipoJornada)
            	FROM [dbo].[ad_docente] AS D2
            	INNER JOIN [dbo].[dim_tipo_contrato] AS TC2 ON D2.idTipoContrato = TC2.TipoContratoID
            WHERE TC2.TipoJornada = 'PT' AND  D2.idSede IS NOT NULL AND  D2.vigente IS NOT NULL AND
            	D2.vigente = 1 AND  D2.periodo=@id
            	AND  D2.idSede <> @idVirtual AND D2.dictaClase=1  ) / 3.0) +
            (SELECT COUNT(TC2.TipoJornada)
            	FROM [dbo].[ad_docente] AS D2
            	INNER JOIN [dbo].[dim_tipo_contrato] AS TC2 ON D2.idTipoContrato = TC2.TipoContratoID
            WHERE  TC2.TipoJornada = 'FT' AND  D2.idSede IS NOT NULL AND  D2.vigente IS NOT NULL AND
            	D2.vigente = 1 
            	AND  D2.idSede <> @idVirtual and  D2.periodo=@id  AND D2.dictaClase=1  )))*100 ,3)
            AS Ratio
            FROM
            	[dbo].[ad_docente] AS D 
            	INNER JOIN
            	[dbo].[dim_tipo_contrato] AS TC ON D.idTipoContrato = TC.TipoContratoID
            	INNER JOIN
            	[dbo].[ad_sede] AS S ON D.idSede = S.idSede and S.periodo=@id
            WHERE
            	D.idSede IS NOT NULL AND  D.vigente IS NOT NULL AND  D.vigente = 1
            	AND  D.idSede <> @idVirtual
            	and  D.periodo=@id
              AND D.dictaClase=1 
              AND S.vigente=1
            GROUP BY
            	S.idSede,
            	S.NombreSede
        END
        ELSE
        BEGIN
         SELECT
            S.idSede,
            S.NombreSede,
            SUM(CASE WHEN TC.TipoJornada = 'FT' THEN 1 ELSE 0 END) AS FT,
            SUM(CASE WHEN TC.TipoJornada = 'PT' THEN 1 ELSE 0 END)  AS PT,
            ROUND((((SUM(CASE WHEN TC.TipoJornada = 'PT' THEN 1 ELSE 0 END) / 3.0) +
            SUM(CASE WHEN TC.TipoJornada = 'FT' THEN 1 ELSE 0 END)) /
            (((SELECT COUNT(TC2.TipoJornada)
            	FROM [dbo].[ad_docente] AS D2
            	INNER JOIN [dbo].[dim_tipo_contrato] AS TC2 ON D2.idTipoContrato = TC2.TipoContratoID
            WHERE TC2.TipoJornada = 'PT' AND  D2.idSede IS NOT NULL AND  D2.vigente IS NOT NULL AND
            	D2.vigente = 1 AND D2.periodo=1
            	AND  D2.idSede <> @idVirtual  AND D2.dictaClase=1 ) / 3.0) +
            (SELECT COUNT(TC2.TipoJornada)
            	FROM [dbo].[ad_docente] AS D2
            	INNER JOIN [dbo].[dim_tipo_contrato] AS TC2 ON D2.idTipoContrato = TC2.TipoContratoID
            WHERE  TC2.TipoJornada = 'FT' AND  D2.idSede IS NOT NULL AND  D2.vigente IS NOT NULL AND
            	D2.vigente = 1 
            	AND  D2.idSede <>@idVirtual and  D2.periodo=1 AND D2.dictaClase=1  )))*100 ,3)
            AS Ratio
            FROM
            	[dbo].[ad_docente] AS D 
            	INNER JOIN
            	[dbo].[dim_tipo_contrato] AS TC ON D.idTipoContrato = TC.TipoContratoID
            	INNER JOIN
            	[dbo].[ad_sede] AS S ON D.idSede = S.idSede and S.periodo=1
            WHERE
            	D.idSede IS NOT NULL AND  D.vigente IS NOT NULL AND  D.vigente = 1
            	AND  D.idSede <> @idVirtual
            	and  D.periodo=1
              AND D.dictaClase=1 
              AND S.vigente=1
            GROUP BY
            	S.idSede,
            	S.NombreSede
        END
      `);

    return res.status(200).json({
      message: 'responseMessage',
      data: resultData.recordset,
    });
  } catch (error) {
    console.error('Error en la API:', error);
    return res.status(500).json({ message: 'Error en la consulta', error });
  }
}
