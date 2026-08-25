import type { Question } from "./schema";

export const QUESTIONS: readonly Question[] = [
  {
    id: "Q01",
    order: 1,
    kind: "projective",
    eyebrow: "潜意识施工 · 01",
    prompt: "半夜醒来，墙上多了一扇门。你觉得门后是？",
    options: [
      { id: "A", label: "一条灯亮得过分整齐的长廊", weights: { ORDER: 1, GEOMETRY: 0.9, EXPRESS: -0.4 } },
      { id: "B", label: "一座刚下过雨的野花园", weights: { GEOMETRY: -1, CONTEXT: 0.9 } },
      { id: "C", label: "正在非法加班的机器核心", weights: { RISK: 0.9, MAKING: -0.8, TIME: -1 } },
    ],
  },
  {
    id: "Q02",
    order: 2,
    kind: "projective",
    eyebrow: "潜意识施工 · 02",
    prompt: "一块空地借你一下午，你会？",
    options: [
      { id: "A", label: "先画网格，空地也得讲规矩", weights: { ORDER: 1, GEOMETRY: 1 } },
      { id: "B", label: "躺到树影移动完再说", weights: { GEOMETRY: -0.8, CONTEXT: 1, EXPRESS: -0.4 } },
      { id: "C", label: "捡废料搭个不知道干嘛的东西", weights: { MAKING: 1, TIME: 0.8, RISK: 0.6 } },
    ],
  },
  {
    id: "Q03",
    order: 3,
    kind: "projective",
    eyebrow: "潜意识施工 · 03",
    prompt: "梦里的城市只剩一种声音。",
    options: [
      { id: "A", label: "节拍器。谁乱拍谁出局", weights: { ORDER: 1, EXPRESS: -0.8 } },
      { id: "B", label: "水声和树叶，路自己会长出来", weights: { GEOMETRY: -0.9, CONTEXT: 0.9 } },
      { id: "C", label: "电机升频，感觉马上要起飞", weights: { RISK: 0.8, EXPRESS: 0.7, TIME: -1 } },
    ],
  },
  {
    id: "Q04",
    order: 4,
    kind: "projective",
    eyebrow: "潜意识施工 · 04",
    prompt: "陌生聚会，你先找到什么？",
    options: [
      { id: "A", label: "最安静的边角，顺便观察动线", weights: { SOCIAL: -1, EXPRESS: -0.8, ORDER: 0.4 } },
      { id: "B", label: "一张能把散人拢起来的大桌", weights: { SOCIAL: 1, CONTEXT: 0.7 } },
      { id: "C", label: "话筒。没有也可以想办法变出来", weights: { EXPRESS: 1, RISK: 0.6, SOCIAL: 0.8 } },
    ],
  },
  {
    id: "Q05",
    order: 5,
    kind: "projective",
    eyebrow: "潜意识施工 · 05",
    prompt: "世界末日前，你只留一间房。",
    options: [
      { id: "A", label: "一束光、一面墙。别再加了", weights: { EXPRESS: -1, ORDER: 0.8, SOCIAL: -0.4 } },
      { id: "B", label: "有厨房和院子的公共客厅", weights: { SOCIAL: 1, CONTEXT: 1, GEOMETRY: -0.5 } },
      { id: "C", label: "全城最后一间还在运转的控制室", weights: { RISK: 0.8, MAKING: -0.9, TIME: -1 } },
    ],
  },
  {
    id: "Q06",
    order: 6,
    kind: "projective",
    eyebrow: "潜意识施工 · 06",
    prompt: "捡到一块来历不明的材料。",
    options: [
      { id: "A", label: "测量、编号、归档", weights: { ORDER: 1, GEOMETRY: 0.7 } },
      { id: "B", label: "摸摸纹理，猜它以前是谁家屋顶", weights: { MAKING: 1, TIME: 1, CONTEXT: 0.7 } },
      { id: "C", label: "直接做破坏性试验", weights: { RISK: 1, EXPRESS: 0.6, TIME: -0.7 } },
    ],
  },
  {
    id: "Q07",
    order: 7,
    kind: "personality",
    eyebrow: "日常人格 · 07",
    prompt: "旅行计划突然全变了。",
    options: [
      { id: "A", label: "原计划是承重墙，不能拆", weights: { ORDER: 1, RISK: -0.7 } },
      { id: "B", label: "看天气和街道，临时改线", weights: { ORDER: -0.8, CONTEXT: 0.8, RISK: 0.5 } },
      { id: "C", label: "先问大家谁饿了", weights: { SOCIAL: 1, CONTEXT: 0.6 } },
    ],
  },
  {
    id: "Q08",
    order: 8,
    kind: "personality",
    eyebrow: "日常人格 · 08",
    prompt: "房间乱到找不到桌面。",
    options: [
      { id: "A", label: "立刻归位，最好误差不超过一毫米", weights: { ORDER: 1, GEOMETRY: 0.7 } },
      { id: "B", label: "乱得挺有生活痕迹，先留着", weights: { ORDER: -0.7, TIME: 0.8, MAKING: 0.5 } },
      { id: "C", label: "摆得更夸张，命名为《星期二》", weights: { EXPRESS: 1, RISK: 0.7 } },
    ],
  },
  {
    id: "Q09",
    order: 9,
    kind: "personality",
    eyebrow: "日常人格 · 09",
    prompt: "观点冲突时，你通常？",
    options: [
      { id: "A", label: "上证据、结构和编号", weights: { ORDER: 0.9, EXPRESS: -0.6 } },
      { id: "B", label: "去现场，听听人到底怎么用", weights: { CONTEXT: 1, SOCIAL: 0.8 } },
      { id: "C", label: "做个模型，再戏剧性地掀开幕布", weights: { EXPRESS: 1, MAKING: 0.6, SOCIAL: 0.5 } },
    ],
  },
  {
    id: "Q10",
    order: 10,
    kind: "personality",
    eyebrow: "日常人格 · 10",
    prompt: "截止日期只剩一天。",
    options: [
      { id: "A", label: "拆任务、锁版本、按表推进", weights: { ORDER: 1, MAKING: -0.6 } },
      { id: "B", label: "靠手感慢慢磨准，谁催谁等", weights: { MAKING: 1, TIME: 0.7 } },
      { id: "C", label: "咖啡、曲线和奇迹", weights: { RISK: 1, EXPRESS: 0.9, TIME: -0.7 } },
    ],
  },
  {
    id: "Q11",
    order: 11,
    kind: "personality",
    eyebrow: "日常人格 · 11",
    prompt: "社交电量只剩 5%。",
    options: [
      { id: "A", label: "独处充电，请勿敲门", weights: { SOCIAL: -1, EXPRESS: -0.7 } },
      { id: "B", label: "三五个人吃顿慢饭", weights: { SOCIAL: 0.8, CONTEXT: 0.8 } },
      { id: "C", label: "还是去现场，然后突然开始表演", weights: { SOCIAL: 0.7, EXPRESS: 1, RISK: 0.6 } },
    ],
  },
  {
    id: "Q12",
    order: 12,
    kind: "personality",
    eyebrow: "日常人格 · 12",
    prompt: "收到哪份礼物最开心？",
    options: [
      { id: "A", label: "一件精密工具", weights: { ORDER: 0.8, MAKING: -0.8, TIME: -0.6 } },
      { id: "B", label: "一件有来历的手作旧物", weights: { MAKING: 1, TIME: 1, CONTEXT: 0.6 } },
      { id: "C", label: "一张去未知地点的票", weights: { RISK: 1, EXPRESS: 0.5, ORDER: -0.6 } },
    ],
  },
  {
    id: "Q13",
    order: 13,
    kind: "aesthetic",
    eyebrow: "建筑直觉 · 13",
    prompt: "哪栋楼最像你今天的精神状态？",
    options: [
      { id: "A", label: "玻璃、钢和不许插队的网格", visual: "grid", weights: { GEOMETRY: 1, ORDER: 1, MAKING: -0.8 } },
      { id: "B", label: "一块很重、但很可靠的混凝土", visual: "mass", weights: { GEOMETRY: 0.8, EXPRESS: -0.5, SOCIAL: 0.4 } },
      { id: "C", label: "像刚从地面逃走的连续曲面", visual: "flow", weights: { GEOMETRY: -0.8, RISK: 1, TIME: -0.9 } },
    ],
  },
  {
    id: "Q14",
    order: 14,
    kind: "aesthetic",
    eyebrow: "建筑直觉 · 14",
    prompt: "哪个空间让你愿意多待十分钟？",
    options: [
      { id: "A", label: "一道切进暗室的光", visual: "light", weights: { EXPRESS: -1, ORDER: 0.7, SOCIAL: -0.6 } },
      { id: "B", label: "大家围着一棵树坐的院子", visual: "courtyard", weights: { GEOMETRY: -0.8, CONTEXT: 1, SOCIAL: 0.9 } },
      { id: "C", label: "彩砖、旋转楼梯和一点失控", visual: "ornament", weights: { EXPRESS: 1, MAKING: 0.8, RISK: 0.4 } },
    ],
  },
  {
    id: "Q15",
    order: 15,
    kind: "aesthetic",
    eyebrow: "建筑直觉 · 15",
    prompt: "伸手摸墙，你希望摸到？",
    options: [
      { id: "A", label: "冷静到能反光的钢和玻璃", visual: "steel", weights: { MAKING: -1, TIME: -1, ORDER: 0.6 } },
      { id: "B", label: "边缘不齐的旧砖和夯土", visual: "earth", weights: { MAKING: 1, TIME: 1, CONTEXT: 0.8 } },
      { id: "C", label: "还留着模板缝的混凝土", visual: "concrete", weights: { GEOMETRY: 0.7, ORDER: 0.8, EXPRESS: -0.5 } },
    ],
  },
  {
    id: "Q16",
    order: 16,
    kind: "aesthetic",
    eyebrow: "建筑直觉 · 16",
    prompt: "你会留下哪扇窗？",
    options: [
      { id: "A", label: "一条连续、水平、很守纪律的窗", visual: "ribbon", weights: { ORDER: 1, GEOMETRY: 0.9 } },
      { id: "B", label: "几扇专门框住树和屋顶的窗", visual: "framed", weights: { CONTEXT: 1, GEOMETRY: -0.7 } },
      { id: "C", label: "一整面让天气闯进来的巨窗", visual: "giant", weights: { EXPRESS: 0.9, RISK: 0.8 } },
    ],
  },
  {
    id: "Q17",
    order: 17,
    kind: "aesthetic",
    eyebrow: "建筑直觉 · 17",
    prompt: "城市送你一块地，你先做？",
    options: [
      { id: "A", label: "一座能复制、升级、维护的模块塔", visual: "module", weights: { ORDER: 0.9, GEOMETRY: 0.9, MAKING: -0.9, TIME: -0.7 } },
      { id: "B", label: "先修补旧巷、院落和邻里关系", visual: "repair", weights: { CONTEXT: 1, MAKING: 0.9, TIME: 1, SOCIAL: 1 } },
      { id: "C", label: "把屋顶和地面卷成一座公园", visual: "landscape", weights: { GEOMETRY: -0.8, RISK: 0.9, SOCIAL: 0.7 } },
    ],
  },
  {
    id: "Q18",
    order: 18,
    kind: "aesthetic",
    eyebrow: "建筑直觉 · 18",
    prompt: "哪种“不完美”最能忍？",
    options: [
      { id: "A", label: "网格歪了一毫米——等等，我不能忍", visual: "misalign", weights: { ORDER: 1, GEOMETRY: 0.9 } },
      { id: "B", label: "旧材料继续开裂、长苔、变颜色", visual: "weather", weights: { MAKING: 1, TIME: 1, CONTEXT: 0.7 } },
      { id: "C", label: "曲面暂时造不出来，但概念先飞", visual: "impossible", weights: { RISK: 1, EXPRESS: 0.8, TIME: -0.9 } },
    ],
  },
] as const;

if (QUESTIONS.length !== 18) {
  throw new Error("The MVP contract requires exactly 18 questions.");
}
