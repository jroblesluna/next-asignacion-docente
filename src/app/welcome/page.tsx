"use client";
import Image from "next/image";
import React from "react";
import { useMsal } from "@azure/msal-react";
import { BrowserAuthError } from "@azure/msal-browser";

function Page() {
  const { instance } = useMsal();

  const handleLogin = () => {
    try {
      instance.loginRedirect({
        scopes: ["user.read"],
      });
    } catch (error) {
      if (
        error instanceof BrowserAuthError &&
        error.errorCode === "interaction_in_progress"
      ) {
        console.log("Interacción de autenticación ya en progreso.");
      } else {
        console.log("Otro error ocurrió:", error);
      }
    }
  };

  // Obtener la fecha de compilación desde las variables de entorno
  const buildDate = process.env.NEXT_PUBLIC_BUILD_DATE || "Desarrollo";

  return (
    <main className="flex flex-row min-h-[100vh] max-lg:flex-col">
      <div className="flex flex-col gap-20 items-start text-black w-[60%] p-10 max-lg:w-full">
        <Image
          src="/icpna-icon.svg"
          alt="ICPNA Logo"
          className="cursor-pointer hover:opacity-80 w-64 mt-5 max-[600px]:mx-auto"
          width={256}
          height={64}
        />

        <div className="flex flex-col gap-8">
          <h1 className="text-5xl font-bold">
            Sistema de Asignación docente ICPNA
          </h1>
          <h6 className="text-sm font-light">Versión: {buildDate}</h6>
          <p className="text-primary_ligth text-[18px]">
            El Sistema de Asignación Docente ICPNA automatiza la asignación de
            profesores a cursos, optimizando horarios según disponibilidad y
            requisitos. Facilita la gestión y genera reportes detallados para
            los administradores académicos.
          </p>

          <button
            className="bg-secundary py-2 px-10 text-white font-semibold hover:bg-secundary_ligth mx-auto"
            onClick={handleLogin}
          >
            Iniciar Sesión
          </button>
        </div>
      </div>

      <div className="w-[60%] h-[100vh] flex justify-end overflow-hidden max-lg:hidden flex-row items-center">
        <Image
          src="/welcome.svg"
          alt="Welcome Illustration"
          className="h-full w-full object-center"
          width={1024}
          height={768}
        />
      </div>
    </main>
  );
}

export default Page;