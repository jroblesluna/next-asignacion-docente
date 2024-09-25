import Link from 'next/link';
import Image from 'next/image';
import { useContext, useState } from 'react';
import { ContextAssignmentReport } from './MyContexts';

interface ModalProps {
  linkTo: string;
  title: string;
  subtitle: string;
  idModal: string;
}

export const ModalWarning: React.FC<ModalProps> = ({ linkTo, title, subtitle, idModal }) => {
  return (
    <dialog id={idModal} className="modal overflow-hidden ">
      <div className="modal-box py-14 px-10">
        <div className="flex flex-row gap-5 items-center">
          <Image
            alt="img"
            src={'/warning-icon.svg'}
            width={20}
            height={20}
            className="text-[#FFA500] size-32"
          />
          <span className="flex flex-col gap-4">
            <h3 className="font-bold text-3xl -ml-2">{title}</h3>
            <p className="font-semibold">{subtitle}</p>
          </span>
        </div>

        <div className="modal-action">
          <form method="dialog" className="flex justify-around w-full">
            <Link
              type="button"
              className="bg-primary py-2 text-white font-semibold hover:bg-primary_light w-48 text-center "
              href={linkTo}
            >
              Aceptar
            </Link>
            <button className="bg-secundary py-2 text-white font-semibold hover:bg-secundary_ligth w-48 ">
              Salir
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
};

interface ModalFormTeacherProps {
  idModal: string;
  data: string[];
  idRow: string;
  setFunction: (value: string) => void;
}
export const ModalFormTeacher: React.FC<ModalFormTeacherProps> = ({
  idModal,
  data,
  idRow,
  setFunction,
}) => {
  const [selectNewTeacher, setSelectNewTeacher] = useState('-1');

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
    setFunction(newTeacher);
    UpdateTeacher(idRow, newTeacher);
  };

  return (
    <dialog id={idModal} className={'modal overflow-hidden cursor-default select-none '}>
      <div className="modal-box py-14 px-10 min-h-[600px] min-w-[800px]">
        <div className="modal-action">
          <form method="dialog" className="flex w-full flex-col">
            <div className="w-full overflow-auto min-h-[400px] max-h-[400px] ">
              <table className="w-full">
                <thead>
                  <tr className="uppercase border overflow-hidden font-inter text-start sticky top-0 bg-white">
                    <th className="py-2">LISTA DE DOCENTES DISPONIBLES</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => {
                    return (
                      <tr
                        key={index}
                        className={
                          'border w-full  cursor-pointer hover:bg-cyan-300 ' +
                          (selectNewTeacher.toLowerCase() === item.toLowerCase()
                            ? 'bg-cyan-400'
                            : '')
                        }
                        onClick={() => {
                          setSelectNewTeacher(item);
                        }}
                      >
                        <td className="py-1 px-5 ">{item}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className=" w-full flex flex-row  gap-10 justify-center mt-5">
              <button
                type="button"
                className="bg-primary py-2 text-white font-semibold hover:bg-primary_light w-48 text-center"
                onClick={() => {
                  const modal = document.getElementById(idModal) as HTMLDialogElement;
                  onhandleClick(selectNewTeacher);
                  setSelectNewTeacher('-1');
                  modal?.close();
                }}
              >
                Aceptar
              </button>
              <button
                type="button"
                className="bg-secundary py-2 text-white font-semibold hover:bg-secundary_ligth w-48"
                onClick={() => {
                  const modal = document.getElementById(idModal) as HTMLDialogElement;
                  setSelectNewTeacher('-1');
                  modal?.close();
                }}
              >
                Salir
              </button>
            </div>
          </form>
        </div>
      </div>
    </dialog>
  );
};
