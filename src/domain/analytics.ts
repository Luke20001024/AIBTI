export type AnalyticsEvent =
  | "home_view"
  | "quiz_start"
  | "question_answer"
  | "quiz_complete"
  | "result_view"
  | "card_save"
  | "share_click"
  | "retest_click";

export const track = (event: AnalyticsEvent, properties: Record<string, string | number | boolean> = {}) => {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent("aibti:analytics", {
      detail: { event, properties, at: Date.now() },
    }));
  } catch {
    // Analytics must never block the quiz in restricted or older WebViews.
  }
};
