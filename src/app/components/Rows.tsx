import { VscDebugBreakpointLog } from 'react-icons/vsc';
import { SlOptionsVertical } from 'react-icons/sl';
interface HistoryTableInterface {
  idPeriod: string;
  startDate: string;
  endDate: string;
  codePeriod: string;
  isActive: boolean;
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
        {isActive ? (
          <div className="bg-[#43D010] text-white font-inter font-semibold text-xs py-1 px-2 rounded-lg">
            <p> ● Activo</p>
          </div>
        ) : (
          <VscDebugBreakpointLog className="text-primary " />
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
        {isActive && (
          <div className="dropdown dropdown-top dropdown-end   bg-white">
            <SlOptionsVertical
              tabIndex={0}
              role="button"
              className="cursor-pointer hover:opacity-80 text-gray-500"
            />

            <ul
              tabIndex={0}
              className="dropdown-content menu rounded-box z-[1] w-40  p-1 mb-2  shadow  bg-white hover:opacity-80 border-none"
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
                    const modal = document.getElementById('my_modal_2');
                    if (modal) {
                      (modal as HTMLDialogElement).showModal();
                    }
                  }}
                >
                  Reprocesar
                </button>
              </li>
              <li>
                <button
                  className=""
                  onClick={() => {
                    const modal = document.getElementById('my_modal_3');
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
import { HiLockClosed } from 'react-icons/hi';

interface ReportAsigmnentTableInterface {
  assignmentId: string;
  course: string;
  schedule: string;
  location: string;
  classroom: string;
  frequency: string;
  teacher: string;
  numberOfStudents: number;
  isRoomClosed: boolean;
  isTeacherClosed: boolean;
}

import { MultiLevelMenuClassroom, MultiLevelMenuTeacher } from './MultiLevelMenu';

export const ReportAsigmnentTable: React.FC<ReportAsigmnentTableInterface> = ({
  location,
  assignmentId,
  classroom,
  course,
  frequency,
  isRoomClosed,
  isTeacherClosed,
  numberOfStudents,
  schedule,
  teacher,
}) => {
  const data = ['105', '106', '107'];

  return (
    <tr
      className={
        'text-[#050505]   border-b-[0.5px] border-[#a1c2f1] ' +
        (teacher === '' || teacher === '-' ? ' bg-[#FFCA38]' : ' ')
      }
    >
      <td>
        {isRoomClosed || isTeacherClosed ? (
          <HiLockClosed onClick={() => alert(assignmentId)} />
        ) : (
          <p className="text-transparent">●</p>
        )}
      </td>
      <td className="font-inter text-start py-3">{location}</td>
      <td className="font-inter text-center  py-3">{course}</td>
      <td className="font-inter text-center  py-3">{schedule}</td>
      <td className="font-inter text-center  py-3">{frequency}</td>
      <td className="font-inter text-center py-3">
        <MultiLevelMenuClassroom classRoom={classroom} data={data} idRow={assignmentId} />
      </td>
      <td className="font-inter text-start  py-3 uppercase">
        <MultiLevelMenuTeacher
          teacher={teacher}
          idRow={assignmentId}
          dataPossibleTeacher={['LINDA ALMAR', 'JUAN REYNOSO']}
          dataRecomended={['Juna diaz', 'pedro ruiz', 'alfin dei']}
        />
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

import { timeDaily, timeWeekend } from '../constants/data';
import { isTimeInRange, containsDaysOfWeek } from '../utils/managmentTime';
import Link from 'next/link';
export const TableTacReport: React.FC<TeacherAssignment> = ({
  classSchedule,
  location,
  status,
  teacher,
}) => {
  return (
    <tr className={'text-[#050505]  text-[14px]  border-b-[0.5px] border-[#a1c2f1] '}>
      <td className="font-inter text-start py-2.5">{teacher}</td>
      <td className="font-inter py-2.5 ">{location}</td>
      <td className="font-inter text-center  py-2.5">{status}</td>
      {/* duda sobre el termino del rango */}
      {timeDaily.map((time, index) => (
        <td
          key={`daily-${index}`}
          className="py-2 uppercase font-inter border text-center  min-w-24"
        >
          <p>
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
          <p>
            {classSchedule
              .filter(
                (classItem) =>
                  isTimeInRange(time, classItem.schedule) &&
                  !containsDaysOfWeek(classItem.frecuency)
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
