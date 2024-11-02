import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../lib/db';
import sql from 'mssql';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  console.log('GET@/pages/api/assignment/getall.ts');
  let pool;

  try {
    const idPeriod = '202409';
    const idVersion = '0';

    // if (!idPeriod || !idVersion) {
    //   return res
    //     .status(400)
    //     .json({ message: 'Faltan campos en el query string', data: false });
    // }

    pool = await connectToDatabase();

    const result = await pool.request().input('id', idPeriod).input('version', idVersion)
      .query(`
               SELECT distinct PA.idHorario, H.HorarioInicio, H.HorarioFin FROM [dbo].[ad_programacionAcademica] AS PA
            INNER JOIN [dbo].[ad_horario] AS H ON H.idHorario=PA.idHorario AND H.periodo=@id
             where PA.idPeriodo=@id and  PA.idVersion =@version  and PA.vigente=1 and PA.cancelado=0
      `);

    const resultadoHorario = result.recordset;

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
      .input('version', idVersion).query(`
    SELECT distinct PA.idFrecuencia, F.NombreFrecuencia FROM [dbo].[ad_programacionAcademica] AS PA
            INNER JOIN [dbo].[ad_frecuencia] AS F ON F.idFrecuencia=PA.idFrecuencia AND F.periodo=@id
             where PA.idPeriodo=@id and  PA.idVersion =@version  and PA.vigente=1 and PA.cancelado=0
      `);

    const resultadoFrecuencia = resultFrecuencia.recordset;

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
        case 'LM':
          numerosDias = [1, 2, 3];
          break;
        case 'MV':
          numerosDias = [2, 3, 5];
          break;
        case 'MJS':
          numerosDias = [2, 4, 7];
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
          throw new Error('Frecuencia no válidaASDASD');
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

    const frecuenciaMap = new Map<number, number[]>();

    const solapamientoFrecuencia = (f1: string, f2: string) => {
      const dias1 = obtenerNumerosPorDias(f1);
      const dias2 = obtenerNumerosPorDias(f2);

      if (!hayNumeroComunEntreArrays(dias1, dias2)) return false;

      return true;
    };

    resultadoFrecuencia.forEach((frecuencia1) => {
      const solapados: number[] = [];

      resultadoFrecuencia.forEach((frecuencia2) => {
        if (frecuencia1.idFrecuencia !== frecuencia2.idFrecuencia) {
          if (
            solapamientoFrecuencia(
              convertirFrecuencia(frecuencia1.NombreFrecuencia),
              convertirFrecuencia(frecuencia2.NombreFrecuencia)
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

    const fId = '1';
    const hid = '24';

    let cadena = '';

    console.log('Frecuencias solapadas de id:1');
    console.log(frecuenciaMap.get(Number(fId)));
    console.log('Horaios solapadas de id:2');
    console.log(horariosMap.get(Number(hid)));

    const maquetarDatos = (frecuenciaId: string, horarioId: string, cabezera: string) => {
      return ` OR (${cabezera}.idFrecuencia =${frecuenciaId} AND ${cabezera}.idHorario = ${horarioId} )`;
    };

    const arraryFrecuencias = frecuenciaMap.get(Number(fId)) || [Number(fId)];
    const arraryHorario = horariosMap.get(Number(hid)) || [Number(hid)];

    arraryFrecuencias.forEach((element1) => {
      arraryHorario.forEach((element2) => {
        cadena += maquetarDatos(element1.toString(), element2.toString(), 'PC');
      });
    });

    const resultDocentes = await pool
      .request()
      .input('dynamicCondition', sql.NVarChar, cadena)
      .execute('testDinamicSolapamiento');

    return res.status(200).json({
      message: 'responseMessage',
      data: resultDocentes.recordset,
    });
  } catch (error) {
    console.error('Error en la API:', error);
    return res.status(500).json({ message: 'Error en la consulta', error });
  }
}
