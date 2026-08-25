import { spawnSync } from "node:child_process";

const pnpmCli = process.env.npm_execpath;
if (!pnpmCli) throw new Error("请通过 pnpm verify:pages 运行 Pages 验收");

const runPnpm = (args, env) => spawnSync(
  process.execPath,
  [pnpmCli, ...args],
  { stdio: "inherit", env },
);

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/AIBTI";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://luke20001024.github.io/AIBTI/";
const buildEnv = {
  ...process.env,
  NEXT_PUBLIC_BASE_PATH: basePath,
  NEXT_PUBLIC_SITE_URL: siteUrl,
};

const build = runPnpm(["run", "build"], buildEnv);
if (build.status !== 0) process.exit(build.status ?? 1);

const forwarded = process.argv.slice(2).filter((argument, index) => !(index === 0 && argument === "--"));
const test = runPnpm(
  ["exec", "playwright", "test", ...forwarded],
  {
    ...buildEnv,
    PLAYWRIGHT_STATIC_EXPORT: "1",
    PLAYWRIGHT_BASE_PATH: basePath,
  },
);
process.exit(test.status ?? 1);
