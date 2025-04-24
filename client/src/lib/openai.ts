import { AnalysisResults } from "@shared/schema";

// Makes calls to backend which will call the OpenAI API
export async function analyzeStartupIdea(
  startupIdea: string
): Promise<AnalysisResults> {
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ startupIdea }),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error analyzing startup idea:", error);
    throw error;
  }
}

export async function generateExecutionPlan(
  startupIdea: string,
  initialBudget: number
): Promise<AnalysisResults["planToExecute"]> {
  try {
    const response = await fetch("/api/execution-plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ startupIdea, initialBudget }),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating execution plan:", error);
    throw error;
  }
}

export async function findInvestors(
  startupIdea: string
): Promise<AnalysisResults["findingInvestors"]> {
  try {
    const response = await fetch("/api/investors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ startupIdea }),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error finding investors:", error);
    throw error;
  }
}
