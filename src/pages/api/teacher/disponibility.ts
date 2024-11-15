import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../lib/db';

interface disponibilidadDocenteInterface {
  DocenteID: number;
  PeriodoAcademico: number;
  EstadoDisponible: number;
  FechaInicio: string;
  FechaFin: string;
}

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
    case 'MJV':
      numerosDias = [3, 4, 5];
      break;
    default:
      throw new Error('Frecuencia no válida ' + frecuencia);
  }

  return numerosDias;
};

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

const solapamientoFrecuencia = (f1: string, f2: string) => {
  const dias1 = obtenerNumerosPorDias(f1);
  const dias2 = obtenerNumerosPorDias(f2);

  if (!hayNumeroComunEntreArrays(dias1, dias2)) return false;

  return true;
};

const maquetarDatos = (frecuenciaId: string, horarioId: string, cabezera: string) => {
  return ` OR (${cabezera}.idFrecuencia =${frecuenciaId} AND ${cabezera}.idHorario = ${horarioId} )`;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    console.log('GET@/pages/api/teacher/disponibility.ts');
    let pool;

    try {
      pool = await connectToDatabase();

      const { idPeriod, uuidSlot, version } = req.query;
      const DocentesActos: DocenteInterface[] = [];

      const MAX_HORAS_FT = parseInt(process.env.MAX_HORAS_FT || '48', 10);
      const MAX_HORAS_PT = parseInt(process.env.MAX_HORAS_PT || '24', 10);

      console.log(MAX_HORAS_PT);
      console.log(MAX_HORAS_FT);

      const result = await pool
        .request()
        .input('id', idPeriod)
        .query(`select * from [dbo].[ad_periodo] where idPeriodo=@id`);

      const periodoData = result.recordset[0];

      if (periodoData.estado != 'ACTIVO') {
        DocentesActos.push({
          id: -1,
          nombre:
            'No se pudo Iniciar la busqueda para el periodo ' +
            periodoData.idPeriodo +
            ' por que su estado es: ' +
            periodoData.estado,
          minutosTotales: '',
          tipoContrato: '',
          nombreSede: '',
        });
        return res.status(200).json({ data: DocentesActos });
      }

      // Datos del curso
      const resultCurso = await pool
        .request()
        .input('id', idPeriod)
        .input('uuidSlot', uuidSlot)
        .input('version', version).query(`
                SELECT DISTINCT P.*,
                    FORMAT(CONVERT(DATETIME, p.inicioClase), 'dd-MM-yyyy') AS InicioClase,
                            FORMAT(CONVERT(DATETIME, p.finalClase), 'dd-MM-yyyy') AS FinClase,
                        H.HorarioInicio, H.HorarioFin, H.MinutosReal, aux.NumDias,
                        (H.MinutosReal * aux.NumDias) AS minutosTotales, F.NombreFrecuencia , F.NombreAgrupFrecuencia
                    FROM [dbo].[ad_programacionAcademica] P
                    INNER JOIN [dbo].[ad_horario] AS H
                        ON P.idHorario = H.idHorario and H.periodo=@id
                    INNER JOIN [dbo].[ad_frecuencia] AS F
                        ON P.idFrecuencia = F.idFrecuencia
                        AND P.idPeriodo = @id
                    OUTER APPLY (
                    SELECT TOP 1 aux.NumDias 
                    FROM [dbo].[aux_intensidad_fase] AS aux
                    WHERE P.uidIdIntensidadFase = aux.uididintensidadfase  and 
                        P.idPeriodo = aux.PeriodoAcademico   
                        ) AS aux
                    WHERE 
    				 P.idPeriodo = @id
    				AND P.uuuidProgramacionAcademica=@uuidSlot AND P.idVersion=@version
                  `);

      const idSedeCurso = resultCurso.recordset[0]?.idSede;

      const resultadoIDVirtual = await pool
        .request()
        .input('id', idPeriod)
        .query(
          `SELECT idSede FROM [dbo].[ad_sede] where nombreSede = 'Virtual' and periodo=@id`
        );

      const virtualID = resultadoIDVirtual.recordset[0]?.idSede;

      const resultDesponibilidad = await pool.request().input('id', idPeriod).query(`
                SELECT DocenteID, PeriodoAcademico,EstadoDisponible,FORMAT(FechaInicio, 'dd-MM-yyyy') 
           as FechaInicio, FORMAT(FechaFin , 'dd-MM-yyyy') as FechaFin  
           FROM [dbo].[disponibilidad_docente]  where  PeriodoAcademico=@id
                  `);
      const disponibilidadDocente = resultDesponibilidad.recordset;

      // Bloques Horarios bloqueados de docente
      const resultHorariosBloquedos = await pool.request().query(`
                            SELECT hbd.CodigoBloque, hbd.DocenteID, bh.BloqueHorario
                            FROM [dbo].[horario_bloqueado_docente] hbd
                            INNER JOIN [dbo].[BloqueHorario] bh
                                ON hbd.CodigoBloque = bh.bloque 
                              `);

      const resultH = await pool.request().input('id', idPeriod).input('version', version)
        .query(`
               SELECT distinct PA.idHorario, H.HorarioInicio, H.HorarioFin FROM [dbo].[ad_programacionAcademica] AS PA
            INNER JOIN [dbo].[ad_horario] AS H ON H.idHorario=PA.idHorario AND H.periodo=@id
             where PA.idPeriodo=@id and  PA.idVersion =@version  and PA.vigente=1 and PA.cancelado=0
      `);

      const resultadoHorario = resultH.recordset;

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

      const resultFrecuencia = await pool
        .request()
        .input('id', idPeriod)
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

      const fId = resultCurso.recordset[0]?.idFrecuencia;
      const hid = resultCurso.recordset[0]?.idHorario;
      let cadenaPC = ``;

      const arraryFrecuencias = frecuenciaMap.get(Number(fId)) || [Number(fId)];
      const arraryHorario = horariosMap.get(Number(hid)) || [Number(hid)];

      arraryFrecuencias.forEach((element1) => {
        arraryHorario.forEach((element2) => {
          cadenaPC += maquetarDatos(element1.toString(), element2.toString(), `PC`);
        });
      });

      // obtner todos los docentes que enseñen el curso, -- ver si diferenciar por sede o no

      let resultDocentes;

      if (virtualID == idSedeCurso) {
        resultDocentes = await pool
          .request()
          .input('id', idPeriod)
          .input('idCurso', resultCurso.recordset[0]?.idCurso)
          .input('tiempoCurso', resultCurso.recordset[0]?.minutosTotales)
          .input('version', version)
          .input('idFrecuencia', resultCurso.recordset[0]?.idFrecuencia)
          .input('idHorario', resultCurso.recordset[0]?.idHorario)
          .input('idVirtual', virtualID)
          .query(
            `
                SELECT 					
                D.idDocente as DocenteID,
                   D.NombreCompletoProfesor, 
                     D.nombreSede,
                   D.FechaInicioContrato,
                   ISNULL((SELECT SUM(H.MinutosReal * aux.NumDias) 
                    FROM [dbo].[ad_programacionAcademica] t2
                    INNER JOIN [dbo].[ad_horario] H ON t2.idHorario = H.idHorario AND H.periodo=@id 
                    INNER JOIN [dbo].[aux_intensidad_fase] aux 
                    ON aux.uidIdIntensidadFase = t2.uidIdIntensidadFase
                    WHERE aux.PeriodoAcademico = @id  
                    AND t2.idDocente = D.idDocente
                    AND t2.idPeriodo = @id  
				          	AND t2.idVersion=@version
                ), 0) AS MinutosAcumulados, 
                   D.idTipoContrato, 
                   TC.TipoJornada, 
                   TC.HoraSemana,
                   ISNULL(
                       ((ISNULL((SELECT SUM(H.MinutosReal * aux.NumDias) 
                    FROM [dbo].[ad_programacionAcademica] t2
                    INNER JOIN [dbo].[ad_horario] H ON t2.idHorario = H.idHorario AND H.periodo=@id  
                    INNER JOIN [dbo].[aux_intensidad_fase] aux 
                    ON aux.uidIdIntensidadFase = t2.uidIdIntensidadFase
                    WHERE aux.PeriodoAcademico = @id  
                    AND t2.idDocente = D.idDocente
                    AND t2.idPeriodo =@id  
				          	AND t2.idVersion=@version
                ), 0) + @tiempoCurso) / CAST((TC.HoraSemana * 60 * 4) AS DECIMAL(10, 2))), 0
                   ) AS Equidad
            FROM  [dbo].[ad_docente] AS D 
			    INNER JOIN [dbo].[dim_tipo_contrato] AS TC ON TC.TipoContratoID = D.idTipoContrato
			    WHERE
             D.periodo = @id  
             AND D.vigente=1
             AND D.dictaClase=1
             AND D.idSede <> @idVirtual
			AND D.FechaInicioContrato IS NOT NULL
       AND NOT EXISTS (
                SELECT 1
                FROM (
                    SELECT 
                        PC.idSede, 
                        PC.idPeriodo, 
                        PC.idCurso, 
                        PC.idFrecuencia, 
                        PC.idHorario
                    FROM 
                        [dbo].[ad_programacionAcademica] AS PC
                    WHERE 
                        PC.idDocente = D.idDocente
                        AND PC.idPeriodo = @id
                        AND PC.idVersion= @version
						AND (
        (PC.idFrecuencia = @idFrecuencia AND PC.idHorario = @idHorario)  
		 ` +
              cadenaPC +
              `    )
                )  AS ClasesAsignadasDocente 
            )
            ORDER BY Equidad
        `
          );
      } else {
        resultDocentes = await pool
          .request()
          .input('id', idPeriod)
          .input('idCurso', resultCurso.recordset[0]?.idCurso)
          .input('tiempoCurso', resultCurso.recordset[0]?.minutosTotales)
          .input('version', version)
          .input('idFrecuencia', resultCurso.recordset[0]?.idFrecuencia)
          .input('idHorario', resultCurso.recordset[0]?.idHorario)
          .input('idSede', resultCurso.recordset[0]?.idSede)
          .query(
            `
            SELECT 					D.idDocente as DocenteID,
                   D.NombreCompletoProfesor, 
                     D.nombreSede,
                   D.FechaInicioContrato,
                   ISNULL((SELECT SUM(H.MinutosReal * aux.NumDias) 
                    FROM [dbo].[ad_programacionAcademica] t2
                    INNER JOIN [dbo].[ad_horario] H ON t2.idHorario = H.idHorario AND H.periodo=@id 
                    INNER JOIN [dbo].[aux_intensidad_fase] aux 
                    ON aux.uidIdIntensidadFase = t2.uidIdIntensidadFase
                    WHERE aux.PeriodoAcademico = @id  
                    AND t2.idDocente = D.idDocente
                    AND t2.idPeriodo = @id  
				          	AND t2.idVersion=@version
                ), 0) AS MinutosAcumulados, 
                   D.idTipoContrato, 
                   TC.TipoJornada, 
                   TC.HoraSemana,
                   ISNULL(
                       ((ISNULL((SELECT SUM(H.MinutosReal * aux.NumDias) 
                    FROM [dbo].[ad_programacionAcademica] t2
                    INNER JOIN [dbo].[ad_horario] H ON t2.idHorario = H.idHorario AND H.periodo=@id  
                    INNER JOIN [dbo].[aux_intensidad_fase] aux 
                    ON aux.uidIdIntensidadFase = t2.uidIdIntensidadFase
                    WHERE aux.PeriodoAcademico = @id  
                    AND t2.idDocente = D.idDocente
                    AND t2.idPeriodo =@id  
				          	AND t2.idVersion=@version
                ), 0) + @tiempoCurso) / CAST((TC.HoraSemana * 60 * 4) AS DECIMAL(10, 2))), 0
                   ) AS Equidad
            FROM  [dbo].[ad_docente] AS D 
			    INNER JOIN [dbo].[dim_tipo_contrato] AS TC ON TC.TipoContratoID = D.idTipoContrato
			    WHERE
             D.periodo = @id  
            AND D.vigente=1
            AND D.dictaClase=1
			AND D.FechaInicioContrato IS NOT NULL
			AND D.idSede=@idSede
  AND NOT EXISTS (
                SELECT 1
                FROM (
                    SELECT 
                        PC.idSede, 
                        PC.idPeriodo, 
                        PC.idCurso, 
                        PC.idFrecuencia, 
                        PC.idHorario
                    FROM 
                        [dbo].[ad_programacionAcademica] AS PC
                    WHERE 
                        PC.idDocente = D.idDocente
                        AND PC.idPeriodo = @id
                        AND PC.idVersion= @version
						AND (
        (PC.idFrecuencia = @idFrecuencia AND PC.idHorario = @idHorario)  
		 ` +
              cadenaPC +
              `    )
                )  AS ClasesAsignadasDocente 
            )
            ORDER BY Equidad
        `
          );
      }

      interface DocenteInterface {
        id: number;
        nombre: string;
        tipoContrato: string;
        minutosTotales: string;
        nombreSede: string;
      }

      const ListaDocentes = resultDocentes.recordset;

      for (const docente of ListaDocentes) {
        // validacion de horas maximas
        if (
          Number(docente.MinutosAcumulados) +
            Number(resultCurso.recordset[0]?.minutosTotales) >
          (docente.TipoJornada == 'FT' ? MAX_HORAS_FT : MAX_HORAS_PT) * 4 * 60
        ) {
          continue;
        }
        // validacion de disponibilidad en todo el curso

        const docenteDisponibleData = disponibilidadDocente.filter(
          (item: disponibilidadDocenteInterface) =>
            item.DocenteID === Number(docente.DocenteID)
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
                resultCurso.recordset[0]?.inicioClase,
                resultCurso.recordset[0]?.finalClase
              );
            }
          );

          if (!respuesta) {
            continue;
          }
        }

        const BloquesBloqueados = resultHorariosBloquedos.recordset.filter(
          (horario) => horario.DocenteID === docente.DocenteID
        );

        if (BloquesBloqueados.length > 0) {
          const respuesta = BloquesBloqueados.every((item) => {
            return !solapaHorarioBloqueado(
              item.CodigoBloque,
              resultCurso.recordset[0]?.NombreAgrupFrecuencia,
              item.BloqueHorario,
              resultCurso.recordset[0]?.HorarioInicio,
              resultCurso.recordset[0]?.HorarioFin
            );
          });

          if (!respuesta) {
            continue;
          }
        }

        const resultClasesAsignadas = await pool
          .request()
          .input('id', idPeriod)
          .input('idDocente', docente.DocenteID)
          .input('idVersion', version).query(`
                        SELECT 
                                PC.idSede, 
                                PC.idPeriodo, 
                                PC.idCurso, 
                                PC.idFrecuencia, 
                                PC.idHorario, 
                                H.HorarioInicio, 
                                H.HorarioFin, 
                                F.NombreFrecuencia, 
                                F.NombreAgrupFrecuencia
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

        if (ClasesAsignadas.length > 0) {
          const respuesta = ClasesAsignadas.every((item) => {
            if (item.NombreAgrupFrecuencia === 'no se está ofreciendo') {
              return false;
            }

            return !claseSolapada(
              item.NombreAgrupFrecuencia,
              item.HorarioInicio,
              item.HorarioFin,
              resultCurso.recordset[0]?.NombreAgrupFrecuencia,
              resultCurso.recordset[0]?.HorarioInicio,
              resultCurso.recordset[0]?.HorarioFin
            );
          });

          if (!respuesta) {
            console.log('continue P-7.4');
            continue;
          }
        }

        DocentesActos.push({
          id: docente.DocenteID,
          nombre: docente.NombreCompletoProfesor,
          minutosTotales: (Number(docente.MinutosAcumulados) / 60).toFixed(2) + 'Hrs',
          tipoContrato: docente.TipoJornada,
          nombreSede: docente.nombreSede,
        });

        // if (DocentesActos.length > 100) {
        //   break;
        // }
      }

      if (DocentesActos.length === 0) {
        console.log('DOCENTES NO ENCONTRADOS');
        DocentesActos.push({
          id: -1,
          nombre: 'Docente no encontrados',
          minutosTotales: '',
          tipoContrato: '',
          nombreSede: '',
        });
      }

      return res.status(200).json({ data: DocentesActos });
    } catch (error) {
      console.error('Error en la API:', error);
      return res.status(500).json({ message: 'Error en la consulta', error });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
