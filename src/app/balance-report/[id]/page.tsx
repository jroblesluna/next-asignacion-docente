'use client';
import { useState } from 'react';
import NavBar from '../../components/NavBar';
import { ReturnTitle } from '../../components/Titles';
import { ModalWarning } from '../../components/Modals';
import Image from 'next/image';
import { locationData } from '../../constants/data';
import { balanceData, schedules } from '../../constants/dataExample';
// import { useParams } from 'next/navigation';
import LayoutValidation from '@/app/LayoutValidation';
const Page = () => {
  // const { id } = useParams();
  const [timeStart, setTimeStart] = useState<string>('06:00');
  const [timeEnd, setTimeEnd] = useState<string>('23:59');
  const [selectedDays, setSelectedDays] = useState('Estado');

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
    return schedules.filter(
      ({ time, frequency }) =>
        rangesOverlap(time, timeStart, timeEnd) &&
        (selectedDays === 'Estado' ||
          (selectedDays === 'Diarios'
            ? weekday.some((item) => frequency.includes(item))
            : selectedDays === 'Sabatinos'
            ? Weekenday.some((item) => frequency.includes(item))
            : false))
    );
  };

  const filteredSchedules = filterSchedules();
  return (
    <LayoutValidation>
      <main className="flex flex-col gap-5 w-full min-h-[100vh] p-8">
        <NavBar />
        <ReturnTitle name="Balance de Asignaciones" />
        <div className="w-[95%] flex gap-10 flex-row  mx-auto justify-between  text-[15px]">
          <div className="flex flex-row gap-5 items-center ">
            <p className="w-48">
              <strong>Periodo: </strong> Agosto del 2022
            </p>
            <p className="w-56">
              <strong>Fecha:</strong> 01/08/2022 - 31/08/2022
            </p>
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
                <option selected>Estado</option>
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
          />
        </div>

        <div className="w-full max-w-[100vw] overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="text-black truncate text-[13px]">
                <th className="py-1 uppercase max-w-16 overflow-hidden font-inter bg-[#062060] text-white min-w-32">
                  FRECUENCIA
                </th>
                <th className="py-1 uppercase font-inter border bg-[#062060] text-white min-w-32">
                  HORARIO
                </th>
                <th className="py-1 uppercase font-inter border bg-[#062060] text-white min-w-24">
                  TOTAL
                </th>
                {locationData.map((time, index) => (
                  <th
                    key={`daily-${index}`}
                    className="py-1 uppercase font-inter border bg-[#062060] text-white min-w-24"
                  >
                    {time}
                  </th>
                ))}
                <th className="py-1 uppercase font-inter border text-white min-w-24"></th>
                {locationData.map((time, index) => (
                  <th
                    key={`daily-${index}`}
                    className="py-1 uppercase font-inter border bg-[#062060] text-white min-w-24"
                  >
                    {time}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="text-xs border">
                <td></td>
                <td className="text-center border">FULL TIME</td>
                <td className="text-center border">
                  {
                    balanceData.filter((rowBalance) => rowBalance.statusTeacher === 'FT')
                      .length
                  }
                </td>
                {locationData.map((item, index) => (
                  <td className="text-center border " key={index}>
                    {
                      balanceData.filter(
                        (rowBalance) =>
                          rowBalance.location === item && rowBalance.statusTeacher === 'FT'
                      ).length
                    }
                  </td>
                ))}
                <td></td>
                {locationData.map((item, index) => (
                  <td className="text-center border font-bold " key={index}>
                    {(
                      (balanceData.filter((rowBalance) => rowBalance.location === item)
                        .length /
                        3 /
                        (balanceData.length / 3)) *
                      100
                    ).toFixed(2) + '%'}
                    <td></td>
                  </td>
                ))}
              </tr>
              <tr className="text-xs border">
                <td></td>
                <td className="text-center border">PART TIME</td>
                <td className="text-center border">
                  {
                    balanceData.filter((rowBalance) => rowBalance.statusTeacher === 'PT')
                      .length
                  }
                </td>
                {locationData.map((item, index) => (
                  <td className="text-center border" key={index}>
                    {
                      balanceData.filter(
                        (rowBalance) =>
                          rowBalance.location === item && rowBalance.statusTeacher === 'PT'
                      ).length
                    }
                  </td>
                ))}
                <td></td>
                <td></td>
              </tr>

              <tr className="text-xs border">
                <td></td>
                <td className="text-center border">RATIO</td>
                <td className="text-center border">{(balanceData.length / 3).toFixed(2)}</td>
                {locationData.map((item, index) => (
                  <td className="text-center border" key={index}>
                    {(
                      (balanceData.filter((rowBalance) => rowBalance.location === item)
                        .length /
                        3 /
                        (balanceData.length / 3)) *
                      100
                    ).toFixed(2) + '%'}
                  </td>
                ))}
                <td></td>
                {locationData.map((item) => (
                  <td key={item} className="text-center border">
                    {(
                      balanceData
                        .filter((rowBalance) => rowBalance.location === item)
                        .reduce(
                          (acumulador, rowBalance) => acumulador + rowBalance.points,
                          0
                        ) /
                      (balanceData.filter((rowBalance) => rowBalance.location === item)
                        .length /
                        3)
                    ).toFixed(2)}
                  </td>
                ))}
              </tr>

              {filteredSchedules.map((item, index) => {
                return (
                  <tr className="text-xs text-center border" key={index}>
                    <td className="border font-semibold">{item.frequency}</td>
                    <td className="border font-semibold"> {item.time}</td>
                    <td>
                      {
                        balanceData.filter(
                          (rowBalance) =>
                            rowBalance.frequency === item.frequency &&
                            rowBalance.scheduleTime === item.time
                        ).length
                      }
                    </td>

                    {locationData.map((itemLocation, index) => (
                      <td className="text-center border" key={index}>
                        {
                          balanceData.filter(
                            (rowBalance) =>
                              rowBalance.frequency === item.frequency &&
                              rowBalance.scheduleTime === item.time &&
                              rowBalance.location === itemLocation
                          ).length
                        }
                      </td>
                    ))}

                    <td>xx</td>
                    {locationData.map((itemLocation, index) => (
                      <td className="text-center border" key={index}>
                        {balanceData.filter(
                          (rowBalance) =>
                            rowBalance.frequency === item.frequency &&
                            rowBalance.scheduleTime === item.time
                        ).length !== 0
                          ? (
                              (balanceData.filter(
                                (rowBalance) =>
                                  rowBalance.frequency === item.frequency &&
                                  rowBalance.scheduleTime === item.time &&
                                  rowBalance.location === itemLocation
                              ).length /
                                balanceData.filter(
                                  (rowBalance) =>
                                    rowBalance.frequency === item.frequency &&
                                    rowBalance.scheduleTime === item.time
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
      </main>
    </LayoutValidation>
  );
};

export default Page;
