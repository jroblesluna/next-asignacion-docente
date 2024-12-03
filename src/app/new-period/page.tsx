'use client';
import NavBar from '../components/NavBar';
import { ReturnTitle } from '../components/Titles';
import { convertirFecha, convertirFormatoFecha } from '../utils/managmentDate';
import { ModalWarning } from '../components/Modals';
import { useEffect, useState } from 'react';
import { TableActiveTeacher } from '../components/Rows';
import Image from 'next/image';
import LayoutValidation from '../LayoutValidation';
import { DocentesActivos, PeriodoAcademico } from '../interface/datainterface';
import periodService from '@/services/period';
import teacherService from '@/services/teacher';
import assigmentService from '@/services/assigment';
import { convertToCustomAcronym } from '../utils/managmentWords';
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
    const resPerido = await periodService.getNew();
    if (!resPerido.data) {
      alert('Ya hay un periodo activo o en proceso. Redirigiendo a la página principal.');
      window.location.href = '/home';
    }
    setDataPeriodo(resPerido.data[0]);
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

  const abrirPeriodo = async (idPeriodo: string) => {
    localStorage.setItem('flagReproceso', 'true');
    localStorage.setItem('tipo', 'normal');
    localStorage.setItem('newPeriod', 'true');
    localStorage.setItem('addEvents', 'false');
    localStorage.setItem('periodo', idPeriodo);
    await periodService.updateState(idPeriodo, 'ACTIVO');
  };

  return (
    <LayoutValidation>
      <main className="flex flex-col gap-5 w-full min-h-[100vh] p-8 ">
        <NavBar></NavBar>
        <ReturnTitle name="Registro de Nuevo Período" />
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
                <div className="w-1/2 min-h-[400px]  p-5 flex items-center justify-center  ">
                  <div className="flex flex-col gap-2">
                    <p className="text-2xl">
                      <strong>Periodo: </strong>
                      {convertirFecha(dataPerido?.idPeriodo.toString() || '')}
                    </p>
                    <p className="text-2xl">
                      <strong>Fecha de Inicio: </strong>
                      {convertirFormatoFecha(dataPerido?.fechaInicio || '')}
                    </p>
                    <p className="text-2xl">
                      <strong>Fecha de Termino: </strong>
                      {convertirFormatoFecha(dataPerido?.fechaFinal || '')}
                    </p>

                    <ModalWarning
                      linkTo={'/loading'}
                      subtitle="Esta acción realizará el primer procesamiento de asignación docente."
                      title="¿Está seguro de crear un nuevo período?"
                      idModal={'abrirNuevoPeriodo-' + dataPerido?.idPeriodo.toString()}
                      setFunction={abrirPeriodo}
                    />
                    <button
                      className="btn bg-secundary py-2 px-20 text-white font-semibold hover:bg-secundary_ligth  mt-10"
                      onClick={() => {
                        const modal = document.getElementById(
                          'abrirNuevoPeriodo-' + dataPerido?.idPeriodo.toString()
                        );
                        if (modal) {
                          (modal as HTMLDialogElement).showModal();
                        }
                      }}
                    >
                      Generar asignación docente
                    </button>
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
