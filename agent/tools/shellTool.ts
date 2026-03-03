import { execSync } from "node:child_process";

const ALLOWED_PREFIXES = [
  "npm ",
  "npx ",
  "pnpm ",
  "yarn ",
  "node ",
  "git status",
  "git diff",
  "git log",
  "git branch",
];

const BLOCKED_SUBSTRINGS = [
  "rm ",
  "del ",
  "rmdir",
  "powershell",
  "curl ",
  "wget ",
  "Invoke-WebRequest",
  "Start-Process",
  "certutil",
  "reg ",
  "shutdown",
  "format",
  ":(){", // fork bomb patterns
];

function normalize(cmd: string) {
  return cmd.trim().replace(/\s+/g, " ");
}

function isAllowed(cmd: string) {
  const c = normalize(cmd);

  // Block obviously dangerous stuff anywhere in the command
  const lowered = c.toLowerCase();
  for (const bad of BLOCKED_SUBSTRINGS) {
    if (lowered.includes(bad.toLowerCase())) return false;
  }

  // Allow only known safe command families
  return ALLOWED_PREFIXES.some((p) => c === p || c.startsWith(p));
}

export function runCmd(cmd: string, cwd: string) {
  const c = normalize(cmd);

  if (!isAllowed(c)) {
    return {
      ok: false,
      output: "",
      error: `Blocked command by policy. Allowed prefixes: ${ALLOWED_PREFIXES.join(", ")}`,
    };
  }

  try {
    const out = execSync(c, {
      cwd,
      stdio: "pipe",
      encoding: "utf8",
      maxBuffer: 5 * 1024 * 1024, // avoid huge output crashes
    });
    return { ok: true, output: out };
  } catch (e: any) {
    return {
      ok: false,
      output: e?.stdout?.toString?.() ?? "",
      error: e?.stderr?.toString?.() ?? e?.message ?? String(e),
    };
  }
}
