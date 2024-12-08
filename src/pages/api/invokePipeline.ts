import { NextApiRequest, NextApiResponse } from "next";
import { ConfidentialClientApplication } from "@azure/msal-node";

// Type for pipeline run
type PipelineRun = {
    runId: string;
    status: string;
};

// Type for query response from Azure
type QueryResponse = {
    value: PipelineRun[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Check if the request method is POST
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // Destructure the pipeline name and action from the request body
    const {
        pipelineName,
        action,
    }: { pipelineName: string; action: "run" | "monitor" } = req.body;

    // Validate the required parameters
    if (!pipelineName || !action) {
        return res.status(400).json({ error: "Missing required parameters: pipelineName and action" });
    }

    // Validate the action
    if (!["run", "monitor"].includes(action)) {
        return res.status(400).json({ error: "Invalid action. Allowed values are 'run' or 'monitor'" });
    }

    // Get environment variables for Azure API
    const tenantID = process.env.NEXT_PUBLIC_AZURE_WEBAPP_ID_TENANT as string;
    const subscriptionId = process.env.NEXT_PUBLIC_AZURE_SUBSCRIPTION_ID;
    const applicationID = process.env.NEXT_PUBLIC_INVOKE_PIPELINE_APP_ID as string;
    const csValue = process.env.NEXT_PUBLIC_INVOKE_PIPELINE_APP_CS as string;
    const resourceGroupName = process.env.NEXT_PUBLIC_DATA_FACTORY_RESOURCE_GROUP_NAME;
    const dataFactoryName = process.env.NEXT_PUBLIC_DATA_FACTORY_NAME;

    // Define URLs for Azure API calls
    const pipelineRunUrl = `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.DataFactory/factories/${dataFactoryName}/queryPipelineRuns?api-version=2018-06-01`;
    const pipelineUrl = `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.DataFactory/factories/${dataFactoryName}/pipelines/${pipelineName}/createRun?api-version=2018-06-01`;

    // Ensure required environment variables are set
    if (!tenantID || !applicationID || !csValue) {
        throw new Error("Missing required environment variables");
    }

    // MSAL configuration for authentication
    const msalConfig = {
        auth: {
            clientId: applicationID,
            authority: `https://login.microsoftonline.com/${tenantID}`,
            clientSecret: csValue,
        },
    };

    const tokenRequest = {
        scopes: ["https://management.azure.com/.default"], // Scope for Azure management
    };

    try {
        // Authenticate and get an access token using MSAL
        const msalClient = new ConfidentialClientApplication(msalConfig);
        const authResult = await msalClient.acquireTokenByClientCredential(tokenRequest);

        if (!authResult || !authResult.accessToken) {
            throw new Error("Failed to acquire access token");
        }

        const bearerToken = authResult.accessToken;

        // Query the pipeline runs from Azure
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

        // Parse the query response
        const queryData: QueryResponse = await queryResponse.json();
        const runningPipelines = queryData.value.filter((run) => run.status === "InProgress");

        if (runningPipelines.length > 0) {
            // If there are running pipelines, return their run IDs
            const runIds = runningPipelines.map((run) => run.runId);
            return res.status(200).json({
                message: "Pipeline is running",
                runningPipelines: runIds,
            });
        }

        // If action is 'run', trigger the pipeline run
        if (action === "run") {
            const pipelineResponse = await fetch(pipelineUrl, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${bearerToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (pipelineResponse.ok) {
                // Successfully triggered the pipeline run
                const result = await pipelineResponse.json();
                res.status(200).json({ message: "Pipeline invoked successfully!", runId: result.runId });
            } else {
                // Handle error if the pipeline run invocation fails
                const errorData = await pipelineResponse.json();
                res.status(500).json({ error: errorData.error.message });
            }
        }
        else {
            res.status(200).json({ message: "Pipeline is not running." })
        }
    } catch (error) {
        // Catch any errors during the process and return the error message
        res.status(500).json({ error: (error as Error).message });
    }
}
