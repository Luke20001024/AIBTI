"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MediaImage } from "../../../components/media-image";
import { withBasePath } from "../../../domain/paths";
import type { VoidV2Content, VoidWorkId } from "../content/void-v2-types";
import styles from "./void-v2.module.css";

type DetailTarget =
  | { kind: "architect" }
  | { kind: "work"; id: VoidWorkId }
  | { kind: "lineage"; index: number };

type VoidV2StoryProps = {
  content: VoidV2Content;
};

export function VoidV2Story({ content }: VoidV2StoryProps) {
  const [interactive, setInteractive] = useState(false);
  const [target, setTarget] = useState<DetailTarget | null>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const dialog = useRef<HTMLDivElement | null>(null);
  const closeButton = useRef<HTMLButtonElement | null>(null);

  const activeWork = useMemo(
    () => target?.kind === "work"
      ? content.works.items.find((work) => work.id === target.id) ?? null
      : null,
    [content.works.items, target],
  );
  const activeLineage = target?.kind === "lineage"
    ? content.lineage.items[target.index] ?? null
    : null;

  useEffect(() => setInteractive(true), []);

  const openSheet = (next: DetailTarget, source: HTMLElement) => {
    trigger.current = source;
    window.history.pushState({ voidV2Detail: true }, "", window.location.href);
    setTarget(next);
  };

  const closeSheet = useCallback((fromHistory = false) => {
    if (!target) return;
    if (!fromHistory && window.history.state?.voidV2Detail) {
      window.history.back();
      return;
    }
    setTarget(null);
    window.setTimeout(() => trigger.current?.focus(), 0);
  }, [target]);

  useEffect(() => {
    if (!target) return;

    const main = document.querySelector<HTMLElement>("[data-void-v2-page]");
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
      <section className={styles.v7Digest} aria-labelledby="void-v2-digest-title">
        <p className={styles.v7Kicker}>{content.digest.label}</p>
        <h2 id="void-v2-digest-title">{content.digest.title}</h2>
        <div className={styles.v7DigestBody}>
          {content.digest.body.map((line) => <p key={line}>{line}</p>)}
        </div>
        <p className={styles.v7StyleBridge}>{content.digest.styleBridge}</p>
        <p className={styles.v7Caveat}>{content.digest.caveat}</p>
      </section>

      <section className={styles.v7Architect} aria-labelledby="void-v2-architect-title">
        <header className={styles.v7SectionHeader}>
          <p className={styles.v7Kicker}>{content.architect.sectionLabel}</p>
          <h2 id="void-v2-architect-title">
            {content.architect.sectionTitle.map((line) => <span key={line}>{line}</span>)}
          </h2>
        </header>

        <div className={styles.v7ArchitectCard}>
          <div className={styles.v7ArchitectCopy}>
            <h3>{content.architect.name}</h3>
            <p className={styles.v7Meta}>{content.architect.originalName} · {content.architect.years}</p>
            <p>{content.architect.summary}</p>
          </div>
          <MediaImage
            className={styles.v7ArchitectImage}
            src={content.architect.image}
            alt={content.architect.imageAlt}
            width={600}
            height={752}
            loading="lazy"
          />
          <button
            className={styles.v7OpenButton}
            type="button"
            disabled={!interactive}
            aria-haspopup="dialog"
            onClick={(event) => openSheet({ kind: "architect" }, event.currentTarget)}
          >
            <span>{content.architect.cta}</span>
            <span aria-hidden="true">＋</span>
          </button>
        </div>
      </section>

      <section className={styles.v7Works} id="void-v2-works" aria-labelledby="void-v2-works-title">
        <header className={styles.v7SectionHeader}>
          <p className={styles.v7Kicker}>03 / 三次实锤</p>
          <h2 id="void-v2-works-title">{content.works.title}</h2>
          <p className={styles.v7SectionLead}>{content.works.lead}</p>
        </header>

        <div className={styles.v7WorkList}>
          {content.works.items.map((work, index) => (
            <article className={styles.v7WorkCard} id={`void-v2-work-${work.id}`} key={work.id}>
              <MediaImage
                className={styles.v7WorkImage}
                src={work.image}
                alt={work.imageAlt}
                width={1200}
                height={800}
                loading="lazy"
                style={{ objectPosition: work.objectPosition }}
              />
              <div className={styles.v7WorkCopy}>
                <p className={styles.v7WorkIndex}>0{index + 1} / {work.instinct} / {work.action}</p>
                <h3>{work.name}</h3>
                <p className={styles.v7Meta}>{work.originalName} · {work.year} · {work.location}</p>
                <p className={styles.v7WorkHook}>{work.cardHook}</p>
                <button
                  className={styles.v7OpenButton}
                  type="button"
                  disabled={!interactive}
                  aria-haspopup="dialog"
                  onClick={(event) => openSheet({ kind: "work", id: work.id }, event.currentTarget)}
                >
                  <span>{work.cta}</span>
                  <span aria-hidden="true">＋</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.v7Lineage} aria-labelledby="void-v2-lineage-title">
        <header className={styles.v7SectionHeader}>
          <p className={styles.v7Kicker}>04 / 同频建筑师</p>
          <h2 id="void-v2-lineage-title">
            {content.lineage.title.map((line) => <span key={line}>{line}</span>)}
          </h2>
          <p className={styles.v7SectionLead}>{content.lineage.lead}</p>
        </header>

        <div className={styles.v7LineageGrid}>
          {content.lineage.items.map((item, index) => (
            <article className={styles.v7LineageCard} key={item.name}>
              <MediaImage src={item.image} alt={item.imageAlt} width={900} height={650} loading="lazy" />
              <div>
                <h3>{item.name}</h3>
                <p className={styles.v7LineageMethod}>{item.method}</p>
                <p className={styles.v7LineageBody}>{item.body.join("，")}</p>
                <button
                  className={styles.v7LineageButton}
                  type="button"
                  disabled={!interactive}
                  aria-haspopup="dialog"
                  onClick={(event) => openSheet({ kind: "lineage", index }, event.currentTarget)}
                >
                  {item.cta}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {target && typeof document !== "undefined" && createPortal(
        <div
          className={styles.v7SheetBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) closeSheet();
          }}
        >
          <div
            className={styles.v7Sheet}
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="void-v2-sheet-title"
            data-void-v2-sheet
          >
            <header className={styles.v7SheetHeader}>
              <span>
                {target.kind === "work" ? "ArcBTI / 空间档案" : "ArcBTI / 建筑师档案"}
              </span>
              <button ref={closeButton} type="button" onClick={() => closeSheet()}>
                关闭 <span aria-hidden="true">×</span>
              </button>
            </header>

            <div className={styles.v7SheetScroll}>
              {target.kind === "architect" && (
                <article className={styles.v7SheetArticle}>
                  <MediaImage
                    className={styles.v7SheetPortrait}
                    src={content.architect.image}
                    alt={content.architect.imageAlt}
                    width={800}
                    height={960}
                  />
                  <p className={styles.v7Kicker}>建筑界最会打拳的那位</p>
                  <h2 id="void-v2-sheet-title">{content.architect.name}</h2>
                  <p className={styles.v7SheetMeta}>{content.architect.originalName} · {content.architect.years}</p>
                  <p className={styles.v7SheetLead}>{content.architect.summary}</p>
                  <section className={styles.v7SheetSection}>
                    <h3>{content.architect.detailTitle}</h3>
                    <p>{content.architect.detailBody}</p>
                  </section>
                  <section className={styles.v7SheetSection}>
                    <h3>{content.architect.methodTitle}</h3>
                    <p>{content.architect.methodBody}</p>
                  </section>
                  <p className={styles.v7SheetTags}>{content.hero.styles.join(" / ")}</p>
                  <a className={styles.v7SourceLink} href={withBasePath("/preview/void-v2/sources/")}>查看人物资料与图片来源</a>
                </article>
              )}

              {target.kind === "work" && activeWork && (
                <article className={styles.v7SheetArticle}>
                  <MediaImage
                    className={styles.v7SheetHeroImage}
                    src={activeWork.image}
                    alt={activeWork.imageAlt}
                    width={1200}
                    height={800}
                    style={{ objectPosition: activeWork.objectPosition }}
                  />
                  <p className={styles.v7Kicker}>{activeWork.instinct} / {activeWork.action}</p>
                  <h2 id="void-v2-sheet-title">{activeWork.name}</h2>
                  <p className={styles.v7SheetMeta}>{activeWork.originalName} · {activeWork.year} · {activeWork.location}</p>
                  <p className={styles.v7SheetLead}>{activeWork.cardHook}</p>

                  <figure className={styles.v7SheetGallery} aria-label={`${activeWork.name}的更多真实建筑图片`}>
                    {activeWork.gallery.map((image) => (
                      <MediaImage key={image.image} src={image.image} alt={image.imageAlt} width={900} height={700} loading="lazy" />
                    ))}
                  </figure>

                  <section className={styles.v7SheetSection}>
                    <h3>{activeWork.detailTitle}</h3>
                    <p>{activeWork.story.join("，")}</p>
                  </section>
                  <section className={styles.v7SheetSection}>
                    <h3>现场看什么</h3>
                    <ul>
                      {activeWork.observations.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </section>
                  <section className={styles.v7SheetSection}>
                    <h3>为什么这招今天还管用</h3>
                    <p>{activeWork.significance}</p>
                    <p>{activeWork.keyFact}</p>
                  </section>
                  <aside className={styles.v7Takeaway}>
                    <strong>{activeWork.takeawayTitle}</strong>
                    <p>{activeWork.takeaway}</p>
                  </aside>
                  <a className={styles.v7SourceLink} href={withBasePath("/preview/void-v2/sources/")}>查看作品资料与图片来源</a>
                </article>
              )}

              {target.kind === "lineage" && activeLineage && (
                <article className={styles.v7SheetArticle}>
                  <MediaImage
                    className={styles.v7SheetHeroImage}
                    src={activeLineage.image}
                    alt={activeLineage.imageAlt}
                    width={1200}
                    height={850}
                  />
                  <p className={styles.v7Kicker}>和 VOID 同频的建筑师</p>
                  <h2 id="void-v2-sheet-title">{activeLineage.name}</h2>
                  <p className={styles.v7SheetMeta}>{activeLineage.originalName} · {activeLineage.years}</p>
                  <p className={styles.v7SheetLead}>{activeLineage.method}</p>
                  <section className={styles.v7SheetSection}>
                    <h3>{activeLineage.detailTitle}</h3>
                    <p>{activeLineage.detailBody}</p>
                  </section>
                  <section className={styles.v7SheetSection}>
                    <h3>他和 VOID 哪里同频</h3>
                    <p>{activeLineage.relation}</p>
                  </section>
                  <section className={styles.v7SheetSection}>
                    <p className={styles.v7Kicker}>先从这座建筑看</p>
                    <h3>{activeLineage.featuredWork}</h3>
                    <p>{activeLineage.workNote}</p>
                  </section>
                  <p className={styles.v7SheetTags}>{activeLineage.keywords.join(" / ")}</p>
                  <a className={styles.v7SourceLink} href={withBasePath("/preview/void-v2/sources/")}>查看人物资料与图片来源</a>
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
