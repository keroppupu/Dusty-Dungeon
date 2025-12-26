import { GoogleGenAI, Type } from "@google/genai";
import { GUIDE_IMAGE } from "../constants";

// Initialize with the environment variable directly as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Cache and API status management
let apiCooldownUntil = 0;
const COOLDOWN_DURATION = 120 * 1000; // 2 minutes cooldown for quota errors
const dialogueCache: Record<string, any> = {};
const battleIntroCache: Record<string, string> = {};

/**
 * Safety wrapper for API calls to prevent UI blocking or crashing on errors.
 * Includes quota limit detection and local fallback logic.
 */
async function withSmartFallback<T>(cacheKey: string, cache: Record<string, T>, fn: () => Promise<T>, fallbackFn: () => T): Promise<T> {
  if (cache[cacheKey]) return cache[cacheKey];

  const now = Date.now();
  if (now < apiCooldownUntil) {
    const res = fallbackFn();
    cache[cacheKey] = res;
    return res;
  }

  return new Promise<T>((resolve) => {
    // Fail fast if the API is non-responsive
    const timeout = setTimeout(() => {
      const res = fallbackFn();
      cache[cacheKey] = res;
      resolve(res);
    }, 3000);

    fn().then((result) => {
      clearTimeout(timeout);
      if (!result) {
        throw new Error("Empty response");
      }
      cache[cacheKey] = result;
      resolve(result);
    }).catch((error) => {
      clearTimeout(timeout);
      const errorStr = String(error?.message || "").toLowerCase();
      // Quota handling
      if (errorStr.includes("quota") || errorStr.includes("limit") || errorStr.includes("429") || errorStr.includes("exceeded")) {
        apiCooldownUntil = Date.now() + COOLDOWN_DURATION;
        console.warn("Gemini API Quota Limit reached. Falling back to local content generation.");
      }
      const res = fallbackFn();
      cache[cacheKey] = res;
      resolve(res);
    });
  });
}

const LOCAL_ENGINE = {
  getFloorMessage: (floor: number) => {
    const themes = ["静かな", "どこか懐かしい", "石造りの", "微かな光が灯る", "空気の澄んだ"];
    const events = ["足音が心地よく響いています。", "歴史の重みを感じる場所です。", "何かが待っているような予感がします。", "一歩ずつ、慎重に進みましょう。"];
    return `${floor}階...。${themes[floor % themes.length]}場所です。${events[Math.floor(Math.random() * events.length)]}`;
  },
  getBattleMessage: (enemyName: string) => {
    const intros = [`${enemyName}が現れました！`, `${enemyName}がこちらを伺っています。`, `戦いが始まります...！` ];
    return intros[Math.floor(Math.random() * intros.length)];
  }
};

/**
 * Generates thematic dialogue when entering a dungeon floor.
 */
export async function generateFloorDialogue(floor: number, playerName: string, job: string) {
  const cacheKey = `floor-${floor}-${job}`;
  const getLocalFallback = () => ({
    speaker: "案内人",
    message: LOCAL_ENGINE.getFloorMessage(floor),
    portrait: GUIDE_IMAGE
  });

  return withSmartFallback(cacheKey, dialogueCache, async () => {
    // Recommended way to request JSON output using responseSchema
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `RPGのダンジョン${floor}階に到達しました。プレイヤー：${playerName}、職業：${job}。その階層にふさわしい案内人のメッセージをJSONで生成してください。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            speaker: { type: Type.STRING, description: "案内人の名前" },
            message: { type: Type.STRING, description: "プレイヤーへのメッセージ本文" }
          },
          required: ["speaker", "message"]
        }
      }
    });
    // Use the .text property to get the generated response
    const jsonStr = response.text;
    const parsed = jsonStr ? JSON.parse(jsonStr) : null;
    return parsed ? { ...parsed, portrait: GUIDE_IMAGE } : getLocalFallback();
  }, getLocalFallback);
}

/**
 * Generates a cute battle introduction line.
 */
export async function generateBattleIntro(enemyName: string) {
  const cacheKey = `enemy-${enemyName}`;
  const getLocalFallback = () => LOCAL_ENGINE.getBattleMessage(enemyName);
  
  return withSmartFallback(cacheKey, battleIntroCache, async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `RPGで「${enemyName}」と遭遇した際の、印象に残る可愛い戦闘開始セリフを1つ生成してください。`,
    });
    // Access response text directly via .text property
    return response.text?.trim() || getLocalFallback();
  }, getLocalFallback);
}
