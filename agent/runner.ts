import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";
import { searchRepo, readFile, writeFile } from "./tools/fsTools";
import { runCmd } from "./tools/shellTool";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type ToolCall =
  | { name: "search_repo"; arguments: { query: string } }
  | { name: "read_file"; arguments: { filePath: string } }
  | { name: "write_file"; arguments: { filePath: string; content: string } }
  | { name: "run_cmd"; arguments: { cmd: string } };

async function main() {
  const task = process.argv.slice(2).join(" ").trim();
  if (!task) {
    console.error("Usage: tsx agent/runner.ts \"<task>\"");
    process.exit(1);
  }

  const repoRoot = process.cwd();
  const system = fs.readFileSync(path.join(repoRoot, "agent/prompts/system.md"), "utf8");

  // Define tools the model can call
  const tools = [
    {
      type: "function",
      name: "search_repo",
      description: "Search the repository for files/lines relevant to a query.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
        },
        required: ["query"],
        additionalProperties: false,
      },
    },
    {
      type: "function",
      name: "read_file",
      description: "Read a UTF-8 text file. filePath must be a repo-relative path like 'app/e/[slug]/EventClient.tsx' (no absolute paths).",
      parameters: {
        type: "object",
        properties: {
          filePath: { type: "string" },
        },
        required: ["filePath"],
        additionalProperties: false,
      },
    },
    {
      type: "function",
      name: "write_file",
      description: "Write content to a file path (overwrites).",
      parameters: {
        type: "object",
        properties: {
          filePath: { type: "string" },
          content: { type: "string" },
        },
        required: ["filePath", "content"],
        additionalProperties: false,
      },
    },
    {
      type: "function",
      name: "run_cmd",
      description:
        "Run a shell command in the repository root. Only use for safe dev commands like npm test/build.",
      parameters: {
        type: "object",
        properties: {
          cmd: { type: "string" },
        },
        required: ["cmd"],
        additionalProperties: false,
      },
    },
  ] as const;


  // Start a tool-calling conversation.
  // We'll keep feeding tool outputs back until the model returns a final answer.
  let input: any[] = [
    { role: "system", content: system },
    { role: "user", content: task },
  ];

  for (let step = 0; step < 20; step++) {
    const resp = await client.responses.create({
      model: "gpt-4.1-mini",
      input,
      tools: tools as any,
    });

    // Keep the model output in the conversation
    input.push(...(resp.output ?? []));

    const toolCalls = (resp.output ?? [])
      .filter((o: any) => o.type === "function_call")
      .map((o: any) => ({
        call_id: o.call_id,
        name: o.name,
        arguments: (() => {
          try { return JSON.parse(o.arguments); }
          catch (e) { return {}; }
        })(),
      }));

    if (!toolCalls.length) {
      console.log("Final reasoning:\n");
      console.log(resp.output_text?.trim() || "(no output)");

      console.log("\nRunning build verification...\n");

      const buildResult = runCmd("npm run build", repoRoot);

      if (!buildResult.ok) {
        console.log("Build failed. Feeding errors back to model...\n");

        input.push({
          role: "user",
          content: `Build failed with error:\n${buildResult.error}\nPlease fix.`,
        });

        continue; // loop continues
      }

      console.log("Build succeeded.");
      return;
    }


    for (const call of toolCalls) {
      let result: any;

      try {
        if (call.name === "search_repo") {
          result = searchRepo(repoRoot, String(call.arguments.query ?? ""));
        } else if (call.name === "read_file") {
          result = readFile(repoRoot, String(call.arguments.filePath ?? ""));
        } else if (call.name === "write_file") {
          writeFile(
            repoRoot,
            String(call.arguments.filePath ?? ""),
            String(call.arguments.content ?? "")
          );
          result = { ok: true };
        } else if (call.name === "run_cmd") {
          result = runCmd(String(call.arguments.cmd ?? ""), repoRoot);
        } else {
          result = { ok: false, error: "Unknown tool" };
        }
      } catch (e: any) {
        result = {
          ok: false,
          error: e?.message ?? String(e),
        };
      }

      input.push({
        type: "function_call_output",
        call_id: call.call_id,
        output: JSON.stringify(result),
      });
    }

  }


  console.error("Agent stopped after 20 steps without finishing.");
  process.exit(2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
