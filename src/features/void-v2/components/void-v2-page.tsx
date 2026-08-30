import { VOID_V2_CONTENT } from "../content/void-v2-content";
import { VoidV2Hero } from "./void-v2-hero";
import { VoidV2ShareEnding } from "./void-v2-share-ending";
import { VoidV2Story } from "./void-v2-story";
import styles from "./void-v2.module.css";

export function VoidV2Page() {
  return (
    <main className={[styles.page, styles.v7Page].join(" ")} data-void-v2-page>
      <VoidV2Hero content={VOID_V2_CONTENT.hero} />
      <VoidV2Story content={VOID_V2_CONTENT} />
      <VoidV2ShareEnding hero={VOID_V2_CONTENT.hero} content={VOID_V2_CONTENT.ending} />
    </main>
  );
}
