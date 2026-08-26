import type { Architect, Building, ResultType } from "../content";
import { withBasePath } from "../domain/paths";

export const SHARE_CARD_WIDTH = 1080;
export const SHARE_CARD_HEIGHT = 1350;

type ShareCardInput = {
  result: ResultType;
  architect: Architect;
  building: Building;
  publicUrl: string;
};

const loadImage = async (src: string) => {
  const image = new Image();
  image.decoding = "async";
  image.src = src;
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`Unable to load ${src}`));
  });
  return image;
};

const drawImageCover = (
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) => {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (image.naturalWidth - sourceWidth) / 2;
  // 人物图的视觉重心通常在上半部，向上偏移能避免横幅裁切掉头部和表情
  const sourceY = Math.max(0, (image.naturalHeight - sourceHeight) * 0.24);
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
};

const wrapText = (
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) => {
  const lines: string[] = [];
  let line = "";
  for (const character of text) {
    const next = line + character;
    if (line && context.measureText(next).width > maxWidth) {
      lines.push(line);
      line = character;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
};

export async function createShareCard({ result, architect, building, publicUrl }: ShareCardInput) {
  await Promise.all([
    document.fonts?.load('900 180px "Barlow Condensed"'),
    document.fonts?.load('800 64px "PingFang SC"'),
  ]).catch(() => undefined);

  const canvas = document.createElement("canvas");
  canvas.width = SHARE_CARD_WIDTH;
  canvas.height = SHARE_CARD_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable");

  context.fillStyle = "#f2efe7";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = result.accent;
  context.fillRect(0, 0, 24, canvas.height);

  context.fillStyle = "#121313";
  context.font = '900 54px "Barlow Condensed", "Arial Narrow", sans-serif';
  context.fillText("Arc", 64, 86);
  const arcWidth = context.measureText("Arc").width;
  context.fillStyle = result.accent;
  context.fillText("B", 64 + arcWidth, 86);
  const bWidth = context.measureText("B").width;
  context.fillStyle = "#121313";
  context.fillText("TI", 64 + arcWidth + bWidth, 86);

  context.fillStyle = result.accent;
  context.font = '800 25px "PingFang SC", "Microsoft YaHei", sans-serif';
  context.fillText("我的建筑母语", 66, 142);
  context.fillStyle = "#121313";
  context.font = '900 176px "Barlow Condensed", "Arial Narrow", sans-serif';
  context.fillText(result.code, 58, 300);
  context.font = '800 72px "PingFang SC", "Microsoft YaHei", sans-serif';
  context.fillText(result.architectureLanguage, 64, 384);

  context.font = '650 29px "PingFang SC", "Microsoft YaHei", sans-serif';
  const summaryLines = wrapText(context, result.languageSummary, 900).slice(0, 2);
  summaryLines.forEach((line, index) => context.fillText(line, 66, 430 + index * 40));

  try {
    const image = await loadImage(withBasePath(result.characterImage));
    drawImageCover(context, image, 24, 510, 1056, 558);
  } catch {
    context.fillStyle = result.accentSoft;
    context.fillRect(24, 510, 1056, 558);
    context.strokeStyle = result.accent;
    context.lineWidth = 2;
    for (let x = 24; x <= 1080; x += 80) {
      context.beginPath();
      context.moveTo(x, 510);
      context.lineTo(x, 1068);
      context.stroke();
    }
  }

  context.fillStyle = "rgba(242,239,231,.94)";
  context.fillRect(52, 994, 560, 50);
  context.fillStyle = "#121313";
  context.font = '900 28px "Barlow Condensed", "Arial Narrow", sans-serif';
  context.fillText(`${result.code} / ${result.name}`, 68, 1029);

  context.strokeStyle = "#bbb6aa";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(64, 1108);
  context.lineTo(1016, 1108);
  context.stroke();

  context.font = '800 27px "PingFang SC", "Microsoft YaHei", sans-serif';
  context.fillStyle = "#121313";
  context.fillText(`代表建筑师  ${architect.name}`, 64, 1160);
  context.fillText(`代表建筑  ${building.name}`, 64, 1206);

  context.font = '650 24px "PingFang SC", "Microsoft YaHei", sans-serif';
  context.fillStyle = "#66645f";
  context.fillText(result.keywords.map((keyword) => `#${keyword}`).join("   "), 64, 1262);
  context.fillStyle = result.accent;
  context.font = '800 27px "PingFang SC", "Microsoft YaHei", sans-serif';
  context.fillText("测测你的建筑直觉", 64, 1312);

  const qrCanvas = document.createElement("canvas");
  const { toCanvas } = await import("qrcode");
  await toCanvas(qrCanvas, publicUrl, {
    width: 158,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#121313", light: "#f2efe7" },
  });
  context.fillStyle = "#f2efe7";
  context.fillRect(842, 1132, 174, 174);
  context.drawImage(qrCanvas, 850, 1140, 158, 158);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Share card export failed")), "image/jpeg", 0.88);
  });

  return { blob, width: canvas.width, height: canvas.height };
}
