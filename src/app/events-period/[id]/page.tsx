/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import NavBar from '../../components/NavBar';
import { ReturnTitle } from '../../components/Titles';
import { ModalWarning } from '../../components/Modals';
import { TableEventReport } from '../../components/Rows';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import LayoutValidation from '@/app/LayoutValidation';
import Image from 'next/image';
import { EventoData, PeriodoAcademico } from '@/app/interface/datainterface';
import periodService from '@/services/period';
import { convertirFecha, convertirFormatoFecha } from '@/app/utils/managmentDate';
import eventService from '@/services/evento';

const Page = () => {
  const { id } = useParams() as { id: string };
  const [dataPerido, setDataPeriodo] = useState<PeriodoAcademico>();
  const [dataEvento, setDataEvento] = useState<EventoData[]>([]);

  const loadData = async () => {
    const resPerido = await periodService.getById(id);
    if (!resPerido.data) {
      alert('No se encontraron datos del periodo. Redirigiendo a la página principal.');
      window.location.href = '/history';
    }
    setDataPeriodo(resPerido.data[0]);
    const resEvent = await eventService.getAll(id);
    setDataEvento(resEvent.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const [selectedState, setSelectedState] = useState('Todas');

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(e.target.value);
  };

  // Filtra los eventos según el estado seleccionado
  const filteredEvents = dataEvento.filter((event) => {
    if (selectedState.toLocaleLowerCase() === 'Todas'.toLocaleLowerCase()) return true;
    return (event.estado === true ? 'Ejecutado' : 'No iniciado') === selectedState;
  });

  const addEventToAssigments = (period: string) => {
    localStorage.setItem('flagReproceso', 'true');
    localStorage.setItem('addEvents', 'true');
    localStorage.setItem('periodo', period);
  };

  return (
    <LayoutValidation>
      <main className="flex flex-col gap-5 w-full min-h-[100vh] p-8 ">
        <NavBar />
        <ReturnTitle name="Registro de Eventos " />
        <div className="w-[90%] flex justify-center mx-auto flex-col">
          <div className="w-[95%] flex flex-row gap-5 justify-end -mt-8">
            <button
              className={`font-roboto py-2 px-8 text-[14px]
               text-white font-semibold  flex flex-row items-center gap-1  ${
                 dataPerido?.estado &&
                 dataPerido?.estado === 'ACTIVO' &&
                 dataEvento.filter((event) => {
                   return event.estado === false;
                 }).length > 0
                   ? 'bg-secundary  hover:bg-secundary_ligth'
                   : 'bg-[#7C7C7C] cursor-not-allowed pointer-events-none'
               } `}
              onClick={() => {
                if (dataPerido?.estado && dataPerido?.estado === 'ACTIVO') {
                  const modal = document.getElementById('reprocesarEvento-' + id);
                  if (modal) {
                    (modal as HTMLDialogElement).showModal();
                  }
                }
              }}
            >
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
            linkTo={'/loading'}
            subtitle={'Esta acción es creara una nueva versión para periodo ' + id + '.'}
            title="¿Está seguro de incorporar los eventos? "
            idModal={'reprocesarEvento-' + id}
            setFunction={addEventToAssigments}
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
                    status={event.estado === true ? 'Ejecutado' : 'No iniciado'}
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
