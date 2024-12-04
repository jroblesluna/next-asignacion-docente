import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const tenantId = process.env.NEXT_PUBLIC_AZURE_WEBAPP_ID_TENANT;
    const clientId = process.env.NEXT_PUBLIC_AZURE_WEBAPP_ID_CLIENT;
    if (!clientId || !tenantId) {
        return res.status(400).json({ error: 'Faltan las configuraciones necesarias' });
    }
    res.status(200).json({
        clientId,
        tenantId,
    });
}
