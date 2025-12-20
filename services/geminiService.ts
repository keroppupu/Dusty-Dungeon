
import { GoogleGenAI } from "@google/genai";

// APIキーの存在チェック。未設定時は最初からAPIを呼ばない
const API_KEY = process.env.API_KEY;
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

// キャッシュと状態管理
let apiCooldownUntil = 0;
const COOLDOWN_DURATION = 90 * 1000; 
const dialogueCache: Record<string, any> = {};
const battleIntroCache: Record<string, string> = {};

/**
 * 429 (Resource Exhausted) などのエラー発生時にAPIリクエストを回避し
 * ローカルの代替メッセージを即座に返す仕組み。
 */
async function withSmartFallback<T>(cacheKey: string, cache: Record<string, T>, fn: () => Promise<T>, fallbackFn: () => T): Promise<T> {
  // 1. キャッシュがあればそれを返す
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  // 2. AIが初期化されていない、またはクールダウン中なら即座にローカル生成
  const now = Date.now();
  if (!ai || now < apiCooldownUntil) {
    const res = fallbackFn();
    cache[cacheKey] = res;
    return res;
  }

  try {
    const result = await fn();
    cache[cacheKey] = result;
    return result;
  } catch (error: any) {
    // 429エラーやその他のAPIエラーをキャッチ
    const status = error?.status || (error?.message?.includes('429') ? 429 : 500);
    
    if (status === 429) {
      apiCooldownUntil = Date.now() + COOLDOWN_DURATION;
      console.warn("Gemini Quota Exceeded. Switching to local engine for 90s.");
    }
    
    // ユーザーにエラーを見せず、静かにフォールバック
    const res = fallbackFn();
    cache[cacheKey] = res;
    return res;
  }
}

// ローカル用の状況別メッセージ生成エンジン
const LOCAL_ENGINE = {
  getFloorMessage: (floor: number) => {
    const themes = [
      "静寂が支配する", "微かな光が差し込む", "風の音が遠くで響く", 
      "湿った土の香りがする", "懐かしい歌が聞こえるような", "時間が止まったような"
    ];
    const events = [
      "ここはかつて誰かの居場所だったのかもしれません。",
      "壁の落書きは、遠い昔の冒険者のもののようです。",
      "あなたの足音が、この世界の鼓動のように響きます。",
      "どこからか、甘い花の香りが漂ってきました。",
      "暗闇の向こうで、何かが瞬いた気がします。"
    ];
    const theme = themes[floor % themes.length];
    const event = events[Math.floor(Math.random() * events.length)];
    return `${floor}階...。${theme}${event}`;
  },
  getBattleMessage: (enemyName: string) => {
    const intros = [
      `${enemyName}が、こちらをじっと見つめています。`,
      `影の中から${enemyName}が姿を現しました。`,
      `${enemyName}が、不思議な踊りを踊りながら近づいてきます。`,
      `ふわふわとした${enemyName}が行く手を塞いでいます。`,
      `${enemyName}との静かな対峙が始まります。`
    ];
    return intros[Math.floor(Math.random() * intros.length)];
  }
};

export async function generateFloorDialogue(floor: number, playerName: string, job: string) {
  const cacheKey = `floor-${floor}-${job}`;
  
  const getLocalFallback = () => ({
    speaker: "時の案内人",
    message: LOCAL_ENGINE.getFloorMessage(floor),
    portrait: `https://picsum.photos/seed/guide-${floor}/100/100`
  });

  return withSmartFallback(cacheKey, dialogueCache, async () => {
    if (!ai) throw new Error("AI not initialized");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `RPGの階層到達メッセージ。
      ${floor}階。名前：${playerName}、職業：${job}。
      くすみカラーの穏やかで少し切ない世界観。日本語で2〜3行。
      JSON形式：{"speaker": "名前", "message": "本文", "portrait": "画像URL"}`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "");
  }, getLocalFallback);
}

export async function generateBattleIntro(enemyName: string) {
  const cacheKey = `enemy-${enemyName}`;
  
  const getLocalFallback = () => LOCAL_ENGINE.getBattleMessage(enemyName);
  
  return withSmartFallback(cacheKey, battleIntroCache, async () => {
    if (!ai) throw new Error("AI not initialized");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `${enemyName}が現れた際の、可愛い感じの短い戦闘開始メッセージを1行生成してください。`,
    });
    return response.text?.trim() || getLocalFallback();
  }, getLocalFallback);
}
