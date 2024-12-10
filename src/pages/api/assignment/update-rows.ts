import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PATCH') {
    console.log('PATCH@/pages/api/assignment/update-rows.ts');
    let pool;

    try {
      const { idPeriodo, idVersion, uuidFila, idDocente, userName } = req.body;

      if (!idPeriodo || !idVersion || !uuidFila || !idDocente || !userName) {
        return res.status(400).json({ message: 'Faltan campos en el body', data: false });
      }

      pool = await connectToDatabase();
      const uidIdSede = process.env.UID_SEDE_VIRTUAL || '';

      const result = await pool
        .request()
        .input('id', idPeriodo)
        .query(`select * from [dbo].[ad_periodo] where idPeriodo=@id`);

      const periodoData = result.recordset[0];
      if (periodoData.estado != 'ACTIVO') {
        return res.status(200).json({
          message:
            'No se pudo editar la asignación para el periodo ' +
            periodoData.idPeriodo +
            ' por que su estado es: ' +
            periodoData.estado,
          data: false,
        });
      }

      const resultInfo = await pool
        .request()
        .input('id', idPeriodo)
        .input('uuidSlot', uuidFila)
        .input('version', idVersion).query(`
                SELECT  * FROM [dbo].[ad_programacionAcademica]
                WHERE 
    				    idPeriodo = @id
    				    AND uuuidProgramacionAcademica=@uuidSlot AND idVersion=@version
                  `);

      const resultadoIDVirtual = await pool
        .request()
        .input('id', idPeriodo)
        .input('uidVirtual', uidIdSede)
        .query(
          `SELECT idSede FROM [dbo].[ad_sede] where uidIdSede = @uidVirtual and  nombreSede = 'Virtual'    and periodo=@id`
        );

      const virtualID = resultadoIDVirtual.recordset[0]?.idSede;

      const idCurso = resultInfo.recordset[0]?.idSede;

      if (idDocente === '-1') {
        if (idCurso != virtualID) {
          await pool
            .request()
            .input('id', idPeriodo)
            .input('idVersion', idVersion)
            .input('uuidFila', uuidFila)
            .input('idDocente', idDocente).query(`
        UPDATE [dbo].[ad_programacionAcademica] 
        SET docenteModificado = null, idDocente = NULL
        WHERE idPeriodo = @id 
        AND uuuidProgramacionAcademica = @uuidFila 
        AND idVersion = @idVersion
    `);
        } else {
          await pool
            .request()
            .input('id', idPeriodo)
            .input('idVersion', idVersion)
            .input('uuidFila', uuidFila)
            .input('idDocente', idDocente).query(`
        UPDATE [dbo].[ad_programacionAcademica] 
        SET docenteModificado = null, idDocente = NULL,
        aulaModificada=null, idAula=idAulaInicial
        WHERE idPeriodo = @id 
        AND uuuidProgramacionAcademica = @uuidFila 
        AND idVersion = @idVersion
    `);
        }
      } else {
        await pool
          .request()
          .input('id', idPeriodo)
          .input('idVersion', idVersion)
          .input('uuidFila', uuidFila)
          .input('idDocente', idDocente)
          .input('userName', userName).query(`
        UPDATE [dbo].[ad_programacionAcademica] 
        SET docenteModificado = @userName, idDocente = @idDocente
        WHERE idPeriodo = @id 
        AND uuuidProgramacionAcademica = @uuidFila 
        AND idVersion = @idVersion
    `);
      }

      return res.status(200).json({
        message: `Campos de asignación docente para el periodo ${idPeriodo} actualizados correctamente`,
        data: true,
      });
    } catch (error) {
      console.error('Error en la API:', error);
      return res.status(500).json({ message: 'Error en la consulta', error });
    }
  } else {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
