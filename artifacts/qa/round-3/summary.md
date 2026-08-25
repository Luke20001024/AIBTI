# AIBTI V2 视觉验收 Round 3

日期：2026-08-26

## 本轮目标

对静态导出后的 `/AIBTI/` 产物进行全八型长页复核，确认人物场景、建筑师肖像、代表建筑与两座延伸建筑在手机结果页中完整加载，并检查内容密度、裁切和横向溢出

## 覆盖范围

- 视口：Android Chromium 393 × 873，保留真实设备项目 DPR
- 入口：`/AIBTI/result/{slug}/?from=share`
- 人格：GRID、ROOT、MASS、VOID、TECH、FLOW、ORNA、HAND
- 每页图像：1 张人物场景、1 张建筑师肖像、1 张代表建筑、2 张延伸建筑
- 页面状态：Shared 公共人格设定，不读取本机答案或个性化维度

## 自动检查

- `pnpm verify:pages` 先以 `/AIBTI/` basePath 重建 `out/`，再通过仓库内置静态服务器执行 Playwright
- 最终 8 项目矩阵共 64 个用例槽位，38 通过、26 按项目职责跳过
- iPhone 390 WebKit、Android 393 Chromium 与 HarmonyOS User-Agent 代理均走通 18 题、显式提交、计算与 Owner 结果
- 计算页答案只存在于 URL fragment，自动检查确认带答案参数没有进入 document 请求
- 八个结果页均完成静态路由加载
- 每页 5 张内容图片均取得非零自然宽度，共检查 40 张页面图片
- 八页均未出现 `.media-fallback`
- 八页 `documentElement.scrollWidth - innerWidth ≤ 1px`
- Playwright 用例 `八型结果页的身份映射、图片资源与布局均完整` 通过
- 52 项 Vitest 单元测试通过

## 视觉复核结论

- 八型人物均使用接近建筑的 6:5 场景，人物与建筑关系清晰，手机端没有 v1 主图两侧大面积留白
- GRID、VOID、TECH 保持冷静或克制，ROOT 与 HAND 更温和，FLOW、MASS、ORNA 分别呈现冒险、强硬与夸张状态，性格差异没有被统一成同一套酷感
- 人格代码、中文称号、专属台词、人物动作和建筑背景在首屏形成单一识别焦点
- 建筑师与作品内容维持高密度短段落，来源后置，不抢占人格揭晓首屏
- 八位／组建筑师肖像和 24 张建筑图均在最终页面中可见，未发现明显拉伸、关键主体完全被裁掉或文字覆盖图像
- 结果页主要图片铺满内容宽度，延伸建筑采用紧凑图文行，长页节奏一致
- 页面仍属于自动设备视口与人工截图复核，不替代真实 Android、微信或 HarmonyOS 浏览器验收

## 证据文件

- `result-grid-393x873.png`
- `result-root-393x873.png`
- `result-mass-393x873.png`
- `result-void-393x873.png`
- `result-tech-393x873.png`
- `result-flow-393x873.png`
- `result-orna-393x873.png`
- `result-hand-393x873.png`

截图文件只作为本地验收证据，不进入 Git 仓库；本摘要进入版本记录
