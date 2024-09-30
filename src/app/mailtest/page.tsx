// /app/mailtest/page.tsx

"use client";

import { useState } from "react";
import axios from "axios";

export default function MailTestPage() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [plainText, setPlainText] = useState("");
  const [status, setStatus] = useState("");

  const sendMail = async () => {
    try {
      setStatus("Enviando correo...");
      const response = await axios.post("/api/mailrouter", {
        to,
        subject,
        plainText,
      });
      setStatus(response.data.message);
    } catch (error) {
      console.error("Error enviando el correo:", error);
      setStatus("Error enviando el correo");
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-fit flex flex-col gap-4 p-10">
        <h1 className="text-2xl">Correo de Prueba</h1>

        <label>Para:</label>
        <input
          type="email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="Correo destinatario"
          style={{
            display: "block",
            marginBottom: "10px",
            padding: "5px",
            width: "300px",
          }}
        />

        <label>Asunto:</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Asunto del correo"
          style={{
            display: "block",
            marginBottom: "10px",
            padding: "5px",
            width: "300px",
          }}
        />

        <label>Mensaje:</label>
        <textarea
          value={plainText}
          onChange={(e) => setPlainText(e.target.value)}
          placeholder="Escribe tu mensaje"
          style={{
            display: "block",
            marginBottom: "10px",
            padding: "5px",
            width: "300px",
            height: "100px",
          }}
        />

        <button
          onClick={sendMail}
          style={{
            padding: "10px 20px",
            backgroundColor: "blue",
            color: "white",
            border: "none",
          }}
        >
          Enviar Correo
        </button>

        {status && <p>{status}</p>}
      </div>
    </div>
  );
}
