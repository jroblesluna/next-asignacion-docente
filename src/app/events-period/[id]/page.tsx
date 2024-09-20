'use client';
import NavBar from '../../components/NavBar';
import { ReturnTitle } from '../../components/Titles';
import { ModalWarning } from '../../components/Modals';
import { TableEventReport } from '../../components/Rows';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import LayoutValidation from '@/app/LayoutValidation';
import Image from 'next/image';

const Page = () => {
  const { id } = useParams();

  const EventTable = [
    {
      name: 'CURSO ASIGNADO',
      description:
        'codigo curso, horario, docente (apellido, nombre) sede (sede docente si es virtual)',
      date: '12/09/2024',
      time: '09:30',
      status: 'No iniciado',
    },
    {
      name: 'CURSO ASIGNADO',
      description:
        'codigo curso, horario, docente (apellido, nombre) sede (sede docente si es virtual)',
      date: '12/09/2024',
      time: '09:30',
      status: 'No iniciado',
    },
    {
      name: 'CURSO ASIGNADO',
      description:
        'codigo curso, horario, docente (apellido, nombre) sede (sede docente si es virtual)',
      date: '12/09/2024',
      time: '09:30',
      status: 'No iniciado',
    },
    {
      name: 'CURSO ASIGNADO',
      description:
        'codigo curso, horario, docente (apellido, nombre) sede (sede docente si es virtual)',
      date: '12/09/2024',
      time: '09:30',
      status: 'No iniciado',
    },
    {
      name: 'CURSO ASIGNADO',
      description:
        'codigo curso, horario, docente (apellido, nombre) sede (sede docente si es virtual)',
      date: '12/09/2024',
      time: '09:30',
      status: 'No iniciado',
    },
    {
      name: 'CURSO POSTERGADO',
      description:
        'codigo curso, horario, docente (apellido, nombre) sede (sede docente si es virtual)',
      date: '11/09/2024',
      time: '14:00',
      status: 'Ejecutado',
    },
    {
      name: 'CURSO POSTERGADO',
      description:
        'codigo curso, horario, docente (apellido, nombre) sede (sede docente si es virtual)',
      date: '11/09/2024',
      time: '14:00',
      status: 'Ejecutado',
    },
    {
      name: 'CURSO POSTERGADO',
      description:
        'codigo curso, horario, docente (apellido, nombre) sede (sede docente si es virtual)',
      date: '11/09/2024',
      time: '14:00',
      status: 'Ejecutado',
    },
    {
      name: 'CURSO POSTERGADO',
      description:
        'codigo curso, horario, docente (apellido, nombre) sede (sede docente si es virtual)',
      date: '11/09/2024',
      time: '14:00',
      status: 'Ejecutado',
    },
    {
      name: 'CURSO POSTERGADO',
      description:
        'codigo curso, horario, docente (apellido, nombre) sede (sede docente si es virtual)',
      date: '11/09/2024',
      time: '14:00',
      status: 'Ejecutado',
    },
    {
      name: 'CURSO POSTERGADO',
      description:
        'codigo curso, horario, docente (apellido, nombre) sede (sede docente si es virtual)',
      date: '11/09/2024',
      time: '14:00',
      status: 'Ejecutado',
    },
    {
      name: 'CURSO POSTERGADO',
      description:
        'codigo curso, horario, docente (apellido, nombre) sede (sede docente si es virtual)',
      date: '11/09/2024',
      time: '14:00',
      status: 'Ejecutado',
    },
    {
      name: 'CURSO POSTERGADO',
      description:
        'codigo curso, horario, docente (apellido, nombre) sede (sede docente si es virtual)',
      date: '11/09/2024',
      time: '14:00',
      status: 'Ejecutado',
    },
  ];

  const [selectedState, setSelectedState] = useState('Todas');

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(e.target.value);
  };

  // Filtra los eventos según el estado seleccionado
  const filteredEvents = EventTable.filter((event) => {
    if (selectedState.toLocaleLowerCase() === 'Todas'.toLocaleLowerCase()) return true;
    return event.status.toLocaleLowerCase() === selectedState.toLocaleLowerCase();
  });

  return (
    <LayoutValidation>
      <main className="flex flex-col gap-5 w-full min-h-[100vh] p-8 ">
        <NavBar />
        <ReturnTitle name="Registro de Eventos " />
        <div className="w-[90%] flex justify-center mx-auto flex-col">
          <div className="w-[95%] flex flex-row gap-5 justify-end -mt-8">
            <button className="bg-secundary font-roboto py-2 px-8 text-[14px] text-white font-semibold hover:bg-secundary_ligth flex flex-row items-center gap-1">
              <Image
                alt="img"
                src={'/edit-icon.svg'}
                width={20}
                height={20}
                className="text-white size-7"
              />
              Incorporar Cambios
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
            linkTo={'/history'}
            subtitle="Esta acción es irreversible."
            title="¿Está seguro de realizar los cambios? "
            idModal="my_modal_6"
          />
        </div>
        <div className="w-[90%] mx-auto flex flex-col gap-3 p-2 mt-3">
          <div className="flex flex-row gap-10">
            <h2 className="text-start mb-8 font-roboto text-3xl font-bold">
              Listado de Eventos:
            </h2>
            <label className="form-control w-full max-w-28 -mt-8">
              <div className="label">
                <span className="label-text text-xs">Estado</span>
              </div>
              <select
                className="select select-bordered text-xs"
                value={selectedState}
                onChange={handleStateChange}
              >
                <option value="Todas">Todas</option>
                <option value="Ejecutado">Ejecutado</option>
                <option value="No iniciado">No iniciado</option>
              </select>
            </label>
          </div>

          <div className="w-full max-h-[44vh] overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="text-black">
                  <th className="py-2 uppercase font-inter text-start font-semibold sticky top-0 bg-white">
                    NOMBRE
                  </th>
                  <th className="py-2 uppercase overflow-hidden font-inter text-start font-semibold sticky top-0 bg-white">
                    DESCRIPCIÓN
                  </th>
                  <th className="py-2 uppercase font-inter font-semibold text-start sticky top-0 bg-white">
                    FECHA
                  </th>
                  <th className="py-2 uppercase font-inter font-semibold text-start sticky top-0 bg-white">
                    HORA
                  </th>
                  <th className="py-2 uppercase font-inter font-semibold text-start sticky top-0 bg-white">
                    ESTADO
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event, index) => (
                  <TableEventReport
                    key={index}
                    date={event.date}
                    description={event.description}
                    name={event.name}
                    status={event.status}
                    time={event.time}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </LayoutValidation>
  );
};

export default Page;
