"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  DIMENSIONS,
  DIMENSION_IDS,
  RESULT_BY_CODE,
  type Architect,
  type Building,
  type ResultType,
} from "../content";
import { track } from "../domain/analytics";
import { readLocalResult } from "../domain/local-result";
import { withBasePath } from "../domain/paths";
import {
  buildPublicResultUrl,
  buildResultPath,
  parseResultEntry,
  resolveResultView,
  type ResultView,
} from "../domain/result-view";
import { createShareCard } from "./share-card";

type Props = {
  result: ResultType;
  architect: Architect;
  primaryBuilding: Building;
};

const CLARITY_LABEL = {
  clear: "倾向很清晰",
  balanced: "双重倾向",
  mixed: "混合型人格",
} as const;

const publicUrl = (slug: string, source: "share" | "card") =>
  buildPublicResultUrl({ origin: window.location.origin, slug, source });

export function ResultPersonalization({ result, architect, primaryBuilding }: Props) {
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const [view, setView] = useState<ResultView | null>(null);
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const [cardBlob, setCardBlob] = useState<Blob | null>(null);
  const [shareHref, setShareHref] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [showFallbackLink, setShowFallbackLink] = useState(false);
  const shareTrigger = useRef<HTMLButtonElement | null>(null);
  const shareDialog = useRef<HTMLDivElement | null>(null);
  const closeShareButton = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const entry = parseResultEntry(new URLSearchParams(query));
    const resolved = resolveResultView({
      entry,
      expectedType: result.code,
      localResult: readLocalResult(),
    });
    setView(resolved);
    track("result_view", { resultCode: result.code, view: resolved.kind });
  }, [query, result.code]);

  useEffect(() => () => {
    if (cardUrl) URL.revokeObjectURL(cardUrl);
  }, [cardUrl]);

  const owner = view?.kind === "owner" ? view.localResult : null;
  const secondary = owner ? RESULT_BY_CODE[owner.secondaryTypeId] : null;
  const strongestDimensions = useMemo(() => {
    if (!owner) return [];
    return [...DIMENSION_IDS]
      .sort((left, right) => Math.abs(owner.dimensionScores[right]) - Math.abs(owner.dimensionScores[left]))
      .slice(0, 3);
  }, [owner]);

  const copyLink = async () => {
    track("share_click", { method: "copy_link", resultCode: result.code });
    const href = publicUrl(result.slug, "share");
    setShareHref(href);
    try {
      await navigator.clipboard.writeText(href);
      setNotice("公开结果链接已复制，不包含你的答案");
      setShowFallbackLink(false);
    } catch {
      setNotice(cardUrl
        ? "浏览器无法自动复制，请长按上方公开链接"
        : "浏览器无法自动复制，请长按下方公开链接");
      setShowFallbackLink(true);
    }
  };

  const openShare = async () => {
    track("share_click", { method: "card_preview", resultCode: result.code });
    const href = publicUrl(result.slug, "share");
    setShareHref(href);
    setBusy(true);
    setNotice("");
    try {
      const card = await createShareCard({
        result,
        architect,
        building: primaryBuilding,
        publicUrl: publicUrl(result.slug, "card"),
      });
      if (cardUrl) URL.revokeObjectURL(cardUrl);
      setCardBlob(card.blob);
      setCardUrl(URL.createObjectURL(card.blob));
    } catch {
      setNotice("分享卡没有生成成功，公开链接仍然可以复制");
    } finally {
      setBusy(false);
    }
  };

  const downloadCard = () => {
    if (!cardUrl) return;
    track("card_save", { method: "download", resultCode: result.code });
    const anchor = document.createElement("a");
    anchor.download = `AIBTI-${result.code}.jpg`;
    anchor.href = cardUrl;
    anchor.click();
  };

  const nativeShare = async () => {
    if (!cardBlob) return;
    const shareUrl = publicUrl(result.slug, "share");
    try {
      if (navigator.share) {
        let file: File | null = null;
        if (typeof File === "function") {
          try {
            file = new File([cardBlob], `AIBTI-${result.code}.jpg`, { type: "image/jpeg" });
          } catch {
            file = null;
          }
        }
        const canShareFile = Boolean(file && navigator.canShare?.({ files: [file] }));
        track("share_click", {
          method: canShareFile ? "native_file" : "native_link",
          resultCode: result.code,
        });
        await navigator.share(canShareFile && file
          ? {
              title: `建筑人格 ${result.code} · ${result.name}`,
              text: result.tagline,
              files: [file],
              url: shareUrl,
            }
          : {
              title: `建筑人格 ${result.code} · ${result.name}`,
              text: result.tagline,
              url: shareUrl,
            });
      } else {
        downloadCard();
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setNotice("系统分享没有打开，可以长按图片保存或复制公开链接");
        setShowFallbackLink(true);
      }
    }
  };

  const closeCard = useCallback(() => {
    if (cardUrl) URL.revokeObjectURL(cardUrl);
    setCardUrl(null);
    setCardBlob(null);
    window.setTimeout(() => shareTrigger.current?.focus(), 0);
  }, [cardUrl]);

  useEffect(() => {
    if (!cardUrl) return;

    const page = document.querySelector("main");
    const previousBodyOverflow = document.body.style.overflow;
    const previousPageInert = page?.inert ?? false;
    document.body.style.overflow = "hidden";
    if (page) page.inert = true;
    window.setTimeout(() => closeShareButton.current?.focus(), 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeCard();
        return;
      }
      if (event.key !== "Tab" || !shareDialog.current) return;

      const focusable = [...shareDialog.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )].filter((element) => !element.hasAttribute("hidden"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      if (page) page.inert = previousPageInert;
    };
  }, [cardUrl, closeCard]);

  return (
    <>
      <section
        className="result-proof"
        data-result-view={view?.kind ?? "loading"}
        aria-busy={view === null}
      >
        {view === null ? (
          <div className="result-proof-loading" role="status">
            <p className="section-kicker">AIBTI 建筑人格</p>
            <h2>正在读取测试结果</h2>
            <div aria-hidden="true"><i /><i /><i /></div>
          </div>
        ) : owner ? (
          <>
            <div className="result-proof-heading">
              <div>
                <p className="section-kicker">匹配依据</p>
                <h2 className="section-title">你的三个关键选择</h2>
              </div>
              <div className="identity-stamp">
                <span>八型匹配</span>
                <strong>#1 / 8</strong>
                <small>{CLARITY_LABEL[owner.clarity]} · 仅本机保存</small>
              </div>
            </div>

            <ol className="evidence-list" aria-label="影响结果最大的三次选择">
              {owner.evidence.map((item, index) => (
                <li key={item.questionId}>
                  <span>0{index + 1}</span>
                  <div>
                    <b>{item.choiceLabel}</b>
                    <p>{item.interpretation}</p>
                  </div>
                </li>
              ))}
            </ol>

            {secondary && (
              <div className="identity-sidecar">
                <span>第二接近的人格</span>
                <a href={withBasePath(buildResultPath(secondary.slug))}>
                  {secondary.code} · {secondary.name} ↗
                </a>
              </div>
            )}

            <div className="dominant-dimensions" aria-label="最鲜明的三项建筑倾向">
              {strongestDimensions.map((id) => {
                const dimension = DIMENSIONS[id];
                const value = owner.dimensionScores[id];
                return (
                  <div key={id}>
                    <span>{dimension.name}</span>
                    <b>{value < 0 ? dimension.negative : dimension.positive}</b>
                  </div>
                );
              })}
            </div>

            <details className="dimension-disclosure">
              <summary>展开八维建筑倾向</summary>
              <div className="dimension-list">
                {DIMENSION_IDS.map((id) => {
                  const dimension = DIMENSIONS[id];
                  const value = owner.dimensionScores[id];
                  return (
                    <div className="dimension-row" key={id}>
                      <span>{dimension.negative}</span>
                      <div
                        className="dimension-track"
                        role="meter"
                        aria-label={dimension.name}
                        aria-valuemin={-1}
                        aria-valuemax={1}
                        aria-valuenow={Number(value.toFixed(2))}
                        aria-valuetext={`${dimension.name}偏向${value < 0 ? dimension.negative : dimension.positive}`}
                        title={`${dimension.negative} ↔ ${dimension.positive}`}
                      >
                        <i style={{ left: `${(value + 1) * 50}%` }} />
                      </div>
                      <span>{dimension.positive}</span>
                    </div>
                  );
                })}
              </div>
            </details>
          </>
        ) : (
          <div className="public-result-note">
            <p className="section-kicker">公开人格档案</p>
            <h2>测出你的建筑人格</h2>
            <a className="primary-button" href={withBasePath("/quiz/")}>开始测试 →</a>
          </div>
        )}

        {view && (
          <div className="result-share-actions" data-testid="result-share-actions">
            <div className="button-row">
              <button
                className="primary-button"
                type="button"
                ref={shareTrigger}
                onClick={openShare}
                disabled={busy}
              >
                {busy ? "正在出图…" : "生成分享卡"}
              </button>
              <button className="secondary-button" type="button" onClick={copyLink}>复制公开链接</button>
            </div>
            {notice && <p className="action-notice" role="status">{notice}</p>}
            {showFallbackLink && !cardUrl && (
              <label className="result-public-link">
                <span>公开链接</span>
                <input
                  readOnly
                  value={shareHref}
                  aria-label="可选择的公开结果链接"
                  onFocus={(event) => event.currentTarget.select()}
                />
              </label>
            )}
          </div>
        )}
      </section>

      {cardUrl && typeof document !== "undefined" && createPortal(
        <div
          className="share-preview-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) closeCard();
          }}
        >
          <div
            className="share-preview-panel"
            ref={shareDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-preview-title"
            aria-describedby="share-preview-help"
          >
            <div className="share-preview-head">
              <span id="share-preview-title">AIBTI 分享卡</span>
              <button ref={closeShareButton} type="button" onClick={closeCard}>关闭 ×</button>
            </div>
            <img className="share-preview-image" src={cardUrl} alt={`${result.name} AIBTI 分享卡`} />
            <p className="share-preview-help" id="share-preview-help">长按图片即可保存</p>
            <label className="share-public-link">
              <span>公开链接</span>
              <input
                readOnly
                value={shareHref}
                aria-label="可选择的公开结果链接"
                onFocus={(event) => event.currentTarget.select()}
              />
            </label>
            <div className="share-preview-actions">
              <button className="primary-button" type="button" onClick={nativeShare}>分享或保存图片</button>
              <button className="secondary-button" type="button" onClick={copyLink}>复制公开链接</button>
            </div>
            {notice && <p className="share-preview-notice" role="status">{notice}</p>}
          </div>
        </div>,
        document.body,
      )}

    </>
  );
}
