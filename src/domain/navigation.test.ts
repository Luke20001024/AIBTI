import { describe, expect, it, vi } from "vitest";
import {
  isSafeNavigationHref,
  startHardNavigation,
  type NavigationEnvironment,
} from "./navigation";

const createEnvironment = ({ throwOn }: { throwOn?: "assign" | "replace" } = {}) => {
  let scheduled: (() => void) | null = null;
  let cancelled = false;
  let pageHide: (() => void) | null = null;

  const environment: NavigationEnvironment = {
    assign: vi.fn(() => {
      if (throwOn === "assign") throw new Error("assign denied");
    }),
    replace: vi.fn(() => {
      if (throwOn === "replace") throw new Error("replace denied");
    }),
    schedule: vi.fn((callback) => {
      scheduled = callback;
      cancelled = false;
      return 1;
    }),
    cancelScheduled: vi.fn(() => {
      cancelled = true;
    }),
    addPageHideListener: vi.fn((listener) => {
      pageHide = listener;
    }),
    removePageHideListener: vi.fn((listener) => {
      if (pageHide === listener) pageHide = null;
    }),
  };

  return {
    environment,
    fireTimeout: () => {
      if (!cancelled) scheduled?.();
    },
    firePageHide: () => pageHide?.(),
  };
};

describe("hard-navigation safety", () => {
  it("accepts local paths and HTTP(S) URLs but rejects executable or protocol-relative URLs", () => {
    expect(isSafeNavigationHref("/AIBTI/result/root/?mine=1")).toBe(true);
    expect(isSafeNavigationHref("https://example.com/path")).toBe(true);
    expect(isSafeNavigationHref("javascript:alert(1)")).toBe(false);
    expect(isSafeNavigationHref("//evil.example/path")).toBe(false);
  });
});

describe("hard-navigation watchdog", () => {
  it("arms the watchdog before starting an assign navigation", () => {
    const { environment } = createEnvironment();
    const order: string[] = [];
    vi.mocked(environment.schedule).mockImplementation((callback) => {
      order.push("watchdog");
      return callback;
    });
    vi.mocked(environment.assign).mockImplementation(() => order.push("assign"));

    startHardNavigation({
      href: "/calculating/",
      mode: "assign",
      onStalled: vi.fn(),
      onError: vi.fn(),
      environment,
    });
    expect(order).toEqual(["watchdog", "assign"]);
  });

  it("calls onStalled once when programmatic navigation is silently ignored", () => {
    const { environment, fireTimeout } = createEnvironment();
    const onStalled = vi.fn();
    startHardNavigation({
      href: "/calculating/",
      mode: "assign",
      onStalled,
      onError: vi.fn(),
      environment,
    });

    fireTimeout();
    fireTimeout();
    expect(onStalled).toHaveBeenCalledTimes(1);
    expect(environment.removePageHideListener).toHaveBeenCalledTimes(1);
  });

  it("cancels the watchdog when pagehide confirms that navigation started", () => {
    const { environment, fireTimeout, firePageHide } = createEnvironment();
    const onStalled = vi.fn();
    firePageHide();
    const handle = startHardNavigation({
      href: "/result/root/?mine=1",
      mode: "replace",
      onStalled,
      onError: vi.fn(),
      environment,
    });
    firePageHide();
    fireTimeout();
    handle.cancel();
    expect(onStalled).not.toHaveBeenCalled();
    expect(environment.cancelScheduled).toHaveBeenCalledTimes(1);
  });

  it("reports synchronous navigation errors and does not later report a stall", () => {
    const { environment, fireTimeout } = createEnvironment({ throwOn: "replace" });
    const onError = vi.fn();
    const onStalled = vi.fn();
    startHardNavigation({
      href: "/result/root/?mine=1",
      mode: "replace",
      onStalled,
      onError,
      environment,
    });
    fireTimeout();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onStalled).not.toHaveBeenCalled();
  });

  it("supports explicit cancellation on component unmount", () => {
    const { environment, fireTimeout } = createEnvironment();
    const onStalled = vi.fn();
    const handle = startHardNavigation({
      href: "/calculating/",
      mode: "assign",
      onStalled,
      onError: vi.fn(),
      environment,
    });
    handle.cancel();
    fireTimeout();
    expect(onStalled).not.toHaveBeenCalled();
  });
});
