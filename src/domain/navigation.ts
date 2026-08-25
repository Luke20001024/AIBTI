export type HardNavigationMode = "assign" | "replace";

export type NavigationEnvironment = {
  assign: (href: string) => void;
  replace: (href: string) => void;
  schedule: (callback: () => void, timeoutMs: number) => unknown;
  cancelScheduled: (handle: unknown) => void;
  addPageHideListener: (listener: () => void) => void;
  removePageHideListener: (listener: () => void) => void;
};

export type HardNavigationOptions = {
  href: string;
  mode: HardNavigationMode;
  timeoutMs?: number;
  onStalled: () => void;
  onError: (error: unknown) => void;
  environment?: NavigationEnvironment;
};

export type HardNavigationHandle = {
  cancel: () => void;
};

export const isSafeNavigationHref = (href: string) => {
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  try {
    const url = new URL(href);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const getBrowserEnvironment = (): NavigationEnvironment | null => {
  if (typeof window === "undefined") return null;
  return {
    assign: (href) => window.location.assign(href),
    replace: (href) => window.location.replace(href),
    schedule: (callback, timeoutMs) => window.setTimeout(callback, timeoutMs),
    cancelScheduled: (handle) => window.clearTimeout(handle as number),
    addPageHideListener: (listener) => window.addEventListener("pagehide", listener, { once: true }),
    removePageHideListener: (listener) => window.removeEventListener("pagehide", listener),
  };
};

export const startHardNavigation = ({
  href,
  mode,
  timeoutMs = 1500,
  onStalled,
  onError,
  environment = getBrowserEnvironment() ?? undefined,
}: HardNavigationOptions): HardNavigationHandle => {
  let settled = false;
  let timeoutHandle: unknown;

  const cleanup = () => {
    if (!environment) return;
    try {
      if (timeoutHandle !== undefined) environment.cancelScheduled(timeoutHandle);
    } catch {
      // Cleanup must not hide the original navigation outcome.
    }
    try {
      environment.removePageHideListener(onPageHide);
    } catch {
      // Some embedded hosts expose incomplete event APIs.
    }
  };

  const settle = () => {
    if (settled) return false;
    settled = true;
    cleanup();
    return true;
  };

  const onPageHide = () => {
    settle();
  };

  const cancel = () => {
    settle();
  };

  if (!environment) {
    settled = true;
    onError(new Error("Navigation is only available in a browser"));
    return { cancel };
  }

  if (!isSafeNavigationHref(href)) {
    settled = true;
    onError(new Error("Unsafe navigation target"));
    return { cancel };
  }

  const safeTimeoutMs = Number.isFinite(timeoutMs) && timeoutMs >= 0 ? timeoutMs : 1500;
  try {
    environment.addPageHideListener(onPageHide);
    timeoutHandle = environment.schedule(() => {
      if (settle()) onStalled();
    }, safeTimeoutMs);
    environment[mode](href);
  } catch (error) {
    if (settle()) onError(error);
  }

  return { cancel };
};
