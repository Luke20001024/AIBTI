"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  DIMENSIONS,
  DIMENSION_IDS,
  QUESTIONS,
  RESULT_BY_CODE,
  type DimensionVector,
  type ResultType,
} from "../content";
import { decodeAnswers, scoreQuiz, type QuizResult } from "../domain/scoring";
import { track } from "../domain/analytics";
import { withBasePath } from "../domain/paths";
import { clearQuizSession } from "../domain/session";

type Props = { result: ResultType };

const EMPTY_SCORES = Object.fromEntries(DIMENSION_IDS.map((id) => [id, 0])) as DimensionVector;

const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = reject;
  image.src = src;
});

const roundedRect = (context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
  context.fill();
};

const createShareCard = async (result: ResultType, secondaryName: string) => {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable");

  context.fillStyle = "#f2efe7";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = result.accent;
  context.fillRect(0, 0, 28, canvas.height);

  context.fillStyle = result.accent;
  context.font = '900 66px "Arial Narrow", Arial, sans-serif';
  context.fillText("AIBTI", 80, 106);
  context.fillStyle = result.ink;
  context.font = '900 156px "Arial Narrow", Arial, sans-serif';
  context.fillText(result.code, 72, 270);
  context.font = '900 76px "PingFang SC", "Microsoft YaHei", sans-serif';
  context.fillText(result.name, 76, 360);
  context.font = '600 32px "PingFang SC", "Microsoft YaHei", sans-serif';
  context.fillText(result.tagline, 78, 416);

  context.fillStyle = result.accentSoft;
  roundedRect(context, 62, 462, 956, 610, 12);

  try {
    const image = await loadImage(withBasePath(result.characterImage));
    const scale = Math.min(900 / image.width, 580 / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    context.drawImage(image, 540 - width / 2, 478 + 580 - height, width, height);
  } catch {
    context.fillStyle = result.accent;
    context.beginPath();
    context.arc(540, 650, 94, 0, Math.PI * 2);
    context.fill();
    context.fillRect(402, 752, 276, 248);
    context.fillStyle = result.ink;
    context.font = '900 34px "PingFang SC", "Microsoft YaHei", sans-serif';
    context.fillText("人物形象施工中", 410, 1030);
  }

  context.fillStyle = result.ink;
  context.font = '800 28px "PingFang SC", "Microsoft YaHei", sans-serif';
  context.fillText(result.school, 76, 1135);
  context.font = '500 25px "PingFang SC", "Microsoft YaHei", sans-serif';
  context.fillStyle = "#56595a";
  context.fillText(`你的相邻人格：${secondaryName}`, 76, 1186);
  context.fillText(result.keywords.map((item) => `#${item}`).join("  "), 76, 1230);
  context.font = '600 22px "PingFang SC", "Microsoft YaHei", sans-serif';
  context.fillText("18 道题，找到与你同频的建筑师和代表建筑", 76, 1294);
  context.textAlign = "right";
  context.fillStyle = result.accent;
  context.fillText("分享时记得附上结果链接", 1004, 1294);

  return canvas.toDataURL("image/jpeg", 0.9);
};

export function ResultPersonalization({ result }: Props) {
  const searchParams = useSearchParams();
  const encoded = searchParams.get("a");
  const [scored, setScored] = useState<QuizResult | null>(null);
  const [shareImage, setShareImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    track("result_view", { resultCode: result.code });
    try {
      if (!encoded) return;
      const value = scoreQuiz(decodeAnswers(encoded));
      if (value.primaryTypeId === result.code) setScored(value);
    } catch {
      setScored(null);
    }
  }, [encoded, result.code]);

  const secondary = RESULT_BY_CODE[scored?.secondaryTypeId ?? result.code];
  const scores = scored?.dimensionScores ?? EMPTY_SCORES;
  const evidence = useMemo(
    () => (scored?.evidenceQuestionIds ?? []).map((id) => QUESTIONS.find((question) => question.id === id)).filter(Boolean),
    [scored],
  );

  const openShare = async () => {
    track("share_click", { method: "card_preview", resultCode: result.code });
    setBusy(true);
    setNotice("");
    try {
      const dataUrl = await createShareCard(result, scored ? secondary.name : "完成测试后揭晓");
      setShareImage(dataUrl);
    } catch (error) {
      if ((error as Error).name !== "AbortError") setNotice("分享卡生成失败，请稍后重试。此结果链接仍可直接复制。 ");
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async () => {
    track("share_click", { method: "copy_link", resultCode: result.code });
    try {
      await navigator.clipboard.writeText(window.location.href);
      setNotice("结果链接已复制。");
    } catch {
      setNotice("请使用浏览器菜单复制当前链接。");
    }
  };

  const downloadCard = () => {
    if (!shareImage) return;
    track("card_save", { method: "download", resultCode: result.code });
    const anchor = document.createElement("a");
    anchor.download = `AIBTI-${result.code}.jpg`;
    anchor.href = shareImage;
    anchor.click();
  };

  const nativeShare = async () => {
    if (!shareImage) return;
    try {
      const response = await fetch(shareImage);
      const blob = await response.blob();
      const file = new File([blob], `AIBTI-${result.code}.jpg`, { type: "image/jpeg" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        track("share_click", { method: "native", resultCode: result.code });
        await navigator.share({ title: `我的建筑人格是 ${result.name}`, text: result.tagline, files: [file], url: window.location.href });
      } else {
        downloadCard();
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") setNotice("系统分享没有打开，请长按图片保存，或直接下载。 ");
    }
  };

  return (
    <>
      <section className="section" id="result-coordinates">
        <p className="section-kicker">你的建筑坐标</p>
        <h2 className="section-title">不是一个孤岛，<br />你旁边还站着谁？</h2>
        {scored ? (
          <div className="sidewing">
            <b>{scored.clarity === "clear" ? "倾向清晰" : scored.clarity === "balanced" ? "双重倾向" : "混合型人格"}</b>
            <p>主型是 {result.code}，最接近的相邻人格是 <a href={withBasePath(`/result/${secondary.slug}/`)}>{secondary.code} · {secondary.name}</a>。人格不是诊断，也不代表你必须喜欢该建筑师的全部作品。</p>
          </div>
        ) : (
          <div className="sidewing"><b>结果样本页</b><p>这个链接没有附带完整答案，所以只展示 {result.code} 的标准画像。完成测试后会出现你的个人维度与相邻人格。</p></div>
        )}

        <div className="dimension-list" aria-label="八维建筑倾向">
          {DIMENSION_IDS.map((id) => {
            const dimension = DIMENSIONS[id];
            const value = scores[id];
            const left = value < 0 ? 50 + value * 50 : 50;
            const width = Math.abs(value) * 50;
            return (
              <div className="dimension-row" key={id}>
                <span>{dimension.name}</span>
                <div className="dimension-track" title={`${dimension.negative} ↔ ${dimension.positive}`}>
                  <span className="dimension-value" style={{ left: `${left}%`, width: `${width}%` }} />
                </div>
                <span className="dimension-pole">{value < 0 ? dimension.negative : value > 0 ? dimension.positive : "中间"}</span>
              </div>
            );
          })}
        </div>

        {evidence.length > 0 && (
          <div className="evidence-box">
            <b>把你推到这里的三次直觉</b>
            <ol>{evidence.map((question) => <li key={question!.id}>{question!.prompt}</li>)}</ol>
          </div>
        )}
      </section>

      <div className="sticky-actions">
        <div className="button-row">
          <button className="primary-button" type="button" onClick={openShare} disabled={busy}>{busy ? "正在出图…" : "生成分享卡"}</button>
          <button className="secondary-button" type="button" onClick={copyLink}>复制结果链接</button>
        </div>
        {notice && <p className="action-notice" role="status">{notice}</p>}
      </div>

      {shareImage && (
        <div className="share-preview-backdrop" role="dialog" aria-modal="true" aria-label="分享卡预览">
          <div className="share-preview-head"><span>微信内请长按图片保存</span><button type="button" onClick={() => setShareImage(null)}>关闭 ×</button></div>
          <img className="share-preview-image" src={shareImage} alt={`${result.name} AIBTI 分享卡`} />
          <div className="share-preview-actions">
            <button className="secondary-button" type="button" onClick={nativeShare}>系统分享 / 下载</button>
            <button className="secondary-button" type="button" onClick={copyLink}>复制链接</button>
          </div>
        </div>
      )}

      <a className="restart-link" href={withBasePath("/quiz/")} onClick={() => { track("retest_click", { resultCode: result.code }); clearQuizSession(); }}>重新测试</a>
    </>
  );
}
