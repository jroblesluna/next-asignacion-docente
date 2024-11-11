/* eslint-disable @typescript-eslint/no-unused-vars */
// import { VscDebugBreakpointLog } from 'react-icons/vsc';
import Image from 'next/image';

interface HistoryTableInterface {
  idPeriod: string;
  startDate: string;
  endDate: string;
  codePeriod: string;
  isActive: string;
}

export const HistoryTable: React.FC<HistoryTableInterface> = ({
  codePeriod,
  endDate,
  idPeriod,
  startDate,
  isActive,
}) => {
  return (
    <tr className="text-[#050505]   border-b-[0.5px]  border-[#a1c2f1] ">
      <td className="py-3.5 flex items-center justify-center ">
        {isActive == 'ACTIVO' ? (
          <div className="bg-[#43D010] text-white font-inter font-semibold text-[11px] py-1 px-2 rounded-lg  text-center  min-w-[75px]  max-w-[75px]">
            <p> ● Activo</p>
          </div>
        ) : isActive == 'CARGANDO' ? (
          <div className="bg-primary_ligth text-white font-inter font-semibold text-[9.5px] py-2 px-2 rounded-lg max-w-[75px]">
            <p> ● Cargando</p>
          </div>
        ) : (
          <div className="bg-secundary text-white font-inter font-semibold text-[11px] py-1 px-2 rounded-lg max-w-[75px]">
            <p> ● Cerrado</p>
          </div>
        )}
      </td>
      <td className="py-3.5 text-center font-bold font-roboto">{codePeriod}</td>
      <td className="py-3.5 text-center max-w-28 font-medium font-inter">{`${startDate} - ${endDate}`}</td>
      <td className="py-3.5 text-center">
        <Link
          className="hover:underline cursor-pointer hover:opacity-80 text-primary_ligth font-medium font-inter"
          href={`/assignments-report/${idPeriod}`}
        >
          Asignaciones
        </Link>
      </td>
      <td className="py-3.5 text-center">
        <Link
          className="hover:underline cursor-pointer hover:opacity-80 text-primary_ligth font-medium font-inter"
          href={`/balance-report/${idPeriod}`}
        >
          Ver Balance
        </Link>
      </td>
      <td className="py-3.5 text-center">
        <Link
          className="hover:underline cursor-pointer hover:opacity-80 text-primary_ligth font-medium font-inter"
          href={`/tac-report/${idPeriod}`}
        >
          Reporte TAC
        </Link>
      </td>
      <td>
        {isActive == 'ACTIVO' && (
          <div className="dropdown dropdown-top dropdown-end   bg-white">
            <Image
              className="cursor-pointer hover:opacity-80 text-gray-500"
              tabIndex={0}
              role="button"
              width={20}
              alt="img"
              height={20}
              src={'/option-icon.svg'}
            />

            <ul
              tabIndex={0}
              className="dropdown-content menu rounded-box z-[1] w-44 p-1 mb-2  shadow  bg-white hover:opacity-80 border-none"
            >
              <li>
                <Link className="" href={`/events-period/${idPeriod}`}>
                  Ver Eventos
                </Link>
              </li>
              <li>
                <button
                  className=""
                  onClick={() => {
                    const modal = document.getElementById('reprocesar-' + idPeriod);
                    if (modal) {
                      (modal as HTMLDialogElement).showModal();
                    }
                  }}
                >
                  Reprocesar Faltantes
                </button>
              </li>
              <li>
                <button
                  className=""
                  onClick={() => {
                    const modal = document.getElementById('reprocesarTotal-' + idPeriod);
                    if (modal) {
                      (modal as HTMLDialogElement).showModal();
                    }
                  }}
                >
                  Volver a procesar
                </button>
              </li>
              <li>
                <button
                  className=""
                  onClick={() => {
                    const modal = document.getElementById('closePeriod-' + idPeriod);
                    if (modal) {
                      (modal as HTMLDialogElement).showModal();
                    }
                  }}
                >
                  Cerrar Periodo
                </button>
              </li>
            </ul>
          </div>
        )}
      </td>
    </tr>
  );
};

interface ReportAsigmnentTableInterface {
  assignmentId: string;
  course: string;
  schedule: string;
  location: string;
  classroom: string;
  classroomId: string;
  classroomIdInitial: string;
  identificadorFisicoinicial: string;
  frequency: string;
  teacher: string;
  teacherId: string;
  numberOfStudents: number;
  isRoomClosed: string | null;
  isTeacherClosed: string | null;
  isEditable: boolean;
}

import { MultiLevelMenuClassroom, MultiLevelMenuTeacher } from './MultiLevelMenu';

export const ReportAsigmnentTable: React.FC<ReportAsigmnentTableInterface> = ({
  location,
  assignmentId,
  classroom,
  classroomId,
  classroomIdInitial,
  course,
  frequency,
  isRoomClosed,
  identificadorFisicoinicial,
  isTeacherClosed,
  numberOfStudents,
  schedule,
  teacher,
  teacherId,
  isEditable,
}) => {
  const [selectedItem, setSelectedItem] = useState(classroom);

  const cambiarAlIdentificadorInicial = () => {
    setSelectedItem(identificadorFisicoinicial);
  };

  return (
    <tr
      className={
        'text-[#050505]   border-b-[0.5px] border-[#a1c2f1] ' +
        (teacher === '' || (teacher === '-' && isEditable) ? ' bg-[#FFCA38]' : ' ')
      }
    >
      <td className="px-1">
        {isRoomClosed || isTeacherClosed ? (
          <div
            className="tooltip  tooltip-right "
            data-tip={`${
              !isTeacherClosed
                ? 'No hay modificaciones de docente'
                : 'Docente modificado por ' + isTeacherClosed
            } /  ${
              !isRoomClosed
                ? 'No hay modificaciones de Aula'
                : 'Aula modificado por ' + isRoomClosed
            } `}
          >
            <Image
              className="size-[15px] opacity-70 z-0"
              width={20}
              alt="img"
              height={20}
              src={'/locked-icon.svg'}
            />
          </div>
        ) : (
          <p className="text-transparent">●</p>
        )}
      </td>
      <td className="font-inter text-start py-3">{location}</td>
      <td className="font-inter text-center  py-3">{course}</td>
      <td className="font-inter text-center  py-3">{schedule}</td>
      <td className="font-inter text-center  py-3">{frequency}</td>
      <td className="font-inter text-center py-3">
        {isEditable ? (
          <MultiLevelMenuClassroom
            classRoom={selectedItem}
            classroomId={classroomId}
            classroomIdInitial={classroomIdInitial}
            location={location}
            idRow={assignmentId}
          />
        ) : (
          <p>
            {location != 'Virtual'
              ? selectedItem
              : classroomId == classroomIdInitial
              ? selectedItem
              : 'CAD-' + selectedItem}
          </p>
        )}
      </td>
      <td className="font-inter text-start  py-3 uppercase">
        {isEditable ? (
          <MultiLevelMenuTeacher
            teacher={teacher}
            location={location}
            idRow={assignmentId}
            teacherId={teacherId}
            setFuntion={cambiarAlIdentificadorInicial}
          />
        ) : (
          <p>{teacher}</p>
        )}
      </td>
      <td className="font-inter text-center  py-3">{numberOfStudents}</td>
    </tr>
  );
};

interface TableActiveTeacherInterface {
  location: string;
  status: string;
  teacher: string;
}

export const TableActiveTeacher: React.FC<TableActiveTeacherInterface> = ({
  location,
  status,
  teacher,
}) => {
  return (
    <tr className={'text-[#050505]  text-[14px]  border-b-[0.5px] border-[#a1c2f1] '}>
      <td className="font-inter text-start py-2.5">{teacher}</td>
      <td className="font-inter text-start  py-2.5">{location}</td>
      <td className="font-inter text-start  py-2.5">{status}</td>
    </tr>
  );
};

interface TableEventReportInterface {
  name: string;
  description: string;
  date: string;
  time: string;
  status: string;
}

export const TableEventReport: React.FC<TableEventReportInterface> = ({
  date,
  description,
  name,
  status,
  time,
}) => {
  return (
    <tr className={'text-[#050505]  text-[14px]  border-b-[0.5px] border-[#a1c2f1] '}>
      <td className="font-inter text-start py-2.5">{name}</td>
      <td className="font-inter text-start  py-2.5  ">{description}</td>
      <td className="font-inter text-start  py-2.5">{date}</td>
      <td className="font-inter text-start  py-2.5">{time}</td>
      <td className="font-inter text-start  py-2.5">{status}</td>
    </tr>
  );
};

interface ClassSchedule {
  frecuency: string;
  schedule: string;
  room: string;
}

interface TeacherAssignment {
  teacher: string;
  location: string;
  status: string;
  classSchedule: ClassSchedule[];
}

import { timeDaily, timeSunday, timeWeekend } from '../constants/data';
import { isTimeInRange, containsDaysOfWeek } from '../utils/managmentTime';
import Link from 'next/link';
import { useState } from 'react';
export const TableTacReport: React.FC<TeacherAssignment> = ({
  classSchedule,
  location,
  status,
  teacher,
}) => {
  return (
    <tr className={'text-[#050505]  text-[14px]  border-b-[0.5px] border-[#a1c2f1] '}>
      <td className="font-inter text-start py-2.5">{teacher}</td>
      <td className="font-inter py-2.5 text-[11px] pl-2  ">{location}</td>
      <td className="font-inter text-center  py-2.5">{status}</td>
      {timeDaily.map((time, index) => (
        <td
          key={`daily-${index}`}
          className="py-2 uppercase font-inter border text-center  min-w-24"
        >
          <p className="text-xs ">
            {classSchedule
              .filter(
                (classItem) =>
                  isTimeInRange(time, classItem.schedule) &&
                  containsDaysOfWeek(classItem.frecuency)
              )
              .map((classItem, index, array) => (
                <span key={index}>
                  {classItem.room + (index !== array.length - 1 ? '/' : '')}
                </span>
              ))}
          </p>
        </td>
      ))}
      {timeWeekend.map((time, index) => (
        <td
          key={`weekend-${index}`}
          className="py-2 uppercase font-inter border text-center min-w-24"
        >
          <p className="text-xs">
            {classSchedule
              .filter(
                (classItem) =>
                  isTimeInRange(time, classItem.schedule) &&
                  !containsDaysOfWeek(classItem.frecuency) &&
                  (classItem.frecuency == 'S' || classItem.frecuency == 'SD')
              )
              .map((classItem, index, array) => (
                <span key={index}>
                  {classItem.room + (index !== array.length - 1 ? '/' : '')}
                </span>
              ))}
          </p>
        </td>
      ))}
      {timeSunday.map((time, index) => (
        <td
          key={`weekend-${index}`}
          className="py-2 uppercase font-inter border text-center min-w-24"
        >
          <p className="text-xs">
            {classSchedule
              .filter(
                (classItem) =>
                  isTimeInRange(time, classItem.schedule) &&
                  !containsDaysOfWeek(classItem.frecuency) &&
                  classItem.frecuency == 'D'
              )
              .map((classItem, index, array) => (
                <span key={index}>
                  {classItem.room + (index !== array.length - 1 ? '/' : '')}
                </span>
              ))}
          </p>
        </td>
      ))}
      <td className="py-2 uppercase font-inter border text-center min-w-24">
        {classSchedule.length}
      </td>
    </tr>
  );
};
