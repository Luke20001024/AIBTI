import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";

const scriptDirectory = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, (match) => match.slice(1)));
const miniRoot = path.resolve(scriptDirectory, "..");
const projectRoot = path.resolve(miniRoot, "..");
const sourceRoot = path.join(miniRoot, "src");
const releaseTarget = process.env.ARCBTI_RELEASE_TARGET === "web" ? "web" : "xhs";
const xhsDistRoot = path.join(miniRoot, "dist");
const webDistRoot = path.join(projectRoot, "web-release", "dist");
const requestedOutput = process.env.ARCBTI_OUTPUT_DIR?.trim();
const distRoot = requestedOutput ? path.resolve(projectRoot, requestedOutput) : xhsDistRoot;
const expectedDistRoot = releaseTarget === "web" ? webDistRoot : xhsDistRoot;
const tempRoot = releaseTarget === "web"
  ? path.join(projectRoot, "web-release", ".build-temp")
  : path.join(miniRoot, ".build-temp");
const optimizationReportPath = releaseTarget === "web"
  ? path.join(projectRoot, "web-release", "optimization-report.json")
  : path.join(miniRoot, "optimization-report.json");

if (path.resolve(distRoot) !== path.resolve(expectedDistRoot)) {
  throw new Error(`Refusing to build ${releaseTarget} into unexpected output directory: ${distRoot}`);
}

const pnpmRoot = path.join(projectRoot, "node_modules", ".pnpm");
const typescriptPackage = fs.readdirSync(pnpmRoot)
  .filter((entry) => entry.startsWith("typescript@"))
  .sort()
  .at(-1);

if (!typescriptPackage) throw new Error("Local TypeScript runtime was not found");

const require = createRequire(import.meta.url);
const ts = require(path.join(pnpmRoot, typescriptPackage, "node_modules", "typescript", "lib", "typescript.js"));

const moduleSources = [
  ["src/content/schema", path.join(projectRoot, "src", "content", "schema.ts")],
  ["src/content/dimensions", path.join(projectRoot, "src", "content", "dimensions.ts")],
  ["src/content/questions", path.join(projectRoot, "src", "content", "questions.ts")],
  ["src/content/discriminator-questions", path.join(projectRoot, "src", "content", "discriminator-questions.ts")],
  ["src/content/results", path.join(projectRoot, "src", "content", "results.ts")],
  ["src/content/building-galleries", path.join(projectRoot, "src", "content", "building-galleries.ts")],
  ["src/content/new-persona-buildings", path.join(projectRoot, "src", "content", "new-persona-buildings.ts")],
  ["src/content/buildings", path.join(projectRoot, "src", "content", "buildings.ts")],
  ["src/content/architects", path.join(projectRoot, "src", "content", "architects.ts")],
  ["src/features/result-v7/content/result-v7-content", path.join(projectRoot, "src", "features", "result-v7", "content", "result-v7-content.ts")],
  ["src/domain/scoring", path.join(projectRoot, "src", "domain", "scoring.ts")],
  ["xhs-mini-tool-v2/src/app", path.join(sourceRoot, "app.ts")],
];

const transpile = (source, filename) => ts.transpileModule(source, {
  fileName: filename,
  compilerOptions: {
    target: ts.ScriptTarget.ES2018,
    module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    esModuleInterop: true,
    removeComments: true,
    sourceMap: false,
    inlineSourceMap: false,
  },
}).outputText;

const compiledModules = moduleSources.map(([id, filename]) => {
  let source = fs.readFileSync(filename, "utf8");
  if (id === "xhs-mini-tool-v2/src/app") {
    const repositoryUrl = releaseTarget === "web" ? "https://github.com/Luke20001024/AIBTI" : "#";
    const messageUrl = releaseTarget === "web"
      ? `${repositoryUrl}/issues/new?template=arcbti-feedback.yml`
      : "#";
    source = source
      .replaceAll("__ARCBTI_WEB_GITHUB_REPOSITORY_URL__", repositoryUrl)
      .replaceAll("__ARCBTI_WEB_GITHUB_MESSAGE_URL__", messageUrl);
  }
  if (id === "src/domain/scoring") {
    source = source.replace('from "../content"', 'from "../content/xhs-core"');
  }
  if (id.startsWith("src/content/") || id.includes("result-v7-content")) {
    source = source
      .replace(/"https?:\/\/[^"\r\n]*"/g, '""')
      .replace(/'https?:\/\/[^'\r\n]*'/g, "''");
  }
  return { id, code: transpile(source, filename) };
});

const personaSlugs = [
  "grid", "root", "mass", "void", "tech", "span", "eave", "tide",
  "ruin", "hand", "sign", "orna", "veil", "flow", "plus", "mix",
];

const jobsByKey = new Map();
const tierRank = { hero: 0, question: 1, ui: 2, primary: 3, architect: 4, gallery: 5 };

const addJob = (key, tier, role, name = "") => {
  if (!key.startsWith("/images/")) throw new Error(`Unexpected image key: ${key}`);
  const source = path.join(projectRoot, "public", key.replace(/^\//, ""));
  if (!fs.existsSync(source)) throw new Error(`Missing runtime image: ${key}`);
  const existing = jobsByKey.get(key);
  if (existing) {
    if (!existing.roles.includes(role)) existing.roles.push(role);
    if (tierRank[tier] < tierRank[existing.tier]) existing.tier = tier;
    return;
  }
  jobsByKey.set(key, { key, source, tier, roles: [role], name });
};

for (const slug of personaSlugs) {
  addJob(`/images/personas/${slug}/hero-poster-v1.webp`, "hero", "hero", slug);
}

addJob("/images/interface/draw-card-back-v2-flat.png", "ui", "draw-card-back", "draw-card-back-v2-flat");
addJob("/images/interface/home-persona-ensemble-v1.webp", "ui", "home-ensemble", "home-persona-ensemble-v1");
addJob("/images/interface/home-persona-ensemble-extension-v1.webp", "ui", "home-extension", "home-persona-ensemble-extension-v1");
addJob("/images/interface/draw-paper-blueprint-v1.webp", "ui", "draw-background", "draw-paper-blueprint-v1");

const questionSource = path.join(projectRoot, "public", "images", "questions-v3");
for (const filename of fs.readdirSync(questionSource).filter((name) => name.endsWith(".webp")).sort()) {
  addJob(`/images/questions-v3/${filename}`, "question", "question", path.parse(filename).name);
}

const architectSourcePath = path.join(projectRoot, "src", "content", "architects.ts");
const buildingsSourcePath = path.join(projectRoot, "src", "content", "buildings.ts");
const newBuildingsSourcePath = path.join(projectRoot, "src", "content", "new-persona-buildings.ts");
const galleriesSourcePath = path.join(projectRoot, "src", "content", "building-galleries.ts");
const architectSource = fs.readFileSync(architectSourcePath, "utf8");
const buildingsSource = fs.readFileSync(buildingsSourcePath, "utf8");
const newBuildingsSource = fs.readFileSync(newBuildingsSourcePath, "utf8");
const galleriesSource = fs.readFileSync(galleriesSourcePath, "utf8");

for (const match of architectSource.matchAll(/src:\s*["'](\/images\/[^"']+)["']/g)) {
  addJob(match[1], "architect", "architect");
}

for (const source of [buildingsSource, newBuildingsSource]) {
  for (const match of source.matchAll(/imageFile:\s*["']([^"']+)["']/g)) {
    addJob(`/images/buildings/${match[1]}`, "primary", "primary-building");
  }
}

for (const source of [buildingsSource, galleriesSource]) {
  for (const match of source.matchAll(/src:\s*["'](\/images\/[^"']+)["']/g)) {
    addJob(match[1], "gallery", "building-gallery");
  }
}

const jobs = [...jobsByKey.values()];
const roleCount = (role) => jobs.filter((job) => job.roles.includes(role)).length;
const expected = {
  hero: 16,
  question: 18,
  architect: 16,
  "primary-building": 80,
  "draw-card-back": 1,
  "home-ensemble": 1,
  "home-extension": 1,
  "draw-background": 1,
};
for (const [role, count] of Object.entries(expected)) {
  if (roleCount(role) !== count) throw new Error(`Expected ${count} ${role} images, found ${roleCount(role)}`);
}
if (roleCount("building-gallery") < 125) {
  throw new Error(`Expected at least 125 building gallery images, found ${roleCount("building-gallery")}`);
}

fs.rmSync(distRoot, { recursive: true, force: true });
fs.rmSync(tempRoot, { recursive: true, force: true });
fs.mkdirSync(path.join(distRoot, "assets"), { recursive: true });
fs.mkdirSync(tempRoot, { recursive: true });

const jobsPath = path.join(tempRoot, "image-jobs.json");
fs.writeFileSync(jobsPath, `${JSON.stringify({ jobs }, null, 2)}\n`, "utf8");

const pythonCandidates = [
  process.env.ARCBTI_PYTHON,
  process.platform === "win32" ? "py" : "python3",
  "python",
].filter(Boolean);

let pythonCommand;
for (const candidate of pythonCandidates) {
  const probeArgs = candidate === "py" ? ["-3", "--version"] : ["--version"];
  const probe = spawnSync(candidate, probeArgs, { encoding: "utf8" });
  if (probe.status === 0) {
    pythonCommand = { command: candidate, prefix: candidate === "py" ? ["-3"] : [] };
    break;
  }
}
if (!pythonCommand) throw new Error("A Python runtime with Pillow is required to optimize the image set");

const optimize = spawnSync(
  pythonCommand.command,
  [...pythonCommand.prefix, path.join(scriptDirectory, "optimize-images.py"), jobsPath, distRoot, optimizationReportPath],
  { cwd: projectRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
);
if (optimize.status !== 0) {
  throw new Error(`Image optimization failed:\n${optimize.stdout}\n${optimize.stderr}`);
}

const optimizationReport = JSON.parse(fs.readFileSync(optimizationReportPath, "utf8"));
const assetMap = {};
const webExternalGalleryOutputs = new Set(releaseTarget === "web"
  ? [...new Map(
      optimizationReport.entries
        .filter((entry) => entry.encodedTier === "gallery")
        .map((entry) => [entry.output, entry]),
    ).values()]
      .sort((left, right) => right.outputBytes - left.outputBytes)
      .slice(0, 60)
      .map((entry) => entry.output)
  : []);
const embeddedAssetByOutput = new Map();
const embeddedOutputs = new Set();
const embeddedGalleryOutputs = new Set();
const embeddedHeroOutputs = new Set();

for (const entry of optimizationReport.entries) {
  const embedGallery = entry.encodedTier === "gallery" && !webExternalGalleryOutputs.has(entry.output);
  const embedHero = releaseTarget === "web" && entry.encodedTier === "hero";
  if (embedGallery || embedHero) {
    let dataUri = embeddedAssetByOutput.get(entry.output);
    if (!dataUri) {
      const relative = entry.output.replace(/^\.\//, "");
      const absolute = path.join(distRoot, relative);
      if (!fs.existsSync(absolute)) throw new Error(`Missing output before embedding: ${entry.output}`);
      const mime = path.extname(relative).toLowerCase() === ".png" ? "image/png" : "image/webp";
      dataUri = `data:${mime};base64,${fs.readFileSync(absolute).toString("base64")}`;
      embeddedAssetByOutput.set(entry.output, dataUri);
      embeddedOutputs.add(entry.output);
    }
    if (embedGallery) embeddedGalleryOutputs.add(entry.output);
    if (embedHero) embeddedHeroOutputs.add(entry.output);
    assetMap[entry.key] = dataUri;
    entry.embedded = true;
    entry.embeddedIn = "./assets/app.js";
  } else {
    assetMap[entry.key] = entry.output;
    entry.embedded = false;
  }
}

for (const output of embeddedOutputs) {
  const relative = output.replace(/^\.\//, "");
  fs.rmSync(path.join(distRoot, relative), { force: true });
}
const standaloneImageFiles = optimizationReport.outputFiles - embeddedOutputs.size;

const runtime = `/* ArcBTI ${releaseTarget === "web" ? "GitHub Pages web release" : "XHS complete mini tool"} · generated classic-script bundle */
(function () {
  "use strict";
  window.__ARCBTI_RELEASE_TARGET__ = ${JSON.stringify(releaseTarget)};
  window.__ARCBTI_ASSET_MAP__ = ${JSON.stringify(assetMap)};
  var definitions = Object.create(null);
  var cache = Object.create(null);

  function define(id, factory) {
    definitions[id] = factory;
  }

  function resolve(from, request) {
    if (request.charAt(0) !== ".") return request;
    var stack = from.split("/");
    stack.pop();
    request.split("/").forEach(function (part) {
      if (!part || part === ".") return;
      if (part === "..") stack.pop();
      else stack.push(part);
    });
    var candidate = stack.join("/").replace(/\\.js$/, "");
    if (definitions[candidate]) return candidate;
    if (definitions[candidate + "/index"]) return candidate + "/index";
    return candidate;
  }

  function load(id, parent) {
    var resolved = parent ? resolve(parent, id) : id;
    if (cache[resolved]) return cache[resolved].exports;
    if (!definitions[resolved]) throw new Error("Unknown bundled module: " + resolved);
    var module = { exports: {} };
    cache[resolved] = module;
    definitions[resolved](function (request) { return load(request, resolved); }, module, module.exports);
    return module.exports;
  }
`;

const moduleBlocks = compiledModules.map(({ id, code }) => `
  define(${JSON.stringify(id)}, function (require, module, exports) {
${code.split("\n").map((line) => `    ${line}`).join("\n")}
  });
`).join("");

const contentCore = `
  define("src/content/xhs-core", function (require, module, exports) {
    Object.assign(
      exports,
      require("./schema"),
      require("./dimensions"),
      require("./questions"),
      require("./discriminator-questions"),
      require("./results"),
      require("./building-galleries"),
      require("./new-persona-buildings"),
      require("./buildings"),
      require("./architects")
    );
  });
`;

const bundle = `${runtime}${contentCore}${moduleBlocks}
  load("xhs-mini-tool-v2/src/app");
})();
`;

fs.copyFileSync(path.join(sourceRoot, "index.html"), path.join(distRoot, "index.html"));
fs.copyFileSync(path.join(sourceRoot, "styles.css"), path.join(distRoot, "assets", "styles.css"));
fs.writeFileSync(path.join(distRoot, "assets", "app.js"), bundle, "utf8");
fs.writeFileSync(path.join(distRoot, "assets", "asset-manifest.json"), `${JSON.stringify({
  version: 2,
  releaseTarget,
  counts: {
    personas: personaSlugs.length,
    hero: roleCount("hero"),
    question: roleCount("question"),
    architect: roleCount("architect"),
    primaryBuilding: roleCount("primary-building"),
    drawCardBack: roleCount("draw-card-back"),
    homeEnsemble: roleCount("home-ensemble"),
    homeExtension: roleCount("home-extension"),
    drawBackground: roleCount("draw-background"),
    buildingGallery: roleCount("building-gallery"),
    uniqueSources: jobs.length,
    optimizedFiles: standaloneImageFiles,
    embeddedGalleryFiles: embeddedGalleryOutputs.size,
    externalGalleryFiles: webExternalGalleryOutputs.size,
    embeddedHeroFiles: embeddedHeroOutputs.size,
  },
  entries: optimizationReport.entries,
}, null, 2)}\n`, "utf8");

fs.rmSync(tempRoot, { recursive: true, force: true });

const files = [];
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else files.push({ path: path.relative(distRoot, absolute).replace(/\\/g, "/"), bytes: fs.statSync(absolute).size });
  }
};
walk(distRoot);

const bytes = files.reduce((sum, file) => sum + file.bytes, 0);
console.log(JSON.stringify({
  releaseTarget,
  output: distRoot,
  files: files.length,
  bytes,
  megabytes: Number((bytes / 1024 / 1024).toFixed(3)),
  assets: optimizationReport.summary,
  embeddedGalleryFiles: embeddedGalleryOutputs.size,
  externalGalleryFiles: webExternalGalleryOutputs.size,
  embeddedHeroFiles: embeddedHeroOutputs.size,
}, null, 2));
