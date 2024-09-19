import React from 'react';
import { ButtonOptionMain } from '../components/Buttons';
import { GrDocumentTime } from 'react-icons/gr';
import { TiDocumentAdd } from 'react-icons/ti';
import { MdEditDocument } from 'react-icons/md';
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
            img={<GrDocumentTime className="size-[95px] text-white" />}
            isDisabled={false}
            title="Historial"
            linkTo="/history"
          />
          <ButtonOptionMain
            img={<TiDocumentAdd className="size-[120px] text-white" />}
            isDisabled={false}
            title="Nuevo Período"
            linkTo="/new-period"
          />
          <ButtonOptionMain
            img={<MdEditDocument className="size-[95px] text-white" />}
            isDisabled={true}
            title="Ver Periodo En curso"
            linkTo="/"
          />
          <ButtonOptionMain img={<></>} isDisabled={false} title="" linkTo="/" />
          <ButtonOptionMain img={<></>} isDisabled={false} title="" linkTo="/" />
          <ButtonOptionMain img={<></>} isDisabled={false} title="" linkTo="/" />
          <ButtonOptionMain img={<></>} isDisabled={false} title="" linkTo="/" />
          <ButtonOptionMain img={<></>} isDisabled={false} title="" linkTo="/" />
        </div>
      </main>
    </LayoutValidation>
  );
};

export default Page;
