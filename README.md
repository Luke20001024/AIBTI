# ArcBTI｜建筑直觉测试

ArcBTI 是一个移动端优先的建筑人格测试：18 道核心题在结果接近时追加最多 2 道辨析题，生成 16 种建筑人格之一，并通过代表建筑师、5 座真实建筑与可展开档案解释结果

线上站点：<https://luke20001024.github.io/AIBTI/>

## 本地运行

要求 Node.js 22 与 pnpm 11

```bash
pnpm install --frozen-lockfile
pnpm dev
```

开发地址默认为 `http://127.0.0.1:3000/`

## GitHub Pages 静态预览

项目使用 Next.js static export，正式部署的 base path 是 `/AIBTI`

```bash
pnpm verify:pages -- --project=android-393-chromium
```

这条命令会：

1. 以 `/AIBTI` 子路径生成 41 个静态页面
2. 在 `127.0.0.1:4173` 启动静态服务器
3. 运行与 GitHub Actions 一致的 Android 393 发布门禁

完整本地浏览器矩阵：

```bash
pnpm verify:pages
```

覆盖 iPhone WebKit 375/390/430、Android Chromium 360/393/412、390×700 短屏和 HarmonyOS 用户代理

## 质量检查

```bash
pnpm typecheck
pnpm test
pnpm verify:pages -- --project=android-393-chromium
```

当前交付合同包括：

- 16/16 人格结果页和来源页可静态直达刷新
- 80/80 建筑档案使用真实建筑照片，每座保有 2–3 张图
- 205 张建筑图片跨项目感知哈希重复 0 项
- 所有内容图片保持固有比例，不使用 `cover` 裁切
- 人物、建筑 Sheet 支持触摸、键盘 Escape、焦点回归与背景滚动恢复
- 重测同时清除 localStorage 与 sessionStorage，并从第 1 题开始
- 公开结果 URL 不包含答题明细

## 目录

- `src/app/`：Next.js 静态路由
- `src/content/`：16 人格、建筑师、80 建筑、问题与评分内容
- `src/features/result-v7/`：当前统一结果页
- `public/images/personas/`：人格首屏 WebP 展示图与 PNG 下载原稿
- `public/images/buildings/`：建筑主图与画廊图
- `tests/e2e/`：移动端跨浏览器与静态子路径回归
- `docs/design/persona-expansion-16-v1/`：最终规划、来源登记和验收报告

## 部署

推送到 `main` 后，[`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) 会自动执行类型检查、单元测试、Android 393 静态 Pages 验收，并将 `out/` 发布到 GitHub Pages

## 素材说明

建筑与人物资料来源集中列在各结果页的“查看资料与图片来源”页面及设计登记文件中。当前原型已记录来源，但不等同于完成商业授权；公开商业使用前仍需逐张复核图片许可、署名和使用范围
