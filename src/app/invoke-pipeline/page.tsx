"use client";

import { useState } from "react";

export default function invokePipeline() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [runIds, setRunIds] = useState<string[]>([]);

  const invokePipeline = async () => {
    setLoading(true);
    setMessage("");
    setRunIds([]);

    try {
      const response = await fetch("/api/invokePipeline", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        if (data.runningPipelines?.length) {
          setMessage("Pipeline is already running.");
          setRunIds(data.runningPipelines);
        } else {
          setMessage(`Success: ${data.message}`);
          setRunIds([data.runId]);
        }
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message || "An unexpected error occurred"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">ICPNA Pipeline Invoker</h1>
      <button
        className="border border-red-500 rounded-lg px-4 py-2 bg-green-300 hover:bg-green-400 disabled:bg-gray-300"
        onClick={invokePipeline}
        disabled={loading}
      >
        {loading ? "Invoking..." : "INVOKE PIPELINE"}
      </button>
      {message && (
        <p className={`mt-4 ${message.startsWith("Success") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}
      {runIds.length > 0 && (
        <div className="mt-4">
          <h2 className="font-semibold">Run IDs:</h2>
          <ul className="list-disc pl-6">
            {runIds.map((runId, index) => (
              <li key={index} className="text-blue-500">{runId || "No Run ID Available"}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
