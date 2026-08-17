import { getSetting } from "./settings";

export async function synthesizeUrdu(userId, text) {
  const key = getSetting(userId, "tts_key").value;
  const live = getSetting(userId, "tts_key").live;
  if (!key) throw new Error("No TTS key. Add a Google Cloud TTS API key in Settings → Urdu TTS.");
  if (!live) throw new Error("Urdu TTS channel is not Live. Flip Go live in Settings.");
  const voice = getSetting(userId, "tts_voice").value || "ur-PK-Standard-A";
  const r = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${key}`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: "ur-PK", name: voice.startsWith("ur-") ? voice : undefined },
      audioConfig: { audioEncoding: "MP3", speakingRate: 0.95 },
    }),
  });
  const d = await r.json();
  if (d.error) throw new Error("TTS: " + d.error.message);
  return Buffer.from(d.audioContent, "base64");
}
