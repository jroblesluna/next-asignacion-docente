/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../lib/db';

import sql from 'mssql';

const frecuenciaEquivalenteMap: { [key: string]: string } = {
  Diario: 'LV',
  Interdiario: 'MJ',
  'Interdiario L-M': 'LM',
  'Interdiario M-V': 'MV',
  'Interdiario L-M-V': 'LMV',
  Dominical: 'D',
  Sabatino: 'S',
  'Sabatino Dominical': 'SD',
  'Interdiario M-J': 'MJ',
  'Interdiario M-J-S': 'MJS',
  Lunes: 'L',
  Jueves: 'J',
  Martes: 'M',
  Miercoles: 'M',
  Viernes: 'V',
  'Semipresencial A': 'no se está ofreciendo',
  'Interdiario L-S': 'no se está ofreciendo',
  'Semipresencial B': 'no se está ofreciendo',
  'Interdiario X-S': 'no se está ofreciendo',
  'Blended J': 'no se está ofreciendo',
};

const convertirFrecuencia = (frecuencia: string): string => {
  return frecuenciaEquivalenteMap[frecuencia] || 'Frecuencia no encontrada';
};

const obtenerNumerosPorDias = (frecuencia: string): number[] => {
  let numerosDias: number[] = [];

  switch (frecuencia) {
    case 'LMV':
      numerosDias = [1, 3, 5];
      break;

    case 'LV':
      numerosDias = [1, 2, 3, 4, 5];
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
    default:
      throw new Error('Frecuencia no válida');
  }

  return numerosDias;
};

interface disponibilidadDocenteInterface {
  DocenteID: number;
  PeriodoAcademico: number;
  EstadoDisponible: number;
  FechaInicio: string;
  FechaFin: string;
}

const hayNumeroComunEntreArrays = (array1: number[], array2: number[]): boolean => {
  for (const num of array1) {
    if (array2.includes(num)) {
      return true;
    }
  }
  return false;
};

const rangosDeTiempoSeSolapan = (rango1: string, rango2: string): boolean => {
  const convertirTiempoEnMinutos = (tiempo: string): number => {
    const [horas, minutos] = tiempo.split(':').map(Number);
    return horas * 60 + minutos;
  };

  const [inicio1, fin1] = rango1.split(' - ').map(convertirTiempoEnMinutos);
  const [inicio2, fin2] = rango2.split(' - ').map(convertirTiempoEnMinutos);

  return inicio1 < fin2 && inicio2 < fin1;
};

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

  return finRango > inicioHorario && finHorario > inicioRango;
};

const disponibleEnFecha = (
  fechaInicio1: string,
  fechaFinal1: string,
  fechaInicio2: string,
  fechaFinal2: string
) => {
  function convertirFecha(cadenaFecha: string): Date {
    const [dia, mes, año] = cadenaFecha.split('-').map(Number);
    return new Date(año, mes - 1, dia);
  }

  const inicio1 = convertirFecha(fechaInicio1);
  const final1 = convertirFecha(fechaFinal1);
  const inicio2 = convertirFecha(fechaInicio2);
  const final2 = convertirFecha(fechaFinal2);

  return final1 < inicio2 || final2 < inicio1;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    console.log('GET@/pages/api/assignment/getall.ts');
    const pool = await connectToDatabase();

    try {
      const { periodo } = req.query;

      console.log(periodo);

      if (!periodo) {
        return res
          .status(400)
          .json({ message: 'Faltan campos en el query string', data: false });
      }

      const result = await pool
        .request()
        .input('id', periodo)
        .query(`select * from [dbo].[ad_periodo] where idPeriodo=@id`);

      if (result.recordset.length == 0) {
        return res.status(200).json({
          message: 'No existe el  periodo ' + periodo,
          data: 'No existe el  periodo ' + periodo,
        });
      }

      const periodoData = result.recordset[0];
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

      // Actualizar de estado de activo a  cargando

      await pool
        .request()
        .input('id', periodo)
        .query(`UPDATE [dbo].[ad_periodo] SET estado='CARGANDO'  where idPeriodo=@id`);

      // Se Genera el registro de avance si no existe para ese periodo
      await pool.request().input('periodoID', sql.Int, periodo)
        .query(` IF NOT EXISTS (SELECT 1 FROM ad_avanceAlgoritmo WHERE idPeriodo = @periodoID)
                      BEGIN
                        INSERT INTO ad_avanceAlgoritmo  (idSede, escenario, idSlot, idPeriodo, idVersion)
                        VALUES (null, null, null, @periodoID,null);
                      END
                      `);

      let flagAvance = true;

      const resultadoAvance = await pool
        .request()
        .input('id', periodo)
        .query(`SELECT  * FROM [dbo].[ad_avanceAlgoritmo] where idPeriodo=@id`);

      const dataAvance = resultadoAvance.recordset;
      // console.log(dataAvance);
      // console.log(dataAvance[0]?.idSede);
      if (dataAvance[0].idSede === null) {
        flagAvance = false;
      }

      // Logica de creación de versiones

      if (!flagAvance) {
        await pool
          .request()
          .input('idPeriodo', sql.Int, periodo)
          .input('nombreCreador', sql.VarChar, 'sytem')
          .execute('ad_crearVersion');

        // SI NO HAY VERSIÓN PARA ESE PERIODO
        // SE CREA UNA VERSIÓN =1  Y SE HACER UNA COPIA , VERSION 1 , SE PROCIGUE EL ALGORITMO
        //  SI HAY SE CREA UNA VERSION SIGUIENTE Y SE ACTUALIZAN LAS TABLAS EN EL PERIODO , Y LA PROGRAMACIÓN CURSO DADA
      }

      // obtener el max id version del periodo en actividad academica

      const resultadoVersion = await pool
        .request()
        .input('id', periodo)
        .query(
          `SELECT Max(idVersion) as Lastversion FROM [dbo].[ad_programacionAcademica] where idPeriodo =@id`
        );

      const version = resultadoVersion.recordset[0]?.Lastversion;

      // console.log(version);

      // P3:  Obtener orden de sedes

      // await sql.query`INSERT INTO testLogsTiempo (estado, fechaHoraActual, periodo, escenario, sede)
      //               VALUES ('Inicio del Algoritmo', DATEADD(HOUR, -5, GETDATE()), ${periodo}, '-', 1);`;

      // obtener ID SEDE VIRTUAL

      const virtualID = 9268;

      const resultadoSedes = await pool
        .request()
        .input('id', periodo)
        .input('virtualID', virtualID)
        .query(
          `  SELECT
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
      															WHERE TC2.TipoJornada = 'PT' AND  D2.idSede IS NOT NULL AND  D2.vigente IS NOT NULL AND
      															D2.vigente = 1 AND D2.FechaInicioContrato IS NOT NULL  and D2.periodo=@id
      														AND  D2.idSede <> @virtualID ) / 3.0
      													) +
      													(SELECT COUNT(TC2.TipoJornada)
      														FROM [dbo].[ad_docente] AS D2
      														INNER JOIN [dbo].[dim_tipo_contrato] AS TC2 ON D2.idTipoContrato = TC2.TipoContratoID
      														WHERE  TC2.TipoJornada = 'FT' AND  D2.idSede IS NOT NULL AND  D2.vigente IS NOT NULL AND
      															D2.vigente = 1 AND D2.FechaInicioContrato IS NOT NULL
      														AND  D2.idSede <>@virtualID and  D2.periodo=@id  )
      												)
      											)*100 ,3)

      										AS Ratio
      									FROM
      											[dbo].[ad_docente] AS D
      									INNER JOIN
      											[dbo].[dim_tipo_contrato] AS TC ON D.idTipoContrato = TC.TipoContratoID
      									INNER JOIN
      											[dbo].[ad_sede] AS S ON D.idSede = S.idSede and S.periodo=@id
      									WHERE
      											D.idSede IS NOT NULL AND  D.vigente IS NOT NULL AND  D.vigente = 1
      											AND D.FechaInicioContrato IS NOT NULL
      											AND  D.idSede <> @virtualID
      											and  D.periodo=@id
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

      // // P4: Iteración por sede

      const resultadoEscenariosActivos = await pool
        .request()
        .query(`SELECT  * FROM [dbo].[ad_escenario] where activo=1`);

      const ListaEscenario = resultadoEscenariosActivos.recordset;

      // console.log(ListaEscenario[0].logica);
      // console.log(ListaEscenario[0].escenario);

      for (const sede of sedesArray) {
        if (Number(dataAvance[0].idSede) != Number(sede.idSede) && flagAvance === true) {
          continue;
        }

        //   await sql.query`INSERT INTO testLogsTiempo (estado, fechaHoraActual, periodo, escenario, sede)
        //               VALUES ( ${
        //                 'Inicio de la sede ' + sede.NombreSede
        //               }  , DATEADD(HOUR, -5, GETDATE()), ${periodo}, '-', ${sede.SedeID});`;

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
                        H.HorarioInicio, H.HorarioFin, H.MinutosReal, aux.NumDias,
                        (H.MinutosReal * aux.NumDias) AS minutosTotales, F.NombreFrecuencia,
                        (SELECT COUNT(*)
                         FROM [dbo].[ad_programacionAcademica] AS PC
                         WHERE PC.idHorario = P.idHorario
                           AND PC.idPeriodo = @id
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
                    OUTER APPLY (
                    SELECT TOP 1 aux.NumDias
                    FROM [dbo].[aux_intensidad_fase] AS aux
                    WHERE P.uidIdIntensidadFase = aux.uididintensidadfase  and
                		P.idPeriodo = aux.PeriodoAcademico
                		) AS aux
                    WHERE
            				P.cancelado=0
            				AND P.vigente = 1
            				AND P.idPeriodo = @id
      							AND P.idVersion=@idVersion
                    AND P.idSede = @idSede
      							AND P.idDocente IS NULL

                    ORDER BY
                        numeroCursos DESC,
                        P.idHorario,
                        intencidadDocente DESC,
                        minutosTotales DESC;`);

        const cursosXsedeArray = resultCursos.recordset;

        // si no hay cursos ir al siguiente
        if (cursosXsedeArray.length === 0) {
          continue;
        }

        // Llamada a consultas estaticas

        const resultDesponibilidad = await pool.request().input('id', periodo).query(`
                      SELECT DocenteID, PeriodoAcademico,EstadoDisponible,FORMAT(FechaInicio, 'dd-MM-yyyy')
                 as FechaInicio, FORMAT(FechaFin , 'dd-MM-yyyy') as FechaFin
                 FROM [dbo].[disponibilidad_docente]  where  PeriodoAcademico=@id
                        `);

        const disponibilidadDocente = resultDesponibilidad.recordset;

        const docentesMap = new Map<number, disponibilidadDocenteInterface>(
          disponibilidadDocente.map((docente: disponibilidadDocenteInterface) => [
            docente.DocenteID,
            docente,
          ])
        );

        const ObtenerDocenteDisponiblePorID = (
          docenteID: number
        ): disponibilidadDocenteInterface | null => {
          return docentesMap.get(docenteID) || null;
        };

        // Bloques Horarios bloqueados de docente
        const resultHorariosBloquedos = await pool.request().query(`
                                  SELECT hbd.CodigoBloque, hbd.DocenteID, bh.BloqueHorario
                                  FROM [dbo].[horario_bloqueado_docente] hbd
                                  INNER JOIN [dbo].[BloqueHorario] bh
                                      ON hbd.CodigoBloque = bh.bloque
                                    `);
        const BloquesBloqueadosCompletos = resultHorariosBloquedos.recordset;

        console.log('Numero de slots : ' + cursosXsedeArray.length);

        //   // P5: Iteración por escenarios

        for (const escenario of ListaEscenario) {
          if (flagAvance && dataAvance[0].escenario != escenario.escenario) {
            continue;
          }

          //     await sql.query`INSERT INTO testLogsTiempo (estado, fechaHoraActual, periodo, escenario, sede)
          //               VALUES ( ${
          //                 'Inicio de la sede/escenario ' + sede.NombreSede
          //               }  , DATEADD(HOUR, -5, GETDATE()), ${periodo}, ${escenario}, ${
          //       sede.SedeID
          //     });`;

          //     // Contador de slots
          let i = 0;
          const orderByClause = escenario.logica;

          let ordenDisponibilidadVirtuales: { idSede: string }[] = [];
          let iteradorOrden = 0;
          //etiqueta de bucle - utilizado solamente para la sede virtual

          let x = 0;
          reiniciar: for (; x < cursosXsedeArray.length; x++) {
            const cursosXsede = cursosXsedeArray[x];

            i = i + 1;
            if (dataAvance[0].idSlot != cursosXsede.uuuidProgramacionAcademica && flagAvance) {
              continue;
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
                .input('escenario', escenario.escenario).query(`
                                  WITH CTE_MediaPorDocente AS (
                              				SELECT
                              					P.idDocente,
                              					D.idSede,
                              					SUM(H.MinutosReal * aux.NumDias) AS MinutosAsignados,
                              					TC.TipoJornada,
                              					TC.HoraSemana,
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
                              						) + SUM(H.MinutosReal * aux.NumDias)
                              					) / CAST((TC.HoraSemana * 60 * 4) AS DECIMAL(10, 2)) * 100 AS Media

                              				FROM [dbo].[ad_programacionAcademica] AS P
                              				INNER JOIN [dbo].[ad_horario] AS H ON P.idHorario = H.idHorario AND H.periodo=@id
                              				INNER JOIN [dbo].[ad_docente] AS D ON D.idDocente = P.idDocente AND D.periodo=@id
                              				INNER JOIN [dbo].[dim_tipo_contrato] AS TC ON TC.TipoContratoID = D.idTipoContrato
                              				INNER JOIN [dbo].[ad_frecuencia] AS F ON P.idFrecuencia = F.idFrecuencia AND F.periodo=@id
                              				OUTER APPLY (
                              					SELECT TOP 1 aux.NumDias
                              					FROM [dbo].[aux_intensidad_fase] AS aux
                              					WHERE P.uidIdIntensidadFase = aux.uididintensidadfase
                              						AND P.idPeriodo = aux.PeriodoAcademico
                              				) AS aux
                              				WHERE
                              					P.idPeriodo = @id
                              					and p.idVersion=0
                              					AND P.cancelado = 0
                              					AND P.vigente = 1
                              					AND D.idSede <> @virtualID

                              				GROUP BY
                              					P.idDocente,
                              					TC.TipoJornada,
                              					TC.HoraSemana,
                              					D.idSede
                                                              )
                              							SELECT
                              								idSede,
                              								ROUND(SUM(Media) / COUNT(idDocente), 2) AS MediaPonderada,
                              								ROUND(100 - (SUM(Media) / COUNT(idDocente)), 2) AS Disponibilidad

                                                              FROM CTE_MediaPorDocente
                                                              GROUP BY idSede
                                                              ORDER BY MediaPonderada;
                                    `);

              ordenDisponibilidadVirtuales = resultadoDisponibilidadVirtuales.recordset;
            }

            if (ordenDisponibilidadVirtuales.length > 0) {
              console.log(
                'PROBANDO ASIGNARLE UN PROFESOR DE LA SEDE : ' +
                  ordenDisponibilidadVirtuales[iteradorOrden].idSede
              );
            }

            const resultDocentes = await pool
              .request()
              .input('OrderBy', sql.NVarChar, orderByClause)
              .input('minutosTotales', sql.Int, cursosXsede.minutosTotales)
              .input('idCurso', sql.Int, cursosXsede.idCurso)
              .input('idHorario', sql.Int, cursosXsede.idHorario)
              .input('idPeriodo', sql.Int, periodo)
              .input('Escenario', sql.VarChar, escenario.escenario)
              .input('idFrecuencia', sql.Int, cursosXsede.idFrecuencia)
              .input('idSedeVirtual', sql.Int, virtualID)
              .input('idVersion', sql.Int, cursosXsede.idVersion)
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

            //       // FLAG DE INSERCCIÓN
            let docenteAsignado = false;

            for (const docente of ListaDocentes) {
              //P7.1: Validar Cumplimiento de Horas a Asignar
              // console.log(Number(docente.totalTiempo));
              // console.log(Number(cursosXsede.minutosTotales));
              // console.log(Number(docente.HoraSemana));
              if (
                Number(docente.totalTiempo) + Number(cursosXsede.minutosTotales) >
                Number(docente.HoraSemana) * 4 * 60
              ) {
                console.log('continue - P7.1 ');
                continue;
              }

              console.log('Paso 7.1 susccess');
              //         //P7.2: Validar Cumplimiento de Disponibilidad (durante todo el curso).

              const docenteDisponibleData = ObtenerDocenteDisponiblePorID(docente.DocenteID);
              if (
                docenteDisponibleData !== null &&
                docenteDisponibleData.EstadoDisponible === 0 &&
                !disponibleEnFecha(
                  docenteDisponibleData?.FechaInicio,
                  docenteDisponibleData?.FechaFin,
                  cursosXsede.InicioClase,
                  cursosXsede.FinClase
                )
              ) {
                console.log('continue - P7.2');
                continue;
              }
              console.log('Paso 7.2 susccess');

              const BloquesBloqueados = BloquesBloqueadosCompletos.filter(
                (horario: { DocenteID: number }) => horario.DocenteID === docente.DocenteID
              );

              if (BloquesBloqueados.length > 0) {
                const respuesta = BloquesBloqueados.every(
                  (item: { CodigoBloque: string; BloqueHorario: string }) => {
                    return !solapaHorarioBloqueado(
                      item.CodigoBloque,
                      convertirFrecuencia(cursosXsede.NombreFrecuencia),
                      item.BloqueHorario,
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
                                      NombreFrecuencia
                                    FROM (
                                        SELECT
                                            S.idSede,
                                            PA.idPeriodo,
                                              PA.idCurso,
                                              PA.idFrecuencia,
                                            PA.idHorario,
                                            H.HorarioInicio,
                                            H.HorarioFin,
                                            F.NombreFrecuencia
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
                                            F.NombreFrecuencia
                                        FROM
                                            [dbo].[ad_programacionAcademica] AS PA
                                        INNER JOIN
                                            [dbo].[ad_horario] AS H ON PA.idHorario = H.idHorario AND H.periodo=202409
                                        INNER JOIN
                                            [dbo].[ad_frecuencia] AS F ON PA.idFrecuencia = F.idFrecuencia AND F.periodo=202409
                                        INNER JOIN
                                            [dbo].[ad_sede] AS S ON PA.idSede = S.idSede AND S.periodo=202409
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
                    NombreFrecuencia: string;
                    HorarioInicio: string;
                    HorarioFin: string;
                  }) => {
                    return !claseSolapada(
                      convertirFrecuencia(item.NombreFrecuencia),
                      item.HorarioInicio,
                      item.HorarioFin,
                      convertirFrecuencia(cursosXsede.NombreFrecuencia),
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
                                              idSlot = ${cursosXsede.uuuidProgramacionAcademica},
                                              idVersion = ${version}
                                          WHERE idPeriodo = ${periodo};`;

              iteradorOrden = 0;
              break; // docentes
            }

            if (
              ListaDocentes.length === 0 ||
              (ListaDocentes.length !== 0 && docenteAsignado === false)
            ) {
              if (
                Number(sede.sedeId) === virtualID &&
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

              console.log(
                'CURSO NO INSERTADO - ' +
                  cursosXsede.idCurso +
                  ' - ' +
                  cursosXsede.NombreFrecuencia
              );

              await sql.query`UPDATE ad_avanceAlgoritmo
                                                  SET idSede = ${sede.idSede},
                                                      escenario = ${escenario.escenario},
                                                      idSlot = ${cursosXsede.uuuidProgramacionAcademica},
                                                      idVersion = ${version}
                                                  WHERE idPeriodo = ${periodo};`;
              iteradorOrden = 0;
              continue;
            }

            // break; // slots x sede
          }

          //     await sql.query`INSERT INTO testLogsTiempo (estado, fechaHoraActual, periodo, escenario, sede)
          //               VALUES ( ${
          //                 'Fin de la sede/escenario ' + sede.NombreSede
          //               }  , DATEADD(HOUR, -5, GETDATE()), ${periodo}, ${escenario}, ${
          //       sede.SedeID
          //     });`;
        } // break;  escenarios

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
                              WHERE
                                  D.idSede = @idSede
                                  AND D.vigente = 1
                                  AND D.FechaInicioContrato IS NOT NULL
                          		AND D.periodo=@id
                          )
                          SELECT
                              d.idDocente,
                              d.TipoContratoID,
                              d.TipoJornada,
                              d.HoraSemana,
                              SUM(ISNULL(t1.tiempoCurso, 0)) + ISNULL((
                                  SELECT SUM(H.MinutosReal * aux.NumDias)
                                  FROM [dbo].[ad_programacionAcademica] t2
                                  INNER JOIN [dbo].[ad_horario] H ON t2.idHorario = H.idHorario AND H.periodo=@id
                                  INNER JOIN [dbo].[aux_intensidad_fase] aux ON aux.uididintensidadfase = t2.uidIdIntensidadFase
                                      AND aux.PeriodoAcademico = @id
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
                                  INNER JOIN [dbo].[ad_docente] AS D ON ClasesAsignadasDocente.idDocente = D.idDocente AND D.periodo=@id
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
                                      INNER JOIN [dbo].[aux_intensidad_fase] aux ON aux.uididintensidadfase = t2.uidIdIntensidadFase
                                          AND aux.PeriodoAcademico = @id
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

        await sql.query`
                   UPDATE [dbo].[ad_pivoteAsignacion]
                    SET seleccionado = 1
                    WHERE
                      escenario = ${MenorDesviacion.escenario}
                      AND idPeriodo = ${periodo}
                      AND idSede = ${sede.idSede}
                      AND idVersion=${version}
                      AND flagVigente = 1; `;

        await sql.query`
                  UPDATE pc
                  SET pc.idDocente = ta.idDocente
                  FROM ad_programacionAcademica pc
                  JOIN [dbo].[ad_pivoteAsignacion] ta ON ta.uuuidProgramacionAcademica = pc.uuuidProgramacionAcademica
                  WHERE ta.escenario = ${MenorDesviacion.escenario}
                    AND ta.idPeriodo = ${periodo}
                    AND ta.idSede = ${sede.idSede}
                    AND ta.idVersion=${version}
                    AND ta.flagVigente = 1
                    AND ta.seleccionado=1; `;

        await sql.query`UPDATE ad_pivoteAsignacion
                    SET flagVigente = 0 where  idPeriodo = ${periodo}  and idSede = ${sede.idSede}  and idVersion =${version} `;

        //   // break; // sedes

        //   await sql.query`INSERT INTO testLogsTiempo (estado, fechaHoraActual, periodo, escenario, sede)
        //               VALUES ( ${
        //                 'Fin de la sede ' + sede.NombreSede
        //               }  , DATEADD(HOUR, -5, GETDATE()), ${periodo}, '-', ${sede.SedeID});`;
      }

      console.log(
        '############################################# FIN ###################################################'
      );

      // Limpiar el registro de Avance Algoritmo al finalizar
      await sql.query`UPDATE ad_avanceAlgoritmo
                                    SET idSede = null,
                                        escenario = null,
                                        idSlot = null,
                                        idVersion=null
                                    WHERE idPeriodo = ${periodo};`;

      // await sql.query`INSERT INTO testLogsTiempo (estado, fechaHoraActual, periodo, escenario, sede)
      //               VALUES ('Fin del Algoritmo', DATEADD(HOUR, -5, GETDATE()), ${periodo}, '-', 1 );`;

      await pool
        .request()
        .input('id', periodo)
        .query(`UPDATE [dbo].[ad_periodo] SET estado='ACTIVO'  where idPeriodo=@id`);

      return res.status(200).json({
        message: 'responseMessage',
        data: 'responseData',
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
