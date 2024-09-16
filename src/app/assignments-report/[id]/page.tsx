'use client';

import { useParams, useRouter } from 'next/navigation';
import React from 'react';
import { useContext, useState } from 'react';
import NavBar from '../../components/NavBar';
import { ReturnTitle } from '../../components/Titles';
import { PiMagnifyingGlass } from 'react-icons/pi';
import { ModalWarning } from '../../components/Modals';
import { MdOutlineFileDownload } from 'react-icons/md';
import { BiSolidEdit } from 'react-icons/bi';
import { ReportAsigmnentTable } from '../../components/Rows';
import {
  ContextAssignmentReport,
  ContextAssignmentReportProvider,
} from '../../components/MyContexts';
import { locationData } from '../../constants/data';

const ReportAssignments = () => {
  const { id } = useParams();
  const [inputValue, setInputValue] = useState('');
  const [selectedSede, setSelectedSede] = useState('Todas');
  const [onlyUnassigned, setOnlyUnassigned] = useState(false);
  const [onlyLocked, setOnlyLocked] = useState(false);
  const router = useRouter();
  const [filterOption, setFilterOption] = useState('Curso');

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
  const { assignments, modifications } = context;

  const filteredAssignments = assignments
    .filter((assignment) => {
      const matchesInputValue =
        filterOption === 'Curso'
          ? assignment.course.toLowerCase().includes(inputValue.toLowerCase())
          : filterOption === 'Profesor'
          ? assignment.teacher.toLowerCase().includes(inputValue.toLowerCase())
          : filterOption === 'Aula'
          ? assignment.classroom.toLowerCase().includes(inputValue.toLowerCase())
          : true;

      return matchesInputValue;
    })
    .filter(
      (assignment) =>
        (selectedSede === 'Todas' ||
          assignment.location.toLowerCase() === selectedSede.toLowerCase()) &&
        (!onlyUnassigned || assignment.teacher === '' || assignment.teacher === '-') &&
        (!onlyLocked || assignment.isTeacherClosed || assignment.isRoomClosed)
    );

  return (
    <main className="flex flex-col gap-5 w-full min-h-[100vh] p-8">
      <NavBar />
      <ReturnTitle name="Tabla de Asignaciones" />
      <div className="w-[95%] flex gap-5 justify-center mx-auto flex-col  ">
        <div className="w-full flex flex-row gap-5 items-end -mt-10">
          <div className="w-1/4 relative text-black border rounded-md">
            <input
              placeholder={'Seleccione y busque '}
              className={'w-full rounded-md py-3 px-3 font-openSans text-opacity-50 text-xs'}
              onChange={handleInputChange}
            />
            <PiMagnifyingGlass
              className="absolute right-3 font-extrabold top-2 cursor-pointer text-primary hover:text-gray-500"
              size={'25px'}
            />
          </div>

          <select
            className="select select-bordered w-full max-w-32"
            value={filterOption}
            onChange={handleFilterOptionChange}
          >
            <option value="Curso">Curso</option>
            <option value="Profesor">Profesor</option>
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
              {locationData.map((item, index) => {
                return (
                  <option value={item} key={index}>
                    {item.toLowerCase()}
                  </option>
                );
              })}
            </select>
          </label>

          <button className="bg-[#50B403] font-roboto py-2 px-6 text-[14px]  text-white font-semibold hover:opacity-80 mx-auto flex flex-row items-center ">
            <MdOutlineFileDownload className="text-white size-7" />
            Descargar Reporte
          </button>

          <button
            className={`font-roboto py-2 px-6 text-[14px] text-white font-semibold flex flex-row items-center gap-1 mx-auto ${
              modifications.length === 0
                ? 'bg-[#7C7C7C] pointer-events-none'
                : 'bg-secundary hover:bg-secundary_ligth '
            }`}
            onClick={() => {
              const modal = document.getElementById('my_modal_5');
              if (modal) {
                (modal as HTMLDialogElement).showModal();
              }
            }}
          >
            <BiSolidEdit className="text-white text-[28px]" />
            Realizar Cambios
          </button>
        </div>
        <div className="flex flex-row gap-10 items-center">
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
        <ModalWarning
          onConfirm={() => router.push('/history')}
          subtitle="Esta acción es irreversible."
          title="¿Está seguro de realizar los cambios? "
          idModal="my_modal_5"
        />
      </div>
      <table className="w-full ">
        <thead>
          <tr className="text-black">
            <th className="py-2 font-inter">
              <p className="text-transparent">●</p>
            </th>
            <th className="py-2 uppercase max-w-16 overflow-hidden font-inter text-start">
              SEDE
            </th>
            <th className="py-2 uppercase font-inter">CURSO</th>
            <th className="py-2 uppercase font-inter">HORARIO</th>
            <th className="py-2 uppercase font-inter">FRECUENCIA</th>
            <th className="py-2 uppercase font-inter">AULA</th>
            <th className="py-2 uppercase font-inter text-start">PROFESOR</th>
            <th className="py-2 uppercase font-inter">N° DE ALUMNOS</th>
          </tr>
        </thead>
        <tbody>
          {filteredAssignments.map((assignment) => (
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
            />
          ))}
        </tbody>
      </table>
    </main>
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
