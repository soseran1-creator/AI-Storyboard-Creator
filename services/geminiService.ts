import { GoogleGenAI, Type, Schema } from "@google/genai";
import { StoryboardResponse, StoryboardBrief } from "../types";

// Helper to get API Key with priority: LocalStorage (User Manual) > Process Env (Deployment)
const getApiKey = (): string | undefined => {
  // 1. Check localStorage first (User override or Manual Input on Vercel)
  if (typeof window !== 'undefined') {
    const localKey = localStorage.getItem("gemini_api_key");
    if (localKey) return localKey;
  }
  
  // 2. Check process.env (Vercel Env Vars or Build-time injection)
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  
  return undefined;
};

// Schema definition for structured output
const storyboardSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "The title of the video content.",
    },
    synopsis: {
      type: Type.STRING,
      description: "A brief synopsis of the video content.",
    },
    cuts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          cutNumber: { type: Type.INTEGER },
          visualDescription: { 
            type: Type.STRING,
            description: "Detailed description of the screen content (Composition, Background, Characters, Expressions, Actions, Camera Angle)."
          },
          sourceFileName: { 
            type: Type.STRING,
            description: "A hypothetical file name for the source footage."
          },
          subtitles: { 
            type: Type.STRING,
            description: "On-screen text/captions suitable for the target audience level."
          },
          narration: { 
            type: Type.STRING,
            description: "Audio script including commentary, character dialogue, and sound effects (SFX)."
          },
          imagePrompt: {
            type: Type.STRING,
            description: "A specific, concise prompt optimized for an AI image generator to create a storyboard sketch."
          }
        },
        required: ["cutNumber", "visualDescription", "sourceFileName", "subtitles", "narration", "imagePrompt"],
      },
    },
  },
  required: ["title", "synopsis", "cuts"],
};

export const generateStoryboardText = async (brief: StoryboardBrief): Promise<StoryboardResponse> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error("API Key not found. Please set it in settings.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Construct the text part of the prompt
    const textPrompt = `
      Create a professional educational video storyboard based on the following Creative Brief.
      
      ${brief.conceptFile ? "**IMPORTANT: A Concept Board PDF has been attached. Analyze the PDF visuals, character designs, and tone, and strictly apply them to the storyboard.**" : ""}

      # CREATIVE BRIEF
      - **Topic:** ${brief.topic}
      - **Purpose:** ${brief.purpose}
      - **Target Audience:** ${brief.targetAudience}
      - **Key Concepts:** ${brief.keyConcepts}
      - **Narrative Flow:** ${brief.narrativeFlow}
      - **Cut Count / Duration:** ${brief.cutCount}
      - **Constraints:** ${brief.constraints}
      - **Concept/Character Settings (Text Note):** ${brief.conceptSettings || "Refer to the attached file if available."}

      # GENERATION RULES (Strict Adherence Required)

      1. **Visual Description (Screen Content & Expression):**
         - Describe the scene concretely: Composition, Background, Characters, Facial Expressions, Actions, and Camera Angles (e.g., Close-up, Wide shot).
         - Do NOT use abstract terms. Be visual.
         - **If a PDF is attached, use the characters and visual style defined in the PDF.**

      2. **Subtitles:**
         - Must match the reading level of the "${brief.targetAudience}".
         - Summarize key messages briefly. Avoid overly long sentences.

      3. **Narration:**
         - Include Commentary, Character Dialogue, and Sound Effects (SFX).
         - Educational explanations must be accurate and concise.

      4. **Flow & Structure:**
         - Strictly follow the provided "Narrative Flow".
         - Adhere to the requested "Cut Count".

      5. **Restrictions:**
         - Do NOT warp characters or change their defined settings.
         - Maintain brand tone.
         - No exaggeration or violent expressions.
         - Do NOT distort educational concepts.
         - Ensure language (Subtitles/Narration) matches the input language (Korean).

      Output the result in JSON format matching the schema.
    `;

    // Prepare contents array (Text + Optional File)
    const contents: any[] = [{ text: textPrompt }];

    // If a file is attached, add it to the contents
    if (brief.conceptFile) {
      contents.push({
        inlineData: {
          mimeType: brief.conceptFile.mimeType,
          data: brief.conceptFile.data
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents, // Pass the array containing text and file
      config: {
        responseMimeType: "application/json",
        responseSchema: storyboardSchema,
        systemInstruction: "You are an expert educational video director and storyboard artist. You organize complex ideas into clear, linear visual sequences strictly adhering to creative briefs and attached concept documents.",
      },
    });

    if (!response.text) {
      throw new Error("No response from Gemini");
    }

    return JSON.parse(response.text) as StoryboardResponse;
  } catch (error) {
    console.error("Error generating storyboard text:", error);
    throw error;
  }
};

export const generateStoryboardImage = async (prompt: string): Promise<string | null> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error("API Key not found.");
    }
    
    const ai = new GoogleGenAI({ apiKey });

    // We append style modifiers to ensure it looks like a storyboard
    const finalPrompt = `${prompt}, minimalistic storyboard sketch style, pencil drawing, rough concept art, wide shot aspect ratio, black and white or muted colors, simple lines, clean composition`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: finalPrompt,
    });

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};