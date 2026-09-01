import fs from "node:fs";
import path from "node:path";

const scriptDirectory = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, (match) => match.slice(1)));
const miniRoot = path.resolve(scriptDirectory, "..");
const projectRoot = path.resolve(miniRoot, "..");
const releaseTarget = process.env.ARCBTI_RELEASE_TARGET === "web" ? "web" : "xhs";
const xhsDistRoot = path.join(miniRoot, "dist");
const webDistRoot = path.join(projectRoot, "web-release", "dist");
const requestedOutput = process.env.ARCBTI_OUTPUT_DIR?.trim();
const distRoot = requestedOutput ? path.resolve(projectRoot, requestedOutput) : xhsDistRoot;
const expectedDistRoot = releaseTarget === "web" ? webDistRoot : xhsDistRoot;
const reportPath = releaseTarget === "web"
  ? path.join(projectRoot, "web-release", "validation-report.json")
  : path.join(miniRoot, "validation-report.json");
if (path.resolve(distRoot) !== path.resolve(expectedDistRoot)) {
  throw new Error(`Refusing to validate ${releaseTarget} from unexpected output directory: ${distRoot}`);
}
const allowedExtensions = new Set([".html", ".css", ".js", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".woff", ".woff2", ".json"]);
const errors = [];
const warnings = [];
const files = [];
const deploymentFileLimit = 200;

const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else files.push(absolute);
  }
};

if (!fs.existsSync(distRoot)) {
  throw new Error("Build output is missing. Run build.mjs first.");
}
walk(distRoot);

if (files.length > deploymentFileLimit) {
  errors.push(`Package contains ${files.length} files; the XHS deployment limit is ${deploymentFileLimit}`);
}

const relativeFiles = files.map((file) => path.relative(distRoot, file).replace(/\\/g, "/"));
const htmlFiles = relativeFiles.filter((file) => path.extname(file).toLowerCase() === ".html");
if (htmlFiles.length !== 1 || htmlFiles[0] !== "index.html") {
  errors.push(`ZIP root must contain exactly one HTML entry named index.html; found ${htmlFiles.join(", ") || "none"}`);
}

for (const file of relativeFiles) {
  const extension = path.extname(file).toLowerCase();
  if (!allowedExtensions.has(extension)) errors.push(`Disallowed file type: ${file}`);
  if (file.includes("..") || file.startsWith("/") || /^[A-Za-z]:/.test(file)) errors.push(`Unsafe path: ${file}`);
  if (/(^|\/)(node_modules|\.git)(\/|$)/.test(file)) errors.push(`Forbidden directory: ${file}`);
  if (/(^|\/)(\.DS_Store|Thumbs\.db)$/.test(file) || file.endsWith(".map")) errors.push(`Forbidden artifact: ${file}`);
}

const index = fs.readFileSync(path.join(distRoot, "index.html"), "utf8");
const script = fs.readFileSync(path.join(distRoot, "assets", "app.js"), "utf8");
const styles = fs.readFileSync(path.join(distRoot, "assets", "styles.css"), "utf8");
const combined = `${index}\n${script}\n${styles}`;
const manifestPath = path.join(distRoot, "assets", "asset-manifest.json");
const manifest = fs.existsSync(manifestPath)
  ? JSON.parse(fs.readFileSync(manifestPath, "utf8"))
  : null;

const checks = [
  [/<script(?!\s+src=)[^>]*>/i, "Inline script is forbidden"],
  [/\stype\s*=\s*["']module["']/i, "Module scripts are forbidden"],
  [/\son[a-z]+\s*=/i, "Inline event handlers are forbidden"],
  [/javascript\s*:/i, "javascript: URLs are forbidden"],
  [/<\s*(iframe|object)\b/i, "iframe/object is forbidden"],
  [/\b(?:eval|Function)\s*\(/, "Dynamic code evaluation is forbidden"],
  [/\bnew\s+Function\b/, "new Function is forbidden"],
  [/\b(?:fetch|XMLHttpRequest|WebSocket|RTCPeerConnection|Worker|SharedWorker|ServiceWorker)\b/, "Network or worker API is forbidden"],
  [/navigator\.(?:clipboard|serviceWorker)/, "Forbidden navigator API is present"],
  [/window\.(?:open|location)\b/, "External navigation API is forbidden"],
  [/\bdownload\s*=/i, "Download attributes are forbidden"],
  [/target\s*=\s*["']_blank["']/i, "New-window targets are forbidden"],
  [/https?:\/\//i, "External HTTP resources are forbidden"],
  [/<base\b/i, "Base tags are forbidden"],
];

const webContentWithoutApprovedExternalUrls = releaseTarget === "web"
  ? combined
      .replaceAll("https://github.com/Luke20001024/AIBTI/issues/new?template=arcbti-feedback.yml", "")
      .replaceAll("https://github.com/Luke20001024/AIBTI", "")
  : combined;

for (const [pattern, message] of checks) {
  const contentToCheck = releaseTarget === "web" && message === "External HTTP resources are forbidden"
    ? webContentWithoutApprovedExternalUrls
    : combined;
  if (pattern.test(contentToCheck)) errors.push(message);
}

if (!/viewport-fit=cover/.test(index)) errors.push("Viewport must include viewport-fit=cover");
if (!/\.\/assets\/styles\.css/.test(index) || !/\.\/assets\/app\.js/.test(index)) {
  errors.push("Entry resources must use explicit relative ./assets paths");
}

const htmlResourcePattern = /(?:src|href)\s*=\s*["']([^"']+)["']/gi;
let match;
while ((match = htmlResourcePattern.exec(index))) {
  const value = match[1];
  if (!value.startsWith("./") && !value.startsWith("data:") && !value.startsWith("#")) {
    errors.push(`Non-relative entry resource: ${value}`);
  }
}

if (/^\s*(?:import|export)\s/m.test(script) || /\bimport\s*\(/.test(script)) {
  errors.push("Bundled JavaScript must be a classic script without import/export");
}

if (!manifest) {
  errors.push("Runtime asset manifest is missing");
} else {
  if (manifest.releaseTarget !== releaseTarget) {
    errors.push(`Asset manifest release target must be ${releaseTarget}; found ${manifest.releaseTarget ?? "missing"}`);
  }
  const requiredCounts = {
    personas: 16,
    hero: 16,
    question: 18,
    architect: 16,
    primaryBuilding: 80,
    drawCardBack: 1,
    homeEnsemble: 1,
    homeExtension: 1,
    drawBackground: 1,
  };
  for (const [name, expected] of Object.entries(requiredCounts)) {
    if (manifest.counts?.[name] !== expected) {
      errors.push(`Asset manifest ${name} count must be ${expected}; found ${manifest.counts?.[name] ?? "missing"}`);
    }
  }
  if ((manifest.counts?.buildingGallery ?? 0) < 125) {
    errors.push(`Asset manifest must contain at least 125 gallery references; found ${manifest.counts?.buildingGallery ?? 0}`);
  }
  for (const entry of manifest.entries ?? []) {
    if (entry.embedded) {
      const container = String(entry.embeddedIn ?? "").replace(/^\.\//, "");
      if (!container || !fs.existsSync(path.join(distRoot, container))) {
        errors.push(`Missing embedded asset container: ${entry.key ?? "unknown"} -> ${entry.embeddedIn ?? "missing"}`);
      }
    } else {
      const relative = String(entry.output ?? "").replace(/^\.\//, "");
      if (!relative || !fs.existsSync(path.join(distRoot, relative))) {
        errors.push(`Missing optimized runtime asset: ${entry.key ?? "unknown"} -> ${entry.output ?? "missing"}`);
      }
    }
    if (!(entry.width > 0) || !(entry.height > 0)) {
      errors.push(`Invalid optimized image dimensions: ${entry.key ?? "unknown"}`);
    }
  }
}

const bytes = files.reduce((sum, file) => sum + fs.statSync(file).size, 0);
const hardLimit = 10 * 1024 * 1024;
const internalTarget = (releaseTarget === "web" ? 10 : 9.5) * 1024 * 1024;
const recommendedLimit = 2 * 1024 * 1024;
if (bytes > hardLimit) errors.push(`Uncompressed package is over 10 MB: ${(bytes / 1024 / 1024).toFixed(2)} MB`);
else if (bytes > internalTarget) errors.push(`Uncompressed package exceeds the ArcBTI 9.5 MB safety target: ${(bytes / 1024 / 1024).toFixed(2)} MB`);
if (bytes > recommendedLimit) warnings.push(`Package exceeds the 2 MB recommendation but stays under the 10 MB hard limit: ${(bytes / 1024 / 1024).toFixed(2)} MB`);

const report = {
  status: errors.length ? "failed" : "passed",
  checkedAt: new Date().toISOString(),
  releaseTarget,
  output: distRoot,
  fileCount: files.length,
  fileLimit: deploymentFileLimit,
  htmlEntries: htmlFiles,
  bytes,
  megabytes: Number((bytes / 1024 / 1024).toFixed(3)),
  assetCounts: manifest?.counts ?? null,
  errors,
  warnings,
};

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
