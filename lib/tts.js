import { getSetting } from "./settings";

export async function synthesizeUrdu(userId, text) {
  const key = getSetting(userId, "tts_key")?.value || process.env.GOOGLE_TTS_KEY;
  const live = getSetting(userId, "tts_key")?.live ?? (process.env.GOOGLE_TTS_KEY ? 1 : 0);

  if (!key) throw new Error("No TTS key. Add a Google Cloud TTS API key in Settings → Urdu TTS or set GOOGLE_TTS_KEY in .env.");
  if (!live) throw new Error("Urdu TTS channel is not Live. Flip Go live in Settings.");

  const voiceName = getSetting(userId, "tts_voice")?.value || "ur-IN-Wavenet-B";
  const langCode = voiceName.startsWith("ur-PK") ? "ur-PK" : "ur-IN";

  const r = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${key}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: langCode, name: voiceName },
      audioConfig: { audioEncoding: "MP3", speakingRate: 0.95 },
    }),
  });

  const d = await r.json();
  if (d.error) throw new Error("Google Cloud TTS: " + d.error.message);
  return Buffer.from(d.audioContent, "base64");
}
