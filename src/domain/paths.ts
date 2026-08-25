export const normalizeBasePath = (requestedBasePath: string | undefined) => {
  const value = requestedBasePath?.trim() ?? "";
  if (!value || value === "/") return "";
  const stripped = value.replace(/^\/+|\/+$/g, "");
  return stripped ? `/${stripped}` : "";
};

export const BASE_PATH = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH);

export const applyBasePath = (path: string, basePath: string) => {
  const normalizedBasePath = normalizeBasePath(basePath);
  if (!normalizedBasePath || !path.startsWith("/") || path.startsWith("//")) return path;
  if (
    path === normalizedBasePath ||
    path.startsWith(`${normalizedBasePath}/`) ||
    path.startsWith(`${normalizedBasePath}?`) ||
    path.startsWith(`${normalizedBasePath}#`)
  ) {
    return path;
  }
  return `${normalizedBasePath}${path}`;
};

export const withBasePath = (path: string) => applyBasePath(path, BASE_PATH);

export const toAbsoluteUrl = (path: string, origin: string) => {
  const base = new URL(origin);
  if (base.protocol !== "http:" && base.protocol !== "https:") {
    throw new Error("Only HTTP(S) origins are supported");
  }
  const url = new URL(path, base.origin);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only HTTP(S) URLs are supported");
  }
  return url.toString();
};
