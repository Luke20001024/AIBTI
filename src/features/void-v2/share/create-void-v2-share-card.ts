import { withBasePath } from "../../../domain/paths";
import type { VoidV2Content } from "../content/void-v2-types";

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1350;

export const VOID_V2_SHARE_CARD_SIZE = {
  width: CARD_WIDTH,
  height: CARD_HEIGHT,
} as const;

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("VOID V2 share asset failed to load"));
    image.src = withBasePath(src);
  });

const drawCover = (
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
  const sourceY = (image.naturalHeight - sourceHeight) / 2;
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
};

const drawContain = (
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) => {
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  context.drawImage(image, x + width - drawWidth, y + height - drawHeight, drawWidth, drawHeight);
};

export async function createVoidV2ShareCard(
  hero: VoidV2Content["hero"],
  ending: VoidV2Content["ending"],
) {
  await document.fonts.ready;
  const [background, persona] = await Promise.all([
    loadImage(hero.background),
    loadImage(hero.persona),
  ]);

  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable");

  context.fillStyle = "#F1EEE5";
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  drawCover(context, background, 0, 0, CARD_WIDTH, CARD_HEIGHT);

  context.fillStyle = "#F1EEE5";
  context.fillRect(0, 0, 500, CARD_HEIGHT);
  context.fillStyle = "#0B0F16";
  context.font = '900 238px "Barlow Condensed", "Arial Narrow", sans-serif';
  context.fillText(hero.code, 58, 230);

  context.font = '900 96px "PingFang SC", "Microsoft YaHei", sans-serif';
  context.fillText(hero.title.slice(0, 3), 62, 360);
  context.fillText(hero.title.slice(3), 62, 460);

  context.font = '700 43px "PingFang SC", "Microsoft YaHei", sans-serif';
  context.fillText(ending.judgment[0], 62, 590);
  context.font = '500 38px "PingFang SC", "Microsoft YaHei", sans-serif';
  context.fillText(ending.judgment[1], 62, 656);
  context.fillText(ending.judgment[2], 62, 714);

  drawContain(context, persona, 355, 165, 725, 1185);

  context.fillStyle = "#1D4E85";
  context.font = '700 29px "PingFang SC", "Microsoft YaHei", sans-serif';
  context.fillText(hero.styles[0] + " ×", 62, 1095);
  context.fillText(hero.styles[1] + " ×", 62, 1140);
  context.fillText(hero.styles[2], 62, 1185);

  context.fillStyle = "#0B0F16";
  context.fillRect(62, 1250, 270, 3);
  context.font = '700 26px "Barlow Condensed", "Arial Narrow", sans-serif';
  context.fillText("ArcBTI · ARCHITECTURE IDENTITY", 62, 1302);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("VOID V2 share card generation failed"));
    }, "image/png");
  });
}
