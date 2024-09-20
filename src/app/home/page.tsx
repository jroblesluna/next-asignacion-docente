import React from 'react';
import { ButtonOptionMain } from '../components/Buttons';
import NavBar from '../components/NavBar';
import { BasicTitle } from '../components/Titles';
import LayoutValidation from '../LayoutValidation';

const Page = () => {
  return (
    <LayoutValidation>
      <main className="flex flex-col gap-5 w-full min-h-[100vh] p-6">
        <NavBar />
        <BasicTitle name="Sistema de Asignación docente ICPNA" />
        <div className="grid grid-cols-4 gap-y-10 justify-items-center w-[90%] mx-auto mt-10">
          <ButtonOptionMain
            img={'/history-icon.svg'}
            isDisabled={false}
            title="Historial"
            linkTo="/history"
          />
          <ButtonOptionMain
            img={'/new-period-icon.svg'}
            isDisabled={false}
            title="Nuevo Período"
            linkTo="/new-period"
          />
          <ButtonOptionMain
            img={'/current-period.svg'}
            isDisabled={true}
            title="Ver Periodo En curso"
            linkTo="/"
          />
          <ButtonOptionMain img={''} isDisabled={false} title="" linkTo="/" />
          <ButtonOptionMain img={''} isDisabled={false} title="" linkTo="/" />
          <ButtonOptionMain img={''} isDisabled={false} title="" linkTo="/" />
          <ButtonOptionMain img={''} isDisabled={false} title="" linkTo="/" />
          <ButtonOptionMain img={''} isDisabled={false} title="" linkTo="/" />
        </div>
      </main>
    </LayoutValidation>
  );
};

export default Page;
