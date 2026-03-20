import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import os from "os";

const execAsync = promisify(exec);

const PROJECT_DIR = path.resolve(process.cwd());

function buildPrompt(sourceName: string, sourceUrl: string): string {
  return [
    `Use WebFetch or Bash/curl to read the page at: ${sourceUrl}`,
    `Extract every startup / portfolio company listed. For each one capture:`,
    `  name, website, description, sector, stage (Pre-seed/Seed/Series A), foundedYear, accelerator, founders [{name, title}]`,
    `Omit fields that are not mentioned. Skip events, blog posts, and non-company entries.`,
    `Write the results as a valid JSON array to: ${PROJECT_DIR}/data/import-queue.json`,
    `Use this TypeScript type for each item:`,
    `  { name: string; website?: string; description?: string; sector?: string; stage?: string; foundedYear?: number; accelerator?: string; founders?: [{name: string; title?: string}] }`,
    `Source context: "${sourceName}"`,
  ].join("\n");
}

export async function POST(req: Request) {
  const { sourceName, sourceUrl, terminal = "Terminal" } = await req.json();

  if (!sourceName || !sourceUrl) {
    return Response.json({ error: "sourceName and sourceUrl are required" }, { status: 400 });
  }

  // Write prompt to a temp file to avoid shell escaping issues with long strings
  const promptPath = path.join(os.tmpdir(), "innovis-claude-prompt.txt");
  const prompt = buildPrompt(sourceName, sourceUrl);
  fs.writeFileSync(promptPath, prompt, "utf-8");

  const escapedDir = PROJECT_DIR.replace(/"/g, '\\"');
  const escapedPromptPath = promptPath.replace(/"/g, '\\"');

  // Command: cd to project, then run claude with prompt piped from file
  const cmd = `cd "${escapedDir}" && claude "$(cat '${escapedPromptPath}')"`;

  let script: string;

  if (terminal === "iTerm") {
    script = `
      tell application "iTerm"
        activate
        tell current window
          create tab with default profile
          tell current session
            write text "${cmd.replace(/"/g, '\\"')}"
          end tell
        end tell
      end tell
    `;
  } else {
    script = `
      tell application "Terminal"
        activate
        do script "${cmd.replace(/"/g, '\\"')}"
      end tell
    `;
  }

  try {
    await execAsync(`osascript -e '${script.replace(/'/g, "'\\''")}'`);
    return Response.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to open terminal";
    return Response.json({ error: message }, { status: 500 });
  }
}
