'use client';
import NavBar from '../components/NavBar';
import { ReturnTitle } from '../components/Titles';

import { useEffect, useState } from 'react';
import { TableActiveTeacher } from '../components/Rows';
import Image from 'next/image';
import LayoutValidation from '../LayoutValidation';
import { DocentesActivos, PeriodoAcademico } from '../interface/datainterface';
import periodService from '@/services/period';
import teacherService from '@/services/teacher';
import assigmentService from '@/services/assigment';
import { convertToCustomAcronym } from '../utils/managmentWords';
import { ModalWarning } from '../components/Modals';
const Page = () => {
  const [inputValue, setInputValue] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Todas');
  const [selectedState, setSelectedState] = useState('Todas');
  const [newStatus, setDataNewStatus] = useState<string[]>([]);

  const [dataPerido, setDataPeriodo] = useState<PeriodoAcademico>();
  const [dataDocentesActivos, setDataDocentesActivos] = useState<DocentesActivos[]>([]);
  const [nombresSedesData, setNombresSedeData] = useState<{ NombreSede: string }[]>([]);
  const [dataVacia, setDataVacia] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 100;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setCurrentPage(1);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLocation(e.target.value);
    setCurrentPage(1);
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(e.target.value);
    setCurrentPage(1);
  };

  const filteredProfessors = dataDocentesActivos.filter((teacher) => {
    const matchesName = teacher.NombreCompletoProfesor.toLowerCase().includes(
      inputValue.toLowerCase()
    );
    const matchesLocation =
      selectedLocation.toLowerCase() === 'Todas'.toLowerCase() ||
      teacher.NombreSede.toLowerCase() === selectedLocation.toLowerCase();
    const matchesState =
      selectedState === 'Todas' ||
      (teacher.TipoJornada.toLowerCase() === selectedState.toLowerCase() &&
        teacher.eventoIndisponible == '-') ||
      selectedState.toLowerCase() ==
        convertToCustomAcronym(teacher.eventoIndisponible).toLowerCase();

    return matchesName && matchesLocation && matchesState;
  });

  // Calcular datos para la paginación
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentProfessors = filteredProfessors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProfessors.length / pageSize);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const loadDataTest = async () => {
    const resPerido = await periodService.verify();
    if (!resPerido.data) {
      alert('Ya hay un periodo activo o en proceso. Redirigiendo a la página principal.');
      window.location.href = '/home';
    }

    console.log(resPerido.data);
    setDataPeriodo(resPerido.data);
  };

  useEffect(() => {
    loadDataTest();
  }, []);

  const loadDataDocentes = async (id: string) => {
    const resSedesData = await assigmentService.getLocationTac('-1');
    setNombresSedeData(resSedesData.data);
    const resDocentes = await teacherService.getAll(id);
    const resNewStatus = await teacherService.getEventDisponibility(id);
    setDataNewStatus(resNewStatus.data);

    setDataDocentesActivos(resDocentes.data);
    if (resDocentes.data.length === 0) {
      setDataVacia(true);
    }
  };

  useEffect(() => {
    if (dataPerido?.idPeriodo !== undefined) {
      loadDataDocentes(dataPerido.idPeriodo.toString());
    }
  }, [dataPerido]);

  //   const reiniciarPeriodo = async (idPeriodo: string) => {
  //     localStorage.setItem('flagReproceso', 'true');
  //     localStorage.setItem('tipo', 'reinicio');
  //     localStorage.setItem('addEvents', 'false');
  //     localStorage.setItem('periodo', idPeriodo);
  //   };

  return (
    <LayoutValidation>
      <main className="flex flex-col gap-5 w-full min-h-[100vh] p-8 ">
        <NavBar></NavBar>
        <ReturnTitle name="Reinicio del  Período" />
        {dataPerido?.idPeriodo === undefined &&
        dataDocentesActivos[0]?.DocenteID === undefined &&
        nombresSedesData.length === 0 &&
        !dataVacia ? (
          <div className="w-[90%] flex gap-5 justify-center mx-auto flex-col items-center min-h-[50vh]">
            <span className="loading loading-bars loading-lg"></span>
          </div>
        ) : (
          <>
            {dataVacia === true ? (
              <div className="w-[90%] flex gap-5 justify-center mx-auto flex-col items-center min-h-[50vh]">
                <h1 className="font-bold text-5xl">
                  {'Datos No Encontrados para el nuevo periodo '}
                </h1>
              </div>
            ) : (
              <div className="w-full flex flex-row">
                <div className="w-1/2 min-h-[400px]  p-5 flex  justify-center  items-center ">
                  <div className="flex flex-col gap-2">
                    <h2 className="font-bold text-[18px]">Definición:</h2>
                    <p className="text-[13px]">
                      ● La función de reinicio limpiará los datos del periodo actual, eliminará
                      los snapshots almacenados y ejecutará la importación de datos
                      proporcionados por el DWH desde el principio.
                    </p>
                    <p className="text-[13px]">
                      ● Las versiones creadas para visualización se conservarán, y el proceso
                      continuará desde la última versión generada.
                    </p>
                    <p className="text-[13px]">
                      {` ● Toda la información proveniente del sistema de inicio se mostrará con
                      un candado e indicará que viene de "SISTEMA INICIO" .`}
                    </p>
                    <h2 className="font-bold text-[18px]">Nota:</h2>
                    <p className="text-[13px]">
                      ● Es necesario ejecutar la sincronización con el sistema de inicio antes
                      de reiniciar el periodo, de lo contrario, podría perderse la información
                      de asignaciones.
                    </p>

                    <ModalWarning
                      linkTo={'/loading'}
                      subtitle="Esta acción reinciará procesamiento de asignación docente."
                      title="¿Está seguro de reiniciar el período?"
                      idModal={'ReiniciarPeriodo-' + dataPerido?.idPeriodo.toString()}
                      setFunction={() => {
                        alert('Función en progreso');
                      }}
                    />
                    <div className="w-1/2 mx-auto">
                      <button
                        className="btn bg-secundary py-2 px-10 text-white font-semibold hover:bg-secundary_ligth  mt-10 "
                        onClick={() => {
                          const modal = document.getElementById(
                            'ReiniciarPeriodo-' + dataPerido?.idPeriodo.toString()
                          );
                          if (modal) {
                            (modal as HTMLDialogElement).showModal();
                          }
                        }}
                      >
                        Reiniciar asignación docente
                      </button>
                    </div>
                  </div>
                </div>
                <div className="w-1/2 min-h-[72vh] max-h-[72vh]   flex flex-col  gap-3 p-2 -mt-10 ">
                  <h2 className="text-center mb-8 font-roboto text-2xl font-bold">
                    Listado de Docentes Activos:
                  </h2>
                  <div className="w-full flex flex-row gap-5 items-start ">
                    <div className="w-1/2 relative text-black border rounded-md h-fit">
                      <input
                        placeholder={'Busque por el nombre del docente'}
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
                    <label className="form-control w-full max-w-32 -mt-9">
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
                        {Array.isArray(newStatus) &&
                          newStatus.map((item) => {
                            return <option key={item}>{item}</option>;
                          })}
                      </select>
                    </label>
                  </div>
                  <div className="w-full overflow-auto">
                    <table className="w-full ">
                      <thead>
                        <tr className="text-black">
                          <th className="py-2 uppercase font-inter text-start sticky top-0 font-semibold bg-white ">
                            PROFESOR
                          </th>
                          <th className="py-2 uppercase overflow-hidden font-inter text-start sticky top-0 font-semibold bg-white">
                            SEDE
                          </th>
                          <th className="py-2 uppercase font-inter font-semibold sticky top-0 text-start bg-white">
                            ESTADO
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentProfessors.map((teacher, index) => (
                          <TableActiveTeacher
                            key={index}
                            location={teacher.NombreSede}
                            teacher={teacher.NombreCompletoProfesor}
                            status={
                              teacher.eventoIndisponible == '-'
                                ? teacher.TipoJornada
                                : convertToCustomAcronym(teacher.eventoIndisponible)
                            }
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {dataDocentesActivos.length !== 0 ? (
                    <div className="flex justify-end flex-row items-center gap-5 ">
                      <p className="text-xs">Filas por página: {pageSize}</p>
                      <span className="text-xs">
                        Página {currentPage} de {totalPages}
                      </span>
                      <div className="flex items-center justify-center flex-row">
                        <Image
                          className={`size-8 cursor-pointer hover:opacity-80 ${
                            currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          onClick={prevPage}
                          width={20}
                          alt="img"
                          height={20}
                          src={'/arrow-left-icon.svg'}
                        />

                        <Image
                          className={`size-8 cursor-pointer hover:opacity-80 ${
                            currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          onClick={nextPage}
                          width={20}
                          alt="img"
                          height={20}
                          src={'/arrow-rigth-icon.svg'}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="w-[90%] flex gap-5 justify-center mx-auto flex-col items-center min-h-[50vh]">
                      <span className="loading loading-bars loading-lg"></span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </LayoutValidation>
  );
};

export default Page;
