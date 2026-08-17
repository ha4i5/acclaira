import fs from "fs"; import path from "path";
import { getUser } from "@/lib/auth";
import { NextResponse } from "next/server";
export async function GET(req, { params }) {
  const u = await getUser();
  if (!u) return NextResponse.json({ error: "auth" }, { status: 401 });
  const safe = params.id.replace(/[^a-zA-Z0-9-]/g, "");
  if (!safe.startsWith(`${u.id}-`) && u.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const file = path.join(process.cwd(), "data", "videos", `${safe}.mp4`);
  if (!fs.existsSync(file)) return NextResponse.json({ error: "not found" }, { status: 404 });
  return new NextResponse(fs.readFileSync(file), {
    headers: { "content-type": "video/mp4", "content-disposition": `attachment; filename="acclaira-${safe}.mp4"` },
  });
}
