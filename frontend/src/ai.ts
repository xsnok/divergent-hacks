// Type definitions for Gemini API
type GeminiPart =
  | { text: string }
  | {
      inline_data: {
        mime_type: string;
        data: string;
      };
    };

interface GeminiRequestBody {
  contents: Array<{
    parts: Array<GeminiPart>;
  }>;
  generationConfig?: {
    responseMimeType: string;
    responseSchema: Record<string, unknown>;
  };
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text: string;
      }>;
    };
  }>;
}

/**
 * Calls the Gemini API and requests structured or unstructured output
 * @param prompt - The text prompt to send to Gemini
 * @param schema - Optional JSON schema for structured output
 * @returns The structured JSON response or text response from Gemini
 */
export default async function callGemini<T = string>(
  prompt: string,
  schema: Record<string, unknown> | null = null
): Promise<T> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is not set in environment variables");
  }

  try {
    // Build the request body
    const requestBody: GeminiRequestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    };

    // Add structured output configuration if schema is provided
    if (schema) {
      requestBody.generationConfig = {
        responseMimeType: "application/json",
        responseSchema: schema,
      };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Gemini API error: ${response.status} ${
          response.statusText
        }. ${JSON.stringify(errorData)}`
      );
    }

    const data: GeminiResponse = await response.json();

    // Extract the response
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const text = data.candidates[0].content.parts?.[0]?.text;

      if (!text) {
        throw new Error("No text found in response");
      }

      // If schema was provided, parse as JSON
      if (schema) {
        try {
          return JSON.parse(text) as T;
        } catch (parseError) {
          const errorMessage =
            parseError instanceof Error ? parseError.message : "Unknown error";
          throw new Error(
            `Failed to parse structured output: ${errorMessage}. Response: ${text}`
          );
        }
      }

      return text as T;
    } else {
      throw new Error("Unexpected response format from Gemini API");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}

/**
 * Helper function to convert a File to base64 string
 * @param file - The image file to convert
 * @returns Promise that resolves to base64 string (without data URL prefix)
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Calls the Gemini API with an image for analysis
 * @param prompt - The text prompt to send to Gemini
 * @param image - The image file to analyze
 * @param schema - Optional JSON schema for structured output
 * @returns The structured JSON response or text response from Gemini
 */
export async function callGeminiWithImage<T = string>(
  prompt: string,
  image: File,
  schema: Record<string, unknown> | null = null
): Promise<T> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is not set in environment variables");
  }

  try {
    // Convert image to base64
    const base64Image = await fileToBase64(image);
    const mimeType = image.type || "image/jpeg";

    // Build the request body with multimodal content
    const requestBody: GeminiRequestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Image,
              },
            },
          ],
        },
      ],
    };

    // Add structured output configuration if schema is provided
    if (schema) {
      requestBody.generationConfig = {
        responseMimeType: "application/json",
        responseSchema: schema,
      };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Gemini API error: ${response.status} ${
          response.statusText
        }. ${JSON.stringify(errorData)}`
      );
    }

    const data: GeminiResponse = await response.json();

    // Extract the response
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const text = data.candidates[0].content.parts?.[0]?.text;

      if (!text) {
        throw new Error("No text found in response");
      }

      // If schema was provided, parse as JSON
      if (schema) {
        try {
          return JSON.parse(text) as T;
        } catch (parseError) {
          const errorMessage =
            parseError instanceof Error ? parseError.message : "Unknown error";
          throw new Error(
            `Failed to parse structured output: ${errorMessage}. Response: ${text}`
          );
        }
      }

      return text as T;
    } else {
      throw new Error("Unexpected response format from Gemini API");
    }
  } catch (error) {
    console.error("Error calling Gemini API with image:", error);
    throw error;
  }
}
