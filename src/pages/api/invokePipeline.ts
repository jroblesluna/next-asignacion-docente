import { NextApiRequest, NextApiResponse } from "next";
import { ConfidentialClientApplication } from "@azure/msal-node";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const tenantID = process.env.NEXT_PUBLIC_AZURE_WEBAPP_ID_TENANT as string;
    const subscriptionId = process.env.NEXT_PUBLIC_AZURE_SUBSCRIPTION_ID;
    const applicationID = process.env.NEXT_PUBLIC_INVOKE_PIPELINE_APP_ID as string;
    const csValue = process.env.NEXT_PUBLIC_INVOKE_PIPELINE_APP_CS as string;
    const resourceGroupName = process.env.NEXT_PUBLIC_DATA_FACTORY_RESOURCE_GROUP_NAME;
    const dataFactoryName = process.env.NEXT_PUBLIC_DATA_FACTORY_NAME;
    const pipelineName = process.env.NEXT_PUBLIC_INVOKE_PIPELINE_NAME;
    const pipelineRunUrl = `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.DataFactory/factories/${dataFactoryName}/queryPipelineRuns?api-version=2018-06-01`;
    const pipelineUrl = `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.DataFactory/factories/${dataFactoryName}/pipelines/${pipelineName}/createRun?api-version=2018-06-01`;

    if (!tenantID || !applicationID || !csValue) {
        throw new Error("Missing required environment variables");
    }
    
    const msalConfig = {
        auth: {
            clientId: applicationID,
            authority: `https://login.microsoftonline.com/${tenantID}`,
            clientSecret: csValue,
        },
    };

    const tokenRequest = {
        scopes: ["https://management.azure.com/.default"],
    };

    try {
        const msalClient = new ConfidentialClientApplication(msalConfig);
        const authResult = await msalClient.acquireTokenByClientCredential(tokenRequest);

        if (!authResult || !authResult.accessToken) {
            throw new Error("Failed to acquire access token");
        }

        const bearerToken = authResult.accessToken;

        // Step 1: Check if the pipeline is already running
        const queryResponse = await fetch(pipelineRunUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${bearerToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                lastUpdatedAfter: new Date(new Date().getTime() - 60 * 60 * 1000).toISOString(), // Check past hour
                lastUpdatedBefore: new Date().toISOString(),
                filters: [{ operand: "PipelineName", operator: "Equals", values: [pipelineName] }],
            }),
        });

        const queryData = await queryResponse.json();
        console.log("Query Data:", queryData);

        const runningPipelines = queryData.value.filter((run: any) => run.status === "InProgress");

        if (runningPipelines.length > 0) {
            const runIds = runningPipelines.map((run: any) => run.runId);
            return res.status(200).json({
                message: "Pipeline is already running",
                runningPipelines: runIds,
            });
        }

        // Step 2: Trigger the pipeline if not running
        const pipelineResponse = await fetch(pipelineUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${bearerToken}`,
                "Content-Type": "application/json",
            },
        });

        if (pipelineResponse.ok) {
            const result = await pipelineResponse.json();
            res.status(200).json({ message: "Pipeline invoked successfully!", runId: result.runId });
        } else {
            const errorData = await pipelineResponse.json();
            res.status(500).json({ error: errorData.error.message });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
