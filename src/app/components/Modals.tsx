/* eslint-disable react-hooks/exhaustive-deps */
// 'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useContext, useEffect, useState } from 'react';
import { ContextAssignmentReport } from './MyContexts';
import teacherService from '@/services/teacher';
import assigmentService from '@/services/assigment';
// import router from 'next/router';

interface ModalProps {
  linkTo: string;
  title: string;
  subtitle: string;
  idModal: string;
  setFunction: (value: string) => void;
}

export const ModalWarning: React.FC<ModalProps> = ({
  linkTo,
  title,
  subtitle,
  idModal,
  setFunction,
}) => {
  const [cargando, setCargando] = useState(false);
  return (
    <dialog id={idModal} className="modal overflow-hidden ">
      <div className="modal-box py-14 px-10">
        {!cargando ? (
          <>
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
                  onClick={() => {
                    setFunction(idModal.match(/\d+/)?.[0] || '');
                    setCargando(true);
                    setTimeout(() => {}, 2000);

                    // const modal = document.getElementById(idModal) as HTMLDialogElement;
                    // modal?.close();
                  }}
                >
                  Aceptar
                </Link>
                <button className="bg-secundary py-2 text-white font-semibold hover:bg-secundary_ligth w-48 ">
                  Salir
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="w-[90%] flex gap-5 justify-center mx-auto flex-col items-center min-h-[50vh]">
            <span className="loading loading-bars loading-lg"></span>
          </div>
        )}
      </div>
    </dialog>
  );
};

export const ModalClosedPeriod: React.FC<ModalProps> = ({
  linkTo,
  title,
  subtitle,
  idModal,
  setFunction,
}) => {
  const [cargando, setCargando] = useState(false);
  return (
    <dialog id={idModal} className="modal overflow-hidden ">
      <div className="modal-box py-14 px-10">
        {!cargando ? (
          <>
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
                  onClick={() => {
                    setFunction(idModal.match(/\d+/)?.[0] || '');
                    setCargando(true);
                    setTimeout(() => {
                      window.location.reload();
                    }, 3000);

                    // const modal = document.getElementById(idModal) as HTMLDialogElement;
                    // modal?.close();
                  }}
                >
                  Aceptar
                </Link>
                <button className="bg-secundary py-2 text-white font-semibold hover:bg-secundary_ligth w-48 ">
                  Salir
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="w-[90%] flex gap-5 justify-center mx-auto flex-col items-center min-h-[50vh]">
            <span className="loading loading-bars loading-lg"></span>
          </div>
        )}
      </div>
    </dialog>
  );
};

interface ModalFormTeacherProps {
  idModal: string;
  idRow: string;
  setFunction: (value: string) => void;
}
interface ModalFormTeacherProps {
  idModal: string;
  idRow: string;
  setFunction: (value: string) => void;
}

interface teacherDisponibility {
  id: number;
  nombre: string;
  tipoContrato: string;
  minutosTotales: string;
  nombreSede: string;
}

export const ModalFormTeacher: React.FC<ModalFormTeacherProps> = ({
  idModal,
  idRow,
  setFunction,
}) => {
  const [selectNewTeacher, setSelectNewTeacher] = useState('-1');
  const [selectNewIdTeacher, setNewIdTeacher] = useState('');

  const [data, setData] = useState<teacherDisponibility[]>([]);

  const context = useContext(ContextAssignmentReport);
  if (!context) {
    throw new Error('DisplayComponent debe ser usado dentro de MyContextProvider');
  }

  const { assignments, setAssignments, setModifications, period, LastVersionID } = context;

  const loadData = async () => {
    const res = await teacherService.getDisponibility(period, idRow, LastVersionID);
    console.log(res.data);
    setData(res.data);
  };

  const uploadRowTeacher = async (idTeacher: string) => {
    await assigmentService.updateRows(period, LastVersionID, idRow, idTeacher);
  };

  // Ejecuta loadData solo cuando el modal esté abierto

  useEffect(() => {
    const modal = document.getElementById(idModal) as HTMLDialogElement;

    if (modal) {
      const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          if (
            mutation.type === 'attributes' &&
            mutation.attributeName === 'open' &&
            modal.open
          ) {
            setSelectNewTeacher('-1');
            setNewIdTeacher('');
            setData([]);
            loadData();
          }
        }
      });

      observer.observe(modal, { attributes: true });

      // Limpia el observer cuando el componente se desmonte
      return () => observer.disconnect();
    }
  }, [idModal]);
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

  const onhandleClick = (newTeacher: string, selectIdTeacher: string) => {
    setFunction(newTeacher);
    uploadRowTeacher(selectIdTeacher);
    UpdateTeacher(idRow, newTeacher);
  };

  return (
    <>
      <dialog id={idModal} className={'modal overflow-hidden cursor-default select-none'}>
        <div className="modal-box py-5 px-10 min-h-[650px] min-w-[800px]">
          <div className="modal-action">
            <form method="dialog" className="flex w-full flex-col">
              <div className=" text-center font-bold">LISTA DE DOCENTES DISPONIBLES</div>
              <div className="w-full mt-5 flex flex-row">
                <p className="px-4 py-2 border w-[58%] font-bold">Docente</p>
                <p className="px-4 py-2 border w-[10%] font-bold">TC</p>
                <p className="px-4 py-2 border w-[14%] font-bold">HA</p>
                <p className="px-4 py-2 border w-[18%] font-bold">SEDE</p>
              </div>

              <div className="w-full overflow-auto min-h-[350px] max-h-[350px] ">
                <table className="w-full mt-2">
                  {data.length === 0 ? (
                    <tbody>
                      <tr>
                        <td
                          colSpan={4}
                          className="w-[90%] flex gap-5 justify-center mx-auto flex-col items-center min-h-[50vh]"
                        >
                          <span className="loading loading-bars loading-lg"></span>
                        </td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody>
                      {data.map((item, index) => (
                        <tr
                          key={index}
                          className={
                            (data[0].id !== -1
                              ? 'border w-full cursor-pointer hover:bg-cyan-300'
                              : 'border ') +
                            (selectNewTeacher.toLowerCase() === item.nombre.toLowerCase() &&
                            data[0].id !== -1
                              ? ' bg-cyan-400'
                              : '')
                          }
                          onClick={() => {
                            if (data[0].id !== -1) {
                              setSelectNewTeacher(item.nombre);
                              setNewIdTeacher(item.id.toString());
                            }
                          }}
                        >
                          <td className="py-1 px-5">{item.nombre}</td>
                          <td className="py-1 px-5">{item.tipoContrato}</td>
                          <td className="py-1 px-5">{item.minutosTotales}</td>
                          <td className="py-1 px-5">{item.nombreSede}</td>
                        </tr>
                      ))}
                    </tbody>
                  )}
                </table>
              </div>

              <div className="flex flex-col text-xs gap-2 mt-5">
                <p className="font-bold">
                  {' '}
                  Leyenda - Docentes que no necesariamente dictan el curso y estan disponibles
                </p>
                <div className="flex flex-row gap-4">
                  <p>
                    <span className="font-bold">PT:</span> Part time
                  </p>
                  <p>
                    <span className="font-bold">FT:</span> Full time
                  </p>
                  <p>
                    <span className="font-bold">TC:</span> Tipo de Contrato
                  </p>
                  <p>
                    <span className="font-bold">HA:</span> Horas acumuladas mensuales
                  </p>
                </div>
              </div>

              <div className="w-full flex flex-row gap-10 justify-center mt-5">
                <button
                  type="button"
                  className="bg-primary py-2 text-white font-semibold hover:bg-primary_light w-48 text-center"
                  onClick={() => {
                    const modal = document.getElementById(idModal) as HTMLDialogElement;
                    if (data[0].id !== -1 && selectNewTeacher !== '-1') {
                      onhandleClick(selectNewTeacher, selectNewIdTeacher);
                    }
                    setSelectNewTeacher('-1');
                    modal?.close();
                  }}
                >
                  Aceptar
                </button>
                <button
                  type="button"
                  className="bg-secundary py-2 text-white font-semibold hover:bg-secondary_light w-48"
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
    </>
  );
};

export const ModalFormTeacherCompatibility: React.FC<ModalFormTeacherProps> = ({
  idModal,
  idRow,
  setFunction,
}) => {
  const [selectNewTeacher, setSelectNewTeacher] = useState('-1');
  const [selectNewIdTeacher, setNewIdTeacher] = useState('');

  const [data, setData] = useState<teacherDisponibility[]>([]);

  const context = useContext(ContextAssignmentReport);
  if (!context) {
    throw new Error('DisplayComponent debe ser usado dentro de MyContextProvider');
  }

  const { assignments, setAssignments, setModifications, period, LastVersionID } = context;

  const loadData = async () => {
    const res = await teacherService.getCompatibility(period, idRow, LastVersionID);
    console.log(res.data);
    setData(res.data);
  };

  const uploadRowTeacher = async (idTeacher: string) => {
    await assigmentService.updateRows(period, LastVersionID, idRow, idTeacher);
  };

  // Ejecuta loadData solo cuando el modal esté abierto

  useEffect(() => {
    const modal = document.getElementById(idModal) as HTMLDialogElement;

    if (modal) {
      const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          if (
            mutation.type === 'attributes' &&
            mutation.attributeName === 'open' &&
            modal.open
          ) {
            setSelectNewTeacher('-1');
            setNewIdTeacher('');
            setData([]);
            loadData();
          }
        }
      });

      observer.observe(modal, { attributes: true });

      // Limpia el observer cuando el componente se desmonte
      return () => observer.disconnect();
    }
  }, [idModal]);
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

  const onhandleClick = (newTeacher: string, selectIdTeacher: string) => {
    setFunction(newTeacher);
    console.log(selectIdTeacher);
    uploadRowTeacher(selectIdTeacher);
    UpdateTeacher(idRow, newTeacher);
  };

  return (
    <>
      <dialog id={idModal} className={'modal overflow-hidden cursor-default select-none'}>
        <div className="modal-box py-5 px-10 min-h-[650px] min-w-[800px]">
          <div className="modal-action">
            <form method="dialog" className="flex w-full flex-col">
              <div className=" text-center font-bold">
                LISTA DE DOCENTES COMPATIBLES Y RECOMENDADOS
              </div>
              <div className="w-full mt-5 flex flex-row">
                <p className="px-4 py-2 border w-[58%] font-bold">Docente</p>
                <p className="px-4 py-2 border w-[10%] font-bold">TC</p>
                <p className="px-4 py-2 border w-[14%] font-bold">HA</p>
                <p className="px-4 py-2 border w-[18%] font-bold">SEDE</p>
              </div>

              <div className="w-full overflow-auto min-h-[350px] max-h-[350px] ">
                <table className="w-full mt-2">
                  {data.length === 0 ? (
                    <tbody>
                      <tr>
                        <td
                          colSpan={4}
                          className="w-[90%] flex gap-5 justify-center mx-auto flex-col items-center min-h-[50vh]"
                        >
                          <span className="loading loading-bars loading-lg"></span>
                        </td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody>
                      {data.map((item, index) => (
                        <tr
                          key={index}
                          className={
                            (data[0].id !== -1
                              ? 'border w-full cursor-pointer hover:bg-cyan-300'
                              : 'border ') +
                            (selectNewTeacher.toLowerCase() === item.nombre.toLowerCase() &&
                            data[0].id !== -1
                              ? ' bg-cyan-400'
                              : '')
                          }
                          onClick={() => {
                            if (data[0].id !== -1) {
                              setSelectNewTeacher(item.nombre);
                              setNewIdTeacher(item.id.toString());
                            }
                          }}
                        >
                          <td className="py-1 px-5">{item.nombre}</td>
                          <td className="py-1 px-5">{item.tipoContrato}</td>
                          <td className="py-1 px-5">{item.minutosTotales}</td>
                          <td className="py-1 px-5">{item.nombreSede}</td>
                        </tr>
                      ))}
                    </tbody>
                  )}
                </table>
              </div>

              <div className="flex flex-col text-xs gap-2 mt-5">
                <p className="font-bold">
                  {' '}
                  Leyenda - Docentes que dictan el curso y estan disponibles
                </p>
                <div className="flex flex-row gap-4">
                  <p>
                    <span className="font-bold">PT:</span> Part time
                  </p>
                  <p>
                    <span className="font-bold">FT:</span> Full time
                  </p>
                  <p>
                    <span className="font-bold">TC:</span> Tipo de Contrato
                  </p>
                  <p>
                    <span className="font-bold">HA:</span> Horas acumuladas mensuales
                  </p>
                </div>
              </div>

              <div className="w-full flex flex-row gap-10 justify-center mt-5">
                <button
                  type="button"
                  className="bg-primary py-2 text-white font-semibold hover:bg-primary_light w-48 text-center"
                  onClick={() => {
                    const modal = document.getElementById(idModal) as HTMLDialogElement;
                    if (data[0].id !== -1 && selectNewTeacher !== '-1') {
                      onhandleClick(selectNewTeacher, selectNewIdTeacher);
                    }
                    setSelectNewTeacher('-1');
                    modal?.close();
                  }}
                >
                  Aceptar
                </button>
                <button
                  type="button"
                  className="bg-secundary py-2 text-white font-semibold hover:bg-secondary_light w-48"
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
    </>
  );
};
