import { NextApiRequest, NextApiResponse } from 'next';
import { ConfidentialClientApplication } from '@azure/msal-node';

type PipelineRun = {
  runId: string;
  status: string;
  runStart: string;
  runEnd?: string;
};

type QueryResponse = {
  value: PipelineRun[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const pipelineName = req.query.pipelineName as string;

  if (!pipelineName) {
    return res.status(400).json({ error: 'Missing pipelineName in query' });
  }

  const tenantID = process.env.NEXT_PUBLIC_AZURE_WEBAPP_ID_TENANT!;
  const subscriptionId = process.env.NEXT_PUBLIC_AZURE_SUBSCRIPTION_ID!;
  const applicationID = process.env.NEXT_PUBLIC_INVOKE_PIPELINE_APP_ID!;
  const csValue = process.env.NEXT_PUBLIC_INVOKE_PIPELINE_APP_CS!;
  const resourceGroupName = process.env.NEXT_PUBLIC_DATA_FACTORY_RESOURCE_GROUP_NAME!;
  const dataFactoryName = process.env.NEXT_PUBLIC_DATA_FACTORY_NAME!;

  const pipelineRunUrl = `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.DataFactory/factories/${dataFactoryName}/queryPipelineRuns?api-version=2018-06-01`;

  const msalConfig = {
    auth: {
      clientId: applicationID,
      authority: `https://login.microsoftonline.com/${tenantID}`,
      clientSecret: csValue,
    },
  };

  const tokenRequest = {
    scopes: ['https://management.azure.com/.default'],
  };

  try {
    const msalClient = new ConfidentialClientApplication(msalConfig);
    const authResult = await msalClient.acquireTokenByClientCredential(tokenRequest);

    if (!authResult?.accessToken) {
      throw new Error('No se pudo obtener token de acceso');
    }

    const bearerToken = authResult.accessToken;

    const queryResponse = await fetch(pipelineRunUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lastUpdatedBefore: new Date().toISOString(),
        filters: [{ operand: 'PipelineName', operator: 'Equals', values: [pipelineName] }],
      }),
    });

    const queryData: QueryResponse = await queryResponse.json();

    if (!queryData.value.length) {
      return res
        .status(200)
        .json({ message: 'No se encontraron ejecuciones de este pipeline' });
    }

    const sorted = queryData.value.sort(
      (a, b) => new Date(b.runStart).getTime() - new Date(a.runStart).getTime()
    );

    const lastRun = sorted[0];

    return res.status(200).json({ message: 'Último pipeline ejecutado', lastRun });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}
