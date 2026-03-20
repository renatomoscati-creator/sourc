import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

const PROJECT_DIR = path.resolve(process.cwd());

function buildPrompt(sourceName: string, sourceUrl: string): string {
  return (
    `Scrape the page at ${sourceUrl} and import all startups into the Milan sourcing database. ` +
    `For each startup found, extract: name, website, description, sector, stage (Pre-seed/Seed/Series A), ` +
    `founded year, accelerator/incubator affiliation, and founder names. ` +
    `Then write the results as a JSON array to data/import-queue.json in the project at ${PROJECT_DIR}. ` +
    `Use the ImportedStartup type: { name, website?, description?, sector?, stage?, foundedYear?, accelerator?, founders?: [{name, title?}] }. ` +
    `Source: "${sourceName}". Focus on real companies, skip events or blog posts.`
  );
}

export async function POST(req: Request) {
  const { sourceName, sourceUrl, terminal = "Terminal" } = await req.json();

  if (!sourceName || !sourceUrl) {
    return Response.json({ error: "sourceName and sourceUrl are required" }, { status: 400 });
  }

  const prompt = buildPrompt(sourceName, sourceUrl);

  // Escape for AppleScript string embedding
  const escapedDir = PROJECT_DIR.replace(/"/g, '\\"');
  const escapedPrompt = prompt.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

  let script: string;

  if (terminal === "iTerm") {
    script = `
      tell application "iTerm"
        activate
        tell current window
          create tab with default profile
          tell current session
            write text "cd \\"${escapedDir}\\" && claude \\"${escapedPrompt}\\""
          end tell
        end tell
      end tell
    `;
  } else {
    // Terminal.app (default)
    script = `
      tell application "Terminal"
        activate
        do script "cd \\"${escapedDir}\\" && claude \\"${escapedPrompt}\\""
      end tell
    `;
  }

  try {
    await execAsync(`osascript -e '${script.replace(/'/g, "'\\''")}'`);
    return Response.json({ success: true, prompt });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to open terminal";
    return Response.json({ error: message }, { status: 500 });
  }
}
