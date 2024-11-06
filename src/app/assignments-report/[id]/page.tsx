/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { useEffect, useMemo } from 'react';
import { useContext, useState } from 'react';
import NavBar from '../../components/NavBar';
import { ReturnTitle } from '../../components/Titles';
import Image from 'next/image';
import { ModalWarning } from '../../components/Modals';
import { ReportAsigmnentTable } from '../../components/Rows';
import {
  ContextAssignmentReport,
  ContextAssignmentReportProvider,
} from '../../components/MyContexts';
import LayoutValidation from '@/app/LayoutValidation';
import { useParams } from 'next/navigation';
import assigmentService from '@/services/assigment';
import { handleDownload } from '@/app/utils/downloadExcel';
import {
  Assignment,
  PeriodoAcademico,
  ProgramacionAcademica,
} from '@/app/interface/datainterface';
import periodService from '@/services/period';
import { convertirFecha, convertirFormatoFecha } from '@/app/utils/managmentDate';

const ReportAssignments = () => {
  const { id } = useParams() as { id: string };
  const [inputValue, setInputValue] = useState('');
  const [selectedSede, setSelectedSede] = useState('Todas');
  const [onlyUnassigned, setOnlyUnassigned] = useState(false);
  const [onlyLocked, setOnlyLocked] = useState(false);
  const [filterOption, setFilterOption] = useState('Profesor');
  const [dataVacia, setDataVacia] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const [ProgramacionAcademicaData, setData] = useState<ProgramacionAcademica[]>([]);
  const [nombresSedesData, setNombresSedeData] = useState<{ NombreSede: string }[]>([]);

  const [dataPerido, setDataPeriodo] = useState<PeriodoAcademico>();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSedeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSede(e.target.value);
  };

  const handleUnassignedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOnlyUnassigned(e.target.checked);
  };
  const handleOnlyLockedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOnlyLocked(e.target.checked);
  };

  const handleFilterOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterOption(e.target.value);
  };

  const context = useContext(ContextAssignmentReport);

  if (!context) {
    throw new Error('DisplayComponent debe ser usado dentro de MyContextProvider');
  }
  const { assignments, setAssignments, setPeriod, setLastVersionID } = context;

  const filteredAssignments = useMemo(() => {
    return assignments
      .filter((assignment) => {
        const matchesInputValue =
          filterOption === 'Curso'
            ? assignment.course.toLowerCase().trim().includes(inputValue.toLowerCase())
            : filterOption === 'Profesor'
            ? assignment.teacher.toLowerCase().trim().includes(inputValue.toLowerCase())
            : filterOption === 'Aula'
            ? assignment.classroom.toLowerCase().trim().includes(inputValue.toLowerCase())
            : true;

        return matchesInputValue;
      })
      .filter(
        (assignment) =>
          (selectedSede === 'Todas' ||
            assignment.location.toLowerCase().trim() === selectedSede.toLowerCase().trim()) &&
          (!onlyUnassigned || assignment.teacher === '' || assignment.teacher === '-') &&
          (!onlyLocked || assignment.isTeacherClosed || assignment.isRoomClosed)
      );
  }, [assignments, inputValue, selectedSede, onlyUnassigned, onlyLocked, filterOption]);

  const totalPages = Math.ceil(filteredAssignments.length / rowsPerPage);
  const paginatedAssignments = filteredAssignments.slice(startIndex, endIndex);

  const handlePageChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const saludar = (mensaje: string) => {
    console.log(mensaje);
  };

  const loadDataTest = async () => {
    const resPerido = await periodService.getById(id);
    if (!resPerido.data) {
      alert('No se encontraron datos del periodo. Redirigiendo a la página principal.');
      window.location.href = '/history';
    }
    setDataPeriodo(resPerido.data[0]);

    const res = await assigmentService.getAll(id, '-1');
    setData(res.data);

    const resSedesData = await assigmentService.getLocation(id);
    setNombresSedeData(resSedesData.data);

    if (res.data.length === 0) {
      setDataVacia(true);
    }
  };

  useEffect(() => {
    loadDataTest();
  }, []);

  useEffect(() => {
    if (ProgramacionAcademicaData[0]) {
      setPeriod(id);
      setLastVersionID(ProgramacionAcademicaData[0].idVersion.toString());
      const assignmentsConvertido: Assignment[] = ProgramacionAcademicaData.map((item) => ({
        assignmentId: item.uuuidProgramacionAcademica,
        isRoomClosed: item.aulaModificada,
        isTeacherClosed: item.docenteModificado,
        location: item.nombreSede,
        course: item.codigoCurso || 'No Encontrado',
        schedule: `${item.HorarioInicio} - ${item.HorarioFin}`,
        frequency: item.NombreAgrupFrecuencia,
        classroom: item.identificadorFisico || '-',
        teacher:
          item.nombreSede === item.nombreSedeAlojada
            ? item.NombreCompletoProfesor
            : item.nombreSedeAlojada !== null
            ? item.NombreCompletoProfesor + ` (${item.nombreSedeAlojada})`
            : '-',
        teacherId: item.idDocente !== null ? item.idDocente.toString() : '',
        numberOfStudents: item.matriculados,
        isEditable: dataPerido?.estado == 'ACTIVO',
      }));
      setAssignments(assignmentsConvertido);
      console.log(assignmentsConvertido);
    }
  }, [ProgramacionAcademicaData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [inputValue, selectedSede, onlyLocked, onlyUnassigned]);

  return (
    <LayoutValidation>
      <main className="flex flex-col gap-5 w-full min-h-[100vh] px-8 pt-8">
        <NavBar />
        <ReturnTitle name="Tabla de Asignaciones" link="/history" />
        <div className="w-[95%] flex gap-5 justify-center mx-auto flex-col  ">
          <div className="w-full flex flex-row gap-5 items-end -mt-10">
            <div className="w-1/4 relative text-black border rounded-md">
              <input
                placeholder={'Seleccione el tipo y busque '}
                className={'w-full rounded-md py-3 px-3 font-openSans text-opacity-50 text-xs'}
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

            <select
              className="select select-bordered w-full max-w-32"
              value={filterOption}
              onChange={handleFilterOptionChange}
            >
              <option value="Profesor">Profesor</option>
              <option value="Curso">Curso</option>
              <option value="Aula">Aula</option>
            </select>

            <div className="form-control max-w-32 border rounded-lg px-1 ">
              <label className="label cursor-pointer flex flex-row justify-around gap-3 ">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={onlyUnassigned}
                  onChange={handleUnassignedChange}
                />
                <span className="label-text text-xs">Solo cursos sin asignar</span>
              </label>
            </div>
            <div className="form-control max-w-28 border rounded-lg px-1 ">
              <label className="label cursor-pointer flex flex-row justify-around gap-3 ">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={onlyLocked}
                  onChange={handleOnlyLockedChange}
                />
                <span className="label-text text-xs">Solo Editados</span>
              </label>
            </div>

            <label className="form-control w-full max-w-32">
              <div className="label">
                <span className="label-text text-xs">Sede</span>
              </div>
              <select
                className="select select-bordered text-xs capitalize"
                value={selectedSede}
                onChange={handleSedeChange}
              >
                <option value="Todas">Todas</option>
                {nombresSedesData.map((item, index) => (
                  <option value={item.NombreSede} key={index}>
                    {item?.NombreSede?.toLowerCase()}
                  </option>
                ))}
              </select>
            </label>

            <button
              className="bg-[#50B403] font-roboto py-2 px-6 text-[14px]  text-white font-semibold hover:opacity-80 mx-auto flex flex-row items-center "
              onClick={() => {
                ProgramacionAcademicaData[0] &&
                  handleDownload(
                    ProgramacionAcademicaData,
                    'reporteAsignaciones' + id,
                    'asignaciones' + id
                  );
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
            {dataPerido?.estado == 'ACTIVO' && (
              <button
                className="bg-primary font-roboto py-3 px-10 text-[14px]  text-white font-semibold hover:opacity-80 mx-auto flex flex-row items-center "
                onClick={() => {
                  const modal = document.getElementById('my_modal_25');
                  if (modal) {
                    (modal as HTMLDialogElement).showModal();
                  }
                }}
              >
                <Image
                  className="size-4 mr-1"
                  width={20}
                  alt="img"
                  height={20}
                  src={'/sync-inc.svg'}
                />
                Sincronizar
              </button>
            )}
          </div>
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
          <ModalWarning
            linkTo={'/history'}
            subtitle="Esta acción es irreversible."
            title="¿Está seguro de realizar los cambios? "
            idModal="my_modal_5"
            setFunction={saludar}
          />
          <ModalWarning
            linkTo={'/history'}
            subtitle="El sistema se bloqueará mientras se esté ejecutando."
            title="¿Está seguro de sincronizar la data con el sistema Inicio? "
            idModal="my_modal_25"
            setFunction={saludar}
          />
        </div>
        {ProgramacionAcademicaData.length === 0 &&
        nombresSedesData.length === 0 &&
        !dataVacia ? (
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
              <div className="w-full overflow-auto min-h-[48vh] max-h-[48vh]  ">
                <table className="w-full ">
                  <thead>
                    <tr className="text-black bg-white">
                      <th className="py-2 font-inter sticky top-0 bg-white z-10 ">
                        <p className="text-transparent">●</p>
                      </th>
                      <th className="py-2 uppercase max-w-16 overflow-hidden font-inter text-start sticky top-0 bg-white">
                        SEDE
                      </th>
                      <th className="py-2 uppercase font-inter sticky top-0 bg-white">
                        CURSO
                      </th>
                      <th className="py-2 uppercase font-inter sticky top-0 bg-white ">
                        HORARIO
                      </th>
                      <th className="py-2 uppercase font-inter sticky top-0 bg-white">
                        FRECUENCIA
                      </th>
                      <th className="py-2 uppercase font-inter sticky top-0 bg-white z-10 ">
                        AULA
                      </th>
                      <th className="py-2 uppercase font-inter text-start sticky top-0 bg-white z-10">
                        PROFESOR
                      </th>
                      <th className="py-2 uppercase font-inter sticky top-0  bg-white">
                        N° DE ALUMNOS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAssignments.map((assignment) => (
                      <ReportAsigmnentTable
                        key={assignment.assignmentId}
                        location={assignment.location}
                        assignmentId={assignment.assignmentId}
                        classroom={assignment.classroom}
                        course={assignment.course}
                        frequency={assignment.frequency}
                        isRoomClosed={assignment.isRoomClosed}
                        isTeacherClosed={assignment.isTeacherClosed}
                        numberOfStudents={assignment.numberOfStudents}
                        schedule={assignment.schedule}
                        teacher={assignment.teacher}
                        isEditable={assignment.isEditable}
                        teacherId={assignment.teacherId}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
        {filteredAssignments.length !== 0 ? (
          <div className="flex justify-end flex-row items-center gap-5 ">
            <p className="text-xs">Filas por página: {rowsPerPage}</p>
            <p className="text-xs">
              {`${startIndex + 1}-${Math.min(endIndex, filteredAssignments.length)} de 
                  ${filteredAssignments.length}`}
            </p>
            <div className="flex items-center justify-center flex-row">
              <Image
                className={`size-8 cursor-pointer hover:opacity-80 ${
                  currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => handlePageChange('prev')}
                width={20}
                alt="img"
                height={20}
                src={'/arrow-left-icon.svg'}
              />

              <Image
                className={`size-8 cursor-pointer hover:opacity-80 ${
                  currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => handlePageChange('next')}
                width={20}
                alt="img"
                height={20}
                src={'/arrow-rigth-icon.svg'}
              />
            </div>
          </div>
        ) : (
          <></>
        )}
      </main>
    </LayoutValidation>
  );
};

const Page = () => {
  return (
    <ContextAssignmentReportProvider>
      <ReportAssignments />
    </ContextAssignmentReportProvider>
  );
};

export default Page;
