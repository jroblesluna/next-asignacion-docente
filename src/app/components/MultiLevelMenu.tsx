import React, { useState, useContext } from 'react';
import { ContextAssignmentReport } from './MyContexts';
import useHover from '../utils/useHover';
import {
  ModalFormRoomCompatibility,
  ModalFormTeacher,
  ModalFormTeacherCompatibility,
} from './Modals';
import assigmentService from '@/services/assigment';
interface MultiLevelMenuClassroomProps {
  idRow: string;
  classRoom: string;
  classroomId: string;
  classroomIdInitial: string;
  location: string;
}

export const MultiLevelMenuClassroom: React.FC<MultiLevelMenuClassroomProps> = ({
  idRow,
  classRoom,
  classroomId,
  classroomIdInitial,
  location,
}) => {
  const [selectedItem, setSelectedItem] = useState(classRoom);
  const [selectedItemRoomId, setSelectedItemRoomId] = useState(classroomId);

  const setearParametros = (value1: string, value2: string) => {
    setSelectedItem(value1);
    setSelectedItemRoomId(value2);
  };

  return (
    <div className="relative inline-block cursor-pointer">
      <div className="flex flex-col">
        <div className="relative group dropdown dropdown-right rounded-none">
          <div tabIndex={0} role="button" className="rounded-none">
            {location != 'Virtual'
              ? selectedItem
              : selectedItemRoomId == classroomIdInitial
              ? selectedItem
              : 'CAD-' + selectedItem}
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100  z-[1] w-60  p-0 ml-2 shadow rounded-none"
          >
            <a className="rounded-none selection:bg-transparent">
              <div
                className="p-2 cursor-pointer hover:bg-gray-200"
                onClick={() => {
                  const modal = document.getElementById(
                    'my_modalRoomCompatibility' + idRow
                  ) as HTMLDialogElement;
                  modal?.showModal();
                }}
              >
                <p>CAMBIAR ASIGNACIÓN A</p>
              </div>
            </a>
          </ul>
        </div>
      </div>
      <ModalFormRoomCompatibility
        idModal={'my_modalRoomCompatibility' + idRow}
        idRow={idRow}
        setFunction={setearParametros}
      />
    </div>
  );
};

interface MultiLevelMenuTeacherProps {
  teacher: string;
  idRow: string;
  location: string;
  teacherId: string;
  setFuntion: () => void;
}

export const MultiLevelMenuTeacher: React.FC<MultiLevelMenuTeacherProps> = ({
  teacher,
  idRow,
  setFuntion,
  location,
}) => {
  const [selectedItem, setSelectedItem] = useState(teacher);
  const {
    handleMouseEnter: handleMouseEnter1,
    handleMouseLeave: handleMouseLeave1,
    isHovered: isHovered1,
  } = useHover();
  const correo = localStorage.getItem('user');
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
            isTeacherClosed: newTeacher !== '-' ? correo : null,
          }
        : assignment
    );

    setModifications((prevModifications) => [...prevModifications, assignmentId]);

    setAssignments([...updatedAssignments]);
  };

  const uploadRowTeacher = async (idTeacher: string) => {
    await assigmentService.updateRows(
      period,
      LastVersionID,
      idRow,
      idTeacher,
      correo || 'user'
    );
  };

  const onhandleRemove = () => {
    if (location == 'Virtual') {
      setFuntion();
    }
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
