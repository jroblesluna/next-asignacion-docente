'use client';
import React from 'react';
import { useState } from 'react';
import NavBar from '../components/NavBar';
import { ReturnTitle } from '../components/Titles';
import { PiMagnifyingGlass } from 'react-icons/pi';
import { HistoryTable } from '../components/Rows';
import { RiArrowDropLeftLine, RiArrowDropRightLine } from 'react-icons/ri';
import { ModalWarning } from '../components/Modals';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { es } from 'date-fns/locale';
import LayoutValidation from '../LayoutValidation';

function Page() {
  const [inputValue, setInputValue] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Sample data, will be removed
  const historyData = [
    {
      idPeriod: '202301',
      startDate: '01/08/2024',
      endDate: '30/08/2024',
      codePeriod: '10520156',
      isActive: true,
    },
    {
      idPeriod: '202302',
      startDate: '01/07/2023',
      endDate: '31/12/2023',
      codePeriod: '10520157',
      isActive: false,
    },
    {
      idPeriod: '202401',
      startDate: '01/01/2023',
      endDate: '30/06/2023',
      codePeriod: '10520158',
      isActive: false,
    },
    {
      idPeriod: '202402',
      startDate: '01/07/2023',
      endDate: '31/12/2023',
      codePeriod: '10520159',
      isActive: false,
    },
    {
      idPeriod: '202501',
      startDate: '01/01/2024',
      endDate: '30/06/2024',
      codePeriod: '10520160',
      isActive: false,
    },
    {
      idPeriod: '202502',
      startDate: '01/07/2024',
      endDate: '31/08/2024',
      codePeriod: '10520161',
      isActive: false,
    },
    {
      idPeriod: '2025024',
      startDate: '01/07/2024',
      endDate: '31/07/2024',
      codePeriod: '105201614',
      isActive: false,
    },
  ];

  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  const filteredData = historyData
    .filter((period) => period.codePeriod.includes(inputValue))
    .filter((period) => {
      const periodStartDate = parseDate(period.startDate);
      const periodEndDate = parseDate(period.endDate);

      return (
        (!startDate || periodStartDate >= startDate) && (!endDate || periodEndDate <= endDate)
      );
    });
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <LayoutValidation>
      <main className="flex flex-col gap-5 w-full min-h-[100vh] p-8">
        <NavBar />
        <ReturnTitle name="Historial de períodos" />
        <div className="w-[90%] flex gap-5 justify-center mx-auto flex-col">
          <div className="w-full flex flex-row gap-5 items-center">
            <div className="w-1/3 relative text-black border rounded-md">
              <input
                placeholder={'Busque por el codigo del periodo'}
                className={'w-full rounded-md py-3 px-3 font-openSans text-opacity-50 text-xs'}
                onChange={handleInputChange}
              />
              <PiMagnifyingGlass
                className="absolute right-3 font-extrabold top-2 cursor-pointer text-primary hover:text-gray-500"
                size={'25px'}
              />
            </div>

            <div className="flex flex-row gap-3">
              <div className="flex flex-row items-center gap-3">
                <label className="font-inter font-semibold text-xs">Fecha de inicio:</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => setStartDate(date)}
                  dateFormat="MM/yyyy"
                  showMonthYearPicker
                  maxDate={
                    endDate
                      ? new Date(endDate.getFullYear(), endDate.getMonth(), 0)
                      : undefined
                  }
                  locale={es}
                />
              </div>
              <div className="flex flex-row items-center gap-3">
                <label className="font-inter font-semibold text-xs opacity-70">
                  Fecha de fin:
                </label>
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date | null) => setEndDate(date)}
                  dateFormat="MM/yyyy"
                  showMonthYearPicker
                  minDate={
                    startDate
                      ? new Date(startDate.getFullYear(), startDate.getMonth())
                      : undefined
                  }
                  maxDate={new Date()}
                  locale={es}
                />
              </div>
            </div>
          </div>

          <ModalWarning
            linkTo={'/loading'}
            subtitle="Se perderán las asignaciones manuales guardadas."
            title="¿Está seguro de reprocesar las asignaciones?"
            idModal="my_modal_2"
          />
          <ModalWarning
            linkTo={'/history'}
            subtitle="Esta acción es irreversible."
            title="¿Está seguro de cerrar el período?"
            idModal="my_modal_3"
          />
          {paginatedData.length !== 0 ? (
            <div className="flex flex-col justify-between min-h-[400px]">
              <table className="w-full ">
                <thead>
                  <tr className="text-primary_ligth">
                    <th className="py-2 font-inter"></th>
                    <th className="py-2 uppercase max-w-16 overflow-hidden font-inter">
                      Código de Período
                    </th>
                    <th className="py-2 uppercase font-inter">Fecha</th>
                    <th className="py-2 text-center uppercase font-inter" colSpan={3}>
                      Reportes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((period) => (
                    <HistoryTable
                      key={period.idPeriod}
                      idPeriod={period.idPeriod}
                      startDate={period.startDate}
                      endDate={period.endDate}
                      codePeriod={period.codePeriod}
                      isActive={period.isActive}
                    />
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end flex-row items-center gap-5">
                <p className="text-xs">Filas por página: {rowsPerPage}</p>
                <p className="text-xs">
                  {startIndex + 1}-{Math.min(endIndex, filteredData.length)} de{' '}
                  {filteredData.length}
                </p>
                <div className="flex items-center justify-center flex-row">
                  <RiArrowDropLeftLine
                    className={`size-8 cursor-pointer hover:opacity-80 ${
                      currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : ''
                    }`}
                    onClick={() => handlePageChange('prev')}
                  />
                  <RiArrowDropRightLine
                    className={`size-8 cursor-pointer hover:opacity-80 ${
                      currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : ''
                    }`}
                    onClick={() => handlePageChange('next')}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="font-black flex items-center justify-center h-60 text-5xl">
              No se encontraron resultados en la tabla.
            </div>
          )}
        </div>
      </main>
    </LayoutValidation>
  );
}

export default Page;
