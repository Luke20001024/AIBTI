const prefix = (process.env.PLAYWRIGHT_BASE_PATH ?? (process.env.PLAYWRIGHT_STATIC_EXPORT === "1" ? "/AIBTI" : ""))
  .trim()
  .replace(/^\/+|\/+$/g, "");

export const appPath = (pathname: string) => {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return prefix ? `/${prefix}${normalized}` : normalized;
};
