"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MediaImage } from "../../../components/media-image";
import { RetestLink } from "../../../components/retest-link";
import type { Architect, Building, ResultType } from "../../../content";
import { track } from "../../../domain/analytics";
import { withBasePath } from "../../../domain/paths";
import voidStyles from "../../void-v2/components/void-v2.module.css";
import { RESULT_V7_EDITORIAL } from "../content/result-v7-content";

type DetailTarget =
  | { kind: "architect" }
  | { kind: "work"; index: number }
  | { kind: "lineage"; index: number };

type ResultV7PageProps = {
  result: ResultType;
  architect: Architect;
  featuredBuildings: readonly Building[];
  recommendedBuildings: readonly Building[];
};

const withoutPeriod = (value: string) => value.replace(/[。.]$/u, "");

export function ResultV7Page({ result, architect, featuredBuildings, recommendedBuildings }: ResultV7PageProps) {
  const editorial = RESULT_V7_EDITORIAL[result.code];
  const [interactive, setInteractive] = useState(false);
  const [target, setTarget] = useState<DetailTarget | null>(null);
  const [shareNotice, setShareNotice] = useState<string>();
  const trigger = useRef<HTMLElement | null>(null);
  const dialog = useRef<HTMLDivElement | null>(null);
  const closeButton = useRef<HTMLButtonElement | null>(null);
  const heroImage = `/images/personas/${result.slug}/hero-poster-v1.webp`;
  const heroDownloadImage = `/images/personas/${result.slug}/hero-poster-v1.png`;
  const sourcePath = `/result/${result.slug}/sources/`;
  const architectImage = architect.portrait?.src;
  const activeWork = target?.kind === "work" ? featuredBuildings[target.index] : undefined;
  const activeWorkEditorial = target?.kind === "work" ? editorial.works[target.index] : undefined;
  const activeContinuationBuilding = target?.kind === "lineage" ? recommendedBuildings[target.index] : undefined;
  const css = {
    "--void-blue": result.accent,
    "--void-ink": result.ink,
    "--void-bone": "#f1eee5",
    "--void-paper-shift": result.accentSoft,
  } as CSSProperties;

  useEffect(() => setInteractive(true), []);

  const openSheet = (next: DetailTarget, source: HTMLElement) => {
    trigger.current = source;
    window.history.pushState({ resultV7Detail: true }, "", window.location.href);
    setTarget(next);
  };

  const closeSheet = useCallback((fromHistory = false) => {
    if (!target) return;
    if (!fromHistory && window.history.state?.resultV7Detail) {
      window.history.back();
      return;
    }
    setTarget(null);
    window.setTimeout(() => trigger.current?.focus(), 0);
  }, [target]);

  useEffect(() => {
    if (!target) return;
    const main = document.querySelector<HTMLElement>("[data-result-v7-page]");
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

  const shareResult = async () => {
    const url = new URL(withBasePath(`/result/${result.slug}/?from=share`), window.location.href).href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${result.code} · ${result.name}`, text: editorial.socialPrompt, url });
        setShareNotice("已打开系统分享");
      } else {
        await navigator.clipboard.writeText(url);
        setShareNotice("结果链接已复制");
      }
      track("share_click", { resultCode: result.code, surface: "result_v7", section: "ending", action: "share" });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareNotice("分享暂时没有成功，可以复制浏览器地址");
    }
  };

  const sheetLabel = target?.kind === "architect" ? "ArcBTI / 建筑师档案" : "ArcBTI / 空间档案";

  return (
    <main className={[voidStyles.page, voidStyles.v7Page].join(" ")} style={css} data-result-v7-page>
      <section className={[voidStyles.hero, voidStyles.heroPosterOnly].join(" ")} aria-labelledby="result-v7-title">
        <MediaImage className={voidStyles.heroPosterImage} src={heroImage} alt="" width={693} height={1296} loading="eager" fetchPriority="high" aria-hidden="true" />
        <div className={voidStyles.visuallyHidden}>
          <p>{result.code}</p>
          <h1 id="result-v7-title">{result.name}</h1>
          <p>{result.languageSummary}</p>
        </div>
      </section>

      <section className={voidStyles.v7Digest} aria-labelledby="result-v7-digest-title">
        <p className={voidStyles.v7Kicker}>01 / 先说人话</p>
        <h2 id="result-v7-digest-title">{editorial.digestTitle}</h2>
        <div className={voidStyles.v7DigestBody}>{editorial.digestBody.map((line) => <p key={line}>{line}</p>)}</div>
        <p className={voidStyles.v7StyleBridge}>{editorial.styleBridge}</p>
        <p className={voidStyles.v7Caveat}>{editorial.caveat}</p>
      </section>

      <section className={voidStyles.v7Architect} aria-labelledby="result-v7-architect-title">
        <header className={voidStyles.v7SectionHeader}>
          <p className={voidStyles.v7Kicker}>02 / 代表建筑师</p>
          <h2 id="result-v7-architect-title">{editorial.architectTitle.map((line) => <span key={line}>{line}</span>)}</h2>
        </header>
        <div className={voidStyles.v7ArchitectCard}>
          <div className={voidStyles.v7ArchitectCopy}>
            <h3>{architect.name}</h3>
            <p className={voidStyles.v7Meta}>{architect.originalName} · {architect.lifespan}</p>
            <p>{withoutPeriod(architect.summary)}</p>
          </div>
          {architectImage ? (
            <MediaImage className={voidStyles.v7ArchitectImage} src={architectImage} alt={architect.portrait?.alt ?? `${architect.name}人物照片`} width={600} height={752} loading="lazy" />
          ) : (
            <div className={voidStyles.v7ArchitectImage} role="img" aria-label={`${architect.name}人物照片待补`} />
          )}
          <button className={voidStyles.v7OpenButton} type="button" disabled={!interactive} aria-haspopup="dialog" onClick={(event) => openSheet({ kind: "architect" }, event.currentTarget)}>
            <span>打开人物档案，看方法怎么长出来</span><span aria-hidden="true">＋</span>
          </button>
        </div>
      </section>

      <section className={voidStyles.v7Works} aria-labelledby="result-v7-works-title">
        <header className={voidStyles.v7SectionHeader}>
          <p className={voidStyles.v7Kicker}>03 / 三次实锤</p>
          <h2 id="result-v7-works-title">{editorial.worksTitle}</h2>
          <p className={voidStyles.v7SectionLead}>{editorial.worksLead}</p>
        </header>
        <div className={voidStyles.v7WorkList}>
          {featuredBuildings.map((building, index) => {
            const workCopy = editorial.works[index];
            return (
              <article className={voidStyles.v7WorkCard} key={building.id}>
                {building.image ? <MediaImage className={voidStyles.v7WorkImage} src={building.image.src} alt={building.image.alt} width={1200} height={800} loading="lazy" /> : null}
                <div className={voidStyles.v7WorkCopy}>
                  <p className={voidStyles.v7WorkIndex}>0{index + 1} / {workCopy.instinct} / {workCopy.action}</p>
                  <h3>{building.name}</h3>
                  <p className={voidStyles.v7Meta}>{building.originalName} · {building.years} · {building.location}</p>
                  <p className={voidStyles.v7WorkHook}>{withoutPeriod(building.hook)}</p>
                  <button className={voidStyles.v7OpenButton} type="button" disabled={!interactive} aria-haspopup="dialog" onClick={(event) => openSheet({ kind: "work", index }, event.currentTarget)}>
                    <span>{workCopy.cta}</span><span aria-hidden="true">＋</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className={voidStyles.v7Lineage} aria-labelledby="result-v7-lineage-title">
        <header className={voidStyles.v7SectionHeader}>
          <p className={voidStyles.v7Kicker}>04 / 继续看</p>
          <h2 id="result-v7-lineage-title">同一套判断<br />再看两座更清楚</h2>
          <p className={voidStyles.v7SectionLead}>{architect.name}把相近的方法推向了另外两种现场</p>
        </header>
        <div className={voidStyles.v7LineageGrid}>
          {recommendedBuildings.map((building, index) => (
              <article className={voidStyles.v7LineageCard} key={building.id}>
                {building.image ? <MediaImage src={building.image.src} alt={building.image.alt} width={900} height={650} loading="lazy" /> : null}
                <div>
                  <h3>{building.name}</h3>
                  <p className={voidStyles.v7LineageMethod}>{withoutPeriod(building.hook)}</p>
                  <p className={voidStyles.v7LineageBody}>{building.originalName} · {building.years}</p>
                  <button className={voidStyles.v7LineageButton} type="button" disabled={!interactive} aria-haspopup="dialog" onClick={(event) => openSheet({ kind: "lineage", index }, event.currentTarget)}>
                    打开建筑档案 ＋
                  </button>
                </div>
              </article>
          ))}
        </div>
        <p className={voidStyles.v7RelatedArchitects}>同频参考　{result.relatedArchitects.join(" / ")}</p>
      </section>

      <section className={voidStyles.ending} aria-labelledby="result-v7-ending-title">
        <div className={voidStyles.endingSummary}>
          <p className={voidStyles.endingCode}>{result.code} · RESULT LOCKED</p>
          <h2 id="result-v7-ending-title">{result.name}</h2>
          <p className={voidStyles.endingJudgment}>{editorial.endingJudgment.map((line) => <span key={line}>{line}</span>)}</p>
          <p className={voidStyles.endingStyles}>{result.keywords.join(" × ")}</p>
        </div>
        <div className={voidStyles.endingActions}>
          <a className={voidStyles.endingPrimary} href={withBasePath(heroDownloadImage)} download={`ArcBTI-${result.code}.png`} onClick={() => track("card_save", { resultCode: result.code, surface: "result_v7", section: "ending", action: "save" })}>保存人格卡</a>
          <button className={voidStyles.endingSecondary} type="button" onClick={shareResult}>分享这个结果</button>
          <p className={voidStyles.socialPrompt}>{shareNotice ?? editorial.socialPrompt}</p>
        </div>
        <nav className={voidStyles.endingLinks} aria-label="结果页后续操作">
          <RetestLink resultCode={result.code} className="">重新测试</RetestLink>
          <a href={withBasePath(sourcePath)}>查看资料与图片来源</a>
        </nav>
      </section>

      {target && typeof document !== "undefined" && createPortal(
        <div className={voidStyles.v7SheetBackdrop} style={css} role="presentation" onPointerDown={(event) => { if (event.currentTarget === event.target) closeSheet(); }}>
          <div className={voidStyles.v7Sheet} ref={dialog} role="dialog" aria-modal="true" aria-labelledby="result-v7-sheet-title" data-result-v7-sheet>
            <header className={voidStyles.v7SheetHeader}><span>{sheetLabel}</span><button ref={closeButton} type="button" onClick={() => closeSheet()}>关闭 <span aria-hidden="true">×</span></button></header>
            <div className={voidStyles.v7SheetScroll}>
              {target.kind === "architect" && (
                <article className={voidStyles.v7SheetArticle}>
                  {architectImage ? <MediaImage className={voidStyles.v7SheetPortrait} src={architectImage} alt={architect.portrait?.alt ?? `${architect.name}人物照片`} width={800} height={960} /> : null}
                  <p className={voidStyles.v7Kicker}>{RESULT_V7_EDITORIAL[result.code].architectTitle[0]}</p>
                  <h2 id="result-v7-sheet-title">{architect.name}</h2>
                  <p className={voidStyles.v7SheetMeta}>{architect.originalName} · {architect.lifespan}</p>
                  <p className={voidStyles.v7SheetLead}>{withoutPeriod(architect.summary)}</p>
                  <section className={voidStyles.v7SheetSection}><h3>{withoutPeriod(architect.storyTitle)}</h3><p>{withoutPeriod(architect.story)}</p></section>
                  <section className={voidStyles.v7SheetSection}><h3>{editorial.architectMethodTitle}</h3><p>{editorial.architectMethodBody}</p></section>
                  <section className={voidStyles.v7SheetSection}><h3>他和 {result.code} 哪里同频</h3><p>{editorial.architectRelation}</p></section>
                  {architect.creditNote ? <p className={voidStyles.v7Supplement}>作者关系说明：{withoutPeriod(architect.creditNote)}</p> : null}
                  <p className={voidStyles.v7SheetTags}>{result.keywords.join(" / ")}</p>
                  <a className={voidStyles.v7SourceLink} href={withBasePath(sourcePath)}>查看人物资料与图片来源</a>
                </article>
              )}
              {target.kind === "work" && activeWork && activeWorkEditorial && (
                <article className={voidStyles.v7SheetArticle}>
                  {activeWork.image ? <MediaImage className={voidStyles.v7SheetHeroImage} src={activeWork.image.src} alt={activeWork.image.alt} width={1200} height={800} /> : null}
                  <p className={voidStyles.v7Kicker}>{activeWorkEditorial.instinct} / {activeWorkEditorial.action}</p>
                  <h2 id="result-v7-sheet-title">{activeWork.name}</h2>
                  <p className={voidStyles.v7SheetMeta}>{activeWork.originalName} · {activeWork.years} · {activeWork.location}</p>
                  <p className={voidStyles.v7SheetLead}>{withoutPeriod(activeWork.hook)}</p>
                  <section className={voidStyles.v7SheetSection}><h3>{activeWorkEditorial.detailTitle}</h3><p>{withoutPeriod(activeWork.story)}</p></section>
                  <section className={voidStyles.v7SheetSection}><h3>现场看什么</h3><ul>{activeWork.lookFor.map((item) => <li key={item}>{withoutPeriod(item)}</li>)}</ul></section>
                  {activeWork.gallery?.length ? <div className={voidStyles.v7SheetGallery}>{activeWork.gallery.map((image) => <MediaImage key={image.src} src={image.src} alt={image.alt} width={1200} height={850} loading="lazy" />)}</div> : null}
                  <section className={voidStyles.v7SheetSection}><h3>为什么这招今天还管用</h3><p>{activeWorkEditorial.significance}</p></section>
                  <p className={voidStyles.v7Supplement}>{activeWorkEditorial.takeaway}</p>
                  <a className={voidStyles.v7SourceLink} href={withBasePath(sourcePath)}>查看作品资料与图片来源</a>
                </article>
              )}
              {target.kind === "lineage" && activeContinuationBuilding && (
                <article className={voidStyles.v7SheetArticle}>
                  {activeContinuationBuilding.image ? <MediaImage className={voidStyles.v7SheetHeroImage} src={activeContinuationBuilding.image.src} alt={activeContinuationBuilding.image.alt} width={1200} height={850} /> : null}
                  <p className={voidStyles.v7Kicker}>继续看 {architect.name}</p>
                  <h2 id="result-v7-sheet-title">{activeContinuationBuilding.name}</h2>
                  <p className={voidStyles.v7SheetMeta}>{activeContinuationBuilding.originalName} · {activeContinuationBuilding.years} · {activeContinuationBuilding.location}</p>
                  <p className={voidStyles.v7SheetLead}>{withoutPeriod(activeContinuationBuilding.hook)}</p>
                  <section className={voidStyles.v7SheetSection}><h3>这座建筑怎么把方法做实</h3><p>{withoutPeriod(activeContinuationBuilding.story)}</p></section>
                  <section className={voidStyles.v7SheetSection}><h3>现场看什么</h3><ul>{activeContinuationBuilding.lookFor.map((item) => <li key={item}>{withoutPeriod(item)}</li>)}</ul></section>
                  {activeContinuationBuilding.gallery?.length ? <div className={voidStyles.v7SheetGallery}>{activeContinuationBuilding.gallery.map((image) => <MediaImage key={image.src} src={image.src} alt={image.alt} width={1200} height={850} loading="lazy" />)}</div> : null}
                  <p className={voidStyles.v7SheetTags}>{result.school} / {result.keywords.join(" / ")}</p>
                  <a className={voidStyles.v7SourceLink} href={withBasePath(sourcePath)}>查看作品资料与图片来源</a>
                </article>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </main>
  );
}
