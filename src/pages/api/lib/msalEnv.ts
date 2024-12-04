import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const clientId = process.env.NEXT_PUBLIC_AZURE_WEBAPP_ID_CLIENT || 'cea39403-2b37-4bde-9cae-c9246ebdd03b';
    const tenantId = process.env.NEXT_PUBLIC_AZURE_WEBAPP_ID_TENANT || 'c25f5a9d-1acb-41dc-8777-55458159b9d9';
    if (!clientId || !tenantId) {
        return res.status(400).json({ error: 'Faltan las configuraciones necesarias' });
    }
    res.status(200).json({
        clientId,
        tenantId,
    });
}
