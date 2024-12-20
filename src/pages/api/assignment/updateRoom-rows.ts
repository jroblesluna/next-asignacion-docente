import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PATCH') {
    console.log('PATCH@/pages/api/assignment/update-rows.ts');
    let pool;

    try {
      const { idPeriodo, idVersion, uuidFila, idRoom, userName } = req.body;

      if (!idPeriodo || !idVersion || !uuidFila || !idRoom || !userName) {
        return res.status(400).json({ message: 'Faltan campos en el body', data: false });
      }

      pool = await connectToDatabase();

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

      await pool
        .request()
        .input('id', idPeriodo)
        .input('idVersion', idVersion)
        .input('uuidFila', uuidFila)
        .input('idRoom', idRoom)
        .input('userName', userName).query(`
        UPDATE [dbo].[ad_programacionAcademica] 
        SET aulaModificada = @userName, idAula = @idRoom
        WHERE idPeriodo = @id 
        AND uuuidProgramacionAcademica = @uuidFila 
        AND idVersion = @idVersion
    `);

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
