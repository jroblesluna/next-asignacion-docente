import React, { useState, useContext } from 'react';
import { ContextAssignmentReport } from './MyContexts';
import useHover from '../utils/useHover';
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
            <li onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              <a>
                <p>CAMBIAR ASIGNACIÓN A</p>
                <div className="absolute left-full top-0 bg-white border border-gray-300 mt-1 shadow-lg  ">
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
  dataPossibleTeacher: string[];
}

export const MultiLevelMenuTeacher: React.FC<MultiLevelMenuTeacherProps> = ({
  teacher,
  idRow,
  dataRecomended,
  dataPossibleTeacher,
}) => {
  const [selectedItem, setSelectedItem] = useState(teacher);
  const {
    handleMouseEnter: handleMouseEnter1,
    handleMouseLeave: handleMouseLeave1,
    isHovered: isHovered1,
  } = useHover();

  const {
    handleMouseEnter: handleMouseEnter2,
    handleMouseLeave: handleMouseLeave2,
    isHovered: isHovered2,
  } = useHover();

  const {
    handleMouseEnter: handleMouseEnter3,
    handleMouseLeave: handleMouseLeave3,
    isHovered: isHovered3,
  } = useHover();

  const context = useContext(ContextAssignmentReport);
  if (!context) {
    throw new Error('DisplayComponent debe ser usado dentro de MyContextProvider');
  }

  const { assignments, setAssignments, setModifications } = context;

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

  const onhandleClick = (newTeacher: string) => {
    setSelectedItem(newTeacher);
    UpdateTeacher(idRow, newTeacher);
  };

  const onhandleRemove = () => {
    setSelectedItem('-');
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

            <li onMouseEnter={handleMouseEnter1} onMouseLeave={handleMouseLeave1}>
              <a>
                <p>CAMBIAR ASIGNACIÓN A</p>
                <div
                  className={
                    'absolute -left-[115%] top-0 bg-white border border-gray-300  shadow-lg  w-60 ' +
                    (!isHovered1 ? 'hidden' : ' ')
                  }
                >
                  <div
                    className="p-2 cursor-pointer hover:bg-gray-200  block  "
                    onMouseEnter={handleMouseEnter2}
                    onMouseLeave={handleMouseLeave2}
                  >
                    <p className="pl-3 "> DOCENTES COMPATIBLES</p>
                    <div
                      className={
                        'absolute -left-[88%] top-0 flex flex-col bg-white border border-gray-300  shadow-lg  ' +
                        (!isHovered2 ? 'hidden' : ' ')
                      }
                    >
                      {dataRecomended.map((item) => (
                        <div
                          className={
                            'p-2 cursor-pointer bg-white hover:bg-gray-200 max-w-52 text-start block uppercase w-52'
                          }
                          key={item}
                          onClick={() => onhandleClick(item)}
                        >
                          <p className="pl-3 "> {item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className="p-2 cursor-pointer hover:bg-gray-200   block "
                    onMouseEnter={handleMouseEnter3}
                    onMouseLeave={handleMouseLeave3}
                  >
                    <p className="pl-3">SELECCIONAR DE LA LISTA DE DOCENTES</p>
                    <div
                      className={
                        'absolute -left-[88%] top-10 flex flex-col bg-white border border-gray-300  shadow-lg  ' +
                        (!isHovered3 ? 'hidden' : ' ')
                      }
                    >
                      {dataPossibleTeacher.map((item) => (
                        <div
                          className={
                            'p-2 cursor-pointer hover:bg-gray-200 max-w-52 text-start block uppercase w-52'
                          }
                          key={item}
                          onClick={() => onhandleClick(item)}
                        >
                          <p className="pl-3 "> {item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
