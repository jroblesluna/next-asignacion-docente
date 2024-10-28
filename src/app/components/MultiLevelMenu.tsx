import React, { useState, useContext } from 'react';
import { ContextAssignmentReport } from './MyContexts';
import useHover from '../utils/useHover';
import { ModalFormTeacher, ModalFormTeacherCompatibility } from './Modals';
import assigmentService from '@/services/assigment';
interface MultiLevelMenuClassroomProps {
  idRow: string;
  classRoom: string;
  data: string[];
}

export const MultiLevelMenuClassroom: React.FC<MultiLevelMenuClassroomProps> = ({
  idRow,
  classRoom,
  data,
}) => {
  const [selectedItem, setSelectedItem] = useState(classRoom);
  const { handleMouseEnter, handleMouseLeave, isHovered } = useHover();
  const context = useContext(ContextAssignmentReport);
  if (!context) {
    throw new Error('DisplayComponent debe ser usado dentro de MyContextProvider');
  }

  const { assignments, setAssignments, setModifications } = context;

  const UpdateClasRoom = (assignmentId: string, classRoom: string) => {
    const updatedAssignments = assignments.map((assignment) =>
      assignment.assignmentId === assignmentId
        ? {
            ...assignment,
            classroom: classRoom,
            isRoomClosed: true,
          }
        : assignment
    );
    setModifications((prevModifications) => [...prevModifications, assignmentId]);

    setAssignments([...updatedAssignments]);
  };

  const onhandleClick = (classRoom: string) => {
    setSelectedItem(classRoom);
    UpdateClasRoom(idRow, classRoom);
  };

  return (
    <div className="relative inline-block cursor-pointer">
      <div className="flex flex-col">
        <div className="relative group dropdown dropdown-right rounded-none">
          <div tabIndex={0} role="button" className="rounded-none">
            {selectedItem}
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100  z-[1] w-52 p-0 ml-2 shadow rounded-none"
          >
            <li
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="rounded-none"
            >
              <a className="rounded-none selection:bg-transparent">
                <p>CAMBIAR ASIGNACIÓN A</p>
                <div className="absolute left-full top-0 bg-white border border-gray-300 mt-1 shadow-lg   ">
                  {data.map((item) => (
                    <div
                      className={
                        'p-2 cursor-pointer hover:bg-gray-200 w-20 text-center block ' +
                        (!isHovered ? 'hidden' : ' ')
                      }
                      key={item}
                      onClick={() => onhandleClick(item)}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

interface MultiLevelMenuTeacherProps {
  teacher: string;
  idRow: string;
  dataRecomended: string[];
  teacherId: string;
}

export const MultiLevelMenuTeacher: React.FC<MultiLevelMenuTeacherProps> = ({
  teacher,
  idRow,
}) => {
  const [selectedItem, setSelectedItem] = useState(teacher);
  const {
    handleMouseEnter: handleMouseEnter1,
    handleMouseLeave: handleMouseLeave1,
    isHovered: isHovered1,
  } = useHover();

  const context = useContext(ContextAssignmentReport);
  if (!context) {
    throw new Error('DisplayComponent debe ser usado dentro de MyContextProvider');
  }

  const { assignments, setAssignments, setModifications, period, LastVersionID } = context;

  const UpdateTeacher = (assignmentId: string, newTeacher: string) => {
    const updatedAssignments = assignments.map((assignment) =>
      assignment.assignmentId === assignmentId
        ? {
            ...assignment,
            teacher: newTeacher,
            isTeacherClosed: newTeacher !== '-',
          }
        : assignment
    );

    setModifications((prevModifications) => [...prevModifications, assignmentId]);

    setAssignments([...updatedAssignments]);
  };

  const uploadRowTeacher = async (idTeacher: string) => {
    await assigmentService.updateRows(period, LastVersionID, idRow, idTeacher);
  };

  const onhandleRemove = () => {
    setSelectedItem('-');
    uploadRowTeacher('-1');
    UpdateTeacher(idRow, '-');
  };

  return (
    <div className="relative inline-block cursor-pointer">
      <div className="flex flex-col">
        <div className="relative group dropdown dropdown-right rounded-none">
          <div tabIndex={0} role="button" className="rounded-none">
            {selectedItem}
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100  z-[1] w-52 p-0 ml-2 shadow rounded-none"
          >
            <li className="rounded-none">
              <a className="rounded-none" onClick={() => onhandleRemove()}>
                DESASIGNAR
              </a>
            </li>

            <li
              onMouseEnter={handleMouseEnter1}
              onMouseLeave={handleMouseLeave1}
              className="rounded-none"
            >
              <a className="rounded-none">
                <p>CAMBIAR ASIGNACIÓN A</p>
                <div
                  className={
                    'absolute -left-[115%] top-0 bg-white border border-gray-300  shadow-lg  w-60 ' +
                    (!isHovered1 ? 'hidden' : ' ')
                  }
                >
                  <div
                    className="p-2 cursor-pointer hover:bg-gray-200  block  "
                    onClick={() => {
                      const modal = document.getElementById(
                        'my_modal' + idRow
                      ) as HTMLDialogElement;
                      modal?.showModal();
                    }}
                  >
                    <p className="pl-3 "> SELECCIONAR DE LA LISTA DE DOCENTES</p>
                  </div>

                  <div
                    className="p-2 cursor-pointer hover:bg-gray-200"
                    onClick={() => {
                      const modal = document.getElementById(
                        'my_modalCompatibility' + idRow
                      ) as HTMLDialogElement;
                      modal?.showModal();
                    }}
                  >
                    <p className="pl-3">DOCENTES COMPATIBLES</p>
                  </div>
                </div>
              </a>
            </li>
          </ul>
        </div>
      </div>
      {/* HACER OTRO MODAL CON EL TEACHER NECESARIO  */}
      <ModalFormTeacher
        idModal={'my_modal' + idRow}
        idRow={idRow}
        setFunction={setSelectedItem}
      />

      <ModalFormTeacherCompatibility
        idModal={'my_modalCompatibility' + idRow}
        idRow={idRow}
        setFunction={setSelectedItem}
      />
    </div>
  );
};
