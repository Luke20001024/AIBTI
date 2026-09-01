import { DIMENSIONS } from "../../src/content/dimensions";
import { DISCRIMINATOR_QUESTIONS } from "../../src/content/discriminator-questions";
import { QUESTIONS } from "../../src/content/questions";
import { RESULT_BY_CODE, RESULT_TYPES } from "../../src/content/results";
import { ARCHITECT_BY_ID } from "../../src/content/architects";
import { BUILDING_BY_ID } from "../../src/content/buildings";
import type { Architect, Building, Question, ResultCode, ResultType } from "../../src/content/schema";
import { RESULT_V7_EDITORIAL } from "../../src/features/result-v7/content/result-v7-content";
import {
  deriveDiscriminatorSequence,
  scoreQuiz,
  selectDiscriminatorQuestion,
  type AnswerMap,
  type QuizResult,
} from "../../src/domain/scoring";

declare global {
  interface Window {
    __ARCBTI_ASSET_MAP__?: Record<string, string>;
    __ARCBTI_RELEASE_TARGET__?: "xhs" | "web";
    xhs?: {
      miniTool?: {
        postNote?: (options: unknown) => Promise<unknown> | unknown;
        saveImageToPhotosAlbum?: (options: { filePath: string }) => Promise<unknown> | unknown;
        writeTempFile?: (options: { data: string }) => Promise<{ filePath?: string }> | { filePath?: string };
      };
    };
  }
}

type ViewName = "home" | "test-entry" | "draw" | "quiz" | "result" | "directory";
type ResultOrigin = "quiz" | "draw" | "directory";

type StoredProgress = {
  answers: AnswerMap;
  index: number;
};

const STORAGE_PROGRESS = "arcbti-xhs-progress-v1";
const STORAGE_RESULT = "arcbti-xhs-result-v1";
const DRAW_CARD_BACK = "/images/interface/draw-card-back-v2-flat.png";
const HOME_ENSEMBLE = "/images/interface/home-persona-ensemble-v1.webp";
const HOME_EXTENSION = "/images/interface/home-persona-ensemble-extension-v1.webp";
const DRAW_PAPER_BACKGROUND = "/images/interface/draw-paper-blueprint-v1.webp";
const RELEASE_TARGET = window.__ARCBTI_RELEASE_TARGET__ === "web" ? "web" : "xhs";
const IS_WEB_RELEASE = RELEASE_TARGET === "web";
const WEB_GITHUB_REPOSITORY_URL = "__ARCBTI_WEB_GITHUB_REPOSITORY_URL__";
const WEB_GITHUB_MESSAGE_URL = "__ARCBTI_WEB_GITHUB_MESSAGE_URL__";
const CORE_COUNT = QUESTIONS.length;
const MAX_QUESTION_COUNT = CORE_COUNT + 2;
const app = document.querySelector<HTMLElement>("#app");
const toast = document.querySelector<HTMLElement>("#toast");

if (!app || !toast) {
  throw new Error("ArcBTI app shell is missing");
}

const state: {
  view: ViewName;
  answers: AnswerMap;
  sequence: Question[];
  index: number;
  result: QuizResult | null;
  resultOrigin: ResultOrigin;
  lastDrawCode: ResultCode | null;
  drawLocked: boolean;
  drawRevealTimer: number | null;
  drawResultTimer: number | null;
  directoryReturnCode: ResultCode | null;
  advanceTimer: number | null;
} = {
  view: "home",
  answers: {},
  sequence: [...QUESTIONS],
  index: 0,
  result: null,
  resultOrigin: "quiz",
  lastDrawCode: null,
  drawLocked: false,
  drawRevealTimer: null,
  drawResultTimer: null,
  directoryReturnCode: null,
  advanceTimer: null,
};

const escapeHtml = (value: unknown) => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

const safeParse = <T>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const readStorage = <T>(key: string): T | null => {
  try {
    return safeParse<T>(window.localStorage.getItem(key));
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The quiz remains fully usable if the host disables local persistence.
  }
};

const removeStorage = (key: string) => {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage restrictions in privacy mode.
  }
};

const scrollTop = () => {
  window.scrollTo({ top: 0, behavior: "auto" });
};

let toastTimer: number | null = null;
let detailOpener: HTMLElement | null = null;
let webDownloadObjectUrl: string | null = null;
let webDownloadGeneration = 0;
const showToast = (message: string) => {
  toast.textContent = message;
  toast.hidden = false;
  if (toastTimer !== null) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.hidden = true;
    toastTimer = null;
  }, 2600);
};

const logoMarkup = () => `
  <div class="brand" aria-label="ArcBTI 建筑直觉">
    <span class="brand-mark">Arc<em>BTI</em></span>
    <span class="brand-sub">建筑直觉</span>
  </div>
`;

const assetPath = (source: string) => window.__ARCBTI_ASSET_MAP__?.[source] ?? source;

const posterPath = (result: ResultType) => assetPath(`/images/personas/${result.slug}/hero-poster-v1.webp`);
const drawCardBackPath = () => assetPath(DRAW_CARD_BACK);
const homeEnsemblePath = () => assetPath(HOME_ENSEMBLE);
const homeExtensionPath = () => assetPath(HOME_EXTENSION);
const drawPaperBackgroundPath = () => assetPath(DRAW_PAPER_BACKGROUND);

// Several source posters intentionally include a pale top margin of different heights.
// The web result page removes only that empty margin; posters whose artwork reaches row 0
// remain untouched. Values were measured against the 16 source images.
const WEB_RESULT_HERO_OFFSET: Record<string, string> = {
  eave: "-7.45%",
  flow: "-5.75%",
  grid: "-7.33%",
  hand: "0%",
  mass: "-6.30%",
  mix: "-7.45%",
  orna: "0%",
  plus: "0%",
  root: "0%",
  ruin: "-7.45%",
  sign: "-7.18%",
  span: "-7.18%",
  tech: "0%",
  tide: "-7.45%",
  veil: "-7.45%",
  void: "0%",
};

const LARGE_PERSONA_POSTERS = new Set(["flow", "grid", "hand", "mass", "orna", "root", "tech"]);
const posterSizeMarkup = (slug: string) => LARGE_PERSONA_POSTERS.has(slug)
  ? 'width="887" height="1774"'
  : 'width="780" height="1564"';

const questionImagePath = (question: Question, optionId: string) =>
  assetPath(`/images/questions-v3/${question.id.toLowerCase()}-${optionId.toLowerCase()}.webp`);

const withoutPeriod = (value: string) => value.replace(/[。.]$/u, "");

const imageMarkup = (
  image: Building["image"] | Architect["portrait"],
  className: string,
  loading: "eager" | "lazy" = "lazy",
) => image ? `<img class="${className}" src="${escapeHtml(assetPath(image.src))}" alt="${escapeHtml(image.alt)}" loading="${loading}">` : "";

const clearModalState = () => {
  document.body.classList.remove("modal-open");
};

const clearDrawTimers = () => {
  if (state.drawRevealTimer !== null) window.clearTimeout(state.drawRevealTimer);
  if (state.drawResultTimer !== null) window.clearTimeout(state.drawResultTimer);
  state.drawRevealTimer = null;
  state.drawResultTimer = null;
  state.drawLocked = false;
};

const hasResumableProgress = () => {
  const stored = readStorage<StoredProgress>(STORAGE_PROGRESS);
  if (!stored || !stored.answers) return false;
  const count = QUESTIONS.filter((question) => stored.answers[question.id]).length;
  return count > 0;
};

const lastResultCode = () => {
  const saved = readStorage<{ code?: ResultCode }>(STORAGE_RESULT);
  return saved?.code && RESULT_BY_CODE[saved.code] ? saved.code : null;
};

const renderHome = () => {
  clearModalState();
  clearDrawTimers();
  revokeWebDownloadObjectUrl();
  state.view = "home";
  const communityMarkup = IS_WEB_RELEASE ? `
          <section class="github-community" aria-labelledby="github-community-title">
            <div class="github-community-copy">
              <p class="github-community-label">ARCBTI · OPEN PROJECT</p>
              <h2 id="github-community-title">喜欢这个建筑人格宇宙？</h2>
              <p>给项目一颗星，或者留下建议、勘误与下一种建筑人格的点子。</p>
            </div>
            <div class="github-community-actions">
              <a class="github-community-link github-star-link" href="${escapeHtml(WEB_GITHUB_REPOSITORY_URL)}">
                <span class="github-community-icon" aria-hidden="true">★</span>
                <span><strong>去 GitHub 加星</strong><small>支持 ArcBTI 继续生长</small></span>
              </a>
              <a class="github-community-link" href="${escapeHtml(WEB_GITHUB_MESSAGE_URL)}">
                <span class="github-community-icon github-message-icon" aria-hidden="true">•••</span>
                <span><strong>留言与建议</strong><small>体验、勘误、建筑点子</small></span>
              </a>
            </div>
          </section>
  ` : "";
  app.innerHTML = `
    <section class="screen home-screen${IS_WEB_RELEASE ? " release-web" : ""}">
      <header class="masthead">
        ${logoMarkup()}
      </header>
      <main class="home-hero choice-home">
        <figure class="choice-visual">
          <img src="${escapeHtml(homeEnsemblePath())}" alt="ArcBTI 十六种建筑人格与中央城市群像" loading="eager">
        </figure>
        <section class="choice-panel" aria-labelledby="choice-title">
          <img class="choice-panel-backdrop" src="${escapeHtml(homeExtensionPath())}" alt="" aria-hidden="true" loading="eager">
          <div class="choice-intro">
            <h1 class="choice-title" id="choice-title"><span>算算你上辈子</span><span>是哪个建筑大师！</span></h1>
            <p class="choice-lead">16 种空间直觉，认真测一遍，或凭直觉抽一张</p>
          </div>
          <div class="choice-actions" aria-label="选择体验方式">
            <button class="choice-button choice-button-primary" type="button" data-action="enter-test">
              <strong>开测！开测！</strong>
            </button>
            <button class="choice-button choice-button-secondary" type="button" data-action="open-draw">
              <strong>看命，直接抽卡！</strong>
            </button>
          </div>
          <p class="choice-note">结果仅保存在当前设备</p>
          ${communityMarkup}
        </section>
      </main>
    </section>
  `;
  scrollTop();
};

const renderTestEntry = () => {
  clearModalState();
  clearDrawTimers();
  revokeWebDownloadObjectUrl();
  state.view = "test-entry";
  const resume = hasResumableProgress();
  const previous = lastResultCode();
  app.innerHTML = `
    <section class="screen test-entry-screen">
      <header class="masthead">
        ${logoMarkup()}
        <button class="text-button" type="button" data-action="go-home">返回</button>
      </header>
      <main class="test-entry-page">
        <div>
          <p class="kicker">ArcBTI · 测试</p>
          <h1>${resume ? "继续，还是重新来" : "重新测一次"}</h1>
          <p>完整测试共 18 题，难分高下时最多追加 2 题</p>
        </div>
        <div class="test-entry-actions">
          ${resume ? '<button class="primary-button" type="button" data-action="resume">继续上次进度</button>' : ""}
          <button class="secondary-button" type="button" data-action="start-new">从第 1 题重新开始</button>
          ${previous ? '<button class="text-button test-result-link" type="button" data-action="show-last-result">查看上次结果</button>' : ""}
        </div>
      </main>
    </section>
  `;
  scrollTop();
};

const renderDraw = () => {
  clearModalState();
  clearDrawTimers();
  revokeWebDownloadObjectUrl();
  state.view = "draw";
  app.innerHTML = `
    <section class="screen draw-screen">
      <header class="masthead">
        ${logoMarkup()}
        <button class="text-button" type="button" data-action="go-home">返回</button>
      </header>
      <main class="draw-page">
        <img class="draw-paper-background" src="${escapeHtml(drawPaperBackgroundPath())}" alt="" aria-hidden="true" loading="eager">
        <div class="draw-copy draw-page-copy">
          <p class="kicker">ArcBTI · Lucky Draw</p>
          <h1 class="draw-page-title">抽一张建筑人格</h1>
          <p class="draw-page-lead">别计算，选第一眼顺手的那张</p>
        </div>
        <div class="draw-stage" data-draw-stage>
          <div class="draw-deck" aria-label="建筑人格抽卡牌组">
            ${[1, 2, 3, 4, 5].map((slot) => `
              <span class="draw-card draw-card-${slot}" aria-hidden="true">
                <span class="draw-card-inner">
                  <span class="draw-card-face draw-card-back" aria-hidden="true">
                    <img src="${escapeHtml(drawCardBackPath())}" alt="" loading="eager">
                  </span>
                  <span class="draw-card-face draw-card-front" aria-hidden="true">
                    <img data-draw-front alt="" loading="eager">
                  </span>
                </span>
              </span>
            `).join("")}
            <div class="draw-pick-zones">
              ${[1, 2, 3, 4, 5].map((slot) => `
                <button type="button" data-action="draw-card" data-slot="${slot}" aria-label="抽第 ${slot} 张建筑人格牌"></button>
              `).join("")}
            </div>
          </div>
          <p class="draw-status" data-draw-status aria-live="polite">点一张，看看今天是哪种空间人格</p>
        </div>
      </main>
    </section>
  `;
  scrollTop();
};

const persistProgress = () => {
  writeStorage(STORAGE_PROGRESS, {
    answers: state.answers,
    index: state.index,
  } satisfies StoredProgress);
};

const startNew = () => {
  clearDrawTimers();
  if (state.advanceTimer !== null) window.clearTimeout(state.advanceTimer);
  state.answers = {};
  state.sequence = [...QUESTIONS];
  state.index = 0;
  state.result = null;
  removeStorage(STORAGE_PROGRESS);
  renderQuestion();
};

const enterTest = () => {
  if (hasResumableProgress() || lastResultCode()) {
    renderTestEntry();
    return;
  }
  startNew();
};

const resumeQuiz = () => {
  const stored = readStorage<StoredProgress>(STORAGE_PROGRESS);
  if (!stored || !stored.answers) {
    startNew();
    return;
  }
  state.answers = { ...stored.answers };
  const discriminatorSequence = deriveDiscriminatorSequence(state.answers);
  state.sequence = [...QUESTIONS, ...discriminatorSequence];
  const firstUnanswered = state.sequence.findIndex((question) => !state.answers[question.id]);
  state.index = firstUnanswered >= 0
    ? firstUnanswered
    : Math.min(stored.index, state.sequence.length - 1);
  renderQuestion();
};

const optionMarkup = (question: Question) => question.options.map((option) => {
  const selected = state.answers[question.id] === option.id;
  const visual = question.kind === "aesthetic"
    ? `<img class="option-visual" src="${questionImagePath(question, option.id)}" alt="${escapeHtml(option.label)}" loading="eager">`
    : "";
  return `
    <button
      class="option-card${selected ? " is-selected" : ""}${visual ? " has-visual" : ""}"
      type="button"
      data-action="choose-option"
      data-option="${option.id}"
      aria-pressed="${selected ? "true" : "false"}"
    >
      ${visual}
      <span class="option-copy">
        <span class="option-label">${escapeHtml(option.label)}</span>
        <span class="option-evidence">${escapeHtml(option.evidence)}</span>
      </span>
      <span class="option-id" aria-hidden="true">${option.id}</span>
    </button>
  `;
}).join("");

const renderQuestion = () => {
  clearModalState();
  revokeWebDownloadObjectUrl();
  state.view = "quiz";
  const question = state.sequence[state.index];
  if (!question) {
    finishQuiz();
    return;
  }
  const currentNumber = Math.min(state.index + 1, MAX_QUESTION_COUNT);
  const totalLabel = state.sequence.length > CORE_COUNT ? state.sequence.length : CORE_COUNT;
  const progress = Math.min(100, (currentNumber / totalLabel) * 100);
  app.innerHTML = `
    <section class="screen quiz-screen">
      <header class="quiz-top">
        <button class="quiz-nav" type="button" data-action="quiz-back" ${state.index === 0 ? "disabled" : ""}>返回</button>
        <div class="progress-wrap">
          <span class="progress-label">${currentNumber} / ${totalLabel}</span>
          <div class="progress-track" aria-hidden="true"><div class="progress-bar" style="width:${progress}%"></div></div>
        </div>
        <button class="quiz-nav" type="button" data-action="quit-quiz">退出</button>
      </header>
      <div class="question-page">
        <p class="question-eyebrow">${escapeHtml(question.eyebrow)}</p>
        <h1 class="question-title">${escapeHtml(question.prompt)}</h1>
        <div class="options">${optionMarkup(question)}</div>
      </div>
    </section>
  `;
  persistProgress();
  scrollTop();
};

const resetDiscriminators = () => {
  for (const discriminator of DISCRIMINATOR_QUESTIONS) {
    delete state.answers[discriminator.id];
  }
  state.sequence = [...QUESTIONS];
};

const chooseOption = (optionId: "A" | "B" | "C") => {
  const question = state.sequence[state.index];
  if (!question || !question.options.some((option) => option.id === optionId)) return;

  if (state.index < CORE_COUNT) resetDiscriminators();
  state.answers[question.id] = optionId;
  persistProgress();
  renderQuestion();

  if (state.advanceTimer !== null) window.clearTimeout(state.advanceTimer);
  state.advanceTimer = window.setTimeout(() => {
    state.advanceTimer = null;
    advanceQuiz();
  }, 155);
};

const advanceQuiz = () => {
  if (state.index < state.sequence.length - 1) {
    state.index += 1;
    renderQuestion();
    return;
  }

  const coreComplete = QUESTIONS.every((question) => state.answers[question.id]);
  if (!coreComplete) {
    const firstMissing = QUESTIONS.findIndex((question) => !state.answers[question.id]);
    state.index = firstMissing >= 0 ? firstMissing : 0;
    renderQuestion();
    return;
  }

  const interim = scoreQuiz(state.answers);
  const usedIds = state.sequence
    .filter((question) => question.id.startsWith("T"))
    .map((question) => question.id);
  const next = selectDiscriminatorQuestion(interim, usedIds);
  if (next && usedIds.length < 2) {
    state.sequence.push(next);
    state.index = state.sequence.length - 1;
    renderQuestion();
    return;
  }

  showResult(interim);
};

const quizBack = () => {
  if (state.advanceTimer !== null) {
    window.clearTimeout(state.advanceTimer);
    state.advanceTimer = null;
  }
  if (state.index <= 0) return;
  state.index -= 1;
  renderQuestion();
};

const dimensionMarkup = (result: QuizResult) => Object.entries(result.dimensionScores)
  .sort((left, right) => Math.abs(right[1]) - Math.abs(left[1]))
  .slice(0, 4)
  .map(([id, score]) => {
    const definition = DIMENSIONS[id as keyof typeof DIMENSIONS];
    const label = score >= 0 ? definition.positive : definition.negative;
    return `<span class="pill">${escapeHtml(label)} ${Math.round(Math.abs(score) * 100)}</span>`;
  })
  .join("");

const evidenceMarkup = (result: QuizResult) => result.evidenceQuestions.map((evidence) => `
  <div class="evidence-item">
    <strong>${escapeHtml(evidence.label)}</strong>
    <span>${escapeHtml(evidence.interpretation)}</span>
  </div>
`).join("");

const resultContext = (result: QuizResult) => {
  const persona = RESULT_BY_CODE[result.primaryTypeId];
  const architect = ARCHITECT_BY_ID[persona.architectId];
  const featuredBuildings = persona.buildingIds.map((id) => BUILDING_BY_ID[id]);
  const recommendedBuildings = persona.recommendedBuildingIds.map((id) => BUILDING_BY_ID[id]);
  const editorial = RESULT_V7_EDITORIAL[persona.code];
  if (!architect || featuredBuildings.some((item) => !item) || recommendedBuildings.some((item) => !item) || !editorial) {
    throw new Error(`Incomplete result content for ${persona.code}`);
  }
  return { persona, architect, featuredBuildings, recommendedBuildings, editorial };
};

const compactEvidenceMarkup = (result: QuizResult) => {
  if (!result.evidenceQuestions.length) return "";
  return `
    <div class="diagnostic-band">
      <p class="micro-label">这次判定抓到了这些反应</p>
      <div class="dimension-row">${dimensionMarkup(result)}</div>
      <div class="evidence-list compact-evidence">${evidenceMarkup(result)}</div>
    </div>
  `;
};

const fullResultMarkup = (result: QuizResult) => {
  const { persona, architect, featuredBuildings, recommendedBuildings, editorial } = resultContext(result);
  const releaseClass = IS_WEB_RELEASE ? " release-web" : "";
  const heroOffset = WEB_RESULT_HERO_OFFSET[persona.slug] ?? "0%";
  const deliveryActions = IS_WEB_RELEASE ? `
            <span class="web-download-slot" data-web-download-slot></span>
  ` : `
            <button class="primary-button" type="button" data-action="save-card">保存人格卡</button>
            <button class="secondary-button" type="button" data-action="post-note">发小红书</button>
  `;
  const deliveryHint = IS_WEB_RELEASE
    ? "人格卡将直接下载到当前设备"
    : "保存与发布需要在小红书小工具环境中使用";
  return `
    <section
      class="screen result-screen complete-result${releaseClass}"
      style="--accent:${escapeHtml(persona.accent)};--accent-soft:${escapeHtml(persona.accentSoft)};--ink:${escapeHtml(persona.ink)};--result-hero-offset:${heroOffset}"
    >
      <header class="result-header">
        ${logoMarkup()}
        <button class="text-button" type="button" data-action="start-new">重测</button>
      </header>

      <div class="result-hero">
        <img src="${escapeHtml(posterPath(persona))}" alt="${escapeHtml(persona.characterAlt)}" data-persona-slug="${escapeHtml(persona.slug)}" ${posterSizeMarkup(persona.slug)} loading="eager">
      </div>

      <div class="result-content editorial-result">
        <section class="editorial-section digest-section">
          <p class="section-index">01 / 先说人话</p>
          <h1>${escapeHtml(editorial.digestTitle)}</h1>
          <div class="digest-copy">
            ${editorial.digestBody.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
          </div>
          <p class="style-bridge">${escapeHtml(editorial.styleBridge)}</p>
          <p class="caveat">${escapeHtml(editorial.caveat)}</p>
          ${compactEvidenceMarkup(result)}
        </section>

        <section class="editorial-section architect-section">
          <header class="section-heading">
            <p class="section-index">02 / 代表建筑师</p>
            <h2>${editorial.architectTitle.map((line) => `<span>${escapeHtml(line)}</span>`).join("")}</h2>
          </header>
          <article class="architect-card">
            <div class="architect-copy">
              <h3>${escapeHtml(architect.name)}</h3>
              <p class="meta">${escapeHtml(architect.originalName)} · ${escapeHtml(architect.lifespan)}</p>
              <p>${escapeHtml(withoutPeriod(architect.summary))}</p>
            </div>
            ${imageMarkup(architect.portrait, "architect-image")}
            <button class="open-button" type="button" data-action="open-detail" data-kind="architect">
              <span>打开人物档案，看方法怎么长出来</span><span aria-hidden="true">＋</span>
            </button>
          </article>
        </section>

        <section class="editorial-section works-section">
          <header class="section-heading">
            <p class="section-index">03 / 三次实锤</p>
            <h2>${escapeHtml(editorial.worksTitle)}</h2>
            <p class="section-lead">${escapeHtml(editorial.worksLead)}</p>
          </header>
          <div class="work-list">
            ${featuredBuildings.map((building, index) => {
              const copy = editorial.works[index];
              return `
                <article class="work-card">
                  ${imageMarkup(building.image, "work-image")}
                  <div class="work-copy">
                    <p class="work-index">0${index + 1} / ${escapeHtml(copy.instinct)} / ${escapeHtml(copy.action)}</p>
                    <h3>${escapeHtml(building.name)}</h3>
                    <p class="meta">${escapeHtml(building.originalName)} · ${escapeHtml(building.years)} · ${escapeHtml(building.location)}</p>
                    <p class="work-hook">${escapeHtml(withoutPeriod(building.hook))}</p>
                    <button class="open-button" type="button" data-action="open-detail" data-kind="building" data-group="featured" data-index="${index}">
                      <span>${escapeHtml(copy.cta)}</span><span aria-hidden="true">＋</span>
                    </button>
                  </div>
                </article>
              `;
            }).join("")}
          </div>
        </section>

        <section class="editorial-section lineage-section">
          <header class="section-heading">
            <p class="section-index">04 / 继续看</p>
            <h2>${editorial.lineageTitle.map((line) => `<span>${escapeHtml(line)}</span>`).join("")}</h2>
            <p class="section-lead">${escapeHtml(editorial.lineageLead)}</p>
          </header>
          <div class="lineage-grid">
            ${recommendedBuildings.map((building, index) => `
              <article class="lineage-card">
                ${imageMarkup(building.image, "lineage-image")}
                <div class="lineage-copy">
                  <h3>${escapeHtml(building.name)}</h3>
                  <p class="lineage-method">${escapeHtml(withoutPeriod(building.hook))}</p>
                  <p class="meta">${escapeHtml(building.originalName)} · ${escapeHtml(building.years)}</p>
                  <button class="lineage-button" type="button" data-action="open-detail" data-kind="building" data-group="recommended" data-index="${index}">打开建筑档案 ＋</button>
                </div>
              </article>
            `).join("")}
          </div>
          <p class="related-architects">同频参考　${persona.relatedArchitects.map(escapeHtml).join(" / ")}</p>
        </section>

        <section class="result-ending">
          <div class="ending-summary">
            <p class="result-code">${escapeHtml(persona.code)} · ${state.resultOrigin === "draw" ? "LUCKY DRAW" : "RESULT LOCKED"}</p>
            <h2>${escapeHtml(persona.name)}</h2>
            <p class="ending-judgment">${editorial.endingJudgment.map((line) => `<span>${escapeHtml(line)}</span>`).join("")}</p>
            <p class="ending-styles">${persona.keywords.map(escapeHtml).join(" × ")}</p>
          </div>
          <div class="ending-actions">
            <button class="draw-again-button" type="button" data-action="draw-again">再抽一次</button>
            ${deliveryActions}
            <button class="text-button wide" type="button" data-action="open-directory">看看其他 15 种人格</button>
          </div>
          <p class="social-prompt">${escapeHtml(editorial.socialPrompt)}</p>
          <p class="button-hint">${deliveryHint}</p>
        </section>
      </div>
      <div id="detail-root"></div>
    </section>
  `;
};

const sourceNote = (labels: readonly string[]) => labels.length
  ? `<p class="source-note">资料索引　${labels.map(escapeHtml).join(" · ")}</p>`
  : "";

const buildingDetailMarkup = (
  building: Building,
  persona: ResultType,
  group: "featured" | "recommended",
  index: number,
) => {
  const editorial = RESULT_V7_EDITORIAL[persona.code];
  const workCopy = group === "featured" ? editorial.works[index] : undefined;
  const gallery = building.gallery ?? [];
  return `
    <article class="detail-article">
      ${imageMarkup(building.image, "detail-hero", "eager")}
      <p class="section-index">${workCopy ? `${escapeHtml(workCopy.instinct)} / ${escapeHtml(workCopy.action)}` : "继续看 / 同频建筑"}</p>
      <h2 id="detail-title">${escapeHtml(building.name)}</h2>
      <p class="detail-meta">${escapeHtml(building.originalName)} · ${escapeHtml(building.years)} · ${escapeHtml(building.location)}</p>
      <p class="detail-lead">${escapeHtml(withoutPeriod(building.hook))}</p>
      <section class="detail-section">
        <h3>${escapeHtml(workCopy?.detailTitle ?? "这座建筑怎么把方法做实")}</h3>
        <p>${escapeHtml(withoutPeriod(building.story))}</p>
      </section>
      <section class="detail-section">
        <h3>现场看什么</h3>
        <ul>${building.lookFor.map((item) => `<li>${escapeHtml(withoutPeriod(item))}</li>`).join("")}</ul>
      </section>
      ${gallery.length ? `
        <div class="detail-gallery">
          ${gallery.map((image) => imageMarkup(image, "detail-gallery-image")).join("")}
        </div>
      ` : ""}
      ${workCopy ? `
        <section class="detail-section">
          <h3>为什么这招今天还管用</h3>
          <p>${escapeHtml(workCopy.significance)}</p>
        </section>
        <p class="supplement">${escapeHtml(workCopy.takeaway)}</p>
      ` : `<p class="detail-tags">${escapeHtml(persona.school)} / ${persona.keywords.map(escapeHtml).join(" / ")}</p>`}
      ${sourceNote(building.sources.map((source) => source.label))}
    </article>
  `;
};

const architectDetailMarkup = (architect: Architect, persona: ResultType) => {
  const editorial = RESULT_V7_EDITORIAL[persona.code];
  return `
    <article class="detail-article">
      ${imageMarkup(architect.portrait, "detail-portrait", "eager")}
      <p class="section-index">${escapeHtml(editorial.architectTitle[0])}</p>
      <h2 id="detail-title">${escapeHtml(architect.name)}</h2>
      <p class="detail-meta">${escapeHtml(architect.originalName)} · ${escapeHtml(architect.lifespan)}</p>
      <p class="detail-lead">${escapeHtml(withoutPeriod(architect.summary))}</p>
      <section class="detail-section"><h3>${escapeHtml(withoutPeriod(architect.storyTitle))}</h3><p>${escapeHtml(withoutPeriod(architect.story))}</p></section>
      <section class="detail-section"><h3>${escapeHtml(editorial.architectMethodTitle)}</h3><p>${escapeHtml(editorial.architectMethodBody)}</p></section>
      <section class="detail-section"><h3>和 ${escapeHtml(persona.code)} 哪里同频</h3><p>${escapeHtml(editorial.architectRelation)}</p></section>
      ${architect.creditNote ? `<p class="supplement">作者关系说明　${escapeHtml(withoutPeriod(architect.creditNote))}</p>` : ""}
      <p class="detail-tags">${persona.keywords.map(escapeHtml).join(" / ")}</p>
      ${sourceNote(architect.sources.map((source) => source.label))}
    </article>
  `;
};

const openDetail = (
  kind: "architect" | "building",
  group: "featured" | "recommended" = "featured",
  index = 0,
  opener?: HTMLElement,
) => {
  if (!state.result) return;
  const root = document.querySelector<HTMLElement>("#detail-root");
  if (!root) return;
  detailOpener = opener ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
  const { persona, architect, featuredBuildings, recommendedBuildings } = resultContext(state.result);
  const article = kind === "architect"
    ? architectDetailMarkup(architect, persona)
    : buildingDetailMarkup(group === "featured" ? featuredBuildings[index] : recommendedBuildings[index], persona, group, index);
  root.innerHTML = `
    <div class="detail-backdrop" data-action="close-detail" role="presentation">
      <div class="detail-sheet" data-action="detail-surface" role="dialog" aria-modal="true" aria-labelledby="detail-title" tabindex="-1">
        <header class="detail-header">
          <span>${kind === "architect" ? "ArcBTI / 建筑师档案" : "ArcBTI / 空间档案"}</span>
          <button type="button" data-action="close-detail">关闭 <span aria-hidden="true">×</span></button>
        </header>
        <div class="detail-scroll">${article}</div>
      </div>
    </div>
  `;
  document.body.classList.add("modal-open");
  root.querySelector<HTMLElement>(".detail-sheet")?.focus({ preventScroll: true });
};

const closeDetail = () => {
  const opener = detailOpener;
  detailOpener = null;
  const root = document.querySelector<HTMLElement>("#detail-root");
  if (root) root.innerHTML = "";
  clearModalState();
  if (opener?.isConnected) {
    opener.classList.add("is-focus-restored");
    const clearRestoredState = () => opener.classList.remove("is-focus-restored");
    opener.addEventListener("blur", clearRestoredState, { once: true });
    opener.addEventListener("keydown", clearRestoredState, { once: true });
    opener.addEventListener("pointerdown", clearRestoredState, { once: true });
    window.requestAnimationFrame(() => opener.focus({ preventScroll: true }));
  }
};

const showResult = (result: QuizResult, origin: ResultOrigin = "quiz", persist = true) => {
  clearModalState();
  clearDrawTimers();
  state.view = "result";
  state.result = result;
  state.resultOrigin = origin;
  if (persist) {
    writeStorage(STORAGE_RESULT, {
      code: result.primaryTypeId,
      answers: state.answers,
      result,
      origin,
    });
  }
  if (persist && origin === "quiz") removeStorage(STORAGE_PROGRESS);
  app.innerHTML = fullResultMarkup(result);
  mountWebDownloadLink();
  scrollTop();
};

const showSavedResult = () => {
  const saved = readStorage<{ code?: ResultCode; answers?: AnswerMap; result?: QuizResult; origin?: ResultOrigin }>(STORAGE_RESULT);
  if (!saved?.code || !RESULT_BY_CODE[saved.code]) {
    showToast("还没有保存过结果，先做一次测试吧");
    return;
  }
  state.answers = saved.answers ?? {};
  state.result = saved.result ?? null;
  if (state.result) {
    showResult(state.result, saved.origin ?? "quiz", false);
    return;
  }
  const fallback = {
    primaryTypeId: saved.code,
    secondaryTypeId: saved.code,
    confidence: 0,
    clarity: "mixed",
    gap: 0,
    dimensionScores: RESULT_BY_CODE[saved.code].vector,
    evidence: [],
    evidenceQuestions: [],
    evidenceQuestionIds: [],
    candidates: [],
    quizVersion: "4.0.0",
    scoringVersion: "4.0.0",
  } satisfies QuizResult;
  showResult(fallback, saved.origin ?? "quiz", false);
};

const renderDirectory = () => {
  clearModalState();
  clearDrawTimers();
  revokeWebDownloadObjectUrl();
  const returnCode = state.view === "result" ? state.result?.primaryTypeId ?? null : null;
  state.view = "directory";
  state.directoryReturnCode = returnCode;
  app.innerHTML = `
    <section class="screen directory-screen${IS_WEB_RELEASE ? " release-web" : ""}">
      <header class="masthead">
        ${logoMarkup()}
        <button class="text-button" type="button" data-action="close-directory">返回</button>
      </header>
      <div class="directory-intro">
        <p class="kicker">ArcBTI · 4 × 4</p>
        <h1>16 种建筑人格</h1>
        <p>骨架、场所、记忆与改写，点开任意一张看看它如何组织空间</p>
      </div>
      <div class="persona-grid">
        ${RESULT_TYPES.map((persona) => `
          <button
            class="persona-card"
            type="button"
            data-action="preview-persona"
            data-code="${persona.code}"
            style="--card-accent:${escapeHtml(persona.accent)}${IS_WEB_RELEASE ? `;--persona-poster-offset:${WEB_RESULT_HERO_OFFSET[persona.slug] ?? "0%"}` : ""}"
          >
            <span class="persona-card-visual">
              <img src="${posterPath(persona)}" alt="${escapeHtml(persona.name)}人格海报" data-persona-slug="${escapeHtml(persona.slug)}" ${posterSizeMarkup(persona.slug)} loading="lazy">
            </span>
            <span class="persona-card-copy">
              <span class="persona-card-code">${escapeHtml(persona.code)}</span>
              <span class="persona-card-name">${escapeHtml(persona.name)}</span>
              <span class="persona-card-language">${escapeHtml(persona.architectureLanguage)}</span>
            </span>
          </button>
        `).join("")}
      </div>
    </section>
  `;
  scrollTop();
};

const syntheticResultFor = (code: ResultCode) => {
  const persona = RESULT_BY_CODE[code];
  if (!persona) return null;
  return {
    primaryTypeId: code,
    secondaryTypeId: code,
    confidence: 0,
    clarity: "mixed",
    gap: 0,
    dimensionScores: persona.vector,
    evidence: [],
    evidenceQuestions: [],
    evidenceQuestionIds: [],
    candidates: [],
    quizVersion: "4.0.0",
    scoringVersion: "4.0.0",
  } satisfies QuizResult;
};

const previewPersona = (code: ResultCode) => {
  const synthetic = syntheticResultFor(code);
  if (!synthetic) return;
  state.result = synthetic;
  state.resultOrigin = "directory";
  state.view = "result";
  app.innerHTML = fullResultMarkup(synthetic);
  mountWebDownloadLink();
  scrollTop();
};

const drawPersonaFromCard = (control: HTMLElement) => {
  if (state.drawLocked || state.view !== "draw") return;
  const stage = control.closest<HTMLElement>("[data-draw-stage]");
  const slot = control.dataset.slot;
  const card = slot ? stage?.querySelector<HTMLElement>(`.draw-card-${slot}`) : null;
  const frontImage = card?.querySelector<HTMLImageElement>("[data-draw-front]");
  if (!stage || !card || !frontImage) return;

  const pool = RESULT_TYPES.filter((persona) => persona.code !== state.lastDrawCode);
  const persona = pool[Math.floor(Math.random() * pool.length)] ?? RESULT_TYPES[0];
  const synthetic = syntheticResultFor(persona.code);
  if (!synthetic) return;

  state.drawLocked = true;
  state.lastDrawCode = persona.code;
  frontImage.src = posterPath(persona);
  frontImage.alt = `${persona.code} ${persona.name}人格卡`;
  card.classList.add("is-picked");
  stage.classList.add("is-picking");
  stage.querySelector<HTMLElement>("[data-draw-status]")!.textContent = "牌已经选定";
  stage.querySelectorAll<HTMLButtonElement>("[data-action='draw-card']").forEach((zone) => {
    zone.disabled = true;
  });

  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const startedAt = Date.now();
  let flipStarted = false;
  const startFlip = () => {
    if (flipStarted || state.view !== "draw") return;
    flipStarted = true;
    const minimumLift = reducedMotion ? 20 : 170;
    const remaining = Math.max(0, minimumLift - (Date.now() - startedAt));
    state.drawRevealTimer = window.setTimeout(() => {
      state.drawRevealTimer = null;
      if (state.view !== "draw") return;
      card.classList.add("is-flipped");
      stage.classList.add("is-revealed");
      stage.querySelector<HTMLElement>("[data-draw-status]")!.textContent = `抽到 ${persona.code} · ${persona.name}`;
      state.drawResultTimer = window.setTimeout(() => {
        showResult(synthetic, "draw");
      }, reducedMotion ? 160 : 700);
    }, remaining);
  };

  if (frontImage.complete && frontImage.naturalWidth > 0) {
    startFlip();
  } else {
    frontImage.addEventListener("load", startFlip, { once: true });
    state.drawRevealTimer = window.setTimeout(startFlip, reducedMotion ? 60 : 340);
  }
};

const imageAsDataUri = (src: string) => new Promise<string>((resolve, reject) => {
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      reject(new Error("Canvas is unavailable"));
      return;
    }
    context.drawImage(image, 0, 0);
    resolve(canvas.toDataURL("image/png"));
  };
  image.onerror = () => reject(new Error("Image failed to load"));
  image.src = src;
});

const imageAsBlobUrl = (src: string) => new Promise<string>((resolve, reject) => {
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      reject(new Error("Canvas is unavailable"));
      return;
    }
    try {
      context.drawImage(image, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("PNG generation failed"));
          return;
        }
        resolve(URL.createObjectURL(blob));
      }, "image/png");
    } catch (error) {
      reject(error);
    }
  };
  image.onerror = () => reject(new Error("Image failed to load"));
  image.src = src;
});

const revokeWebDownloadObjectUrl = () => {
  webDownloadGeneration += 1;
  if (webDownloadObjectUrl) {
    URL.revokeObjectURL(webDownloadObjectUrl);
    webDownloadObjectUrl = null;
  }
};

const mountWebDownloadLink = () => {
  if (!IS_WEB_RELEASE || !state.result) return;
  const slot = app.querySelector<HTMLElement>("[data-web-download-slot]");
  if (!slot) return;

  revokeWebDownloadObjectUrl();
  const generation = webDownloadGeneration;
  const persona = RESULT_BY_CODE[state.result.primaryTypeId];
  const link = document.createElement("a");
  link.className = "primary-button web-download-button is-preparing";
  link.href = "#";
  link.setAttribute("role", "button");
  link.setAttribute("aria-label", "保存人格卡");
  link.setAttribute("aria-disabled", "true");
  link.dataset.action = "web-download-feedback";
  link.textContent = "准备人格卡…";
  slot.replaceWith(link);

  const useSourceDownload = () => {
    link.href = posterPath(persona);
    link.setAttribute("download", `ArcBTI-${persona.code}-${persona.slug}.webp`);
    link.setAttribute("aria-disabled", "false");
    link.classList.remove("is-preparing");
    link.textContent = "保存人格卡";
  };

  void imageAsBlobUrl(posterPath(persona)).then((objectUrl) => {
    if (generation !== webDownloadGeneration || !link.isConnected) {
      URL.revokeObjectURL(objectUrl);
      return;
    }
    webDownloadObjectUrl = objectUrl;
    link.href = objectUrl;
    link.setAttribute("download", `ArcBTI-${persona.code}-${persona.slug}.png`);
    link.setAttribute("aria-disabled", "false");
    link.classList.remove("is-preparing");
    link.textContent = "保存人格卡";
  }).catch(() => {
    if (generation !== webDownloadGeneration || !link.isConnected) return;
    useSourceDownload();
  });
};

const getMiniToolApi = () => window.xhs?.miniTool;

const saveCard = async () => {
  if (!state.result) return;
  const persona = RESULT_BY_CODE[state.result.primaryTypeId];
  if (IS_WEB_RELEASE) return;
  const api = getMiniToolApi();
  if (!api?.saveImageToPhotosAlbum) {
    showToast("请在小红书小工具中打开后保存");
    return;
  }
  try {
    showToast("正在生成清晰人格卡");
    const data = await imageAsDataUri(posterPath(persona));
    let filePath = data;
    if (api.writeTempFile) {
      const written = await api.writeTempFile({ data });
      if (written?.filePath) filePath = written.filePath;
    }
    await api.saveImageToPhotosAlbum({ filePath });
    showToast("人格卡已保存到相册");
  } catch {
    showToast("保存失败，请稍后再试");
  }
};

const postNote = async () => {
  if (!state.result) return;
  const api = getMiniToolApi();
  if (!api?.postNote) {
    showToast("请在小红书小工具中打开后发布");
    return;
  }
  const persona = RESULT_BY_CODE[state.result.primaryTypeId];
  try {
    showToast("正在准备笔记图片");
    const data = await imageAsDataUri(posterPath(persona));
    await api.postNote({
      title: `${persona.code}｜${persona.name}`,
      content: `${persona.tagline}\n${persona.languageSummary}\n\n#ArcBTI #建筑直觉 #建筑人格`,
      pageType: "photo_publish",
      mediaInfo: {
        image_resources: [{ url: data }],
      },
    });
  } catch {
    showToast("发布页打开失败，请稍后再试");
  }
};

const finishQuiz = () => {
  if (QUESTIONS.every((question) => state.answers[question.id])) {
    showResult(scoreQuiz(state.answers));
  } else {
    renderHome();
  }
};

const actionFrom = (target: EventTarget | null) => {
  if (!(target instanceof Element)) return null;
  return target.closest<HTMLElement>("[data-action]");
};

app.addEventListener("click", (event) => {
  const control = actionFrom(event.target);
  if (!control) return;
  const action = control.dataset.action;

  if (action === "enter-test") enterTest();
  if (action === "open-draw") renderDraw();
  if (action === "go-home") renderHome();
  if (action === "start-new") startNew();
  if (action === "resume") resumeQuiz();
  if (action === "show-last-result") showSavedResult();
  if (action === "draw-card") drawPersonaFromCard(control);
  if (action === "draw-again") renderDraw();
  if (action === "open-directory") renderDirectory();
  if (action === "close-directory") {
    if (state.directoryReturnCode && state.result) {
      app.innerHTML = fullResultMarkup(state.result);
      mountWebDownloadLink();
      state.view = "result";
      scrollTop();
    } else {
      renderHome();
    }
  }
  if (action === "choose-option") {
    const optionId = control.dataset.option;
    if (optionId === "A" || optionId === "B" || optionId === "C") chooseOption(optionId);
  }
  if (action === "quiz-back") quizBack();
  if (action === "quit-quiz") renderHome();
  if (action === "preview-persona") {
    const code = control.dataset.code as ResultCode | undefined;
    if (code && RESULT_BY_CODE[code]) previewPersona(code);
  }
  if (action === "open-detail") {
    const kind = control.dataset.kind;
    const group = control.dataset.group === "recommended" ? "recommended" : "featured";
    const index = Number(control.dataset.index ?? "0");
    if ((kind === "architect" || kind === "building") && Number.isFinite(index)) {
      openDetail(kind, group, index, control);
    }
  }
  if (action === "close-detail") closeDetail();
  if (action === "web-download-feedback") {
    if (control.getAttribute("aria-disabled") === "true") {
      event.preventDefault();
      showToast("人格卡正在准备，请稍候");
    } else {
      showToast("人格卡已开始下载");
    }
  }
  if (action === "save-card") void saveCard();
  if (action === "post-note") void postNote();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.body.classList.contains("modal-open")) closeDetail();
});

renderHome();
