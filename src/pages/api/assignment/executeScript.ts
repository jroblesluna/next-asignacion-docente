/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */

/* Importaciones necesarias para el funcionamiento de la API. */
import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../lib/db';
import sql from 'mssql';
import { sendEmail } from '../lib/conectEmail';

/*Estrucuturas de interfaces necesarias para el correcto funcionamiento del codigo */

interface disponibilidadDocenteInterface {
  DocenteID: number;
  PeriodoAcademico: number;
  EstadoDisponible: number;
  FechaInicio: string;
  FechaFin: string;
}

interface EventosCambiosDocente {
  idDocente: string;
  cambioDisponibilidad: boolean;
  cambioHorarioBloqueado: boolean;
  cambioLibroDocente: boolean;
}

/* Función que convierte una frecuencia en un array de números, representando los 
días de la semana (1-7) que abarca dicha frecuencia. */

const obtenerNumerosPorDias = (frecuencia: string): number[] => {
  let numerosDias: number[] = [];

  switch (frecuencia) {
    case 'LMV':
      numerosDias = [1, 3, 5];
      break;
    case 'LV':
      numerosDias = [1, 2, 3, 4, 5];
      break;
    case 'LM':
      numerosDias = [1, 3];
      break;

    case 'MJS':
      numerosDias = [2, 4, 6];
      break;
    case 'MJV':
      numerosDias = [2, 4, 5];
      break;
    case 'MJ':
      numerosDias = [2, 4];
      break;
    case 'SD':
      numerosDias = [6, 7];
      break;
    case 'S':
      numerosDias = [6];
      break;
    case 'D':
      numerosDias = [7];
      break;
    case 'L':
      numerosDias = [1];
      break;
    case 'M':
      numerosDias = [2, 3];
      break;
    case 'J':
      numerosDias = [4];
      break;
    case 'V':
      numerosDias = [5];
      break;

    default:
      throw new Error('Frecuencia no válida');
  }

  return numerosDias;
};

/* Función auxiliar que determina si dos frecuencias se superponen o intersectan. */
const hayNumeroComunEntreArrays = (array1: number[], array2: number[]): boolean => {
  for (const num of array1) {
    if (array2.includes(num)) {
      return true;
    }
  }
  return false;
};

/* Función que recibe dos rangos de tiempo como parámetros y verifica si se solapan o se intersectan. */

const rangosDeTiempoSeSolapan = (rango1: string, rango2: string): boolean => {
  const convertirTiempoEnMinutos = (tiempo: string): number => {
    const [horas, minutos] = tiempo.split(':').map(Number);
    return horas * 60 + minutos;
  };

  const [inicio1, fin1] = rango1.split(' - ').map(convertirTiempoEnMinutos);
  const [inicio2, fin2] = rango2.split(' - ').map(convertirTiempoEnMinutos);

  return inicio1 < fin2 && inicio2 < fin1;
};

/* Función que recibe como parámetros la frecuencia, el horario de inicio y fin de dos clases,
 y verifica si se solapan. Devuelve false si no hay intersección entre los horarios. */

const claseSolapada = (
  frecuencia1: string,
  horarioInicial1: string,
  horarioFinal1: string,
  frecuencia2: string,
  horarioInicial2: string,
  horarioFinal2: string
): boolean => {
  const dias1 = obtenerNumerosPorDias(frecuencia1);
  const dias2 = obtenerNumerosPorDias(frecuencia2);

  if (!hayNumeroComunEntreArrays(dias1, dias2)) return false;

  if (
    !rangosDeTiempoSeSolapan(
      horarioInicial1 + ' - ' + horarioFinal1,
      horarioInicial2 + ' - ' + horarioFinal2
    )
  )
    return false;

  return true;
};

/* Función diseñada para validar si un horario bloqueado de un docente se solapa con la combinación de frecuencia, 
   hora de inicio y hora de fin de una clase. */

const solapaHorarioBloqueado = (
  tipoSemana: string,
  frecuencia: string,
  rango: string,
  horarioInicio: string,
  horarioFin: string
) => {
  function convertirHora(cadenaHora: string): Date {
    const [horas, minutos] = cadenaHora.split(':').map(Number);
    const hoy = new Date();
    hoy.setHours(horas, minutos, 0, 0);
    return hoy;
  }
  const diasHabiles = ['L', 'M', 'J', 'V'];
  const diasFinDeSemana = ['S', 'D'];

  //SABATINOS = S
  //DIARIOS  =D

  if (
    (tipoSemana[0] === 'S' && diasHabiles.some((dia) => frecuencia.includes(dia))) ||
    (tipoSemana[0] === 'D' && diasFinDeSemana.some((dia) => frecuencia.includes(dia)))
  ) {
    return false;
  }

  const [rangoInicio, rangoFin] = rango.split(' - ');
  const inicioRango = convertirHora(rangoInicio);
  const finRango = convertirHora(rangoFin);
  const inicioHorario = convertirHora(horarioInicio);
  const finHorario = convertirHora(horarioFin);

  if (tipoSemana == 'S9') {
    return finRango > inicioHorario && finHorario > inicioRango && frecuencia.includes('D');
  }

  return finRango > inicioHorario && finHorario > inicioRango;
};

/* Función que valida si dos fechas se superponen o intersectan. Devuelve false si  hay intersección entre ellas. */

const disponibleEnFecha = (
  fechaInicio1: string,
  fechaFinal1: string,
  fechaInicio2: string,
  fechaFinal2: string
) => {
  console.log('Analisando solapamiento con fechas ');

  function convertirFecha(cadenaFecha: string): Date {
    const [dia, mes, anio] = cadenaFecha.split('-').map(Number);
    return new Date(anio, mes - 1, dia);
  }

  try {
    const inicio1 = convertirFecha(fechaInicio1);
    const final1 = convertirFecha(fechaFinal1);
    const inicio2 = convertirFecha(fechaInicio2);
    const final2 = convertirFecha(fechaFinal2);
    return final1 < inicio2 || final2 < inicio1;
  } catch (error) {
    console.log('No hay fecha disponible');
    return false;
  }
};

/* Función que valida si dos horarios se solapan. Devuelve true si hay solapamiento entre ellos. */
const solapamientoHorario = (rango: string, horarioInicio: string, horarioFin: string) => {
  function convertirHora(cadenaHora: string): Date {
    const [horas, minutos] = cadenaHora.split(':').map(Number);
    const hoy = new Date();
    hoy.setHours(horas, minutos, 0, 0);
    return hoy;
  }

  const [rangoInicio, rangoFin] = rango.split(' - ');
  const inicioRango = convertirHora(rangoInicio);
  const finRango = convertirHora(rangoFin);
  const inicioHorario = convertirHora(horarioInicio);
  const finHorario = convertirHora(horarioFin);

  return finRango > inicioHorario && finHorario > inicioRango;
};

/* Función que valida si dos frecuencias se solapan. Devuelve true si hay solapamiento entre ellos. */

const solapamientoFrecuencia = (f1: string, f2: string) => {
  const dias1 = obtenerNumerosPorDias(f1);
  const dias2 = obtenerNumerosPorDias(f2);

  if (!hayNumeroComunEntreArrays(dias1, dias2)) return false;

  return true;
};

/* Función que genera una cadena para bloquear los horarios y frecuencias que se solapan con otros, 
   y así excluirlos al buscar docentes disponibles para un curso. */

const maquetarDatos = (frecuenciaId: string, horarioId: string, cabezera: string) => {
  return ` OR (${cabezera}.idFrecuencia =${frecuenciaId} AND ${cabezera}.idHorario = ${horarioId} )`;
};

/* Función auxiliar que obtiene el periodo anterior requirido a partir del periodo actual. */
const calcularCodigoAnterior = (codigo: string, mesesARestar: number) => {
  const year = parseInt(codigo.slice(0, 4), 10);
  const month = parseInt(codigo.slice(4, 6), 10);
  const fechaOriginal = new Date(year, month - 1);

  fechaOriginal.setMonth(fechaOriginal.getMonth() - mesesARestar);

  const nuevoAnio = fechaOriginal.getFullYear();
  const nuevoMes = (fechaOriginal.getMonth() + 1).toString().padStart(2, '0');

  return Number(`${nuevoAnio}${nuevoMes}`);
};

/* Llamada al pipeline para la actualización del Data Warehouse (DWH). */
const invokePipeline = async (action: 'run' | 'monitor', url_base: string) => {
  const pipelineName = process.env.NEXT_PUBLIC_INVOKE_PIPELINE_NAME || '';

  try {
    // Send a POST request to invoke or monitor the pipeline
    const response = await fetch(url_base + '/api/invokePipeline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pipelineName, // Name of the pipeline to act upon
        action, // Action: either 'run' or 'monitor'
      }),
    });

    const data = await response.json(); // Parse the JSON response

    if (response.ok) {
      // Handling success for 'run' action
      if (action === 'run') {
        if (data.runningPipelines?.length) {
          // If pipeline is already running, show message and list running pipelines
          console.log('Pipeline is already running.');
          console.log(
            data.runningPipelines.map((runId: string) => ({ runId, status: 'Running' }))
          );
        } else {
          // If pipeline is not running, invoke the pipeline and show success mes sage
          console.log(`Success: ${data.message}`);
          console.log([{ runId: data.runId, status: 'Running' }]);
        }

        return true;
      }
      // Handling success for 'monitor' action
      else if (action === 'monitor') {
        if (data.runningPipelines?.length) {
          // If there are running pipelines, show monitoring message and list them
          console.log('Monitoring the pipeline...');
          console.log(
            data.runningPipelines.map((runId: string) => ({ runId, status: 'Running' }))
          );
          return false;
        } else {
          // If no pipelines are running, show a no running pipelines message
          console.log('No running pipelines found.');
          return true;
        }
      }
    } else {
      // Handle error if the response is not OK
      console.log(`Error: ${data.error}`);
      return true;
    }
  } catch (error: unknown) {
    // Catch any unexpected errors and display the message
    const errorMessage = (error as Error).message || 'An unexpected error occurred';
    console.log(`Error: ${errorMessage}`);
    return true;
  }
};

/* Inicio formal de la API. */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    console.log('GET@/pages/api/assignment/executeScript.ts');

    /* Construir de la url base para la llamada del pipeline */
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    console.log(baseUrl);

    try {
      /*Conexión a la base de datos */
      const pool = await connectToDatabase();

      /* Parámetros requeridos para el funcionamiento del algoritmo de asignación docente:
   - periodo: código del periodo para realizar la asignación.
   - correo: dirección de correo del usuario que solicitó la generación.
   - addeventos: indica si se deben añadir los eventos a la asignación.
   - tipo: especifica el tipo de asignación a realizar. */

      const { periodo, correo, addEvents, tipo } = req.query;

      /* Acceso a las variables de entorno que afectan la asignación. */
      const MAX_HORAS_FT = parseInt(process.env.MAX_HORAS_FT || '48', 10);
      const MAX_HORAS_PT = parseInt(process.env.MAX_HORAS_PT || '24', 10);
      const uidIdSede = process.env.UID_SEDE_VIRTUAL || '';

      console.log('Horas maximas por docentes PT: ' + MAX_HORAS_PT);
      console.log('Horas maximas por docentes FT: ' + MAX_HORAS_FT);

      /* Verificación de la existencia de los parámetros. */
      if (!periodo && !correo && !addEvents && !tipo) {
        return res
          .status(400)
          .json({ message: 'Faltan campos en el query string', data: false });
      }

      const result = await pool
        .request()
        .input('id', periodo)
        .query(`select * from [dbo].[ad_periodo] where idPeriodo=@id`);

      /* Verificación de la existencia del periodo. */
      if (result.recordset.length == 0) {
        return res.status(200).json({
          message: 'No existe el  periodo ' + periodo,
          data: 'No existe el  periodo ' + periodo,
        });
      }

      const periodoData = result.recordset[0];
      /* Verificación de que el periodo esté activo o en proceso de carga; de lo contrario, no se puede iniciar la asignación. */
      if (periodoData.estado != 'ACTIVO' && periodoData.estado != 'CARGANDO') {
        return res.status(200).json({
          message: 'No existe el  periodo ' + periodo,
          data:
            'No se pudo Inciar la asignación Docente para el periodo ' +
            periodoData.idPeriodo +
            ' por que su estado es: ' +
            periodoData.estado,
        });
      }

      /* Actualiza el estado de "activo" a "cargando" para evitar modificaciones mientras el sistema realiza la asignación.*/

      await pool
        .request()
        .input('id', periodo)
        .query(`UPDATE [dbo].[ad_periodo] SET estado='CARGANDO'  where idPeriodo=@id`);

      /* Obtener los datos si ya existe programación académica para el periodo especificado. */
      const resultExistDataPeriod = await pool
        .request()
        .input('id', periodo)
        .query(`SELECT  TOP 1 * FROM [dbo].[ad_programacionAcademica] where idPeriodo=@id`);

      /* El pipeline de actualización se llamará solo en los siguientes casos:
   1. Si hay eventos, es decir, si addEvents es true.
   2. Si no existe programación académica para el periodo actual, lo que indica que es la primera vez que se realiza la asignación.
   3. Si el tipo es "reinicio", lo que significa obtener las últimas actualizaciones desde el inicio del sistema y reprocesar. */

      if (
        addEvents === 'true' ||
        resultExistDataPeriod.recordset.length == 0 ||
        tipo == 'reinicio'
      ) {
        // Actualizar tablas desde el DWH - Invoke Pipeline
        console.log('Llamando al pipeline Invoke');
        await invokePipeline('run', baseUrl);

        let resStatusPipeline;

        console.log('Actualizando las tablas del DWH');

        /* Mediante un bucle, se espera hasta que el pipeline termine su ejecución. */
        do {
          // Esperar 5 segundos antes de ejecutar el siguiente paso
          console.log('esperando 5 segundo');
          await new Promise((resolve) => setTimeout(resolve, 5000));
          console.log('Llamando al monitoreo del pipeline');
          resStatusPipeline = await invokePipeline('monitor', baseUrl);
        } while (!resStatusPipeline);
      }

      /* Se genera un registro de avance si no existe uno para el periodo especificado. */

      await pool.request().input('periodoID', sql.Int, periodo)
        .query(` IF NOT EXISTS (SELECT 1 FROM ad_avanceAlgoritmo WHERE idPeriodo = @periodoID)
                      BEGIN
                        INSERT INTO ad_avanceAlgoritmo  (idSede, escenario, idSlot, idPeriodo, idVersion,correo,slotsRecorridos, totalSlots)
                        VALUES (null, null, null, @periodoID,null,null,0,null);
                      END
                      `);

      let flagAvance = true;

      /* Obtiene el resultado de avance. Si se ha detenido, permite volver al punto desde la última asignación registrada. */

      const resultadoAvance = await pool
        .request()
        .input('id', periodo)
        .query(`SELECT  * FROM [dbo].[ad_avanceAlgoritmo] where idPeriodo=@id`);

      const dataAvance = resultadoAvance.recordset;

      /* Si no hay avance, se sigue el procedimiento estándar. */

      if (dataAvance[0].idSede === null) {
        flagAvance = false;
      }

      /* Obtención de la disponibilidad de los docentes para un periodo específico. */
      const resultDesponibilidad = await pool.request().input('id', periodo).query(`
                      SELECT DocenteID, PeriodoAcademico,EstadoDisponible,FORMAT(FechaInicio, 'dd-MM-yyyy')
                 as FechaInicio, FORMAT(FechaFin , 'dd-MM-yyyy') as FechaFin
                 FROM [dbo].[disponibilidad_docente]  where  PeriodoAcademico=@id
                        `);

      const disponibilidadDocente = resultDesponibilidad.recordset;

      /* Obtención de los Horarios bloqueados de los docente para un periodo específico. */

      const resultHorariosBloquedos = await pool.request().query(`
                                  SELECT DISTINCT 
                                                hbd.CodigoBloque, 
                                                hbd.DocenteID, 
                                                bh.bloque
                                            FROM 
                                                [dbo].[horario_bloqueado_docente] hbd
                                            INNER JOIN 
                                                [dbo].[BloqueHorario] bh
                                                ON hbd.CodigoBloque = bh.BloqueHorario
                                            WHERE 
                                            hbd.FlagConsiderado = 1;
                                    `);
      const BloquesBloqueadosCompletos = resultHorariosBloquedos.recordset;

      /* Si el tipo es "reinicio", se llama al procedimiento ad_reiniciarDataPeriodo, que borra y genera las nuevas tablas snapshot. */

      if (tipo == 'reinicio') {
        await pool
          .request()
          .input('periodo', sql.Int, Number(periodo))
          .input('nombreCreador', sql.VarChar, correo)
          .execute('ad_reiniciarDataPeriodo');
      }

      if (!flagAvance) {
        /* Crea las tablas snapshot si no existen para el periodo especificado. */
        await pool
          .request()
          .input('periodo', sql.Int, Number(periodo))
          .input('nombreCreador', sql.VarChar, correo)
          .execute('ad_capturaDatosNuevoPeriodo');

        /* Crea la tabla de programación academica si no existe para el periodo especificado. */
        await pool
          .request()
          .input('periodo', sql.Int, Number(periodo))
          .execute('ad_CrearNuevaProgramacionAcademica');

        /* Verifica si se deben incorporar o no los eventos. */
        if (addEvents == 'true') {
          const resultEvents = await pool.request().input('id', periodo).query(`
                SELECT  * FROM  ad_evento WHERE periodo=@id and estado=0 `);

          const listaEventos = resultEvents.recordset;
          /* Verifica si hay al menos un evento */

          if (listaEventos.length !== 0) {
            console.log('Hay ' + listaEventos.length + ' eventos ');

            /* Genera una nueva versión de la programación académica para el periodo especificado. */

            const resultNewVersion = await pool
              .request()
              .input('idPeriodo', sql.Int, periodo)
              .input('nombreCreador', sql.VarChar, correo)
              .execute('ad_crearVersion');

            const nuevaIdVersion = resultNewVersion.recordset[0].nuevoIdVersion;
            /* Copia la programación del curso y le asigna una nueva versión generada. */

            await pool
              .request()
              .input('periodo', sql.Int, periodo)
              .input('idVersion', sql.Int, nuevaIdVersion)
              .execute('ad_copiarProgramacionAcademicaConNuevaVersion');

            const Revisardocentes: EventosCambiosDocente[] = [];
            const RevisarProgramacion: string[] = [];

            /* Función que crea un array de clave-valor, donde el idDocente es la clave, 
           y actualiza los estados de sus cambios y los eventos correspondientes que le afecten. */

            const actualizarCampoDocente = <
              K extends keyof Omit<EventosCambiosDocente, 'idDocente'>
            >(
              idDocente: string,
              campo: K,
              valor: EventosCambiosDocente[K]
            ) => {
              const docente = Revisardocentes.find((d) => d.idDocente == idDocente);

              if (docente) {
                docente[campo] = valor;
              }
            };

            for (const evento of listaEventos) {
              /* Actualización de las tablas snapshot . */

              const entidad = evento.entidadReferencia.split('.')[1];
              console.log('periodo: ' + Number(evento.periodo));
              console.log('uuid: ' + evento.uuidEntidad.toString());
              console.log('entidad: ' + entidad.toString());

              await pool
                .request()
                .input('periodo', sql.Int, Number(evento.periodo))
                .input('uuid', sql.VarChar, evento.uuidEntidad)
                .input('NombreTabla', sql.VarChar, entidad)
                .execute('ad_ActualizarTablasSnaptshot');

              if (
                !Revisardocentes.find((d) => d.idDocente == evento.entidadId.toString()) &&
                (evento.entidadReferencia.split('.')[1] == 'dim_docente' ||
                  evento.entidadReferencia.split('.')[1] == 'disponibilidad_docente' ||
                  evento.entidadReferencia.split('.')[1] == 'LibroPorDocente' ||
                  evento.entidadReferencia.split('.')[1] == 'horario_bloqueado_docente')
              ) {
                console.log('Añadiendo docente: ' + evento.entidadId.toString());
                Revisardocentes.push({
                  idDocente: evento.entidadId.toString(),
                  cambioDisponibilidad: false,
                  cambioHorarioBloqueado: false,
                  cambioLibroDocente: false,
                });
              }

              if (evento.entidadReferencia.split('.')[1] == 'disponibilidad_docente') {
                actualizarCampoDocente(evento.entidadId, 'cambioDisponibilidad', true);
                console.log('Entro a ' + 'cambioDisponibilidad');
              }

              if (evento.entidadReferencia.split('.')[1] == 'LibroPorDocente') {
                actualizarCampoDocente(evento.entidadId, 'cambioLibroDocente', true);
                console.log('Entro a ' + 'cambioLibroDocente');
              }

              if (evento.entidadReferencia.split('.')[1] == 'horario_bloqueado_docente') {
                actualizarCampoDocente(evento.entidadId, 'cambioHorarioBloqueado', true);
                console.log('Entro a ' + 'cambioHorarioBloqueado');
              }

              if (evento.entidadReferencia.split('.')[1] == 'ProgramacionCursos') {
                RevisarProgramacion.push(evento.uuidEntidad);
                console.log('Entro a ' + 'ProgramacionCursos');
              }
            }

            const resultadoIDVirtual = await pool
              .request()
              .input('id', periodo)
              .input('uidVirtual', uidIdSede)
              .query(
                `SELECT idSede FROM [dbo].[ad_sede] where uidIdSede = @uidVirtual and  nombreSede = 'Virtual'    and periodo=@id`
              );

            const virtualID = resultadoIDVirtual.recordset[0]?.idSede;

            for (const docenteAnalisis of Revisardocentes) {
              console.log('analisando el docente:  ' + docenteAnalisis.idDocente);

              const resultOneDocente = await pool
                .request()
                .input('id', periodo)
                .input('idDocente', docenteAnalisis.idDocente).query(`
                  SELECT  idDocente , vigente FROM [dbo].[ad_docente]
                  WHERE idDocente = @idDocente AND  periodo = @id`);

              console.log(
                resultOneDocente.recordset[0]?.vigente ? 'El docente sigue vigente' : ''
              );

              if (resultOneDocente.recordset[0]?.vigente == false) {
                console.log('DESASIGNAR , ya no esta vigente el docente');
                await pool
                  .request()
                  .input('id', periodo)
                  .input('idVersion', nuevaIdVersion)
                  .input('idDocente', docenteAnalisis.idDocente)
                  .input('idVirtual', virtualID).query(`
                  BEGIN
              
                    UPDATE ad_programacionAcademica 
                    SET idAula = idAulaInicial, aulaModificada = NULL
                    WHERE idSede = @idVirtual 
                    AND  idDocente = @idDocente 
                    AND aulaModificada IS NOT NULL  
                    AND idVersion = @idVersion 
                    AND idPeriodo = @id;
                    
                    UPDATE [dbo].[ad_programacionAcademica]  
                    SET idDocente = NULL, docenteModificado=NULL
                    WHERE idDocente = @idDocente 
                    AND idPeriodo = @id
                    AND idVersion = @idVersion;
                    END `);
                continue;
              }

              if (
                !docenteAnalisis.cambioLibroDocente &&
                !docenteAnalisis.cambioHorarioBloqueado &&
                !docenteAnalisis.cambioDisponibilidad
              ) {
                console.log(
                  'No hay mas analisis para el docente ' + docenteAnalisis.idDocente
                );
                continue;
              }

              const resultClasesAsignadas = await pool
                .request()
                .input('id', periodo)
                .input('idDocente', docenteAnalisis.idDocente)
                .input('idVersion', nuevaIdVersion).query(`
                        SELECT 
                                PC.idSede, 
                                PC.uuuidProgramacionAcademica,
                                PC.idPeriodo, 
                                PC.idCurso, 
                                PC.idFrecuencia, 
                                PC.idHorario, 
                                H.HorarioInicio, 
                                H.HorarioFin, 
                                F.NombreFrecuencia, 
                                F.NombreAgrupFrecuencia,
                                FORMAT(CONVERT(DATETIME, PC.inicioClase), 'dd-MM-yyyy') AS InicioClase,
                                FORMAT(CONVERT(DATETIME, PC.finalClase), 'dd-MM-yyyy') AS FinClase
                                FROM 
                                 [dbo].[ad_programacionAcademica] AS PC
                                INNER JOIN 
                                [dbo].[ad_horario]  AS H ON PC.idHorario = H.idHorario and H.periodo = @id
                                INNER JOIN 
                                [dbo].[ad_frecuencia]  AS F ON PC.idFrecuencia = F.idFrecuencia and F.periodo = @id
                                WHERE 
                                PC.idDocente = @idDocente
                                AND PC.idPeriodo = @id
                                AND PC.idVersion=@idVersion
                          `);

              const ClasesAsignadas = resultClasesAsignadas.recordset;

              for (const claseDocente of ClasesAsignadas) {
                if (docenteAnalisis.cambioLibroDocente) {
                  console.log(
                    'Analisando cambioLibroDocente para el docente ' +
                      docenteAnalisis.idDocente
                  );

                  const resultDictaCurso = await pool
                    .request()
                    .input('idDocente', docenteAnalisis.idDocente)
                    .input('idCurso', claseDocente.idCurso)
                    .query(
                      `SELECT top 1 * FROM [dbo].[LibroPorDocente] where DocenteID = @idDocente and CursoID= @idCurso`
                    );

                  if (resultDictaCurso.recordset.length === 0) {
                    console.log(
                      'Desasignar Slot ' +
                        claseDocente.uuuidProgramacionAcademica +
                        ' del docente:  ' +
                        docenteAnalisis.idDocente
                    );
                    await pool
                      .request()
                      .input('id', periodo)
                      .input('idVersion', nuevaIdVersion)
                      .input(
                        'uuuidProgramacionAcademica',
                        claseDocente.uuuidProgramacionAcademica
                      )
                      .input('idDocente', docenteAnalisis.idDocente)
                      .input('idVirtual', virtualID).query(`
                                BEGIN
                                UPDATE ad_programacionAcademica 
                                SET idAula = idAulaInicial, aulaModificada = NULL
                                WHERE idSede = @idVirtual 
                                AND  idDocente = @idDocente 
                                AND uuuidProgramacionAcademica=@uuuidProgramacionAcademica
                                AND aulaModificada IS NOT NULL  
                                AND idVersion = @idVersion 
                                AND idPeriodo = @id;
                                
                                UPDATE [dbo].[ad_programacionAcademica]  
                                SET idDocente = NULL, docenteModificado=NULL
                                WHERE idDocente = @idDocente 
                                AND uuuidProgramacionAcademica=@uuuidProgramacionAcademica
                                AND idPeriodo = @id
                                AND idVersion = @idVersion;
                                END `);
                    continue;
                  }
                }

                if (docenteAnalisis.cambioDisponibilidad) {
                  console.log(
                    'Analisando cambioDisponibilidad para el docente ' +
                      docenteAnalisis.idDocente
                  );

                  const docenteDisponibleData = disponibilidadDocente.filter(
                    (item: disponibilidadDocenteInterface) =>
                      item.DocenteID == Number(docenteAnalisis.idDocente)
                  );

                  if (docenteDisponibleData.length > 0) {
                    const respuesta = docenteDisponibleData.every(
                      (item: disponibilidadDocenteInterface) => {
                        if (Number(item.EstadoDisponible) == 1) {
                          return true;
                        }
                        return disponibleEnFecha(
                          item?.FechaInicio,
                          item?.FechaFin,
                          claseDocente.InicioClase,
                          claseDocente.FinClase
                        );
                      }
                    );

                    if (!respuesta) {
                      console.log(
                        'Desasignar Slot ' +
                          claseDocente.uuuidProgramacionAcademica +
                          ' del docente:  ' +
                          docenteAnalisis.idDocente
                      );
                      await pool
                        .request()
                        .input('id', periodo)
                        .input('idVersion', nuevaIdVersion)
                        .input(
                          'uuuidProgramacionAcademica',
                          claseDocente.uuuidProgramacionAcademica
                        )
                        .input('idDocente', docenteAnalisis.idDocente)
                        .input('idVirtual', virtualID).query(`
                  BEGIN
              
                    UPDATE ad_programacionAcademica 
                    SET idAula = idAulaInicial, aulaModificada = NULL
                    WHERE idSede = @idVirtual 
                    AND  idDocente = @idDocente 
                    AND uuuidProgramacionAcademica=@uuuidProgramacionAcademica
                    AND aulaModificada IS NOT NULL  
                    AND idVersion = @idVersion 
                    AND idPeriodo = @id;
                    
                    UPDATE [dbo].[ad_programacionAcademica]  
                    SET idDocente = NULL, docenteModificado=NULL
                    WHERE idDocente = @idDocente 
                    AND uuuidProgramacionAcademica=@uuuidProgramacionAcademica
                    AND idPeriodo = @id
                    AND idVersion = @idVersion;
                    END `);

                      continue;
                    }
                  }
                }

                if (docenteAnalisis.cambioHorarioBloqueado) {
                  console.log(
                    'Analisando cambioHorarioBloqueado para el docente ' +
                      docenteAnalisis.idDocente
                  );

                  const BloquesBloqueados = BloquesBloqueadosCompletos.filter(
                    (horario: { DocenteID: number }) =>
                      horario.DocenteID == Number(docenteAnalisis.idDocente)
                  );

                  if (BloquesBloqueados.length > 0) {
                    const respuesta = BloquesBloqueados.every(
                      (item: { CodigoBloque: string; bloque: string }) => {
                        return !solapaHorarioBloqueado(
                          item.CodigoBloque,
                          claseDocente.NombreAgrupFrecuencia,
                          item.bloque,
                          claseDocente.HorarioInicio,
                          claseDocente.HorarioFin
                        );
                      }
                    );

                    if (!respuesta) {
                      console.log(
                        'Desasignar Slot ' +
                          claseDocente.uuuidProgramacionAcademica +
                          ' del docente:  ' +
                          docenteAnalisis.idDocente
                      );
                      await pool
                        .request()
                        .input('id', periodo)
                        .input('idVersion', nuevaIdVersion)
                        .input(
                          'uuuidProgramacionAcademica',
                          claseDocente.uuuidProgramacionAcademica
                        )
                        .input('idDocente', docenteAnalisis.idDocente)
                        .input('idVirtual', virtualID).query(`
                                BEGIN
                                UPDATE [dbo].[ad_programacionAcademica]  
                                SET idAula = idAulaInicial, aulaModificada = NULL
                                WHERE idSede = @idVirtual 
                                AND  idDocente = @idDocente 
                                AND uuuidProgramacionAcademica=@uuuidProgramacionAcademica
                                AND aulaModificada IS NOT NULL  
                                AND idVersion = @idVersion 
                                AND idPeriodo = @id;
                                
                                UPDATE [dbo].[ad_programacionAcademica]  
                                SET idDocente = NULL , docenteModificado=NULL
                                WHERE idDocente = @idDocente 
                                AND uuuidProgramacionAcademica=@uuuidProgramacionAcademica
                                AND idPeriodo = @id
                                AND idVersion = @idVersion;
                                END `);

                      continue;
                    }
                  }
                }
              }
            }

            for (const programacionAnailis of RevisarProgramacion) {
              const resultOneProgramacion = await pool
                .request()
                .input('id', periodo)
                .input('idVersion', nuevaIdVersion)
                .input('uuidProgramacionAcademica', programacionAnailis).query(`
                  SELECT  cancelado, vigente FROM [dbo].[ad_programacionAcademica]
                  WHERE uuuidProgramacionAcademica = @uuidProgramacionAcademica  AND idPeriodo = @id 
                  AND idVersion= @idVersion`);

              if (
                resultOneProgramacion.recordset[0]?.cancelado == true ||
                resultOneProgramacion.recordset[0]?.vigente == false
              ) {
                console.log('Desasignar Docente de ' + programacionAnailis);
                await pool
                  .request()
                  .input('id', periodo)
                  .input('idVersion', nuevaIdVersion)
                  .input('uuidProgramacionAcademica', programacionAnailis)
                  .input('idVirtual', virtualID).query(`
                  BEGIN

                    UPDATE [dbo].[ad_programacionAcademica]  
                    SET idDocente = NULL , docenteModificado=NULL
                    WHERE uuuidProgramacionAcademica = @uuidProgramacionAcademica 
                    AND idPeriodo = @id
                    AND idVersion = @idVersion;
              
                    UPDATE [dbo].[ad_programacionAcademica]
                    SET idAula = idAulaInicial, aulaModificada = NULL
                    WHERE idSede = @idVirtual 
                    AND  uuuidProgramacionAcademica = @uuidProgramacionAcademica 
                    AND aulaModificada IS NOT NULL  
                    AND idVersion = @idVersion 
                    AND idPeriodo = @id;
                  END
  `);
              }
            }

            // actualizar todos esos luego de Hacer los cambios
            for (const evento of listaEventos) {
              //actualiza el estado de cada evento despues de incorporarlo
              await pool
                .request()
                .input('id', periodo)
                .input('idEvento', evento.indice)
                .query(
                  `UPDATE ad_evento  SET estado=1 , fechaCambio=DATEADD(HOUR, -5, GETDATE())  WHERE periodo=@id and indice=@idEvento`
                );
            }
          }
          if (listaEventos.length === 0) {
            console.log('No Hay eventos');
          }
        }

        // actualizar las dicta clase de los docentes

        await pool.request().input('id', periodo)
          .query(`UPDATE  [dbo].[ad_docente] set dictaClase =(CASE 
           WHEN EXISTS (SELECT top 1 * 
                        FROM [dbo].[LibroPorDocente] 
                        WHERE [dbo].[LibroPorDocente].DocenteID = ad_docente.idDocente) 
           THEN 1 
           ELSE 0 
       END)         WHERE periodo=@id`);
      }

      if (tipo == 'total') {
        // se crea la version por que es un reproceso total
        const resultNewVersion = await pool
          .request()
          .input('idPeriodo', sql.Int, periodo)
          .input('nombreCreador', sql.VarChar, correo)
          .execute('ad_crearVersion');

        const nuevaIdVersion = resultNewVersion.recordset[0].nuevoIdVersion;
        // COPIAR LA PROGRAMACIÓN CURSO Y AGREGARLE UNA NUEVA VERSIÓN
        await pool
          .request()
          .input('periodo', sql.Int, periodo)
          .input('idVersion', sql.Int, nuevaIdVersion)
          .execute('ad_copiarProgramacionAcademicaConNuevaVersion');
      }

      // obtener el max id version del periodo en actividad academica

      const resultadoVersion = await pool
        .request()
        .input('id', periodo)
        .query(
          `SELECT Max(idVersion) as Lastversion FROM [dbo].[ad_programacionAcademica] where idPeriodo =@id`
        );

      const version = resultadoVersion.recordset[0]?.Lastversion;

      // P3:  Obtener orden de sedes

      // obtener ID SEDE VIRTUAL

      const resultadoIDVirtual = await pool
        .request()
        .input('id', periodo)
        .input('uidVirtual', uidIdSede)
        .query(
          `SELECT idSede FROM [dbo].[ad_sede] where uidIdSede = @uidVirtual and  nombreSede = 'Virtual'    and periodo=@id`
        );

      const virtualID = resultadoIDVirtual.recordset[0]?.idSede;

      console.log('virtual: ' + virtualID);
      const resultadoSedes = await pool
        .request()
        .input('id', periodo)
        .input('virtualID', virtualID)
        .query(
          ` SELECT
                    S.idSede,
                    S.NombreSede,
                    SUM(CASE WHEN TC.TipoJornada = 'FT' THEN 1 ELSE 0 END) AS FT,
                    SUM(CASE WHEN TC.TipoJornada = 'PT' THEN 1 ELSE 0 END)  AS PT,
                    ROUND(
                    (
                    (
                    (SUM(CASE WHEN TC.TipoJornada = 'PT' THEN 1 ELSE 0 END) / 3.0) +
                    SUM(CASE WHEN TC.TipoJornada = 'FT' THEN 1 ELSE 0 END)
                    ) /
                    (
                    (
                    (SELECT COUNT(TC2.TipoJornada)
                    FROM [dbo].[ad_docente] AS D2
                    INNER JOIN [dbo].[dim_tipo_contrato] AS TC2 ON D2.idTipoContrato = TC2.TipoContratoID
                    LEFT JOIN [dbo].[disponibilidad_docente] AS DD 
                    ON DD.DocenteID = D2.idDocente AND DD.PeriodoAcademico = @id
                    WHERE TC2.TipoJornada = 'PT' AND  D2.idSede IS NOT NULL AND  D2.vigente IS NOT NULL AND
                    D2.vigente = 1 AND  D2.periodo=@id 
                    AND ( DD.EstadoDisponible=1 OR DD.EstadoDisponible IS NULL) 
                    
                    AND  D2.idSede <> @virtualID  AND D2.dictaClase=1 
                    
                        ) / 3.0
                    ) +
                    (SELECT COUNT(TC2.TipoJornada)
                    FROM [dbo].[ad_docente] AS D2
                    INNER JOIN [dbo].[dim_tipo_contrato] AS TC2 ON D2.idTipoContrato = TC2.TipoContratoID
                    LEFT JOIN [dbo].[disponibilidad_docente] AS DD 
                    ON DD.DocenteID = D2.idDocente AND DD.PeriodoAcademico = @id
                    WHERE  TC2.TipoJornada = 'FT' AND  D2.idSede IS NOT NULL AND  D2.vigente IS NOT NULL AND
                    D2.vigente = 1 
                    AND ( DD.EstadoDisponible=1 OR DD.EstadoDisponible IS NULL) 
                    
                    AND  D2.idSede <>@virtualID and  D2.periodo=@id AND D2.dictaClase=1  )
                    )
                    )*100 ,3)
                    
                    AS Ratio
                    FROM
                    [dbo].[ad_docente] AS D
                    INNER JOIN
                    [dbo].[dim_tipo_contrato] AS TC ON D.idTipoContrato = TC.TipoContratoID
                    INNER JOIN
                    [dbo].[ad_sede] AS S ON D.idSede = S.idSede and S.periodo=@id
                    LEFT JOIN [dbo].[disponibilidad_docente] AS DD 
                    ON DD.DocenteID = D.idDocente AND DD.PeriodoAcademico = @id
                    WHERE
                    D.idSede IS NOT NULL AND  D.vigente IS NOT NULL AND  D.vigente = 1
                    AND  D.idSede <> @virtualID
                    and  D.periodo=@id
                    AND D.dictaClase=1
                    AND S.vigente=1
                    AND ( DD.EstadoDisponible=1 OR DD.EstadoDisponible IS NULL) 
                    GROUP BY
                    S.idSede,
                    S.NombreSede
                    UNION ALL
                    SELECT
                    @virtualID AS idSede,
                    'Virtual' AS NombreSede,
                    0 AS FT,
                    0 AS PT,
                    0.000 AS Ratio
                    ORDER BY
                    Ratio DESC;
      `
        );

      const sedesArray = resultadoSedes.recordset;

      console.log(sedesArray);

      if (tipo == 'total') {
        await pool.request().input('id', periodo).input('idVersion', version).query(`
                  UPDATE ad_programacionAcademica 
                  SET idDocente = NULL
                  WHERE  docenteModificado is null and idVersion=@idVersion and idPeriodo=@id `);
        await pool
          .request()
          .input('id', periodo)
          .input('idVersion', version)
          .input('idVirtual', virtualID).query(`
                  UPDATE ad_programacionAcademica 
                  SET idAula = idAulaInicial,  aulaModificada=null
                  WHERE  idSede=@idVirtual and  aulaModificada is not null  and docenteModificado is null  and idVersion=@idVersion and idPeriodo=@id`);
      }

      // P4: Iteración por sede
      let aux_slotsRecorridos = dataAvance[0].slotsRecorridos;
      const resultadoEscenariosActivos = await pool
        .request()
        .query(`SELECT  * FROM [dbo].[ad_escenario] where activo=1`);

      const ListaEscenario = resultadoEscenariosActivos.recordset;

      const resultCantidadSlots = await pool
        .request()
        .input('id', periodo)
        .input('idVersion', version).query(`
                    SELECT  count(*) as cantidad FROM [dbo].[ad_programacionAcademica]
                        		WHERE
                        		cancelado=0
                        		AND vigente = 1
                        		AND idPeriodo = @id
                        		AND idVersion=@idVersion
                        		AND idDocente IS NULL
                 `);

      const cantidadSlots = resultCantidadSlots.recordset[0];

      await sql.query`UPDATE ad_avanceAlgoritmo
                                          SET totalSlots = ${cantidadSlots.cantidad}
                                          WHERE idPeriodo = ${periodo};`;

      for (const sede of sedesArray) {
        if (Number(dataAvance[0].idSede) != Number(sede.idSede) && flagAvance === true) {
          continue;
        }

        console.log(
          '#################| SEDE: ' +
            sede.idSede +
            '-' +
            sede.NombreSede +
            ' |#################'
        );

        const resultCursos = await pool
          .request()
          .input('id', periodo)
          .input('idSede', sede.idSede)
          .input('idVersion', version).query(`
                      SELECT DISTINCT P.*,
                       FORMAT(CONVERT(DATETIME, p.inicioClase), 'dd-MM-yyyy') AS InicioClase,
                       FORMAT(CONVERT(DATETIME, p.finalClase), 'dd-MM-yyyy') AS FinClase,
                        H.HorarioInicio, H.HorarioFin, H.MinutosReal  , aux.NumDias,
                        (H.MinutosReal  * aux.NumDias) AS minutosTotales,   F.NombreFrecuencia, F.NombreAgrupFrecuencia,
                         (F.CantidadDiasSemanales * H.MinutosReal ) AS  minutosTotalesSemanales,
                         (SELECT COUNT(*)
                         FROM [dbo].[ad_programacionAcademica] AS PC
                         WHERE PC.idHorario = P.idHorario
                           AND PC.idPeriodo =@id
                           AND PC.idVersion=@idVersion
                           AND PC.idSede= @idSede ) AS numeroCursos,
                        (SELECT COUNT(*)
                         FROM [dbo].[LibroPorDocente]
                         WHERE CursoID = P.idCurso) AS intencidadDocente
                    FROM [dbo].[ad_programacionAcademica] P
                    INNER JOIN [dbo].[ad_horario] AS H
                      ON P.idHorario = H.idHorario AND H.periodo=@id
                    INNER JOIN [dbo].[ad_frecuencia] AS F
                      ON P.idFrecuencia = F.idFrecuencia AND F.periodo=@id
                  LEFT JOIN [dbo].[ad_curso] as C
               ON C.idCurso= P.idCurso AND C.periodo=@id
              OUTER APPLY ( SELECT CASE WHEN C.DuracionClase = 1 THEN 
              (SELECT SUM(aux.NumDias) FROM [dbo].[aux_intensidad_fase] AS aux
               WHERE P.uidIdIntensidadFase = aux.uididintensidadfase AND P.idPeriodo = aux.PeriodoAcademico) 
               ELSE 
               (SELECT TOP 1 aux.NumDias FROM [dbo].[aux_intensidad_fase] AS aux WHERE P.uidIdIntensidadFase = aux.uididintensidadfase 
              	AND P.idPeriodo = aux.Periodo)  
                END AS NumDias 
                ) AS aux    

                    WHERE
                    P.cancelado=0
                    AND P.vigente = 1
                    AND P.idPeriodo = @id
                    AND P.idVersion=@idVersion
                    AND P.idSede =  @idSede
                     AND P.idDocente is null
                    ORDER BY
                        H.HorarioInicio,
                        P.idHorario,
                        intencidadDocente ASC,
                        minutosTotales DESC;`);

        const cursosXsedeArray = resultCursos.recordset;

        // si no hay cursos ir al siguiente
        if (cursosXsedeArray.length === 0) {
          continue;
        }

        // Llamada a consultas estaticas

        const resultH = await pool.request().input('id', periodo).input('version', version)
          .query(`
               SELECT distinct PA.idHorario, H.HorarioInicio, H.HorarioFin FROM [dbo].[ad_programacionAcademica] AS PA
            INNER JOIN [dbo].[ad_horario] AS H ON H.idHorario=PA.idHorario AND H.periodo=@id
             where PA.idPeriodo=@id and  PA.idVersion =@version  and PA.vigente=1 and PA.cancelado=0
      `);

        const resultadoHorario = resultH.recordset;

        // CALCULO DE HORARIOS SOLAPADOS

        const horariosMap = new Map<number, number[]>();

        resultadoHorario.forEach((horario1) => {
          const rango = `${horario1.HorarioInicio} - ${horario1.HorarioFin}`;
          const solapados: number[] = [];

          resultadoHorario.forEach((horario2) => {
            if (horario1.idHorario !== horario2.idHorario) {
              if (solapamientoHorario(rango, horario2.HorarioInicio, horario2.HorarioFin)) {
                solapados.push(horario2.idHorario);
              }
            }
          });

          if (solapados.length > 0) {
            horariosMap.set(horario1.idHorario, solapados);
          } else {
            horariosMap.set(horario1.idHorario, []);
          }
        });
        // CALCULO DE FREUENCIA SOLAPADOS

        const resultFrecuencia = await pool
          .request()
          .input('id', periodo)
          .input('version', version).query(`
    SELECT distinct PA.idFrecuencia, F.NombreFrecuencia, F.NombreAgrupFrecuencia FROM [dbo].[ad_programacionAcademica] AS PA
            INNER JOIN [dbo].[ad_frecuencia] AS F ON F.idFrecuencia=PA.idFrecuencia AND F.periodo=@id
             where PA.idPeriodo=@id and  PA.idVersion =@version  and PA.vigente=1 and PA.cancelado=0
      `);

        const resultadoFrecuencia = resultFrecuencia.recordset;

        const frecuenciaMap = new Map<number, number[]>();

        resultadoFrecuencia.forEach((frecuencia1) => {
          const solapados: number[] = [];

          resultadoFrecuencia.forEach((frecuencia2) => {
            if (frecuencia1.idFrecuencia !== frecuencia2.idFrecuencia) {
              if (
                solapamientoFrecuencia(
                  frecuencia1.NombreAgrupFrecuencia,
                  frecuencia2.NombreAgrupFrecuencia
                )
              ) {
                solapados.push(frecuencia2.idFrecuencia);
              }
            }
          });

          if (solapados.length > 0) {
            frecuenciaMap.set(frecuencia1.idFrecuencia, solapados);
          } else {
            frecuenciaMap.set(frecuencia1.idFrecuencia, []);
          }
        });

        console.log('Numero de slots : ' + cursosXsedeArray.length);

        //   // P5: Iteración por escenarios

        for (const escenario of ListaEscenario) {
          if (flagAvance && dataAvance[0].escenario != escenario.escenario) {
            continue;
          }

          //      Contador de slots
          let i = 0;
          const orderByClause = escenario.logica;

          let ordenDisponibilidadVirtuales: { idSede: string }[] = [];
          let iteradorOrden = 0;

          let x = 0;
          reiniciar: for (; x < cursosXsedeArray.length; x++) {
            const cursosXsede = cursosXsedeArray[x];

            i = i + 1;
            if (dataAvance[0].idSlot != cursosXsede.uuuidProgramacionAcademica && flagAvance) {
              continue;
            }

            if (
              i == cursosXsedeArray.length &&
              aux_slotsRecorridos + cursosXsedeArray.length < aux_slotsRecorridos
            ) {
              aux_slotsRecorridos += cursosXsedeArray.length;
            }

            if (flagAvance === true) {
              flagAvance = false;
              continue;
            }

            console.log(
              '####################################### NUMERO DE FILA:  ' +
                i +
                '- ' +
                'escenario [' +
                escenario.escenario +
                ']' +
                '+ sede[' +
                sede.NombreSede +
                '] ###################################################'
            );

            console.log(cursosXsede);

            if (Number(sede.idSede) === virtualID) {
              const resultadoDisponibilidadVirtuales = await pool
                .request()
                .input('id', periodo)
                .input('virtualID', virtualID)
                .input('idVersion', sql.Int, version)
                .input('escenario', escenario.escenario).query(`
                               WITH CTE_MediaPorDocente AS (
                                  SELECT
                                      D.idDocente,
                                      D.idSede,
                                     	ISNULL( SUM(H.MinutosReal * aux.NumDias),0) AS MinutosAsignados,
                                      TC.TipoJornada,
                                      TC.HoraSemana,
                                     ISNULL (
                                  	(
                                          ISNULL(
                                              (SELECT SUM(tiempoCurso)
                                               FROM [dbo].[ad_pivoteAsignacion]
                                               WHERE escenario = @escenario
                                                 AND idSede = @virtualID
                                                 AND idPeriodo = @id
                                                 AND flagVigente = 1
                                                 AND idDocente = P.idDocente
                                              ), 0
                                          ) + ISNULL(SUM(H.MinutosReal * aux.NumDias), 0)
                                      ) / CAST((TC.HoraSemana * 60 * 4) AS DECIMAL(10, 2)) * 100 ,0)   AS Media
                                  
                                  FROM   [dbo].[ad_docente] AS D 
                                  LEFT JOIN [dbo].[ad_programacionAcademica] AS P 
                                      ON  P.idDocente = D.idDocente 
                                      AND P.idPeriodo = @id
                                      AND P.idVersion = @idVersion
                                      AND P.cancelado = 0
                                      AND P.vigente = 1
                                      
                                  LEFT JOIN [dbo].[ad_horario] AS H 
                                      ON P.idHorario = H.idHorario 
                                      AND H.periodo = @id
                                  LEFT JOIN [dbo].[disponibilidad_docente] AS DD 
                                  ON DD.DocenteID = D.idDocente AND DD.PeriodoAcademico = @id
                                  LEFT JOIN [dbo].[dim_tipo_contrato] AS TC 
                                      ON TC.TipoContratoID = D.idTipoContrato
                                  LEFT JOIN [dbo].[ad_frecuencia] AS F 
                                      ON P.idFrecuencia = F.idFrecuencia 
                                      AND F.periodo = @id
                                      LEFT JOIN [dbo].[ad_curso] as C
                                  ON C.idCurso= P.idCurso AND C.periodo=@id
              OUTER APPLY ( SELECT CASE WHEN C.DuracionClase = 1 THEN 
              (SELECT SUM(aux.NumDias) FROM [dbo].[aux_intensidad_fase] AS aux
               WHERE P.uidIdIntensidadFase = aux.uididintensidadfase AND P.idPeriodo = aux.PeriodoAcademico) 
               ELSE 
               (SELECT TOP 1 aux.NumDias FROM [dbo].[aux_intensidad_fase] AS aux WHERE P.uidIdIntensidadFase = aux.uididintensidadfase 
              	AND P.idPeriodo = aux.Periodo)  
                END AS NumDias 
                ) AS aux    
                                  WHERE
                                      D.vigente = 1	
                                      AND D.idSede <> @virtualID
                                      AND D.periodo = @id
                                      AND D.dictaClase=1
                                       AND ( DD.EstadoDisponible=1 OR DD.EstadoDisponible IS NULL) 
                                  GROUP BY
                                      D.idDocente,
                                      TC.TipoJornada,
                                      TC.HoraSemana,
                                      D.idSede,
                                      P.idDocente
                                  )
                                  SELECT
                                  idSede,
                                  ROUND(SUM(Media) / COUNT(idDocente), 2) AS MediaPonderada,
                                  ROUND(100 - (SUM(Media) / COUNT(idDocente)), 2) AS Disponibilidad
                                  FROM CTE_MediaPorDocente 
                                  GROUP BY idSede
                                  ORDER BY MediaPonderada ; 
                                    `);

              ordenDisponibilidadVirtuales = resultadoDisponibilidadVirtuales.recordset;
            }

            if (ordenDisponibilidadVirtuales.length > 0) {
              console.log(
                'PROBANDO ASIGNARLE UN PROFESOR DE LA SEDE : ' +
                  ordenDisponibilidadVirtuales[iteradorOrden].idSede
              );
            }

            const fId = cursosXsede.idFrecuencia;
            const hid = cursosXsede.idHorario;
            let cadenaPC = '';
            let cadenaTA = '';

            const arraryFrecuencias = frecuenciaMap.get(Number(fId)) || [Number(fId)];
            const arraryHorario = horariosMap.get(Number(hid)) || [Number(hid)];

            arraryFrecuencias.forEach((element1) => {
              arraryHorario.forEach((element2) => {
                cadenaPC += maquetarDatos(element1.toString(), element2.toString(), 'PC');
              });
            });

            arraryFrecuencias.forEach((element1) => {
              arraryHorario.forEach((element2) => {
                cadenaTA += maquetarDatos(element1.toString(), element2.toString(), 'TA');
              });
            });

            const resultDocentes = await pool
              .request()
              .input('OrderBy', sql.NVarChar, orderByClause)
              .input('dinamicPC', sql.NVarChar, cadenaPC)
              .input('dinamicTA', sql.NVarChar, cadenaTA)
              .input('minutosTotales', sql.Int, cursosXsede.minutosTotales)
              .input('idCurso', sql.Int, cursosXsede.idCurso)
              .input('idHorario', sql.Int, cursosXsede.idHorario)
              .input('idPeriodo', sql.Int, periodo)
              .input(
                'idPeriodoDiferido',
                sql.Int,
                calcularCodigoAnterior(periodo?.toString() || '', 2)
              )
              .input('Escenario', sql.VarChar, escenario.escenario)
              .input('idFrecuencia', sql.Int, cursosXsede.idFrecuencia)
              .input('idSedeVirtual', sql.Int, virtualID)
              .input('idVersion', sql.Int, version)
              .input(
                'idSede',
                sql.Int,
                Number(sede.idSede) !== virtualID
                  ? sede.idSede
                  : ordenDisponibilidadVirtuales[iteradorOrden].idSede
              )
              .input('sedeVirtual', sql.Bit, Number(sede.idSede) === virtualID ? 1 : 0)
              .execute('ad_obtenerDocentesDisponiblesXsede');

            const ListaDocentes = resultDocentes.recordset;

            // FLAG DE INSERCCIÓN
            let docenteAsignado = false;

            for (const docente of ListaDocentes) {
              //P7.1: Validar Cumplimiento de Horas a Asignar

              //P.7.1.1 VALIDAR NO CUMPLIENTO DE HORAS SEMANALES A ASIGNAR

              // RECUENTO MINUTOS SEMANALES
              // N° DIAS MAX CLASE SEMANA * minutos REALES  , AGRUPADO POR DOCENTE, > MAX HORAS

              console.log('Minutos Semanales Acumulado: ' + docente.totalTiempoSemanal);
              console.log('Minutos Semanales Curso: ' + cursosXsede.minutosTotalesSemanales);

              if (
                Number(docente.totalTiempoSemanal) +
                  Number(cursosXsede.minutosTotalesSemanales) >
                (docente.TipoJornada == 'FT' ? MAX_HORAS_FT : MAX_HORAS_PT) * 60
              ) {
                console.log('continue - P7.1 - SEMANAL');
                continue;
              }

              if (
                Number(docente.totalTiempo) + Number(cursosXsede.minutosTotales) >
                (docente.TipoJornada == 'FT' ? MAX_HORAS_FT : MAX_HORAS_PT) * 4 * 60
              ) {
                console.log('continue - P7.1 -MENSUAL');
                continue;
              }

              console.log('Paso 7.1 susccess');
              //P7.2: Validar Cumplimiento de Disponibilidad (durante todo el curso).

              const docenteDisponibleData = disponibilidadDocente.filter(
                (item: disponibilidadDocenteInterface) =>
                  item.DocenteID == Number(docente.idDocente)
              );

              if (docenteDisponibleData.length > 0) {
                const respuesta = docenteDisponibleData.every(
                  (item: disponibilidadDocenteInterface) => {
                    if (Number(item.EstadoDisponible) == 1) {
                      return true;
                    }
                    return disponibleEnFecha(
                      item?.FechaInicio,
                      item?.FechaFin,
                      cursosXsede.InicioClase,
                      cursosXsede.FinClase
                    );
                  }
                );

                if (!respuesta) {
                  console.log('continue - P7.2');
                  continue;
                }
              }

              console.log('Paso 7.2 susccess');

              const BloquesBloqueados = BloquesBloqueadosCompletos.filter(
                (horario: { DocenteID: number }) => horario.DocenteID == docente.idDocente
              );

              if (BloquesBloqueados.length > 0) {
                const respuesta = BloquesBloqueados.every(
                  (item: { CodigoBloque: string; bloque: string }) => {
                    return !solapaHorarioBloqueado(
                      item.CodigoBloque,
                      cursosXsede.NombreAgrupFrecuencia,
                      item.bloque,
                      cursosXsede.HorarioInicio,
                      cursosXsede.HorarioFin
                    );
                  }
                );

                if (!respuesta) {
                  console.log('continue - P7.3');
                  continue;
                }
              }

              console.log('Paso 7.3 susccess');
              //P7.4: Validar el No Solapamiento de clases.
              const resultadoClasesAsignadas = await pool
                .request()
                .input('id', periodo)
                .input('idDocente', docente.idDocente)
                .input('idVersion', version)
                .input('escenario', escenario.escenario).query(`
                                      SELECT
                                      idSede,
                                      idPeriodo,
                                      idCurso,
                                      idFrecuencia,
                                      idHorario,
                                      HorarioInicio,
                                      HorarioFin,
                                      NombreFrecuencia,
                                      NombreAgrupFrecuencia
                                    FROM (
                                        SELECT
                                            S.idSede,
                                            PA.idPeriodo,
                                              PA.idCurso,
                                              PA.idFrecuencia,
                                            PA.idHorario,
                                            H.HorarioInicio,
                                            H.HorarioFin,
                                            F.NombreFrecuencia,
                                            F.NombreAgrupFrecuencia
                                        FROM
                                            [dbo].[ad_pivoteAsignacion] AS PA
                                        INNER JOIN
                                            [dbo].[ad_horario] AS H ON PA.idHorario = H.idHorario AND H.periodo=@id
                                        INNER JOIN
                                            [dbo].[ad_frecuencia] AS F ON PA.idFrecuencia = F.idFrecuencia AND F.periodo=@id
                                        INNER JOIN
                                            [dbo].[ad_sede] AS S ON PA.idSede = S.idSede AND S.periodo=@id
                                        WHERE
                                            PA.idDocente = @idDocente
                                            AND PA.idPeriodo = @id
                                            AND PA.flagVigente = 1
                                            AND PA.escenario = @escenario
                                        AND PA.idVersion=@idVersion

                                        UNION ALL

                                        SELECT
                                            S.idSede,
                                            PA.idPeriodo,
                                            PA.idCurso,
                                            PA.idFrecuencia,
                                            PA.idHorario,
                                            H.HorarioInicio,
                                            H.HorarioFin,
                                            F.NombreFrecuencia,
                                            F.NombreAgrupFrecuencia
                                        FROM
                                            [dbo].[ad_programacionAcademica] AS PA
                                        INNER JOIN
                                            [dbo].[ad_horario] AS H ON PA.idHorario = H.idHorario AND H.periodo=@id
                                        INNER JOIN
                                            [dbo].[ad_frecuencia] AS F ON PA.idFrecuencia = F.idFrecuencia AND F.periodo=@id
                                        INNER JOIN
                                            [dbo].[ad_sede] AS S ON PA.idSede = S.idSede AND S.periodo=@id
                                        WHERE
                                            PA.idDocente = @idDocente
                                            AND PA.idPeriodo =@id
                                        AND PA.idVersion=@idVersion
                                        AND PA.vigente=1
                                        AND PA.cancelado=0
                                    ) AS ClasesAsignadasDocente;
                                    `);

              const ClasesAsignadas = resultadoClasesAsignadas.recordset;

              if (ClasesAsignadas.length > 0) {
                const respuesta = ClasesAsignadas.every(
                  (item: {
                    NombreAgrupFrecuencia: string;
                    HorarioInicio: string;
                    HorarioFin: string;
                  }) => {
                    return !claseSolapada(
                      item.NombreAgrupFrecuencia,
                      item.HorarioInicio,
                      item.HorarioFin,
                      cursosXsede.NombreAgrupFrecuencia,
                      cursosXsede.HorarioInicio,
                      cursosXsede.HorarioFin
                    );
                  }
                );

                if (!respuesta) {
                  console.log('continue P-7.4');
                  continue;
                }
              }
              console.log('Paso 7.4 susccess');

              console.log(
                'Insertar : ' +
                  docente.idDocente +
                  ' en el slot (' +
                  cursosXsede.idCurso +
                  '/ ' +
                  cursosXsede.idHorario +
                  '/ ' +
                  cursosXsede.idFrecuencia +
                  ')'
              );
              docenteAsignado = true;

              await sql.query`INSERT INTO [dbo].[ad_pivoteAsignacion] ( escenario,  idCurso, idFrecuencia,  idDocente,
                         idHorario, tiempoCurso,  idSede, idPeriodo,  seleccionado, flagVigente,  uuuidProgramacionAcademica, idVersion)
                            VALUES (${escenario.escenario},${cursosXsede.idCurso}, ${cursosXsede.idFrecuencia},  ${docente.idDocente} , ${cursosXsede.idHorario}
                            , ${cursosXsede.minutosTotales}, ${sede.idSede},${periodo},0,1,${cursosXsede.uuuidProgramacionAcademica},${version});`;

              await sql.query`UPDATE ad_avanceAlgoritmo
                                          SET idSede = ${sede.idSede},
                                              escenario = ${escenario.escenario},
                                              idSlot = ${
                                                cursosXsede.uuuidProgramacionAcademica
                                              },
                                              idVersion = ${version},
                                              correo=${correo},
                                              slotsRecorridos = ${
                                                i == cursosXsedeArray.length
                                                  ? aux_slotsRecorridos
                                                  : aux_slotsRecorridos + i
                                              }

                                          WHERE idPeriodo = ${periodo};`;

              iteradorOrden = 0;
              break; // docentes
            }

            if (
              ListaDocentes.length === 0 ||
              (ListaDocentes.length !== 0 && docenteAsignado === false)
            ) {
              if (
                Number(sede.idSede) === virtualID &&
                iteradorOrden + 1 < ordenDisponibilidadVirtuales.length
              ) {
                console.log('PROBANDO SIGUIENTE SEDE');
                iteradorOrden++;
                i--;
                x--;
                continue reiniciar;
              }

              await sql.query`INSERT INTO ad_pivoteAsignacion ( escenario,  idCurso, idFrecuencia,  idDocente,
                         idHorario, tiempoCurso,  idSede, idPeriodo,  seleccionado, flagVigente,  uuuidProgramacionAcademica, idVersion)
                            VALUES (${escenario.escenario},${cursosXsede.idCurso}, ${cursosXsede.idFrecuencia}, null , ${cursosXsede.idHorario}
                            , ${cursosXsede.minutosTotales}, ${sede.idSede},${periodo},0,1,${cursosXsede.uuuidProgramacionAcademica},${version});`;

              if (ListaDocentes.length === 0) {
                console.log('No se encontraron docente para el curso: ' + cursosXsede.idCurso);
              }
              console.log(
                'CURSO NO INSERTADO - ' +
                  cursosXsede.idCurso +
                  ' - ' +
                  cursosXsede.NombreFrecuencia
              );

              await sql.query`UPDATE ad_avanceAlgoritmo
                                                  SET idSede = ${sede.idSede},
                                                      escenario = ${escenario.escenario},
                                                      idSlot = ${
                                                        cursosXsede.uuuidProgramacionAcademica
                                                      },
                                                      idVersion = ${version},
                                                      slotsRecorridos = ${
                                                        i == cursosXsedeArray.length
                                                          ? aux_slotsRecorridos
                                                          : aux_slotsRecorridos + i
                                                      },  correo=${correo}
                                                  WHERE idPeriodo = ${periodo};`;
              iteradorOrden = 0;
              continue;
            }

            //FIN  slots x sede
          }
        } // FIN escenarios

        interface escenariosComparacion {
          escenario: string;
          desviacion: number;
        }

        let ListascenariosComparacion: escenariosComparacion[] = [];

        for (const escenario of ListaEscenario) {
          let resultadoAsignacioneXEscenario;

          if (Number(sede.idSede) !== virtualID) {
            resultadoAsignacioneXEscenario = await pool
              .request()
              .input('id', periodo)
              .input('idVersion', version)
              .input('idSede', sede.idSede)
              .input('escenario', escenario.escenario).query(`
                                     WITH DocenteData AS (
                              SELECT
                                  D.idDocente,
                                  D.idTipoContrato AS TipoContratoID,
                                  TC.TipoJornada,
                                  TC.HoraSemana
                              FROM
                                  [dbo].[ad_docente] AS D
                              INNER JOIN
                                  [dbo].[dim_tipo_contrato] AS TC ON D.idTipoContrato = TC.TipoContratoID
                              LEFT JOIN [dbo].[disponibilidad_docente] AS DD 
                    ON DD.DocenteID = D.idDocente AND DD.PeriodoAcademico = @id
                              WHERE
                                  D.idSede = @idSede
                                  AND D.vigente = 1
                                  AND D.dictaClase=1
                          		AND D.periodo=@id
                                  AND ( DD.EstadoDisponible=1 OR DD.EstadoDisponible IS NULL) 

                          )
                          SELECT
                              d.idDocente,
                              d.TipoContratoID,
                              d.TipoJornada,
                              d.HoraSemana,
                              SUM(ISNULL(t1.tiempoCurso, 0)) + ISNULL((
                                  SELECT SUM(H.MinutosReal  * aux.NumDias)
                                  FROM [dbo].[ad_programacionAcademica] t2
                                  INNER JOIN [dbo].[ad_horario] H ON t2.idHorario = H.idHorario AND H.periodo=@id
                                  
                                   LEFT JOIN [dbo].[ad_curso] as C
                                                 ON C.idCurso= t2.idCurso AND C.periodo=@id
                                                OUTER APPLY ( SELECT CASE WHEN C.DuracionClase = 1 THEN 
                                                (SELECT SUM(aux.NumDias) FROM [dbo].[aux_intensidad_fase] AS aux
                                                 WHERE t2.uidIdIntensidadFase = aux.uididintensidadfase AND t2.idPeriodo = aux.PeriodoAcademico) 
                                                 ELSE 
                                                 (SELECT TOP 1 aux.NumDias FROM [dbo].[aux_intensidad_fase] AS aux WHERE t2.uidIdIntensidadFase = aux.uididintensidadfase 
                                                	AND t2.idPeriodo = aux.Periodo)  
                                                  END AS NumDias 
                                                  ) AS aux    
                                  WHERE
                                      t2.idDocente = d.idDocente
                                      AND t2.idPeriodo = @id
                          			AND t2.idVersion=@idVersion
                              ), 0) AS totalTiempo
                          FROM
                              DocenteData d
                          LEFT JOIN
                              [dbo].[ad_pivoteAsignacion] t1 ON d.idDocente = t1.idDocente
                              AND t1.escenario = @escenario
                              AND t1.idSede = @idSede
                              AND t1.idPeriodo = @id
                              AND t1.flagVigente = 1
                          	AND t1.idVersion=@idVersion
                          GROUP BY
                              d.idDocente, d.TipoContratoID, d.TipoJornada, d.HoraSemana;
                                    `);
          } else {
            resultadoAsignacioneXEscenario = await pool
              .request()
              .input('id', periodo)
              .input('idVersion', version)
              .input('idSede', sede.idSede)
              .input('escenario', escenario.escenario).query(`
                              WITH DocenteData AS (
                                  SELECT DISTINCT
                                      ClasesAsignadasDocente.idSede,
                                      ClasesAsignadasDocente.idDocente,
                                      TC.TipoJornada,
                                      TC.HoraSemana,
                                      D.idTipoContrato AS TipoContratoID
                                  FROM (
                                      SELECT
                                          TA.idSede,
                                          TA.idDocente
                                      FROM
                                          [dbo].[ad_pivoteAsignacion] AS TA
                                      WHERE
                                          TA.idPeriodo = @id
                                          AND TA.flagVigente = 1
                              			AND TA.idVersion=@idVersion
                                          AND (TA.escenario = @escenario AND TA.idSede = @idSede)

                                      UNION ALL

                                      -- Segundo bloque: datos de ad_programacionAcademica
                                      SELECT
                                          PC.idSede,
                                          PC.idDocente
                                      FROM
                                          [dbo].[ad_programacionAcademica] AS PC
                                      WHERE
                                          PC.idPeriodo = @id
                                          AND PC.idSede = @idSede
                              			AND PC.idVersion=@idVersion
                                    AND PC.idDocente is not null
                                  ) AS ClasesAsignadasDocente
                                  INNER JOIN [dbo].[ad_docente] AS D ON ClasesAsignadasDocente.idDocente = D.idDocente AND D.periodo=@id AND D.dictaClase=1
                                  INNER JOIN [dbo].[dim_tipo_contrato] AS TC ON D.idTipoContrato = TC.TipoContratoID
                              )

                              SELECT
                                  d.idDocente ,
                                  d.TipoContratoID,
                                  d.TipoJornada,
                                  d.HoraSemana,
                                  SUM(ISNULL(t1.tiempoCurso, 0)) + ISNULL((
                                      SELECT SUM(H.MinutosReal * aux.NumDias)
                                      FROM [dbo].[ad_programacionAcademica] t2
                                      INNER JOIN [dbo].[ad_horario] H ON t2.idHorario = H.idHorario AND H.periodo=@id
                                      
                                       LEFT JOIN [dbo].[ad_curso] as C
                                       ON C.idCurso= t2.idCurso AND C.periodo=@id
                                      OUTER APPLY ( SELECT CASE WHEN C.DuracionClase = 1 THEN 
                                      (SELECT SUM(aux.NumDias) FROM [dbo].[aux_intensidad_fase] AS aux
                                       WHERE t2.uidIdIntensidadFase = aux.uididintensidadfase AND t2.idPeriodo = aux.PeriodoAcademico) 
                                       ELSE 
                                       (SELECT TOP 1 aux.NumDias FROM [dbo].[aux_intensidad_fase] AS aux WHERE t2.uidIdIntensidadFase = aux.uididintensidadfase 
                                      	AND t2.idPeriodo = aux.Periodo)  
                                        END AS NumDias 
                                        ) AS aux    
                                      WHERE
                                          t2.idDocente = d.idDocente
                                          AND t2.idPeriodo = @id
                              			AND t2.idVersion=@idVersion
                              			AND t2.vigente=1
                              			AND t2.cancelado=0
                                  ), 0) AS totalTiempo
                              FROM
                                  DocenteData d
                              LEFT JOIN
                                  [dbo].[ad_pivoteAsignacion] t1 ON d.idDocente = t1.idDocente
                                  AND t1.escenario = @escenario
                                  AND t1.idSede = @idSede
                                  AND t1.idPeriodo = @id
                                  AND t1.flagVigente = 1
                              	AND t1.idVersion=@idVersion
                              GROUP BY
                                  d.idDocente, d.TipoContratoID, d.TipoJornada, d.HoraSemana;

                                    `);
          }

          const AsignacioneXEscenario = resultadoAsignacioneXEscenario.recordset;

          const ratioDocente = AsignacioneXEscenario.map(
            (docente: { totalTiempo: number; HoraSemana: number }) =>
              docente.totalTiempo / (docente.HoraSemana * 60 * 4)
          );

          const media =
            ratioDocente.reduce((acc: number, ratio: number) => acc + ratio, 0) /
            ratioDocente.length;

          const sumaCuadrados = ratioDocente.reduce(
            (acc: number, ratio: number) => acc + Math.pow(ratio - media, 2),
            0
          );
          const varianza = sumaCuadrados / ratioDocente.length;
          const desviacionEstandar = Math.sqrt(varianza);

          console.log(
            'La desviación estándar del escenario ' + escenario.escenario + ' es ',
            desviacionEstandar
          );

          ListascenariosComparacion.push({
            escenario: escenario.escenario,
            desviacion: desviacionEstandar,
          });
        }

        const MenorDesviacion = ListascenariosComparacion.reduce((menor, actual) => {
          return actual.desviacion < menor.desviacion ? actual : menor;
        });

        console.log(
          'ESCENARIO ESCOGIDO: ' +
            MenorDesviacion.escenario +
            ' con desviación standar de: ' +
            MenorDesviacion.desviacion
        );

        console.log(
          periodo + ' | ' + version + ' | ' + MenorDesviacion.escenario + ' | ' + sede.idSede
        );

        await pool
          .request()
          .input('id', periodo)
          .input('idversion', version)
          .input('escenario', MenorDesviacion.escenario)
          .input('idSede', sede.idSede).query(`
               BEGIN TRANSACTION;

                UPDATE [dbo].[ad_pivoteAsignacion]
                    SET seleccionado = 1
                    WHERE
                      escenario = @escenario
                      AND idPeriodo = @id
                      AND idVersion= @idversion
                      AND idSede = @idSede
                      AND flagVigente = 1; 
              
              MERGE INTO [dbo].[ad_programacionAcademica] AS PC
                USING [dbo].[ad_pivoteAsignacion] AS TA
                ON PC.uuuidProgramacionAcademica = TA.uuuidProgramacionAcademica
                   AND TA.escenario = @escenario
                   AND TA.idPeriodo = @id
                   AND TA.idSede = @idSede
                   AND TA.idVersion = @idversion
                   AND TA.flagVigente = 1
                   AND TA.seleccionado = 1
                   AND PC.idperiodo = @id AND PC.idversion = @idversion
                WHEN MATCHED AND PC.idperiodo = @id AND PC.idversion = @idversion THEN
                    UPDATE SET PC.idDocente = TA.idDocente;
                
          
              UPDATE ad_pivoteAsignacion
              SET flagVigente = 0
              WHERE idPeriodo = @id 
                AND idSede = @idSede
                AND idVersion = @idversion;
          
    COMMIT TRANSACTION; `);

        //   FIN sedes
      }

      console.log(
        '############################################# FIN ###################################################'
      );

      // Limpiar el registro de Avance Algoritmo al finalizar
      await sql.query`UPDATE ad_avanceAlgoritmo
                                    SET idSede = null,
                                        escenario = null,
                                        idSlot = null,
                                        idVersion=null,
                                        correo=null,
                                        slotsRecorridos =0,
                                        totalSlots =null
                                    WHERE idPeriodo = ${periodo};`;

      await pool
        .request()
        .input('id', periodo)
        .query(`UPDATE [dbo].[ad_periodo] SET estado='ACTIVO'  where idPeriodo=@id`);

      const subject = 'Sistema de Asignación Docente';
      const plainText =
        'Algoritmo de asignación docente terminado exitosamente para el periodo ' +
        periodo +
        'y la versión ' +
        version;

      if (correo) {
        await sendEmail(correo as string, subject, plainText);
      }

      return res.status(200).json({
        message: 'Algoritmo de asignación docente terminado exitosamente',
        data: true,
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
