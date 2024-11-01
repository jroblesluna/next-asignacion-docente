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
  'Interdiario M-J-V': 'MJV',
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    console.log('GET@/pages/api/teacher/getall.ts');
    let pool;

    try {
      pool = await connectToDatabase();

      const { idPeriod, uuidSlot, version } = req.query;

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
                        (H.MinutosReal * aux.NumDias) AS minutosTotales, F.NombreFrecuencia
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

      const virtualID = 9268;
      const idSedeCurso = resultCurso.recordset[0]?.idSede;

      const resultDesponibilidad = await pool.request().input('id', idPeriod).query(`
                SELECT DocenteID, PeriodoAcademico,EstadoDisponible,FORMAT(FechaInicio, 'dd-MM-yyyy') 
           as FechaInicio, FORMAT(FechaFin , 'dd-MM-yyyy') as FechaFin  
           FROM [dbo].[disponibilidad_docente]  where  PeriodoAcademico=@id
                  `);

      const docentesMap = new Map<number, disponibilidadDocenteInterface>(
        resultDesponibilidad.recordset.map((docente: disponibilidadDocenteInterface) => [
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

      // obtner todos los docentes que enseñen el curso, -- ver si diferenciar por sede o no

      let resultDocentes;

      if (virtualID == idSedeCurso) {
        resultDocentes = await pool
          .request()
          .input('id', idPeriod)
          .input('idCurso', resultCurso.recordset[0]?.idCurso)
          .input('tiempoCurso', resultCurso.recordset[0]?.minutosTotales).query(`
            SELECT LD.*, 
                   D.NombreCompletoProfesor, 
                   D.FechaInicioContrato,
                   ISNULL((
                       SELECT SUM(H.MinutosReal * aux.NumDias) 
                       FROM [dbo].[ProgramacionCursos] t2
                       INNER JOIN [dbo].[dim_horario] H ON t2.HorarioID = H.HorarioID
                       INNER JOIN [dbo].[aux_intensidad_fase] aux ON aux.uididintensidadfase = t2.uidIdIntensidadFase
                       WHERE aux.PeriodoAcademico = @id
                         AND t2.DocenteID = LD.DocenteID
                         AND t2.Periodo = @id
                   ), 0) AS MinutosAcumulados, 
                   D.idTipoContrato, 
                   TC.TipoJornada, 
                   TC.HoraSemana,
                   ISNULL(
                       ((ISNULL((
                           SELECT SUM(H.MinutosReal * aux.NumDias) 
                           FROM [dbo].[ProgramacionCursos] t2
                           INNER JOIN [dbo].[dim_horario] H ON t2.HorarioID = H.HorarioID
                           INNER JOIN [dbo].[aux_intensidad_fase] aux ON aux.uididintensidadfase = t2.uidIdIntensidadFase
                           WHERE aux.PeriodoAcademico = @id
                             AND t2.DocenteID = LD.DocenteID
                             AND t2.Periodo = @id
                       ), 0) + @tiempoCurso) / CAST((TC.HoraSemana * 60 * 4) AS DECIMAL(10, 2))), 0
                   ) AS Equidad
            FROM [dbo].[LibroPorDocente] AS LD
            INNER JOIN [dbo].[ad_docente] AS D ON D.idDocente = LD.docenteID 
                AND D.periodo = @id 
                AND D.FechaInicioContrato IS NOT NULL
            INNER JOIN [dbo].[dim_tipo_contrato] AS TC ON TC.TipoContratoID = D.idTipoContrato
            WHERE LD.CursoID = @idCurso
            ORDER BY Equidad
        `);
      } else {
        resultDocentes = await pool
          .request()
          .input('id', idPeriod)
          .input('idCurso', resultCurso.recordset[0]?.idCurso)
          .input('tiempoCurso', resultCurso.recordset[0]?.minutosTotales)
          .input('idSede', idSedeCurso).query(`
            SELECT LD.*, 
                   D.NombreCompletoProfesor, 
                   D.FechaInicioContrato,
                   ISNULL((
                       SELECT SUM(H.MinutosReal * aux.NumDias) 
                       FROM [dbo].[ProgramacionCursos] t2
                       INNER JOIN [dbo].[dim_horario] H ON t2.HorarioID = H.HorarioID
                       INNER JOIN [dbo].[aux_intensidad_fase] aux ON aux.uididintensidadfase = t2.uidIdIntensidadFase
                       WHERE aux.PeriodoAcademico = @id
                         AND t2.DocenteID = LD.DocenteID
                         AND t2.Periodo = @id
                   ), 0) AS MinutosAcumulados, 
                   D.idTipoContrato, 
                   TC.TipoJornada, 
                   TC.HoraSemana,
                   ISNULL(
                       ((ISNULL((
                           SELECT SUM(H.MinutosReal * aux.NumDias) 
                           FROM [dbo].[ProgramacionCursos] t2
                           INNER JOIN [dbo].[dim_horario] H ON t2.HorarioID = H.HorarioID
                           INNER JOIN [dbo].[aux_intensidad_fase] aux ON aux.uididintensidadfase = t2.uidIdIntensidadFase
                           WHERE aux.PeriodoAcademico = @id
                             AND t2.DocenteID = LD.DocenteID
                             AND t2.Periodo = @id
                       ), 0) + @tiempoCurso) / CAST((TC.HoraSemana * 60 * 4) AS DECIMAL(10, 2))), 0
                   ) AS Equidad
            FROM [dbo].[LibroPorDocente] AS LD
            INNER JOIN [dbo].[ad_docente] AS D ON D.idDocente = LD.docenteID 
                AND D.periodo = @id 
                AND D.FechaInicioContrato IS NOT NULL
                AND D.idSede=@idSede
            INNER JOIN [dbo].[dim_tipo_contrato] AS TC ON TC.TipoContratoID = D.idTipoContrato
            WHERE LD.CursoID = @idCurso
            ORDER BY Equidad
        `);
      }

      interface DocenteInterface {
        id: number;
        nombre: string;
        tipoContrato: string;
        minutosTotales: string;
      }

      const ListaDocentes = resultDocentes.recordset;

      const DocentesActos: DocenteInterface[] = [];

      for (const docente of ListaDocentes) {
        // validacion de horas maximas
        if (
          Number(docente.MinutosAcumulados) +
            Number(resultCurso.recordset[0]?.minutosTotales) >
          Number(docente.HoraSemana) * 4 * 60
        ) {
          continue;
        }
        // validacion de disponibilidad en todo el curso
        const docenteDisponibleData = ObtenerDocenteDisponiblePorID(docente.DocenteID);
        if (
          docenteDisponibleData !== null &&
          docenteDisponibleData.EstadoDisponible === 0 &&
          !disponibleEnFecha(
            docenteDisponibleData?.FechaInicio,
            docenteDisponibleData?.FechaFin,
            resultCurso.recordset[0]?.inicioClase,
            resultCurso.recordset[0]?.finalClase
          )
        ) {
          continue;
        }

        const BloquesBloqueados = resultHorariosBloquedos.recordset.filter(
          (horario) => horario.DocenteID === docente.DocenteID
        );

        if (BloquesBloqueados.length > 0) {
          const respuesta = BloquesBloqueados.every((item) => {
            return !solapaHorarioBloqueado(
              item.CodigoBloque,
              convertirFrecuencia(resultCurso.recordset[0]?.NombreFrecuencia),
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
          .input('idDocente', docente.DocenteID).query(`
                        SELECT 
                                PC.idSede, 
                                PC.idPeriodo, 
                                PC.idCurso, 
                                PC.idFrecuencia, 
                                PC.idHorario, 
                                H.HorarioInicio, 
                                H.HorarioFin, 
                                F.NombreFrecuencia
                                FROM 
                                 [dbo].[ad_programacionAcademica] AS PC
                                INNER JOIN 
                                [dbo].[ad_horario]  AS H ON PC.idHorario = H.idHorario and H.periodo = @id
                                INNER JOIN 
                                [dbo].[ad_frecuencia]  AS F ON PC.idFrecuencia = F.idFrecuencia and F.periodo = @id
                                WHERE 
                                PC.idDocente = @idDocente
                                AND PC.idPeriodo = @id
                          `);

        const ClasesAsignadas = resultClasesAsignadas.recordset;

        if (ClasesAsignadas.length > 0) {
          const respuesta = ClasesAsignadas.every((item) => {
            if (convertirFrecuencia(item.NombreFrecuencia) === 'Frecuencia no encontrada') {
              console.log(item.NombreFrecuencia);
              return false;
            }

            return !claseSolapada(
              convertirFrecuencia(item.NombreFrecuencia),
              item.HorarioInicio,
              item.HorarioFin,
              convertirFrecuencia(resultCurso.recordset[0]?.NombreFrecuencia),
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
          minutosTotales: docente.MinutosAcumulados,
          tipoContrato: docente.TipoJornada,
        });

        if (DocentesActos.length > 2) {
          break;
        }
      }

      if (DocentesActos.length === 0) {
        console.log('DOCENTES NO ENCONTRADOS');
        DocentesActos.push({
          id: -1,
          nombre: 'Docente no encontrados',
          minutosTotales: '',
          tipoContrato: '',
        });
      }

      return res.status(200).json({ data: DocentesActos });
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
