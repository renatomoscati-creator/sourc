import fs from "fs";
import path from "path";

const QUEUE_PATH = path.join(process.cwd(), "data", "import-queue.json");

export async function GET() {
  if (!fs.existsSync(QUEUE_PATH)) {
    return Response.json({ items: [], count: 0 });
  }
  try {
    const raw = fs.readFileSync(QUEUE_PATH, "utf-8");
    const items = JSON.parse(raw);
    return Response.json({ items, count: Array.isArray(items) ? items.length : 0 });
  } catch {
    return Response.json({ items: [], count: 0 });
  }
}
