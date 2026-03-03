import fs from "node:fs";
import path from "node:path";

function resolveSafePath(root: string, targetPath: string) {
  const resolved = path.resolve(root, targetPath);
  if (!resolved.startsWith(root)) {
    throw new Error("Access outside repository root is not allowed. Use repo-relative paths only.");
  }
  return resolved;
}

export function searchRepo(root: string, query: string, max = 30) {
  const results: { file: string; line: number; text: string }[] = [];

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (["node_modules", ".next", ".git", "dist", "build"].includes(entry.name)) continue;
        walk(full);
      } else {
        if (entry.name.match(/\.(png|jpg|jpeg|gif|webp|ico|pdf|zip)$/i)) continue;

        try {
          const content = fs.readFileSync(full, "utf8");
          const lines = content.split(/\r?\n/);

          for (let i = 0; i < lines.length; i++) {
            if (lines[i].toLowerCase().includes(query.toLowerCase())) {
              results.push({
                file: path.relative(root, full),
                line: i + 1,
                text: lines[i].slice(0, 300),
              });
              if (results.length >= max) return;
            }
          }
        } catch {
          // skip unreadable/binary files
        }
      }
    }
  }

  walk(root);
  return results;
}

export function readFile(root: string, filePath: string) {
  const safePath = resolveSafePath(root, filePath);
  return fs.readFileSync(safePath, "utf8");
}

export function writeFile(root: string, filePath: string, content: string) {
  const safePath = resolveSafePath(root, filePath);
  console.log(`Writing file: ${filePath}`);
  fs.writeFileSync(safePath, content, "utf8");
}
