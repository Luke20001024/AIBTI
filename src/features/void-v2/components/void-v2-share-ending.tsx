"use client";

import { useEffect, useState } from "react";
import { RetestLink } from "../../../components/retest-link";
import { track } from "../../../domain/analytics";
import { withBasePath } from "../../../domain/paths";
import type { VoidV2Content } from "../content/void-v2-types";
import { createVoidV2ShareCard } from "../share/create-void-v2-share-card";
import styles from "./void-v2.module.css";

type VoidV2ShareEndingProps = {
  hero: VoidV2Content["hero"];
  content: VoidV2Content["ending"];
};

export function VoidV2ShareEnding({ hero, content }: VoidV2ShareEndingProps) {
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [busyAction, setBusyAction] = useState<"save" | "share">();
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const replacePreview = (blob: Blob) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(blob));
  };

  const publicUrl = () => new URL(withBasePath("/preview/void-v2/?from=share"), window.location.href).href;

  const makeCard = async (action: "save" | "share") => {
    setBusyAction(action);
    setError(undefined);
    setNotice(undefined);

    try {
      const blob = await createVoidV2ShareCard(hero, content);

      if (action === "save") {
        replacePreview(blob);
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "ArcBTI-VOID-V3.png";
        anchor.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
        setNotice(content.saveNotice);
        track("card_save", { resultCode: "VOID", surface: "void_v3", section: "share", action: "save" });
        return;
      }

      if (!navigator.share) {
        replacePreview(blob);
        setNotice(content.previewCaption);
        track("share_click", { resultCode: "VOID", surface: "void_v3", section: "share", action: "preview_fallback" });
        return;
      }

      const shareData: ShareData = {
        title: "VOID · 寂静的边界",
        text: content.socialPrompt,
        url: publicUrl(),
      };
      if (typeof File !== "undefined") {
        const file = new File([blob], "ArcBTI-VOID-V3.png", { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) shareData.files = [file];
      }
      await navigator.share(shareData);
      setNotice(content.shareSuccess);
      track("share_click", { resultCode: "VOID", surface: "void_v3", section: "share", action: "native_share" });
    } catch (shareError) {
      if (
        typeof shareError === "object"
        && shareError !== null
        && "name" in shareError
        && shareError.name === "AbortError"
      ) return;
      setError(content.generateError);
    } finally {
      setBusyAction(undefined);
    }
  };

  return (
    <section className={styles.ending} aria-labelledby="void-v2-ending-title">
      <div className={styles.endingSummary} id="void-v2-ending-poster">
        <p className={styles.endingCode}>VOID · RESULT LOCKED</p>
        <h2 id="void-v2-ending-title">{hero.title}</h2>
        <p className={styles.endingJudgment}>
          {content.judgment.map((line) => <span key={line}>{line}</span>)}
        </p>
        <p className={styles.endingStyles}>{hero.styles.join(" × ")}</p>
      </div>

      <div className={styles.endingActions}>
        <button
          className={styles.endingPrimary}
          type="button"
          disabled={Boolean(busyAction)}
          onClick={() => makeCard("save")}
          data-analytics-event="card_save"
          data-analytics-value="void-v3"
        >
          {busyAction === "save" ? "正在生成…" : content.primaryAction}
        </button>
        <button
          className={styles.endingSecondary}
          type="button"
          disabled={Boolean(busyAction)}
          onClick={() => makeCard("share")}
          data-analytics-event="share_click"
          data-analytics-value="void-v3"
        >
          {busyAction === "share" ? "正在生成…" : content.secondaryAction}
        </button>
        <p className={styles.socialPrompt}>{content.socialPrompt}</p>
        {error ? <p className={styles.shareError} role="alert">{error}</p> : null}
        {notice ? <p className={styles.shareNotice} role="status">{notice}</p> : null}
      </div>

      {previewUrl ? (
        <figure className={styles.sharePreview}>
          <img src={previewUrl} alt="生成的 VOID V3 分享卡预览" />
          <figcaption>{content.previewCaption}</figcaption>
        </figure>
      ) : null}

      <nav className={styles.endingLinks} aria-label="结果页后续操作">
        <RetestLink resultCode="VOID" className="">{content.retest}</RetestLink>
        <a href={withBasePath("/preview/void-v2/sources/")}>
          {content.sources}
        </a>
      </nav>
    </section>
  );
}
