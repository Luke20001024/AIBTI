# VOID V2 · G0 基线与隔离清单

> 状态：G0 已完成隔离与文件保护；视口截图矩阵待 G9 在 V2 测试环境补齐
>
> 记录日期：2026-08-27

## 1. 工作区关系

| 项目 | 当前 VOID 基线 | VOID V2 实施副本 |
| --- | --- | --- |
| 路径 | `C:\Users\Admin\Documents\ChatGPT\AIBTI` | `I:\ABTI\void-v2-app` |
| 分支 | `codex/v2-experience-rebuild` | `codex/void-v2-parallel` |
| 起始 HEAD | `c2b0e1d3bb4b7c5fdcdc709c88dbf6f6914f416a` | `c2b0e1d3bb4b7c5fdcdc709c88dbf6f6914f416a` |
| 建立隔离时状态 | 24 项既有未提交变更 | clean |
| 用途 | 只读现状参考、旧版回退点 | 仅新增 `/preview/void-v2/` 候选版 |

禁止把当前基线的脏状态提交、重置、清理或覆盖。所有 V2 开发只在实施副本中进行。

## 2. 当前旧版的已观察行为

- 正式结果地址：`/result/void/?from=share`；
- 人格代码：`VOID`；
- 人格标题：`寂静的边界`；
- 核心判断：`你偏爱被光切开的厚重边界，让空间先安静下来`；
- 代表建筑师：安藤忠雄；
- 三座主要作品：光之教堂、地中美术馆、水御堂；
- 主要操作：生成分享卡、复制公开链接、打开人物故事、打开空间细节、重新测试；
- 390 × 844 已观察首屏中，人物仍是建筑空间中的远景小比例尺，标题和十字光先于人物被识别；
- 当前 DOM 与视觉基线来自 2026-08-27 的只读检查；其余视口截图因应用内浏览器阻止重新访问本机地址，转入 G9 的项目内测试矩阵。

## 3. 受保护文件 SHA-256

下表的 `当前 VOID 基线` 是用户现有脏工作区的实际内容哈希；`V2 起始 HEAD` 是独立 worktree 建立时的仓库内容哈希。两列不同是建立 worktree 之前已经存在的用户改动，不属于 V2。

| 文件 | 当前 VOID 基线 | V2 起始 HEAD |
| --- | --- | --- |
| `src/app/result/[slug]/page.tsx` | `BBE4249E250C9F54DA5E19B71CBFBC4F565E3BACDE6738988B4BF01B59BC8B77` | `039BBE534F69085321C45BB604ECB0307B3D66E607F01C4C50BD27689B772ED9` |
| `src/components/result-identity-card.tsx` | `84557478FB4590DD5581E3E1E51516B9D21D026B638E79712F09AD3EEDE4F32E` | `MISSING` |
| `src/components/result-identity-card.module.css` | `50E9279D98F4B8BF559B1181F6DD5D6B85536FD0DFC57649B8C0144CD5AEDE78` | `MISSING` |
| `src/components/result-detail-sheets.tsx` | `CCF83C949C8A8002DF6341816A16E85F92A5086A9E54DAE4C25D695F59FAD3BD` | `4C264E50756E4F242357474023B8E338CDB3C352D11672C86D88586F5811228C` |
| `src/components/result-personalization.tsx` | `9B16C5DF123AB905135703172AD8481227614CA3CA447047ECF6AC1AA8CDDBC6` | `A0D4C35521957B93D73D61331004D7EDE6B326BB04232894FBD4A1279AAF0703` |
| `src/components/share-card.ts` | `95B9B41A33920CA746353087DC226604D1BEAAA311481BADCE08E908B136AD14` | `F3385D289D49E9AC03D6C6BB6FCB4771252E6A61DE7CA216D55475C42B5D622A` |
| `src/content/results.ts` | `934006E4E9B9F6521F0ED0E99E56B82A47E9E8C65DEBE04B1A881943BAD2D16A` | `9EEB7F3249F6D8B29978D58357648B2DCB6B9E08C378BC5650B7EB82E159CEDF` |
| `src/content/architects.ts` | `FC8C617A7E1D9F7C8E18F56F2104EA76AD3F7D8498C973D26DAFDEB9FBE19CE5` | `72A0ACE590895D0B5BEDD9953E3EABD7F23F7E2F8987F62EB4CD518F6A234F31` |
| `src/content/buildings.ts` | `9B9E4F2C51B37424E6AAD1E8284B39C5786207D92D7171CE96E3D7422CBE042D` | `A19585A6A471F5F119FD1988D90F9CB5B1C78499651EDC253715AA3C0A447E6E` |
| `src/content/schema.ts` | `E59ABF0B19A3B928EB898BC6AA4BD8AE7FD95BEF612B17DA78B47F96B6C54BB0` | `DCA497E2F65C352255116CAE581009044A0038140234F66C2307A8F589D66486` |
| `src/app/globals.css` | `66E6D557E8C3FC63BCC16BB1B742434A2A145FE1DB0D8B5571F2EDAAA195FBD7` | `3B07D3193ED0590189B660C1A5DDC00D6814E6C8BE63FA3536EAC34B69B8BEC3` |
| `tests/e2e/result-gallery.spec.ts` | `983522E3941E7B748D83FAB54AB46A8554385B81EBA0EAE047992B1580BB64AA` | `3C7041B75FE5D46FB11D2E34D624BE9497F48CFB9F7FB54F0C80045CC29A516E` |
| `tests/e2e/mobile-layout.spec.ts` | `54D934D884268FEB536EE23F1A1E5E558C31943C9D34C69856FC011BAF75B5A6` | `D32522C0C1545BD5B83B37EC3B622560782E47C15EB81762C2DA8C8E12295D2B` |
| `tests/e2e/share-cards.spec.ts` | `16D1EF12F4E655706066F42C23E64E3257BFD7EC3AAD5942EC09B889A7A1F995` | `81FC9E6ADF72F4D501365B7DF729A65B4020BF4681DD690CE6A31C98252F4833` |

## 4. V2 的保护规则

第一轮不允许修改以上文件，也不允许在旧结果页加入 VOID V2 条件分支。V2 可以只读导入稳定能力，但所有人物、内容、样式、交互、分享与测试必须位于新的 `void-v2` feature tree 中。

每次阶段门 Review 都执行：

1. `git diff --` 检查受保护文件；
2. 对存在于 V2 worktree 的受保护文件重新计算 SHA-256；
3. 确认新变更仅位于 `/preview/void-v2/`、`src/features/void-v2/`、`public/images/void-v2/`、`docs/design/void-v2/` 和 V2 专属测试文件；
4. 如出现受保护文件 diff，阶段门立即失败。

## 5. G0 结论

- 独立 worktree：已建立；
- 独立 branch：已建立；
- 原项目受保护文件：临时预览启动前后全部一致；
- V2 路由与文件：尚未创建；
- 旧版迁移：未授权；
- 下一阶段：G1 概念、图片、Copy lock 与 Asset inventory 冻结。
