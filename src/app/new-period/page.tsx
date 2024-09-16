'use client';
import NavBar from '../components/NavBar';
import { ReturnTitle } from '../components/Titles';
import { getCurrentMonthDetails } from '../utils/managmentDate';
import { ModalWarning } from '../components/Modals';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PiMagnifyingGlass } from 'react-icons/pi';
import { TableActiveTeacher } from '../components/Rows';
// Import de Datos de Ejemplo
import { professorTable } from '../constants/dataExample';
import { locationData, stateData } from '../constants/data';
const Page = () => {
  const { period, startDate, endDate } = getCurrentMonthDetails();
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Todas');
  const [selectedState, setSelectedState] = useState('Todas');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLocation(e.target.value);
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(e.target.value);
  };

  const filteredProfessors = professorTable.filter((teacher) => {
    const matchesName = teacher.professor.toLowerCase().includes(inputValue.toLowerCase());
    const matchesLocation =
      selectedLocation.toLowerCase() === 'Todas'.toLowerCase() ||
      teacher.location.toLowerCase() === selectedLocation.toLowerCase();
    const matchesState =
      selectedState === 'Todas' ||
      teacher.status.toLowerCase() === selectedState.toLowerCase();

    return matchesName && matchesLocation && matchesState;
  });

  return (
    <main className="flex flex-col gap-5 w-full min-h-[100vh] p-8 ">
      <NavBar></NavBar>
      <ReturnTitle name="Registro de Nuevo Período" />

      <div className="w-full flex flex-row">
        <div className="w-1/2 min-h-[400px]  p-5 flex items-center justify-center  ">
          <div className="flex flex-col gap-2">
            <p className="text-2xl">
              <strong>Periodo:</strong> {period}
            </p>
            <p className="text-2xl">
              <strong>Fecha de Inicio:</strong> {startDate}
            </p>
            <p className="text-2xl">
              <strong>Fecha de Termino:</strong> {endDate}
            </p>

            <ModalWarning
              onConfirm={() => router.push('/loading')}
              subtitle="Esta acción realizará el primer procesamiento de asignación docente."
              title="¿Está seguro de crear un nuevo período?"
              idModal="my_modal_1"
            />
            <button
              className="btn bg-secundary py-2 px-20 text-white font-semibold hover:bg-secundary_ligth  mt-10"
              onClick={() => {
                const modal = document.getElementById('my_modal_1');
                if (modal) {
                  (modal as HTMLDialogElement).showModal();
                }
              }}
            >
              Generar asignación docente
            </button>
          </div>
        </div>
        <div className="w-1/2 min-h-[72vh] max-h-[72vh]   flex flex-col  gap-3 p-2 -mt-10 ">
          <h2 className="text-center mb-8 font-roboto text-2xl font-bold">
            Listado de Docentes Activos:
          </h2>
          <div className="w-full flex flex-row gap-5 items-start ">
            <div className="w-1/2 relative text-black border rounded-md h-fit">
              <input
                placeholder={'Busque por el nombre del docente'}
                className={'w-full rounded-md py-3 px-3 font-openSans text-opacity-50 text-xs'}
                onChange={handleInputChange}
              />
              <PiMagnifyingGlass
                className="absolute right-3 font-extrabold top-2 cursor-pointer text-primary hover:text-gray-500"
                size={'25px'}
              />
            </div>
            <label className="form-control w-full max-w-32 -mt-9">
              <div className="label">
                <span className="label-text text-xs">Sede</span>
              </div>
              <select
                className="select select-bordered text-xs  capitalize"
                value={selectedLocation}
                onChange={handleLocationChange}
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
            <label className="form-control w-full max-w-28 -mt-9">
              <div className="label">
                <span className="label-text text-xs">Estado</span>
              </div>
              <select
                className="select select-bordered text-xs"
                value={selectedState}
                onChange={handleStateChange}
              >
                <option value="Todas">Todas</option>
                {stateData.map((item, index) => {
                  return (
                    <option value={item} key={index}>
                      {item}
                    </option>
                  );
                })}
              </select>
            </label>
          </div>
          <div className="w-full overflow-auto">
            <table className="w-full ">
              <thead>
                <tr className="text-black">
                  <th className="py-2 uppercase font-inter text-start sticky top-0 font-semibold bg-white ">
                    PROFESOR
                  </th>
                  <th className="py-2 uppercase overflow-hidden font-inter text-start sticky top-0 font-semibold bg-white">
                    SEDE
                  </th>
                  <th className="py-2 uppercase font-inter font-semibold sticky top-0 text-start bg-white">
                    ESTADO
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProfessors.map((teacher, index) => (
                  <TableActiveTeacher
                    key={index}
                    location={teacher.location}
                    teacher={teacher.professor}
                    status={teacher.status}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Page;
