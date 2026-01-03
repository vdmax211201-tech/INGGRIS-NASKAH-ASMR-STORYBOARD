
import { GoogleGenAI, Type } from "@google/genai";
import { VisualStyle, MusicStyle, Language, VideoType, StoryGenerationResult, Gender } from "../types";

const safeJsonParse = (text: string): any => {
  try {
    return JSON.parse(text);
  } catch (e) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (innerError) {
        throw new Error("Struktur JSON dari AI tidak valid.");
      }
    }
    throw new Error("Gagal menemukan objek JSON yang valid.");
  }
};

export const generateVisualPrompts = async (
  script: string,
  visualStyle: VisualStyle,
  musicStyle: MusicStyle,
  language: Language,
  videoType: VideoType,
  gender: Gender
): Promise<StoryGenerationResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const complexityRules = videoType === VideoType.SHORT 
    ? `SCENE COUNT: Exactly 8 scenes. ASPECT RATIO: 9:16 (Vertical).`
    : `SCENE COUNT: Between 18 to 22 scenes. ASPECT RATIO: 16:9 (Cinematic).`;

  const systemInstruction = `
    You are a Senior AI Cinematographer specializing in CHARACTER LOCK and VISUAL CONTINUITY.
    Your absolute priority is ensuring the character looks 100% identical from Scene 1 to the final Scene.

    --- MANDATORY PRODUCTION RULES ---
    
    1. THE CHARACTER DNA (Visual Anchor):
       - First, define a 'characterReference' in English. This is the "Visual DNA".
       - It MUST be extremely specific: [Face details: eye shape/color, nose, jawline] + [Hair: texture, exact length, style] + [Exact Outfit: Fabric type, specific colors, unique marks like buttons, stains, or logos].
       - Example: "A 25-year-old woman with pale skin, sharp emerald eyes, messy raven-black bob haircut, wearing a weathered tan canvas jacket with a high collar and brass buttons over a white ribbed turtleneck."

    2. VERBATIM PROMPT PREFIXING (The Subject Lock):
       - EVERY single 'visualPrompt' MUST start with this EXACT 'characterReference' block.
       - NEVER use pronouns like "He", "She", "The character", or "The man from before". 
       - If you summarize or change even one word of the character description between scenes, the production fails.
       - Structure: "[Visual DNA Prefix], [Specific Action], [Environment Details], [Camera Angle], [Lighting Style in ${visualStyle}]".

    3. NARRATIVE LANGUAGE:
       - All story/voiceover text ('title', 'summary', 'voiceOver', 'hook', 'body', 'climax', 'cta') MUST be in ${language}.
       - All technical instructions ('visualPrompt', 'thumbnailPrompt', 'characterReference') MUST be in English.

    4. CONTINUITY OF ENVIRONMENT:
       - Keep the setting consistent. If they are in a room, describe the same window, the same light source, and the same textures in every scene until they leave the room.

    5. PRODUCTION VOLUME:
       - ${complexityRules}

    RETURN ONLY VALID JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ 
        parts: [{ 
          text: `STRICT CONTINUITY PRODUCTION INITIATED.
                 Script: ${script}
                 Aesthetic: ${visualStyle}
                 Music/Audio: ${musicStyle}
                 Gender: ${gender}
                 Output Language: ${language}
                 Video Format: ${videoType}
                 ${complexityRules}` 
        }] 
      }],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            characterReference: { type: Type.STRING },
            hook: { type: Type.STRING },
            body: { type: Type.STRING },
            climax: { type: Type.STRING },
            cta: { type: Type.STRING },
            thumbnailPrompt: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sceneNumber: { type: Type.INTEGER },
                  timeframe: { type: Type.STRING },
                  visualPrompt: { type: Type.STRING },
                  voiceOver: { type: Type.STRING },
                  soundscape: { type: Type.STRING },
                  continuityNotes: { type: Type.STRING }
                },
                required: ["sceneNumber", "timeframe", "visualPrompt", "voiceOver", "soundscape", "continuityNotes"]
              }
            }
          },
          required: ["title", "summary", "characterReference", "scenes", "tags", "hashtags", "thumbnailPrompt"]
        }
      }
    });

    return safeJsonParse(response.text) as StoryGenerationResult;
  } catch (error: any) {
    console.error("Continuity Engine Critical Failure:", error);
    throw new Error(error.message || "Gagal membangun storyboard konsisten. Coba perkecil naskah atau ganti gaya.");
  }
};
