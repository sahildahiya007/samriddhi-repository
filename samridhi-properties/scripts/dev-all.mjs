import { spawn } from "node:child_process";

function run(command, args, name, useShell = false) {
  const child = spawn(command, args, {
    stdio: "inherit",
    shell: useShell,
  });

  child.on("exit", (code) => {
    if (code !== 0) {
      console.error(`${name} exited with code ${code}`);
    }
  });

  return child;
}

const backend = run("node", ["backend/server.js"], "Backend");
const frontend = process.platform === "win32"
  ? run("cmd.exe", ["/c", "npx vite"], "Frontend")
  : run("npx", ["vite"], "Frontend");

function shutdown() {
  if (!backend.killed) backend.kill("SIGINT");
  if (!frontend.killed) frontend.kill("SIGINT");
  setTimeout(() => process.exit(0), 300);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
