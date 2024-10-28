import { EmailClient } from '@azure/communication-email';

const connectionString = process.env.COMMUNICATION_SERVICES_CONNECTION_STRING;

export async function sendEmail(to: string, subject: string, plainText: string) {
  if (!connectionString) {
    throw new Error(
      'La variable de entorno COMMUNICATION_SERVICES_CONNECTION_STRING no está definida'
    );
  }

  const client = new EmailClient(connectionString);

  const emailMessage = {
    senderAddress: 'noreply@notificaciones.icpna-virtual.edu.pe',
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
  return result;
}
