"use client";

import { useState } from "react";

export default function InvokePipeline() {
  // State to manage loading status
  const [loading, setLoading] = useState(false);

  // State to manage messages (success/error)
  const [message, setMessage] = useState("");

  // State to manage running pipeline IDs and their statuses
  const [runIds, setRunIds] = useState<{ runId: string; status: string }[]>([]);

  // State to manage the pipeline name input field
  const [pipelineName, setPipelineName] = useState<string>(process.env.NEXT_PUBLIC_INVOKE_PIPELINE_NAME || "");

  // Function to invoke the pipeline or monitor its status
  const invokePipeline = async (action: "run" | "monitor") => {
    setLoading(true);  // Set loading to true when starting the action
    setMessage("");    // Reset previous message
    setRunIds([]);     // Clear any previously listed run IDs

    try {
      // Send a POST request to invoke or monitor the pipeline
      const response = await fetch("/api/invokePipeline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pipelineName,  // Name of the pipeline to act upon
          action,        // Action: either 'run' or 'monitor'
        }),
      });

      const data = await response.json();  // Parse the JSON response

      if (response.ok) {
        // Handling success for 'run' action
        if (action === "run") {
          if (data.runningPipelines?.length) {
            // If pipeline is already running, show message and list running pipelines
            setMessage("Pipeline is already running.");
            setRunIds(data.runningPipelines.map((runId: string) => ({ runId, status: "Running" })));
          } else {
            // If pipeline is not running, invoke the pipeline and show success message
            setMessage(`Success: ${data.message}`);
            setRunIds([{ runId: data.runId, status: "Running" }]);
          }
        } 
        // Handling success for 'monitor' action
        else if (action === "monitor") {
          if (data.runningPipelines?.length) {
            // If there are running pipelines, show monitoring message and list them
            setMessage("Monitoring the pipeline...");
            setRunIds(data.runningPipelines.map((runId: string) => ({ runId, status: "Running" })));
          } else {
            // If no pipelines are running, show a no running pipelines message
            setMessage("No running pipelines found.");
          }
        }
      } else {
        // Handle error if the response is not OK
        setMessage(`Error: ${data.error}`);
      }
    } catch (error: unknown) {
      // Catch any unexpected errors and display the message
      const errorMessage = (error as Error).message || "An unexpected error occurred";
      setMessage(`Error: ${errorMessage}`);
    } finally {
      // Reset loading state once the operation is completed
      setLoading(false);
    }
  };

  // Function to reset the state
  const resetState = () => {
    setMessage("");
    setRunIds([]);
    setPipelineName(process.env.NEXT_PUBLIC_INVOKE_PIPELINE_NAME || "");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pipeline Invoker</h1>
      
      <div className="mb-4">
        <label htmlFor="pipelineName" className="block font-semibold">Pipeline Name:</label>
        <input
          id="pipelineName"
          type="text"
          className="mt-2 p-2 border border-gray-300 rounded"
          value={pipelineName}
          onChange={(e) => setPipelineName(e.target.value)} // Update pipeline name on input change
        />
      </div>
      
      {/* Button to trigger the pipeline run */}
      <button
        className="border border-red-500 rounded-lg px-4 py-2 bg-green-300 hover:bg-green-400 disabled:bg-gray-300"
        onClick={() => invokePipeline("run")}
        disabled={loading} // Disable button when loading
      >
        {loading ? "Invoking..." : "RUN PIPELINE"}
      </button>

      {/* Button to monitor the pipeline status */}
      <button
        className="ml-4 border border-blue-500 rounded-lg px-4 py-2 bg-yellow-300 hover:bg-yellow-400 disabled:bg-gray-300"
        onClick={() => invokePipeline("monitor")}
        disabled={loading} // Disable button when loading
      >
        {loading ? "Monitoring..." : "MONITOR"}
      </button>

      {/* Button to reset the state */}
      <button
        className="ml-4 border border-gray-500 rounded-lg px-4 py-2 bg-gray-200 hover:bg-gray-300"
        onClick={resetState}
        disabled={loading} // Disable button when loading
      >
        RESET
      </button>

      {/* Display message (success or error) */}
      {message && (
        <p className={`mt-4 ${message.startsWith("Success") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}

      {/* Display the list of running pipeline IDs */}
      {runIds.length > 0 && (
        <div className="mt-4">
          <h2 className="font-semibold">Run IDs:</h2>
          <ul className="list-disc pl-6">
            {runIds.map((run, index) => (
              <li key={index} className="text-blue-500">
                {run.runId || "No Run ID Available"} - <span className="text-gray-600">{run.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
