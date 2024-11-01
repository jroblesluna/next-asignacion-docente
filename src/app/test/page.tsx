/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useEffect, useState } from 'react';
import assigmentService from '@/services/assigment';
import { balanceDataInterface, esquemaFrecuenciaHorario } from '../interface/datainterface';
import { frecuenciaEquivalenteMap } from '../utils/other';
// import { docentesTac, tacData } from '../interface/datainterface';
// import periodService from '@/services/period';
// import teacherService from '@/services/teacher';
// import versionService from '@/services/version';

function Page() {
  const [balancaDatarray, setBalancaDatarray] = useState<balanceDataInterface[]>([]);

  const loadDataTest = async () => {
    const res = await assigmentService.getDataBalance('202409');
    setBalancaDatarray(res.data);
    setData(JSON.stringify(res, null, 2));
    // setData(res.data);
  };
  // const [ProgramacionAcademicaData, setData] = useState<docentesTac[]>([]);
  // const [ProgramacionAcademicaDataTac, setDataTac] = useState<tacData[]>([]);
  // const [DataSchedules, setDataSchedules] = useState<schedulesInterface[]>([]);

  useEffect(() => {
    loadDataTest();
  }, []);

  // useEffect(() => {
  //   if (ProgramacionAcademicaData[0]) {
  //     const tacConvertido: tacData[] = ProgramacionAcademicaData.filter(
  //       (obj, index, self) =>
  //         index === self.findIndex((o) => o.uuidDocente === obj.uuidDocente)
  //     ).map((item) => ({
  //       teacher: item.NombreCompletoProfesor,
  //       location: item.NombreSede,
  //       status: item.TipoJornada,
  //       classSchedule: ProgramacionAcademicaData.filter(
  //         (item2) => item2.uuidDocente === item.uuidDocente && item2.idFrecuencia !== null
  //       ).map((elemento) => ({
  //         frecuency: elemento.NombreFrecuencia,
  //         schedule: elemento.HorarioInicio + ' - ' + elemento.HorarioFin,
  //         room:
  //           elemento.idAula !== null
  //             ? elemento.identificadorFisico
  //             : elemento.idFrecuencia !== null
  //             ? 'S/A'
  //             : '',
  //       })),
  //     }));
  //     setDataTac(tacConvertido);
  //   }
  // }, [ProgramacionAcademicaData]);

  useEffect(() => {
    if (balancaDatarray.length !== 0) {
      const uniqueCombinations = new Set<string>();
      const result: esquemaFrecuenciaHorario[] = [];

      balancaDatarray.forEach(
        (item: { NombreFrecuencia: string; HorarioInicio: string; HorarioFin: string }) => {
          const comboKey = `${item.NombreFrecuencia}, ${item.HorarioInicio} - ${item.HorarioFin}`;

          if (!uniqueCombinations.has(comboKey)) {
            uniqueCombinations.add(comboKey);
            result.push({
              frecuencia:
                frecuenciaEquivalenteMap[item.NombreFrecuencia] || item.NombreFrecuencia,
              horario: `${item.HorarioInicio} - ${item.HorarioFin}`,
            });
          }
        }
      );
      console.log('Combinaciones únicas como objetos:', result);
    }
  }, [balancaDatarray]);

  const [data, setData] = useState('');

  return (
    <main className="flex flex-col gap-5 w-full min-h-[100vh] p-8 ">
      {/* <p>{ProgramacionAcademicaData[0]?.uuidDocente}</p>
      <p>{JSON.stringify(ProgramacionAcademicaDataTac, null, 2)}</p> */}
      {data}
    </main>
  );
}

export default Page;
