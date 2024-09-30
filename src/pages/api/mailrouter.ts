import { NextApiRequest, NextApiResponse } from 'next';
import { EmailClient } from '@azure/communication-email';

const connectionString = process.env.COMMUNICATION_SERVICES_CONNECTION_STRING;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      if (!connectionString) {
        throw new Error('La variable de entorno COMMUNICATION_SERVICES_CONNECTION_STRING no está definida');
      }

      const { to, subject, plainText } = req.body;

      console.log(to, subject, plainText);

      if (!to || !subject || !plainText) {
        return res.status(400).json({ message: 'Faltan parámetros obligatorios' });
      }

      const client = new EmailClient(connectionString);

      const emailMessage = {
        senderAddress: "DoNotReply@notificaciones.icpna-virtual.edu.pe",
        content: {
          subject,
          plainText,
        },
        recipients: {
          to: [{ address: to }],
        },
      };

      const poller = await client.beginSend(emailMessage);
      const result = await poller.pollUntilDone();

      if (result.status === 'Succeeded') {
        return res.status(200).json({ message: 'Correo enviado correctamente' });
      } else {
        return res.status(500).json({ message: 'Error al enviar el correo', details: result });
      }

    } catch (error) {
      console.error('Error al enviar el correo:', error);
      return res.status(500).json({ message: 'Error interno al enviar el correo', error });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
