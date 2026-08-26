"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Architect, Building, ResultType } from "../content";
import { MediaImage } from "./media-image";

type DetailTarget =
  | { kind: "lineage" }
  | { kind: "architect" }
  | { kind: "building"; id: string };

type Props = {
  result: ResultType;
  architect: Architect;
  featuredBuildings: readonly Building[];
  recommendedBuildings: readonly Building[];
};

const trimTerminalPeriod = (value: string) => value.replace(/[。.]$/u, "");

export function ResultDetailSheets({
  result,
  architect,
  featuredBuildings,
  recommendedBuildings,
}: Props) {
  const [interactive, setInteractive] = useState(false);
  const [target, setTarget] = useState<DetailTarget | null>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const dialog = useRef<HTMLDivElement | null>(null);
  const closeButton = useRef<HTMLButtonElement | null>(null);
  const buildings = useMemo(
    () => [...featuredBuildings, ...recommendedBuildings],
    [featuredBuildings, recommendedBuildings],
  );
  const activeBuilding = target?.kind === "building"
    ? buildings.find((building) => building.id === target.id) ?? null
    : null;

  useEffect(() => {
    setInteractive(true);
  }, []);

  const openSheet = (next: DetailTarget, source: HTMLElement) => {
    trigger.current = source;
    window.history.pushState({ arcbtiDetail: true }, "", window.location.href);
    setTarget(next);
  };

  const closeSheet = useCallback((fromHistory = false) => {
    if (!target) return;
    if (!fromHistory && window.history.state?.arcbtiDetail) {
      window.history.back();
      return;
    }
    setTarget(null);
    window.setTimeout(() => trigger.current?.focus(), 0);
  }, [target]);

  useEffect(() => {
    if (!target) return;

    const main = document.querySelector("main");
    const previousOverflow = document.body.style.overflow;
    const previousInert = main?.inert ?? false;
    document.body.style.overflow = "hidden";
    if (main) main.inert = true;
    window.setTimeout(() => closeButton.current?.focus(), 0);

    const onPopState = () => closeSheet(true);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSheet();
        return;
      }
      if (event.key !== "Tab" || !dialog.current) return;

      const focusable = [...dialog.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )];
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

    window.addEventListener("popstate", onPopState);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (main) main.inert = previousInert;
    };
  }, [closeSheet, target]);

  return (
    <>
      <section
        className="result-story"
        aria-labelledby="architect-title"
        data-interactive={interactive}
      >
        <div className="architect-intro">
          <div className="architect-intro-copy">
            <p className="section-kicker">代表建筑师</p>
            <h2 id="architect-title">{architect.name}</h2>
            <p className="architect-original">{architect.originalName} · {architect.lifespan}</p>
            <p>{trimTerminalPeriod(architect.summary)}</p>
            <button
              className="inline-detail-button"
              type="button"
              disabled={!interactive}
              onClick={(event) => openSheet({ kind: "architect" }, event.currentTarget)}
            >
              了解这位建筑师 <span aria-hidden="true">↗</span>
            </button>
          </div>
          {architect.portrait && (
            <div className="architect-intro-media">
              <MediaImage
                className="architect-intro-portrait"
                src={architect.portrait.src}
                alt={architect.portrait.alt}
                fallbackLabel="建筑师肖像整理中"
                loading="lazy"
                decoding="async"
              />
              <p className="portrait-identity-source">
                肖像身份参考 <a href={architect.portrait.source.url} target="_blank" rel="noreferrer">{architect.portrait.source.label} <span aria-hidden="true">↗</span></a>
              </p>
            </div>
          )}
        </div>

        <div className="featured-work-list">
          <p className="section-kicker">三座代表建筑</p>
          {featuredBuildings.map((building, index) => (
            <article className="featured-work" key={building.id}>
              {building.image && (
                <MediaImage
                  className="featured-work-image"
                  src={building.image.src}
                  alt={building.image.alt}
                  fallbackLabel="建筑图片整理中"
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
              )}
              <div className="featured-work-copy">
                <span className="work-index">{String(index + 1).padStart(2, "0")}</span>
                <h3>{building.name}</h3>
                <p className="work-meta">{building.originalName} · {building.years}</p>
                <p className="work-hook">{trimTerminalPeriod(building.hook)}</p>
                <button
                  className="inline-detail-button"
                  type="button"
                  disabled={!interactive}
                  onClick={(event) => openSheet(
                    { kind: "building", id: building.id },
                    event.currentTarget,
                  )}
                >
                  查看空间细节 <span aria-hidden="true">↗</span>
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="lineage-summary">
          <p className="section-kicker">建筑谱系</p>
          <h2>{result.school}</h2>
          <p>{trimTerminalPeriod(result.schoolSummary)}</p>
          <button
            className="inline-detail-button"
            type="button"
            disabled={!interactive}
            onClick={(event) => openSheet({ kind: "lineage" }, event.currentTarget)}
          >
            展开学派与相关建筑师 <span aria-hidden="true">↗</span>
          </button>
        </div>

        <div className="recommended-work-list">
          <p className="section-kicker">还可以看</p>
          <div className="recommended-work-grid">
            {recommendedBuildings.map((building) => (
              <article className="recommended-work" key={building.id}>
                {building.image && (
                  <MediaImage
                    className="recommended-work-image"
                    src={building.image.src}
                    alt={building.image.alt}
                    fallbackLabel="建筑图片整理中"
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <div>
                  <h3>{building.name}</h3>
                  <p>{building.originalName}</p>
                  <button
                    type="button"
                    disabled={!interactive}
                    onClick={(event) => openSheet(
                      { kind: "building", id: building.id },
                      event.currentTarget,
                    )}
                  >
                    查看 <span aria-hidden="true">↗</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {target && typeof document !== "undefined" && createPortal(
        <div
          className="detail-sheet-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) closeSheet();
          }}
        >
          <div
            className="detail-sheet"
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-sheet-title"
          >
            <header className="detail-sheet-header">
              <span>ArcBTI 资料卡</span>
              <button ref={closeButton} type="button" onClick={() => closeSheet()}>
                关闭 <span aria-hidden="true">×</span>
              </button>
            </header>

            <div className="detail-sheet-content">
              {target.kind === "architect" && (
                <article className="detail-article">
                  {architect.portrait && (
                    <div className="detail-portrait-media">
                      <MediaImage
                        className="detail-architect-image"
                        src={architect.portrait.src}
                        alt={architect.portrait.alt}
                        fallbackLabel="建筑师肖像整理中"
                        decoding="async"
                      />
                      <p className="portrait-identity-source">
                        肖像身份参考 <a href={architect.portrait.source.url} target="_blank" rel="noreferrer">{architect.portrait.source.label} <span aria-hidden="true">↗</span></a>
                      </p>
                    </div>
                  )}
                  <p className="section-kicker">代表建筑师</p>
                  <h2 id="detail-sheet-title">{architect.name}</h2>
                  <p className="detail-subtitle">{architect.originalName} · {architect.lifespan}</p>
                  <p>{trimTerminalPeriod(architect.summary)}</p>
                  <hr />
                  <h3>{architect.storyTitle}</h3>
                  <p>{trimTerminalPeriod(architect.story)}</p>
                  <dl className="detail-facts">
                    <div><dt>地区</dt><dd>{architect.region}</dd></div>
                    <div><dt>关联谱系</dt><dd>{architect.school}</dd></div>
                  </dl>
                  {architect.creditNote && <p className="detail-note">{trimTerminalPeriod(architect.creditNote)}</p>}
                  <div className="detail-sources">
                    {architect.sources.map((source) => (
                      <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
                        {source.label} <span aria-hidden="true">↗</span>
                      </a>
                    ))}
                  </div>
                </article>
              )}

              {target.kind === "lineage" && (
                <article className="detail-article">
                  <p className="section-kicker">{result.code} 的建筑谱系</p>
                  <h2 id="detail-sheet-title">{result.school}</h2>
                  <p className="detail-lead">{trimTerminalPeriod(result.schoolSummary)}</p>
                  <div className="language-bridge">
                    <span>ArcBTI 建筑母语</span>
                    <strong>{result.architectureLanguage}</strong>
                    <p>这是对你的空间偏好的编辑归纳，不是建筑史中的正式学派名称</p>
                  </div>
                  <h3>这条谱系在意什么</h3>
                  <p>{trimTerminalPeriod(result.architectureLogic)}</p>
                  <h3>还可以认识</h3>
                  <p>{result.relatedArchitects.join(" · ")}</p>
                </article>
              )}

              {target.kind === "building" && activeBuilding && (
                <article className="detail-article building-detail">
                  {activeBuilding.image && (
                    <MediaImage
                      className="detail-building-image"
                      src={activeBuilding.image.src}
                      alt={activeBuilding.image.alt}
                      fallbackLabel="建筑图片整理中"
                      decoding="async"
                    />
                  )}
                  <p className="section-kicker">建筑作品</p>
                  <h2 id="detail-sheet-title">{activeBuilding.name}</h2>
                  <p className="detail-subtitle">{activeBuilding.originalName}</p>
                  <p className="detail-lead">{trimTerminalPeriod(activeBuilding.hook)}</p>
                  <dl className="detail-facts">
                    <div><dt>地点</dt><dd>{activeBuilding.location}</dd></div>
                    <div><dt>年代</dt><dd>{activeBuilding.years}</dd></div>
                  </dl>
                  <h3>现场看什么</h3>
                  <ul>
                    {activeBuilding.lookFor.map((item) => (
                      <li key={item}>{trimTerminalPeriod(item)}</li>
                    ))}
                  </ul>
                  <h3>为什么值得看</h3>
                  <p>{trimTerminalPeriod(activeBuilding.story)}</p>
                  <div className="detail-sources">
                    {activeBuilding.sources.map((source) => (
                      <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
                        资料 · {source.label} <span aria-hidden="true">↗</span>
                      </a>
                    ))}
                    {activeBuilding.image && (
                      <a href={activeBuilding.image.source.url} target="_blank" rel="noreferrer">
                        图片 · {activeBuilding.image.source.label} <span aria-hidden="true">↗</span>
                      </a>
                    )}
                  </div>
                </article>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
