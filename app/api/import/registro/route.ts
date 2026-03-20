import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";

export interface RegistroEntry {
  name: string;
  codiceFiscale?: string;
  province?: string;
  city?: string;
  sector?: string;
  ateco?: string;
  website?: string;
  foundedYear?: number;
  stage?: string;
  accelerator?: string;
}

export async function GET(req: NextRequest) {
  const searchParams = await Promise.resolve(new URL(req.url).searchParams);
  const province = searchParams.get("province") ?? "";
  const sector = searchParams.get("sector") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "50");

  const filePath = path.join(process.cwd(), "data", "registro_parsed.json");
  const all: RegistroEntry[] = JSON.parse(readFileSync(filePath, "utf-8"));

  let filtered = all;
  if (province) filtered = filtered.filter((e) => e.province === province);
  if (sector) filtered = filtered.filter((e) => e.sector === sector);

  const total = filtered.length;
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);

  // Unique provinces & sectors for filter UI
  const provinces = [...new Set(all.map((e) => e.province).filter(Boolean))].sort();
  const sectors = [...new Set(all.map((e) => e.sector).filter(Boolean))].sort();

  return NextResponse.json({ items, total, page, limit, provinces, sectors });
}
