import { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from './lib/conectEmail';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const to = 'ext.jrobles@icpna-virtual.edu.pe';
      const subject = 'Asunto del correo de prueba';
      const plainText = 'Este es el contenido del correo de prueba';

      const result = await sendEmail(to, subject, plainText);

      if (result.status === 'Succeeded') {
        return res.status(200).json({ message: 'Correo enviado correctamente desde GET' });
      } else {
        return res
          .status(500)
          .json({ message: 'Error al enviar el correo desde GET', details: result });
      }
    } catch (error) {
      console.error('Error al enviar el correo desde GET:', error);
      return res
        .status(500)
        .json({ message: 'Error interno al enviar el correo desde GET', error });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
