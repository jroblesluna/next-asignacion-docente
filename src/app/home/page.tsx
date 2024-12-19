'use client';

import React, { useEffect, useState } from 'react';
import { ButtonOptionMain } from '../components/Buttons';
import NavBar from '../components/NavBar';
import { BasicTitle } from '../components/Titles';
import LayoutValidation from '../LayoutValidation';
import periodService from '@/services/period';
import { PeriodoAcademico } from '../interface/datainterface';

const Page = () => {
  const [dataPerido, setDataPeriodo] = useState<PeriodoAcademico>();

  const loadData = async () => {
    const resPerido = await periodService.verify();
    setDataPeriodo(resPerido.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <LayoutValidation>
      <main className="flex flex-col gap-5 w-full min-h-[100vh] p-6 items-start justify-start">
        <NavBar />
        <BasicTitle name="Sistema de Asignación docente ICPNA" />
        {dataPerido === undefined ? (
          <div className="w-[90%] flex gap-5 justify-center mx-auto flex-col items-center min-h-[50vh]">
            <span className="loading loading-bars loading-lg"></span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 justify-items-center w-[90%] mx-auto mt-10  min-h-[50vh]">
            <ButtonOptionMain
              img={'/history-icon.svg'}
              isDisabled={false}
              title="Historial"
              linkTo="/history"
            />
            <ButtonOptionMain
              img={'/new-period-icon.svg'}
              isDisabled={dataPerido.idPeriodo !== -1}
              title={'Nuevo Período'}
              linkTo="/new-period"
            />
            <ButtonOptionMain
              img={'/current-period.svg'}
              isDisabled={dataPerido.idPeriodo === -1}
              title="Ver Periodo En curso"
              linkTo={'/assignments-report/' + (dataPerido?.idPeriodo || '')}
            />
            <ButtonOptionMain
              img={'/config.svg'}
              isDisabled={false}
              title="Configurar escenarios"
              linkTo="/config-data"
            />
            <ButtonOptionMain
              img={'/reload-icon.svg'}
              isDisabled={dataPerido.idPeriodo === -1}
              title="Reiniciar y procesar"
              linkTo="/reload-period"
            />
            <ButtonOptionMain
              img={'/upload-icon.svg'}
              isDisabled={dataPerido.idPeriodo === -1}
              title="Sincronizar a Inicio"
              linkTo="/synchronize"
            />

            <ButtonOptionMain img={''} isDisabled={true} title="" linkTo="/" />
            <ButtonOptionMain img={''} isDisabled={true} title="" linkTo="/" />
          </div>
        )}
      </main>
    </LayoutValidation>
  );
};

export default Page;
