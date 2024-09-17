'use client';
import { ChangeEvent, useState } from 'react';
import NavBar from '../../components/NavBar';
import { ReturnTitle } from '../../components/Titles';
import { PiMagnifyingGlass } from 'react-icons/pi';
import { ModalWarning } from '../../components/Modals';
import { MdOutlineFileDownload } from 'react-icons/md';
import { useParams } from 'next/navigation';
import { IoMdArrowDropdown } from 'react-icons/io';
import { LuHistory } from 'react-icons/lu';
import { singsCompare, timeDaily, timeWeekend } from '../../constants/data';
import { numberCompare, frecuencyData } from '../../constants/data';
import { TableTacReport } from '../../components/Rows';
import { evaluateExpression } from '../../utils/managmentTime';
import LayoutValidation from '@/app/LayoutValidation';
const Page = () => {
  const [inputValue, setInputValue] = useState('');
  const [selectedState, setSelectedState] = useState('Todas');
  const [selectedLocation, setSelectedLocation] = useState('Todas');
  const [selectedSings, setSelectedSings] = useState('ninguna');
  const [selectedNumberCompare, setSelectedNumberCompare] = useState('ninguna');

  const [showHistoryVersion, setShowHistoryVersion] = useState(false);
  const { id } = useParams();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLocation(e.target.value);
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(e.target.value);
  };

  const handleNumberCompareChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedNumberCompare(e.target.value);
  };
  const handleSingsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSings(e.target.value);
  };

  // data de ejempplo
  const tacData = [
    {
      teacher: 'OSTOS RIOS, OLGA DEL CARMEN',
      location: 'LIMA',
      status: 'FT',
      classSchedule: [
        { frecuency: 'LMV', schedule: '8:00 - 12:00', room: 'A213' },
        { frecuency: 'LV', schedule: '14:00 - 16:00', room: 'A230' },
        { frecuency: 'SD', schedule: '10:00 - 12:00', room: 'A214' },
      ],
    },
    {
      teacher: 'FERNANDEZ PEREZ, JUAN CARLOS',
      location: 'AREQUIPA',
      status: 'PT',
      classSchedule: [
        { frecuency: 'LMV', schedule: '14:00 - 18:00', room: 'A215' },
        { frecuency: 'S', schedule: '9:00 - 13:00', room: 'A216' },
      ],
    },
    {
      teacher: 'GARCIA LOPEZ, ANA MARIA',
      location: 'CUSCO',
      status: 'FT',
      classSchedule: [
        { frecuency: 'LMV', schedule: '10:00 - 12:00', room: 'A217' },
        { frecuency: 'SD', schedule: '8:00 - 10:00', room: 'A218' },
      ],
    },
    {
      teacher: 'HUAMAN TORRES, CARLOS ALBERTO',
      location: 'TRUJILLO',
      status: 'PT',
      classSchedule: [
        { frecuency: 'MJ', schedule: '18:00 - 20:00', room: 'A218' },
        { frecuency: 'S', schedule: '14:00 - 16:00', room: 'A219' },
      ],
    },
    {
      teacher: 'MENDOZA RAMOS, LAURA ELENA',
      location: 'LIMA',
      status: 'FT',
      classSchedule: [
        { frecuency: 'MJ', schedule: '8:00 - 10:00', room: 'A220' },
        { frecuency: 'LMV', schedule: '12:00 - 14:00', room: 'A221' },
        { frecuency: 'SD', schedule: '12:00 - 14:00', room: 'A222' },
      ],
    },
  ];

  interface CheckboxState {
    [key: string]: boolean;
  }

  const [checkboxState, setCheckboxState] = useState<CheckboxState>(() =>
    frecuencyData.reduce<CheckboxState>((acc, item) => {
      acc[item] = true;
      return acc;
    }, {})
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { value, checked } = event.target;
    setCheckboxState((prevState) => ({
      ...prevState,
      [value]: checked,
    }));
  };

  const filteredDataTac = tacData.filter(
    (rowTac) =>
      rowTac.teacher.toLowerCase().includes(inputValue.toLowerCase()) &&
      (selectedNumberCompare === 'ninguna' ||
        selectedSings === 'ninguna' ||
        (selectedSings !== 'ninguna' && selectedNumberCompare !== 'ninguna'
          ? evaluateExpression(
              rowTac.classSchedule.length,
              selectedNumberCompare,
              selectedSings
            )
          : false)) &&
      (selectedLocation === 'Todas' ||
        rowTac.location.toLowerCase() === selectedLocation.toLowerCase()) &&
      (selectedState === 'Todas' ||
        rowTac.status.toLowerCase() === selectedState.toLowerCase())
  );

  return (
    <LayoutValidation>
      <main className="flex flex-col gap-5 w-full min-h-[100vh] p-8">
        <NavBar />
        <ReturnTitle name="Reporte TAC" />
        <div className="w-[95%] flex gap-5 justify-center mx-auto flex-col  ">
          <div className="w-full flex flex-row  justify-around items-end -mt-10  ">
            <div className="flex flex-row gap-5 items-end w-full">
              <div className="w-1/3 relative text-black border rounded-md">
                <input
                  placeholder={'Busque por el nombre del docente '}
                  className={
                    'w-full rounded-md py-3 px-3 font-openSans text-opacity-50 text-xs'
                  }
                  onChange={handleInputChange}
                />
                <PiMagnifyingGlass
                  className="absolute right-3 font-extrabold top-2 cursor-pointer text-primary hover:text-gray-500"
                  size={'25px'}
                />
              </div>

              <label className="form-control w-full max-w-32">
                <div className="label">
                  <span className="label-text text-xs">Sede</span>
                </div>
                <select
                  className="select select-bordered text-xs"
                  value={selectedLocation}
                  onChange={handleLocationChange}
                >
                  <option selected>Todas</option>
                  <option>Lima</option>
                  <option>Miraflores</option>
                  <option>La Molina</option>
                </select>
              </label>
              <label className="form-control w-full max-w-28 -mt-9">
                <div className="label">
                  <span className="label-text text-xs">Estado</span>
                </div>
                <select
                  className="select select-bordered text-xs"
                  value={selectedState}
                  onChange={handleStateChange}
                >
                  <option value="Todas">Todas</option>
                  <option value="FT">FT</option>
                  <option value="PT">PT</option>
                  <option value="VAC">VAC</option>
                  <option value="DM">DM</option>
                </select>
              </label>
              <div className="form-control w-full max-w-28 -mt-9 ">
                <div className="label">
                  <span className="label-text text-[10px] -mb-2">N° de clases Asignadas</span>
                </div>
                <div className="flex flex-row gap-4 border  rounded-md w-36 px-2 py-1 items-center ">
                  <label className="form-control w-full max-w-28 ">
                    <div className="label  h-2 text-start   ">
                      <span className="label-text text-[10px] ">Signo</span>
                    </div>
                    <select
                      className="select select-bordered text-xs select-xs max-w-14"
                      value={selectedSings}
                      onChange={handleSingsChange}
                    >
                      <option value="ninguna"></option>
                      {singsCompare.map((sing, index) => {
                        return (
                          <option value={sing} key={index}>
                            {sing}
                          </option>
                        );
                      })}
                    </select>
                  </label>
                  <label className="form-control w-full max-w-28 ">
                    <div className="label  h-2 text-start">
                      <span className="label-text text-[10px] ">N°</span>
                    </div>
                    <select
                      className="select select-bordered text-xs select-xs max-w-14"
                      value={selectedNumberCompare}
                      onChange={handleNumberCompareChange}
                    >
                      <option value="ninguna"></option>
                      {numberCompare.map((number, index) => {
                        return (
                          <option value={number} key={index}>
                            {number}
                          </option>
                        );
                      })}
                    </select>
                  </label>
                </div>
              </div>

              <div className="dropdown dropdown-bottom ml-5">
                <div tabIndex={0} role="button" className="btn bg-white flex flex-row gap-3">
                  Frecuencia <IoMdArrowDropdown />
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow  hover:bg-white cursor-default"
                >
                  {frecuencyData.map((item) => (
                    <li
                      key={item}
                      className="hover:bg-white cursor-default h-10 justify-center"
                    >
                      <div className="form-control hover:bg-white cursor-default">
                        <label className="label cursor-default flex flex-row items-center gap-2">
                          <input
                            type="checkbox"
                            value={item}
                            checked={checkboxState[item] || false}
                            onChange={handleChange}
                            className="checkbox cursor-pointer"
                          />
                          <span className="label-text cursor-default">{item}</span>
                        </label>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <button className="bg-[#50B403] font-roboto py-2 px-8 w-64 text-[14px] text-white font-semibold hover:opacity-80  flex flex-row items-center ">
              <MdOutlineFileDownload className="text-white size-7" />
              Descargar Reporte
            </button>
          </div>
          <div className="flex flex-row gap-10 items-center justify-between">
            <div className="flex flex-row gap-10 items-center ">
              <p>
                <strong>ID: </strong> {id}
              </p>

              <p>
                <strong>Periodo: </strong> Agosto del 2022
              </p>
              <p>
                <strong>Fecha:</strong> 01/08/2022 - 31/08/2022
              </p>
            </div>
            <div className="flex flex-row gap-5  w-40">
              <p>
                <strong>Versión: </strong> N° 2
              </p>

              <div className="relative   ">
                <LuHistory
                  className="size-7  cursor-pointer hover:opacity-60"
                  onClick={() => setShowHistoryVersion(!showHistoryVersion)}
                />

                {/* se debe mapear */}
                <div
                  className={
                    'absolute w-64 min-h-60 h-60 bg-[#ffffff] px-5 border flex flex-col gap-2 items-center p-3 right-[90%] top-8 rounded-md ' +
                    (showHistoryVersion ? 'block' : 'hidden')
                  }
                >
                  <p className="font-inter font-bold mb-2 ">Historial de Versiones</p>
                  <div className="font-roboto font-extralight flex flex-row items-center gap-3">
                    <span className="text-green-500 text-xl">*</span>
                    <span className="hover:underline cursor-pointer text-xs ">
                      N°2 - 08/09/2024 por el usuario x a las 12:02 pm (mas reciente)
                    </span>
                  </div>
                  <p className="font-roboto font-thin flex flex-row items-center gap-3">
                    <span className="text-green-500 text-xl">*</span>
                    <span className="hover:underline cursor-pointer text-xs ">
                      N°1 - 08/09/2024 por el usuario x1 a las 10:01 pm
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full max-w-[100vw] overflow-auto">
            <table className="w-full ">
              <thead>
                <tr className="text-black">
                  <th className="py-2 uppercase max-w-16 overflow-hidden font-inter  bg-[#19B050] text-white min-w-80">
                    PROFESOR
                  </th>
                  <th className="py-2 uppercase font-inter border bg-[#19B050] text-white min-w-32">
                    SEDE
                  </th>
                  <th className="py-2 uppercase font-inter border bg-[#19B050] text-white min-w-24">
                    ESTADO
                  </th>
                  {timeDaily.map((time, index) => (
                    <th
                      key={`daily-${index}`}
                      className="py-2 uppercase font-inter border bg-[#062060] text-white min-w-24"
                    >
                      {time}
                    </th>
                  ))}
                  {timeWeekend.map((time, index) => (
                    <th
                      key={`weekend-${index}`}
                      className="py-2 uppercase font-inter border bg-[#19B0F0] text-white min-w-24"
                    >
                      {time}
                    </th>
                  ))}
                  <th className="py-2 uppercase font-inter border bg-[#19B0F0] text-white min-w-24">
                    Todas
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDataTac.map((rowTac, index) => (
                  <TableTacReport
                    key={index}
                    classSchedule={rowTac.classSchedule.filter(
                      (item) => checkboxState[item.frecuency]
                    )}
                    location={rowTac.location}
                    status={rowTac.status}
                    teacher={rowTac.teacher}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <ModalWarning
            onConfirm={() => alert('Cierre de periodo')}
            subtitle="Esta acción es irreversible."
            title="¿Está seguro de cerrar el período?"
            idModal="my_modal_3"
          />
        </div>
      </main>
    </LayoutValidation>
  );
};

export default Page;
