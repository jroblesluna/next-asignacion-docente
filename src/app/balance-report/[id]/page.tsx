'use client';
import { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar';
import { ReturnTitle } from '../../components/Titles';
import { ModalWarning } from '../../components/Modals';
import Image from 'next/image';
import LayoutValidation from '@/app/LayoutValidation';
import { convertirFecha, convertirFormatoFecha } from '@/app/utils/managmentDate';
import { useParams } from 'next/navigation';
import periodService from '@/services/period';
import {
  balanceDataInterface,
  esquemaFrecuenciaHorario,
  PeriodoAcademico,
  ratioData,
} from '@/app/interface/datainterface';
import assigmentService from '@/services/assigment';
import { frecuenciaEquivalenteMap } from '@/app/utils/other';
const Page = () => {
  const { id } = useParams() as { id: string };
  const [timeStart, setTimeStart] = useState<string>('06:00');
  const [timeEnd, setTimeEnd] = useState<string>('23:59');
  const [selectedDays, setSelectedDays] = useState('Estado');
  const [dataPerido, setDataPeriodo] = useState<PeriodoAcademico>();
  const [ratiosData, setRatiosData] = useState<ratioData[]>([]);
  const [balancaDatarray, setBalancaDatarray] = useState<balanceDataInterface[]>([]);
  const [balanceSchedule, setBalanceSchedule] = useState<esquemaFrecuenciaHorario[]>([]);
  const [locationData, setLocationData] = useState<string[]>([]);

  const handleTimeStartChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTimeStart(event.target.value);
  };
  const handleSelectedDays = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDays(e.target.value);
  };

  const handleTimeEndChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTimeEnd(event.target.value);
  };

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const rangesOverlap = (scheduleRange: string, start: string, end: string) => {
    const [scheduleStart, scheduleEnd] = scheduleRange.split('-');
    const scheduleStartMinutes = timeToMinutes(scheduleStart);
    const scheduleEndMinutes = timeToMinutes(scheduleEnd);
    const rangeStartMinutes = timeToMinutes(start);
    const rangeEndMinutes = timeToMinutes(end);

    return scheduleStartMinutes >= rangeStartMinutes && scheduleEndMinutes <= rangeEndMinutes;
  };

  const weekday = ['L', 'M', 'J', 'V'];
  const Weekenday = ['S', 'D'];

  const filterSchedules = () => {
    return balanceSchedule.filter(
      ({ horario, frecuencia }) =>
        rangesOverlap(horario, timeStart, timeEnd) &&
        (selectedDays === 'Estado' ||
          (selectedDays === 'Diarios'
            ? weekday.some((item) => frecuencia.includes(item))
            : selectedDays === 'Sabatinos'
            ? Weekenday.some((item) => frecuencia.includes(item))
            : false))
    );
  };

  const filteredSchedules = filterSchedules();

  const loadData = async () => {
    const resPerido = await periodService.getById(id);
    setDataPeriodo(resPerido.data[0]);
    const resRatioData = await assigmentService.getRatiosBalance(id);
    setRatiosData(resRatioData.data);
    console.log(resRatioData.data);

    const resBalanceData = await assigmentService.getDataBalance(id);
    setBalancaDatarray(resBalanceData.data);
    console.log(resBalanceData.data);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

      setBalanceSchedule(result);

      const uniqueSedesAlojadas = Array.from(
        new Set(
          balancaDatarray.map((item: { nombreSedeAlojada: string }) => item.nombreSedeAlojada)
        )
      );
      console.log(uniqueSedesAlojadas);
      setLocationData(uniqueSedesAlojadas);
    }
  }, [balancaDatarray]);

  return (
    <LayoutValidation>
      <main className="flex flex-col gap-5 w-full min-h-[100vh] p-8">
        <NavBar />
        <ReturnTitle name="Balance de Asignaciones" />
        <div className="w-[95%] flex gap-10 flex-row  mx-auto justify-between  text-[15px]">
          <div className="flex flex-row gap-5 items-center ">
            <div className="flex flex-row gap-10 items-center">
              <div className="flex flex-row gap-2">
                <strong>Periodo: </strong>
                <p>{convertirFecha(id)}</p>
              </div>
              <div className="flex flex-row gap-2">
                <strong>Fecha:</strong>
                <p className={dataPerido?.fechaInicio ? '' : 'skeleton h-4 w-[200px] '}>
                  {dataPerido?.fechaInicio !== undefined &&
                    ` ${convertirFormatoFecha(
                      dataPerido?.fechaInicio
                    )} - ${convertirFormatoFecha(dataPerido?.fechaFinal)} `}
                </p>
              </div>
            </div>
            <div className="flex flex-row items-center ">
              <label className="font-inter font-semibold text-xs">Hora de inicio:</label>
              <input
                id="time-input"
                type="time"
                value={timeStart}
                onChange={handleTimeStartChange}
                className="border px-3 py-2.5 rounded-md -ml-6"
              />
            </div>
            <div className="flex flex-row items-center ">
              <label className="font-inter font-semibold text-xs">Hora de Fin:</label>
              <input
                id="time-input"
                type="time"
                value={timeEnd}
                onChange={handleTimeEndChange}
                className="border px-3 py-2.5 rounded-md -ml-3"
              />
            </div>

            <label className="form-control w-full max-w-32 -mt-8">
              <div className="label">
                <span className="label-text text-xs">Sede</span>
              </div>
              <select
                className="select select-bordered text-xs"
                value={selectedDays}
                onChange={handleSelectedDays}
              >
                <option>Estado</option>
                <option>Diarios</option>
                <option>Sabatinos</option>
              </select>
            </label>
          </div>
          <button className="bg-[#50B403] font-roboto py-2 px-8 w-56 text-[14px] text-white font-semibold hover:opacity-80  flex flex-row items-center ">
            <Image
              className="size-7"
              width={20}
              alt="img"
              height={20}
              src={'/download-icon.svg'}
            />
            Descargar Reporte
          </button>
          <ModalWarning
            linkTo={'/history'}
            subtitle="Esta acción es irreversible."
            title="¿Está seguro de cerrar el período?"
            idModal="my_modal_3"
            setFunction={(s: string) => {
              console.log(s);
            }}
          />
        </div>

        {ratiosData.length === 0 ||
        balanceSchedule.length === 0 ||
        locationData.length === 0 ? (
          <div className="w-[90%] flex gap-5 justify-center mx-auto flex-col items-center min-h-[50vh]">
            <span className="loading loading-bars loading-lg"></span>
          </div>
        ) : (
          <div className="w-full max-w-[100vw] overflow-auto py-3">
            <table className="w-full">
              <thead>
                <tr className="text-black truncate text-[11px]">
                  <th className="py-1 uppercase max-w-16 overflow-hidden font-inter bg-[#062060] text-white min-w-32">
                    FRECUENCIA
                  </th>
                  <th className="py-1 uppercase font-inter border bg-[#062060] text-white min-w-32">
                    HORARIO
                  </th>
                  <th className="py-1 uppercase font-inter border bg-[#062060] text-white min-w-24">
                    TOTAL
                  </th>
                  {ratiosData.map((item, index) => (
                    <th
                      key={`daily-${index}`}
                      className="py-1 uppercase font-inter border bg-[#062060] text-white min-w-24"
                    >
                      {item.NombreSede}
                    </th>
                  ))}
                  <th className="py-1 uppercase font-inter border text-white min-w-24"></th>
                  {ratiosData.map((item, index) => (
                    <th
                      key={`daily-${index}`}
                      className="py-1 uppercase font-inter border bg-[#062060] text-white min-w-24"
                    >
                      {item.NombreSede}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="text-xs border">
                  <td></td>
                  <td className="text-center border">FULL TIME</td>
                  <td className="text-center border">
                    {ratiosData.reduce((acc: number, item: ratioData) => acc + item.FT, 0)}
                  </td>
                  {ratiosData.map((item, index) => (
                    <td className="text-center border " key={index}>
                      {item.FT}
                    </td>
                  ))}
                  <td></td>
                  {ratiosData.map((item, index) => (
                    <td className="text-center border font-bold " key={index}>
                      {item.Ratio.toFixed(2) + '%'}
                    </td>
                  ))}
                </tr>
                <tr className="text-xs border">
                  <td></td>
                  <td className="text-center border">PART TIME</td>
                  <td className="text-center border">
                    {ratiosData.reduce((acc: number, item: ratioData) => acc + item.PT, 0)}
                  </td>
                  {ratiosData.map((item, index) => (
                    <td className="text-center border" key={index}>
                      {item.PT}
                    </td>
                  ))}
                  <td></td>
                  <td></td>
                </tr>

                <tr className="text-xs border">
                  <td></td>
                  <td className="text-center border">RATIO</td>
                  <td className="text-center border">
                    {(
                      ratiosData.reduce((acc: number, item: ratioData) => acc + item.FT, 0) +
                      ratiosData.reduce((acc: number, item: ratioData) => acc + item.PT, 0) / 3
                    ).toFixed(2)}
                  </td>
                  {ratiosData.map((item, index) => (
                    <td className="text-center border" key={index}>
                      {item.Ratio.toFixed(2) + '%'}
                    </td>
                  ))}
                  <td></td>
                  {ratiosData.map((item) => (
                    <td key={item.idSede} className="text-center border">
                      {(
                        balancaDatarray.reduce(
                          (acc: number, itemBalance: balanceDataInterface) =>
                            itemBalance.nombreSede === item.NombreSede
                              ? acc + itemBalance.carga
                              : acc,
                          0
                        ) /
                        ((item.NombreSede === item.NombreSede ? item.FT : 0) +
                          (item.NombreSede === item.NombreSede ? item.PT : 0) / 3)
                      ).toFixed(2) + '%'}
                    </td>
                  ))}
                </tr>

                {filteredSchedules.map((item, index) => {
                  return (
                    <tr className="text-xs text-center border" key={index}>
                      <td className="border font-semibold">{item.frecuencia}</td>
                      <td className="border font-semibold"> {item.horario}</td>
                      <td>
                        {
                          balancaDatarray.filter(
                            (rowBalance) =>
                              frecuenciaEquivalenteMap[rowBalance.NombreFrecuencia] ===
                                item.frecuencia &&
                              `${rowBalance.HorarioInicio} - ${rowBalance.HorarioFin}` ===
                                item.horario
                          ).length
                        }
                      </td>

                      {ratiosData.map((itemLocation, index) => (
                        <td className="text-center border" key={index}>
                          {
                            balancaDatarray.filter(
                              (rowBalance) =>
                                frecuenciaEquivalenteMap[rowBalance.NombreFrecuencia] ===
                                  item.frecuencia &&
                                `${rowBalance.HorarioInicio} - ${rowBalance.HorarioFin}` ===
                                  item.horario &&
                                rowBalance.nombreSede === itemLocation.NombreSede
                            ).length
                          }
                        </td>
                      ))}

                      <td>xx</td>
                      {ratiosData.map((itemLocation, index) => (
                        <td className="text-center border" key={index}>
                          {balancaDatarray.filter(
                            (rowBalance) =>
                              frecuenciaEquivalenteMap[rowBalance.NombreFrecuencia] &&
                              frecuenciaEquivalenteMap[rowBalance.NombreFrecuencia] ===
                                item.frecuencia &&
                              `${rowBalance.HorarioInicio} - ${rowBalance.HorarioFin}` ===
                                item.horario
                          ).length !== 0
                            ? (
                                (balancaDatarray.filter(
                                  (rowBalance) =>
                                    frecuenciaEquivalenteMap[rowBalance.NombreFrecuencia] &&
                                    frecuenciaEquivalenteMap[rowBalance.NombreFrecuencia] ===
                                      item.frecuencia &&
                                    `${rowBalance.HorarioInicio} - ${rowBalance.HorarioFin}` ===
                                      item.horario &&
                                    rowBalance.nombreSede === itemLocation.NombreSede
                                ).length /
                                  balancaDatarray.filter(
                                    (rowBalance) =>
                                      frecuenciaEquivalenteMap[rowBalance.NombreFrecuencia] &&
                                      frecuenciaEquivalenteMap[rowBalance.NombreFrecuencia] ===
                                        item.frecuencia &&
                                      `${rowBalance.HorarioInicio} - ${rowBalance.HorarioFin}` ===
                                        item.horario
                                  ).length) *
                                100
                              ).toFixed(2) + '%'
                            : ''}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </LayoutValidation>
  );
};

export default Page;
