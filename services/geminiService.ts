
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

// サーキットブレーカーの状態管理
let apiCooldownUntil = 0;
const COOLDOWN_DURATION = 60 * 1000; // 429エラー時は60秒間APIを休止

/**
 * 429 (Resource Exhausted) エラー発生時に、一定期間APIリクエストを回避し
 * ローカルの代替メッセージを即座に返す仕組み。
 */
async function withCircuitBreaker<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  const now = Date.now();
  if (now < apiCooldownUntil) {
    console.warn("Gemini API is in cooldown. Using local fallback.");
    return fallback;
  }

  try {
    return await fn();
  } catch (error: any) {
    const status = error?.status || (error?.message?.includes('429') ? 429 : 500);
    
    if (status === 429) {
      console.error("Gemini Quota Exceeded (429). Triggering cooldown.");
      apiCooldownUntil = Date.now() + COOLDOWN_DURATION;
    } else {
      console.error("Gemini API Error:", error);
    }
    return fallback;
  }
}

// ローカル用のセリフ集（クォータ制限時のフォールバック）
const LOCAL_DIALOGUES = [
  "空気はひんやりとして、どこか懐かしい香りがします。",
  "壁の向こうから、小さな吐息が聞こえたような気がしました。",
  "光と影が、床の上で静かにダンスを踊っています。",
  "ここは忘れられた時間の溜まり場。急ぐ必要はありませんよ。",
  "足元の石畳が、かつてここを通った誰かの記憶を語っています。",
  "遠くで鐘の音が響いた気がしました。幻聴でしょうか？",
  "あなたの歩く音が、この静寂に小さな波紋を広げています。"
];

export async function generateFloorDialogue(floor: number, playerName: string, job: string) {
  const localMsg = LOCAL_DIALOGUES[Math.floor(Math.random() * LOCAL_DIALOGUES.length)];
  const fallback = {
    speaker: "穏やかな亡霊",
    message: `${floor}階...。${localMsg}`,
    portrait: `https://picsum.photos/seed/ghost-${floor}/100/100`
  };

  return withCircuitBreaker(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `あなたはRPGのストーリーテラーです。プレイヤーがダンジョンの${floor}階に到達しました。
      名前：${playerName}、職業：${job}。
      この階の雰囲気（穏やか、切ない、かわいい）を2〜3行の日本語で。
      JSONで：{"speaker": "名前", "message": "本文", "portrait": "画像URL"}`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "");
  }, fallback);
}

export async function generateBattleIntro(enemyName: string) {
  const fallback = `${enemyName}が、静かにあなたの前に立ちふさがりました。`;
  
  return withCircuitBreaker(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `${enemyName}が現れた際の、可愛い感じの短い戦闘開始メッセージを1行生成してください。`,
    });
    return response.text?.trim() || fallback;
  }, fallback);
}
