import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../lib/db';
import { sendEmail } from '../lib/conectEmail';
import { getCurrentDateTimeLima } from '@/app/utils/managmentTime';
const invokePipeline = async (action: 'run' | 'monitor', url_base: string, correo: string) => {
  const pipelineName = process.env.NEXT_PUBLIC_INVOKE_PIPELINE_SYNC_NAME || '';
  let hasFailed = false; // Variable para saber si falló en algún momento

  try {
    // Enviar petición para invocar o monitorear el pipeline
    const response = await fetch(`${url_base}/api/invokePipeline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pipelineName, action }),
    });

    const data = await response.json();

    if (response.ok) {
      if (action === 'run') {
        if (data.runningPipelines?.length) {
          console.log('Pipeline is already running.', data.runningPipelines);
        } else {
          console.log(`Success: ${data.message}`, [{ runId: data.runId, status: 'Running' }]);
        }
        return { success: true, hasFailed };
      }

      if (action === 'monitor') {
        if (data.runningPipelines?.length) {
          console.log('Monitoring the pipeline...', data.runningPipelines);
          return { success: false, hasFailed };
        } else {
          console.log('No running pipelines found.');
          return { success: true, hasFailed };
        }
      }
    } else {
      hasFailed = true; // Indicar que ha fallado
      const message = `La transmisión de datos (pipeline) de sincronización ha fallado a las ${getCurrentDateTimeLima()}. Por favor contactar con el equipo de TI.`;
      console.log(`Error: ${data.error}`);
      if (correo) await sendEmail(correo, 'Sistema de Asignación Docente Informa:', message);
      return { success: true, hasFailed };
    }
  } catch (error: unknown) {
    hasFailed = true; // Indicar que ha fallado
    const errorMessage = (error as Error).message || 'An unexpected error occurred';
    console.log(`Error: ${errorMessage}`);
    const message = `La transmisión de datos (pipeline) de sincronización  ha fallado a las ${getCurrentDateTimeLima()}. Por favor contactar con el equipo de TI.`;
    if (correo) await sendEmail(correo, 'Sistema de Asignación Docente Informa:', message);
    return { success: true, hasFailed };
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    let pool;
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    try {
      pool = await connectToDatabase();
      const { idPeriodo, correo } = req.body;

      if (!idPeriodo || !correo) {
        return res.status(400).json({ message: 'idPeriodo y correo son requeridos' });
      }

      const result = await pool
        .request()
        .input('id', idPeriodo)
        .query(`select * from [dbo].[ad_periodo] where idPeriodo=@id`);

      const periodoData = result.recordset[0];
      if (periodoData.estado != 'ACTIVO') {
        return res.status(200).json({
          message:
            'No se pudo sincronizar  la asignación para el periodo ' +
            periodoData.idPeriodo +
            ' por que su estado es: ' +
            periodoData.estado,
          data: false,
        });
      }
      await pool
        .request()
        .input('id', idPeriodo)
        .input('estado', 'CARGANDO')
        .query('UPDATE ad_periodo SET estado = @estado WHERE idPeriodo = @id');

      let resStatusPipeline = false;
      let resStatusFilePipeline = false;
      do {
        // Esperar 5 segundos antes de ejecutar el siguiente paso
        console.log('Esperando 5 segundos...');
        await new Promise((resolve) => setTimeout(resolve, 5000));

        console.log('Llamando al monitoreo del pipeline SINC');
        if (correo) {
          const result = await invokePipeline(
            'monitor',
            baseUrl,
            Array.isArray(correo) ? correo[0] : correo
          );
          resStatusPipeline = result?.success || false;
          // Si hubo fallas en algún momento, salir del bucle
          if (result?.hasFailed) {
            resStatusFilePipeline = result?.hasFailed;
            console.log('Error detectado en el monitoreo SINC. Saliendo del bucle.');
            break;
          }
        }
      } while (!resStatusPipeline);

      if (!resStatusFilePipeline) {
        await pool.request().input('periodo', idPeriodo).query(`
            DECLARE @user VARCHAR(255);
            DECLARE @IdVersion INT;        

            SET @user = (SELECT TOP 1 usuarioEjecutado FROM [dbo].[ad_asignacion_output] ORDER BY usuarioEjecutado DESC);
            -- Obtener la última versión
            SET @IdVersion = (SELECT MAX(idVersion) FROM ad_version WHERE idPeriodo = @periodo);
            -- Actualizar la tabla
            UPDATE [dbo].[ad_programacionAcademica]
            SET aulaModificada = 
                CASE 
                    WHEN (aulaModificada not in ( 'SISTEMA INICIO' ,'')  and  aulaModificada is not null )  THEN @user + ' (SINC)' 
                    ELSE aulaModificada
                END,
                docenteModificado = CASE 
                    WHEN (docenteModificado <> 'SISTEMA INICIO' AND idDocente is not null  )   THEN @user + ' (SINC)' 
                    ELSE docenteModificado
                END
            WHERE idPeriodo = @periodo 
            AND idVersion = @IdVersion 
            AND uuuidProgramacionAcademica IN (SELECT uididprograma FROM [dbo].[ad_asignacion_output])
`);

        //   actualizar tabla de programacion curso (opcional)
        await pool.request().input('periodo', idPeriodo).query(`
                 MERGE INTO [dbo].[ProgramacionCursos] AS destino
                                  USING (
            						SELECT A.idAula, D.idDocente, AO.uidIdPrograma FROM [dbo].[ad_asignacion_output]AS AO 
                            left join [dbo].[ad_aula] as A ON AO.uididaula=A.uidIdAula AND A.periodo=@periodo
                            left join [dbo].[ad_docente] as D ON AO.uididprofesor = D.uuidDocente  AND D.periodo=@periodo
                                  ) AS origen 
                                  ON origen.uidIdPrograma = destino.uidIdPrograma  
                                  AND destino.Periodo =@periodo
                                  WHEN MATCHED THEN
                                      UPDATE SET 
            						   destino.DocenteID = CASE WHEN origen.idDocente = '' THEN NULL 
                                       ELSE origen.idDocente  END,
            						   destino.AulaID =  CASE WHEN origen.idAula = '' THEN NULL 
                                       ELSE origen.idAula  END;
                      `);
      }

      await pool
        .request()
        .input('id', idPeriodo)
        .input('estado', 'ACTIVO')
        .query('UPDATE ad_periodo SET estado = @estado WHERE idPeriodo = @id');

      console.log(
        !resStatusFilePipeline
          ? `Sincronización terminada correctamente a las ${getCurrentDateTimeLima()}  para el periodo ${idPeriodo} `
          : `Error en la sincronización para el periodo ${idPeriodo} `
      );

      const subject = 'Sistema de Asignación Docente';
      const plainText = !resStatusFilePipeline
        ? `Sincronización terminada correctamente a las ${getCurrentDateTimeLima()}  para el periodo ${idPeriodo} `
        : `Error en la sincronización para el periodo ${idPeriodo} `;

      if (correo) {
        await sendEmail(correo as string, subject, plainText);
      }

      return res.status(200).json({
        message: !resStatusFilePipeline
          ? `Sincronización terminada correctamente a las ${getCurrentDateTimeLima()}  para el periodo ${idPeriodo} `
          : `Error en la sincronización para el periodo ${idPeriodo} `,
        data: !resStatusFilePipeline
          ? 'Se ha sincronizado exitosamente '
          : 'Error al sincronizar',
      });
    } catch (error) {
      console.error('Error en la API:', error);
      return res.status(500).json({ message: 'Error en la consulta', error });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
