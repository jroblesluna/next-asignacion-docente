import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const clientId = process.env.NEXT_PUBLIC_AZURE_WEBAPP_ID_CLIENT || 'dummyClient';
    const tenantId = process.env.NEXT_PUBLIC_AZURE_WEBAPP_ID_TENANT || 'dummyTenant';
    res.status(200).json({
        clientId,
        tenantId,
    });
}
