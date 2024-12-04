"use client";

import React, { useEffect, useState } from "react";
import { ButtonOptionMain } from "../components/Buttons";
import NavBar from "../components/NavBar";
import { BasicTitle } from "../components/Titles";
import LayoutValidation from "../LayoutValidation";
import periodService from "@/services/period";
import { PeriodoAcademico } from "../interface/datainterface";

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
      <main className="flex flex-col gap-5 w-full min-h-[100vh] p-6">
        <NavBar />
        <BasicTitle name="Sistema de Asignación docente ICPNA" />
        {dataPerido === undefined ? (
          <div className="w-[90%] flex gap-5 justify-center mx-auto flex-col items-center min-h-[50vh]">
            <span className="loading loading-bars loading-lg"></span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 justify-items-center w-[90%] mx-auto mt-10">
            <ButtonOptionMain
              img={"/history-icon.svg"}
              isDisabled={false}
              title="Historial"
              linkTo="/history"
              //className="text-sm sm:text-base md:text-lg px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4"
            />
            <ButtonOptionMain
              img={"/new-period-icon.svg"}
              isDisabled={dataPerido.idPeriodo !== -1}
              title={"Nuevo Período"}
              linkTo="/new-period"
              //className="text-sm sm:text-base md:text-lg px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4"
            />

            <ButtonOptionMain
              img={"/current-period.svg"}
              isDisabled={dataPerido.idPeriodo === -1}
              title="Ver Periodo En curso"
              linkTo={"/assignments-report/" + (dataPerido?.idPeriodo || "")}
            />
            <ButtonOptionMain
              img={"/config.svg"}
              isDisabled={false}
              title="Configurar escenarios"
              linkTo="/config-data"
            />
            <ButtonOptionMain
              img={"/reload-icon.svg"}
              isDisabled={true}
              title="Reiniciar y procesar"
              linkTo="/reload-period"
            />
            <ButtonOptionMain
              img={"/upload-icon.svg"}
              isDisabled={true}
              title="Sincronizar a Inicio"
              linkTo="/"
            />
            <ButtonOptionMain img={""} isDisabled={false} title="" linkTo="/" />
            <ButtonOptionMain img={""} isDisabled={false} title="" linkTo="/" />
          </div>
        )}
      </main>
    </LayoutValidation>
  );
};

export default Page;
