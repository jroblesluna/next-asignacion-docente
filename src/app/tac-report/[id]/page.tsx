'use client';
import { ChangeEvent, useEffect, useState } from 'react';
import NavBar from '../../components/NavBar';
import { ReturnTitle } from '../../components/Titles';
import { useParams } from 'next/navigation';
import { singsCompare, timeDaily, timeSunday, timeWeekend } from '../../constants/data';
import { numberCompare, frecuencyData } from '../../constants/data';
import { TableTacReport } from '../../components/Rows';
import { evaluateExpression } from '../../utils/managmentTime';
import LayoutValidation from '@/app/LayoutValidation';
import Image from 'next/image';
import {
  docentesTac,
  PeriodoAcademico,
  tacData,
  versionData,
} from '@/app/interface/datainterface';
import assigmentService from '@/services/assigment';
import { downloadExcelTac } from '@/app/utils/downloadExcel';
import periodService from '@/services/period';
import { convertirFecha, convertirFormatoFecha } from '@/app/utils/managmentDate';
import versionService from '@/services/version';

const Page = () => {
  const [inputValue, setInputValue] = useState('');
  const [selectedState, setSelectedState] = useState('Todas');
  const [selectedLocation, setSelectedLocation] = useState('Todas');
  const [selectedSings, setSelectedSings] = useState('ninguna');
  const [selectedNumberCompare, setSelectedNumberCompare] = useState('ninguna');
  const [ProgramacionAcademicaData, setData] = useState<docentesTac[]>([]);
  const [ProgramacionAcademicaDataTac, setDataTac] = useState<tacData[]>([]);
  const [dataPerido, setDataPeriodo] = useState<PeriodoAcademico>();
  const [DataVersion, setDataVersion] = useState<versionData[]>([]);
  const [selectVersion, setSelectedVersion] = useState('');
  const [showHistoryVersion, setShowHistoryVersion] = useState(false);
  const { id } = useParams() as { id: string };
  const [nombresSedesData, setNombresSedeData] = useState<{ NombreSede: string }[]>([]);
  const [dataVacia, setDataVacia] = useState(false);

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

  const loadData = async () => {
    const resPerido = await periodService.getById(id);
    if (!resPerido.data) {
      alert('No se encontraron datos del periodo. Redirigiendo a la página principal.');
      window.location.href = '/history';
    }
    setDataPeriodo(resPerido.data[0]);
    const resVersion = await versionService.getAll(id);
    setDataVersion(resVersion.data);
    setSelectedVersion(resVersion.data[0].idVersion);
    const resSedesData = await assigmentService.getLocationTac(id);
    console.log(resSedesData.data);
    setNombresSedeData(resSedesData.data);
    const res = await assigmentService.getTacAssigment(id, '-1');
    setData(res.data);

    if (res.data.length === 0) {
      setDataVacia(true);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeDataVersion = async (idVersion: string) => {
    setSelectedVersion(idVersion);
    setData([]);
    setDataTac([]);
    setDataVacia(false);
    const res = await assigmentService.getTacAssigment(id, idVersion);
    setData(res.data);
    if (res.data.length === 0) {
      setDataVacia(true);
    }
  };

  useEffect(() => {
    if (ProgramacionAcademicaData[0]) {
      const tacConvertido: tacData[] = ProgramacionAcademicaData.filter(
        (obj, index, self) =>
          index === self.findIndex((o) => o.uuidDocente === obj.uuidDocente)
      ).map((item) => ({
        teacher: item.NombreCompletoProfesor,
        location: item.NombreSede,
        status: item.TipoJornada,
        classSchedule: ProgramacionAcademicaData.filter(
          (item2) => item2.uuidDocente === item.uuidDocente && item2.idFrecuencia !== null
        ).map((elemento) => ({
          frecuency: elemento.NombreAgrupFrecuencia,
          schedule: elemento.HorarioInicio + ' - ' + elemento.HorarioFin,
          room: elemento.codigoCurso,
        })),
      }));
      setDataTac(tacConvertido);
    }
  }, [ProgramacionAcademicaData]);

  interface CheckboxState {
    [key: string]: boolean;
  }

  const downloadExcel = () => {
    if (ProgramacionAcademicaDataTac[0]) {
      downloadExcelTac(ProgramacionAcademicaDataTac, id);
    }
  };

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

  const filteredDataTac = ProgramacionAcademicaDataTac.filter(
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
      <main className="flex flex-col gap-5 w-full min-h-[100vh] px-8 pt-8">
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

                <Image
                  className="absolute right-3 font-extrabold top-2 cursor-pointer  hover:opacity-80 size-[25px]"
                  width={20}
                  alt="img"
                  height={20}
                  src={'/search-icon.svg'}
                />
              </div>

              <label className="form-control w-full max-w-32">
                <div className="label">
                  <span className="label-text text-xs">Sede</span>
                </div>
                <select
                  className="select select-bordered text-xs capitalize"
                  value={selectedLocation}
                  onChange={handleLocationChange}
                >
                  <option value="Todas">Todas</option>
                  {nombresSedesData.map((item, index) => (
                    <option key={index} value={item.NombreSede}>
                      {item?.NombreSede?.toLowerCase() || ''}
                    </option>
                  ))}
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
                </select>
              </label>
              <div className="form-control w-full max-w-28 -mt-9 ">
                <div className="label">
                  <span className="label-text text-[9px] -mb-2">N° de clases Asignadas</span>
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
                <div
                  tabIndex={0}
                  role="button"
                  className="btn bg-white flex flex-row   gap-5   text-start w-[140px] justify-center  align-middle"
                >
                  <p>Frecuencia</p>
                  <Image
                    className="absolute right-1.5 font-extrabold top-4 cursor-pointer  hover:opacity-80 size-[20px] items-center "
                    width={20}
                    alt="img"
                    height={20}
                    src={'/arrow-down-icon.svg'}
                  />
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
            <button
              className="bg-[#50B403] font-roboto py-2 px-8 w-64 text-[14px] text-white font-semibold hover:opacity-80  flex flex-row items-center "
              onClick={() => {
                ProgramacionAcademicaDataTac.length > 0 && !dataVacia && downloadExcel();
              }}
            >
              <Image
                className="size-7"
                width={20}
                alt="img"
                height={20}
                src={'/download-icon.svg'}
              />
              Descargar Reporte
            </button>
          </div>
          <div className="flex flex-row gap-10 items-center justify-between">
            <div className="flex flex-row gap-10 items-center">
              <div className="flex flex-row gap-2">
                <strong>Codigo de Periodo: </strong> {id}
              </div>
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
            <div className="flex flex-row gap-5  w-40">
              <p>
                <strong>Versión: </strong> N°{selectVersion}
              </p>

              <div className="relative ">
                <Image
                  className="size-5  cursor-pointer hover:opacity-60"
                  onClick={() => setShowHistoryVersion(!showHistoryVersion)}
                  width={20}
                  alt="img"
                  height={20}
                  src={'/clock-history-icon.svg'}
                />

                <div
                  className={
                    'absolute w-64 min-h-60 h-60 max-h-60 overflow-y-auto bg-[#ffffff] px-5 border flex flex-col gap-2 items-center p-3 right-[90%] top-8 rounded-md z-20  ' +
                    (showHistoryVersion ? 'block' : 'hidden')
                  }
                >
                  <p className="font-inter font-bold mb-2 ">Historial de Versiones</p>

                  {DataVersion.length === 0 ? (
                    <div className="w-[90%] flex gap-5 justify-center mx-auto flex-col items-center min-h-[50vh]">
                      <span className="loading loading-bars loading-lg"></span>
                    </div>
                  ) : (
                    <>
                      {DataVersion.map((item, index) => {
                        return (
                          <div
                            className="font-roboto font-extralight flex flex-row items-center gap-3"
                            key={index}
                          >
                            <span className="text-green-500 text-xl">*</span>
                            <span
                              className={
                                'hover:underline cursor-pointer text-[10px] ' +
                                (item.idVersion == selectVersion ? 'text-primary_ligth ' : '')
                              }
                              onClick={() => {
                                changeDataVersion(item.idVersion);
                              }}
                            >
                              {`N°${item.idVersion} - Modificado el  ${convertirFormatoFecha(
                                item.fecha
                              )} a las ${item.fechaHora} por el usario: ${item.nombreCreador}`}
                            </span>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          {ProgramacionAcademicaDataTac.length === 0 && !dataVacia ? (
            <div className="w-[90%] flex gap-5 justify-center mx-auto flex-col items-center min-h-[50vh]">
              <span className="loading loading-bars loading-lg"></span>
            </div>
          ) : (
            <>
              {dataVacia === true ? (
                <div className="w-[90%] flex gap-5 justify-center mx-auto flex-col items-center min-h-[50vh]">
                  <h1 className="font-bold text-5xl"> Datos No Encontrados</h1>
                </div>
              ) : (
                <div className="w-full max-w-[100vw] max-h-[27vw] min-h-[27vw]  overflow-auto">
                  <table className="w-full ">
                    <thead>
                      <tr className="text-black">
                        <th className="py-2.5 uppercase max-w-16 overflow-hidden font-inter sticky top-0 bg-[#19B050] text-white min-w-80">
                          PROFESOR
                        </th>
                        <th className="py-2.5 uppercase font-inter border bg-[#19B050] sticky top-0 text-white min-w-32">
                          SEDE
                        </th>
                        <th className="py-2.5 uppercase font-inter border bg-[#19B050] sticky top-0 text-white min-w-24">
                          ESTADO
                        </th>
                        {timeDaily.map((time, index) => (
                          <th
                            key={`daily-${index}`}
                            className="py-2.5 uppercase font-inter border bg-[#062060] sticky top-0 text-white min-w-24"
                          >
                            {time}
                          </th>
                        ))}
                        {timeWeekend.map((time, index) => (
                          <th
                            key={`weekend-${index}`}
                            className="py-2.5 uppercase font-inter border bg-[#19B0F0] sticky top-0 text-white min-w-24"
                          >
                            {time}
                          </th>
                        ))}
                        {timeSunday.map((time, index) => (
                          <th
                            key={`weekend-${index}`}
                            className="py-2.5 uppercase font-inter border bg-[#296984] sticky top-0 text-white min-w-24"
                          >
                            {time}
                          </th>
                        ))}
                        <th className="py-2.5 uppercase font-inter border bg-[#19B0F0] sticky top-0 text-white min-w-24">
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
              )}
            </>
          )}
        </div>
      </main>
    </LayoutValidation>
  );
};

export default Page;
