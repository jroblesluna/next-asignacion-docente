import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../lib/db';

interface RoomDisponibility {
  id: number;
  nombre: string;
  capacidad: string;
  nombreSede: string;
}

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
    console.log('GET@/pages/api/teacher/compatibility.ts');
    let pool;
    const AulaActos: RoomDisponibility[] = [];

    try {
      pool = await connectToDatabase();

      const { idPeriod, uuidSlot, version } = req.query;
      // saca el aula
      console.log(uuidSlot);
      console.log(version);

      const result = await pool
        .request()
        .input('id', idPeriod)
        .query(`select * from [dbo].[ad_periodo] where idPeriodo=@id`);

      const periodoData = result.recordset[0];

      if (periodoData.estado != 'ACTIVO') {
        AulaActos.push({
          id: -1,
          nombre:
            'No se pudo Iniciar la busqueda para el periodo ' +
            periodoData.idPeriodo +
            ' por que su estado es: ' +
            periodoData.estado,
          capacidad: '',
          nombreSede: '',
        });
        return res.status(200).json({ data: AulaActos });
      }

      const resultAula = await pool
        .request()
        .input('id', idPeriod)
        .input('uuidSlot', uuidSlot)
        .input('version', version).query(`
                SELECT DISTINCT P.*,
                    FORMAT(CONVERT(DATETIME, p.inicioClase), 'dd-MM-yyyy') AS InicioClase,
                            FORMAT(CONVERT(DATETIME, p.finalClase), 'dd-MM-yyyy') AS FinClase,
                        H.HorarioInicio, H.HorarioFin, H.MinutosReal ,  F.NombreFrecuencia , F.NombreAgrupFrecuencia,
                         A.identificadorFisico, A.capacidad, A.idSede AS idSedeAula, D.idSede AS idSedeDocente
                    FROM [dbo].[ad_programacionAcademica] P
                    INNER JOIN [dbo].[ad_horario] AS H
                        ON P.idHorario = H.idHorario and H.periodo=@id
                    INNER JOIN [dbo].[ad_frecuencia] AS F
                        ON P.idFrecuencia = F.idFrecuencia
                        AND F.periodo = @id
                    LEFT JOIN [dbo].[ad_aula] AS A
                        ON P.idAula = A.idAula
                        AND A.periodo = @id    
                     LEFT JOIN [dbo].[ad_docente] AS D
                        ON P.idDocente = D.idDocente
                        AND D.periodo = @id     
                         
                    WHERE 
    				 P.idPeriodo = @id
    				AND P.uuuidProgramacionAcademica=@uuidSlot AND P.idVersion=@version
                  `);

      const idSedeCurso = resultAula.recordset[0]?.idSede;

      console.log(resultAula.recordset);

      if (resultAula.recordset[0].idAula == null) {
        AulaActos.push({
          id: -1,
          nombre: 'No se pudo Iniciar la busqueda por que el Id aula es null ',
          capacidad: '',
          nombreSede: '',
        });
        return res.status(200).json({ data: AulaActos });
      }

      const resultadoIDVirtual = await pool
        .request()
        .input('id', idPeriod)
        .query(
          `SELECT idSede FROM [dbo].[ad_sede] where uidIdSede = '28894d3f-e9e1-476c-9314-764dc0bcd003'and  nombreSede = 'Virtual'    and periodo=@id`
        );

      const virtualID = resultadoIDVirtual.recordset[0]?.idSede;

      if (
        resultAula.recordset[0].idDocente == null &&
        resultAula.recordset[0].idSede == virtualID
      ) {
        AulaActos.push({
          id: -1,
          nombre: 'No se pudo Iniciar la busqueda por que no hay docente asignado ',
          capacidad: '',
          nombreSede: '',
        });
        return res.status(200).json({ data: AulaActos });
      }

      // DATOS ESTATICOS
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

      const fId = resultAula.recordset[0]?.idFrecuencia;
      const hid = resultAula.recordset[0]?.idHorario;
      let cadenaPC = ``;

      const arraryFrecuencias = frecuenciaMap.get(Number(fId)) || [Number(fId)];
      const arraryHorario = horariosMap.get(Number(hid)) || [Number(hid)];

      arraryFrecuencias.forEach((element1) => {
        arraryHorario.forEach((element2) => {
          cadenaPC += maquetarDatos(element1.toString(), element2.toString(), `PC`);
        });
      });

      let resultAulas;
      if (virtualID != idSedeCurso) {
        resultAulas = await pool
          .request()
          .input('id', idPeriod)
          .input('idSedeCurso', idSedeCurso)
          .input('version', version)
          .input('idFrecuencia', resultAula.recordset[0]?.idFrecuencia)
          .input('idHorario', resultAula.recordset[0]?.idHorario)
          .query(
            `SELECT A.* , S.nombreSede AS nombreSedeAula from [dbo].[ad_aula] AS A 
            INNER JOIN [dbo].[ad_sede] AS S ON S.idSede=A.idSede  AND S.periodo=@id
            WHERE A.periodo=@id AND A.vigente=1 AND A.idSede = @idSedeCurso
             AND NOT EXISTS (
                SELECT 1
                FROM (
                    SELECT 
                        PC.idSede, 
                        PC.idAula, 
                        PC.idPeriodo, 
                        PC.idFrecuencia, 
                        PC.idHorario
                    FROM 
                        [dbo].[ad_programacionAcademica] AS PC
                    WHERE 
                        PC.idAula = A.idAula
                        AND PC.idPeriodo = @id
                        AND PC.idVersion= @version
						AND (
        (PC.idFrecuencia = @idFrecuencia AND PC.idHorario = @idHorario)  
		 ` +
              cadenaPC +
              `    )
                )  AS ClasesAsignadasDocente 
            )
        `
          );
      } else {
        resultAulas = await pool
          .request()
          .input('id', idPeriod)
          .input('idSedeAlojada', resultAula.recordset[0]?.idSedeDocente)
          .input('version', version)
          .input('idFrecuencia', resultAula.recordset[0]?.idFrecuencia)
          .input('idHorario', resultAula.recordset[0]?.idHorario)
          .query(
            `SELECT A.* , S.nombreSede AS nombreSedeAula from [dbo].[ad_aula] AS A 
            INNER JOIN [dbo].[ad_sede] AS S ON S.idSede=A.idSede  AND S.periodo=@id
            WHERE A.periodo=@id AND A.vigente=1 AND A.idSede = @idSedeAlojada
             AND NOT EXISTS (
                SELECT 1
                FROM (
                    SELECT 
                        PC.idSede, 
                        PC.idAula, 
                        PC.idPeriodo, 
                        PC.idFrecuencia, 
                        PC.idHorario
                    FROM 
                        [dbo].[ad_programacionAcademica] AS PC
                    WHERE 
                        PC.idAula = A.idAula
                        AND PC.idPeriodo = @id
                        AND PC.idVersion= @version
						AND (
        (PC.idFrecuencia = @idFrecuencia AND PC.idHorario = @idHorario)  
		 ` +
              cadenaPC +
              `    )
                )  AS ClasesAsignadasDocente 
            )
        `
          );
      }

      const ListaAulas = resultAulas?.recordset || [];

      for (const aula of ListaAulas) {
        const resultClasesAsignadas = await pool
          .request()
          .input('id', idPeriod)
          .input('idAula', aula.idAula)
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
                                PC.idAula = @idAula
                                AND PC.idPeriodo = @id
                                AND PC.idVersion=@idVersion
                          `);

        const ClasesAsignadas = resultClasesAsignadas.recordset;

        if (ClasesAsignadas.length > 0) {
          const respuesta = ClasesAsignadas.every((item) => {
            if (item.NombreAgrupFrecuencia === 'no se está ofreciendo') {
              console.log(item.NombreFrecuencia);
              console.log(item.NombreAgrupFrecuencia);
              return false;
            }

            return !claseSolapada(
              item.NombreAgrupFrecuencia,
              item.HorarioInicio,
              item.HorarioFin,
              resultAula.recordset[0]?.NombreAgrupFrecuencia,
              resultAula.recordset[0]?.HorarioInicio,
              resultAula.recordset[0]?.HorarioFin
            );
          });

          if (!respuesta) {
            console.log('continue P-7.4');
            continue;
          }
        }

        AulaActos.push({
          id: aula.idAula,
          nombre: aula.identificadorFisico,
          capacidad: aula.capacidad,
          nombreSede: aula.nombreSedeAula,
        });
      }

      if (AulaActos.length === 0) {
        console.log('Aulas no encontradas');
        AulaActos.push({
          id: -1,
          nombre: 'Aulas no encontradas',
          capacidad: '',
          nombreSede: '',
        });
      }

      return res.status(200).json({ data: AulaActos });
    } catch (error) {
      console.error('Error en la API:', error);
      return res.status(500).json({ message: 'Error en la consulta', error });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
