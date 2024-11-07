import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../lib/db';
import sql from 'mssql';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    let pool;

    try {
      pool = await connectToDatabase();

      const id = 202409;

      const resultEvents = await pool.request().input('id', id).query(`
                SELECT  * FROM  ad_evento WHERE periodo=@id and estado=0 `);
      // SI HAY EVENTOS Y EL USUARIO QUIERE INCORPORARLOS

      const listaEventos = resultEvents.recordset;
      if (listaEventos.length !== 0) {
        // se crea la version si hay eventos
        const resultNewVersion = await pool
          .request()
          .input('idPeriodo', sql.Int, id)
          .input('nombreCreador', sql.VarChar, 'test')
          .execute('ad_crearVersion');
        console.log(resultNewVersion.recordset[0].nuevoIdVersion);
        const nuevaIdVersion = resultNewVersion.recordset[0].nuevoIdVersion;

        // COPIAR LA PROGRAMACIÓN CURSO Y AGREGARLE UNA NUEVA VERSIÓN

        await pool
          .request()
          .input('periodo', sql.Int, id)
          .input('idVersion', sql.Int, nuevaIdVersion)
          .execute('ad_copiarProgramacionAcademicaConNuevaVersion');

        for (const evento of listaEventos) {
          // Identificar los evento que modifican indirectamente la tabla PA
          // VIGENCIA DE UN DOCENTE - LO DESASIGNA AUTOMATICAMENTE
          // SU DISPONIBILIDAD CAMBIA
          //   SI HAY UN NUEVO HORARIO BLOQUEADO?
          // AGREGAR UN NUEVO CURSO
          // CAMBIAR LA VIGENCIA DE UN CURSO
          // teniendo el id version ya puedo modificar todos los eventos

          // ver condicional si son tablas snaptshot

          // ACTUALIZACIÓN DE LAS TABLAS SNAPTSHOT
          await pool
            .request()
            .input('periodo', sql.Int, evento.periodo)
            .input('uuid', sql.VarChar, evento.uuidEntidad)
            .input('NombreTabla', sql.VarChar, evento.entidadReferencia.split('.')[1])
            .execute('ad_ActualizarTablasSnaptshot');

          //actualiza el estado
          await pool.request().input('id', id).input('idEvento', evento.indice).query(`
                          UPDATE ad_evento  SET estado=1  WHERE periodo=@id and indice=@idEvento`);
        }
      }

      return res.status(200).json({
        message: `TEST EVENTOS RETURN`,
        data: resultEvents.recordset,
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
