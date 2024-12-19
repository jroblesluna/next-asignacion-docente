'use client';

import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import { ReturnTitle } from '../components/Titles';
import LayoutValidation from '../LayoutValidation';
import periodService from '@/services/period';
import { interfaceEscenario, PeriodoAcademico } from '../interface/datainterface';
import { EscenarioBase } from '../components/escenarios';
import assigmentService from '@/services/assigment';

const Page = () => {
  const [dataPerido, setDataPeriodo] = useState<PeriodoAcademico>();
  const [dataEscenario, setDataEscenario] = useState<interfaceEscenario[]>([]);

  const loadData = async () => {
    const resPerido = await periodService.verify();
    setDataPeriodo(resPerido.data);

    const resEscenario = await assigmentService.getEscenarios();
    setDataEscenario(resEscenario.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <LayoutValidation>
      <main className="flex flex-col gap-5 w-full min-h-[100vh] p-4">
        <NavBar />
        <ReturnTitle name="Configuración de Escenarios" />
        {dataPerido === undefined ? (
          <div className="w-[90%] flex gap-5 justify-center mx-auto flex-col items-center min-h-[50vh]">
            <span className="loading loading-bars loading-lg"></span>
          </div>
        ) : (
          <div className="w-[90%] flex gap-5 justify-center mx-auto flex-col items-start min-h-[50vh]">
            <div className="grid grid-cols-3 gap-4 w-full  min-w-[90vw] mx-auto min-h-[200px]">
              {!dataEscenario ? (
                <div className="w-[90%] flex gap-5 justify-center mx-auto flex-col items-center min-h-[50vh]">
                  <span className="loading loading-bars loading-lg"></span>
                </div>
              ) : (
                dataEscenario.map((item, index) => (
                  <EscenarioBase activo={item.activo} escenario={item.escenario} key={index} />
                ))
              )}
            </div>
            <div className="flex flex-col gap-4">
              <p className="font-bold text-3xl">Leyenda</p>
              <div className="flex flex-row gap-2 w-full">
                <p className="font-bold text-[14px] w-[10%]">Equidad / (E): </p>
                <p className="w-[90%] text-[12px]">
                  Se basa en el número acumulado de horas asignadas a un docente, sumando las
                  horas del nuevo curso a asignar. A menor número de horas acumuladas, más alto
                  será el docente en la lista.
                </p>
              </div>
              <div className="flex flex-row gap-2 w-full">
                <p className="font-bold text-[14px] w-[10%]">Antigüedad / (A) : </p>
                <p className="w-[90%] text-[12px]">
                  Se considera la fecha de ingreso del docente a la institución. A mayor
                  antigüedad, más alto será el docente en la lista.
                </p>
              </div>
              <div className="flex flex-row gap-2 w-full">
                <p className="font-bold text-[14px] w-[10%]">
                  Habitualidad de Horario / (HH):
                </p>
                <p className="w-[90%] text-[12px]">
                  Se ordena según la mayor habitualidad de horario, calculada como el número de
                  veces que el docente ha dictado en ese horario en los últimos 12 meses,
                  dividido por la cantidad de meses en los que ha trabajado. A mayor
                  preferencia horaria, más
                </p>
              </div>
              <div className="flex flex-row gap-2 w-full">
                <p className="font-bold text-[14px] w-[10%]">
                  Habitualidad en el Curso / (HC):
                </p>
                <p className="w-[90%] text-[12px]">
                  Se evalúa la experiencia o habitualidad del docente en un curso específico,
                  calculada como el número de veces que ha dictado ese curso en los últimos 12
                  meses, dividido por 12. A mayor habitualidad en el curso, más alto será el
                  docente en la lista.
                </p>
              </div>
              <div className="flex flex-row gap-2 w-full items-center">
                <p className="w-[95%] text-[12px] font-semibold">
                  NOTA: Seleccionar más de un escenario incrementa el tiempo de procesamiento y
                  se selecciona entre los que generen una menor desviación estandar durante la
                  asignación para cada sede.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </LayoutValidation>
  );
};

export default Page;
