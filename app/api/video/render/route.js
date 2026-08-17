import fs from "fs"; import path from "path";
import { execFile } from "child_process";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import { synthesizeUrdu } from "@/lib/tts";
import { NextResponse } from "next/server";

export const maxDuration = 120;
const vidDir = path.join(process.cwd(), "data", "videos");

const ff = (args) => new Promise((res, rej) =>
  execFile("ffmpeg", args, { timeout: 110000 }, (e, so, se) => e ? rej(new Error("FFmpeg failed: " + (se || e.message).slice(-200))) : res()));

export async function POST(req) {
  const u = await getUser();
  if (!u) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { script, imageBase64 } = await req.json();
  if (!script || !imageBase64) return NextResponse.json({ error: "Script and background image are required." });
  try {
    await new Promise((res, rej) => execFile("ffmpeg", ["-version"], (e) => e ? rej(new Error("FFmpeg is not installed on this server. Run: sudo apt install -y ffmpeg")) : res()));
    const audio = await synthesizeUrdu(u.id, script);
    fs.mkdirSync(vidDir, { recursive: true });
    const id = `${u.id}-${Date.now()}`;
    const img = path.join(vidDir, `${id}.png`), mp3 = path.join(vidDir, `${id}.mp3`), mp4 = path.join(vidDir, `${id}.mp4`);
    fs.writeFileSync(img, Buffer.from(imageBase64.split(",").pop(), "base64"));
    fs.writeFileSync(mp3, audio);
    await ff(["-y", "-loop", "1", "-i", img, "-i", mp3,
      "-filter_complex", "[0:v]scale=1080:1920,zoompan=z='min(zoom+0.0008,1.12)':d=125*60:s=1080x1920:fps=25[v]",
      "-map", "[v]", "-map", "1:a", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest", mp4]);
    fs.unlinkSync(img); fs.unlinkSync(mp3);
    db.prepare("INSERT INTO history (user_id,module,title,status,url) VALUES (?,?,?,?,?)")
      .run(u.id, "Module 3", script.slice(0, 50), "rendered", `/api/video/file/${id}`);
    return NextResponse.json({ url: `/api/video/file/${id}` });
  } catch (e) { return NextResponse.json({ error: e.message }); }
}
