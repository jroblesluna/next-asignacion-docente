"use client";
import { useEffect, useState } from "react";
import { Roboto } from "next/font/google";
import "./globals.css";
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import { getMsalConfig } from "../pages/api/lib/msalConfig";

const roboto = Roboto({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [msalConfig, setMsalConfig] = useState<PublicClientApplication | null>(
    null
  );

  useEffect(() => {
    getMsalConfig()
      .then((config) => {
        const msalInstance = new PublicClientApplication(config);
        setMsalConfig(msalInstance);
      })
      .catch((err) => {
        console.error("Error al obtener la configuración de MSAL:", err);
      });
  }, []);

  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/icpna-SmallIcon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Asignación docente</title>
      </head>
      <body className={roboto.className} suppressHydrationWarning={true}>
        {!msalConfig ? (
          <div className="w-full h-[100vh] flex items-center justify-center">
            <span className="loading loading-spinner text-success loading-lg"></span>
          </div>
        ) : (
          <MsalProvider instance={msalConfig}>{children}</MsalProvider>
        )}
      </body>
    </html>
  );
}
