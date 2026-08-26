import type { Question } from "./schema";

export const QUESTIONS: readonly Question[] = [
  {
    id: "Q01",
    order: 1,
    kind: "projective",
    eyebrow: "潜意识施工 · 01",
    prompt: "半夜醒来，家里多出一道楼梯，你觉得它通向哪里？",
    options: [
      { id: "A", label: "只亮着一盏灯的空房间", weights: { EXPRESS: -0.8, SOCIAL: -0.8, GEOMETRY: 0.3 } },
      { id: "B", label: "屋顶上正在长大的花园", weights: { EXPRESS: -0.1, SOCIAL: 0.5, GEOMETRY: -1, CONTEXT: 0.9 } },
      { id: "C", label: "一座还没通电的未来车站", weights: { EXPRESS: 0.9, SOCIAL: 0.3, GEOMETRY: 0.7, CONTEXT: -0.9 } },
    ],
  },
  {
    id: "Q02",
    order: 2,
    kind: "projective",
    eyebrow: "潜意识施工 · 02",
    prompt: "一块空地借你一个下午，你会留下什么？",
    options: [
      { id: "A", label: "一张谁路过都能坐的大桌", weights: { ORDER: 0.6, GEOMETRY: 0.7, EXPRESS: 0.1, SOCIAL: 1, RISK: -0.4 } },
      { id: "B", label: "一架会随风转、谁都能碰一下的装置", weights: { ORDER: -1, GEOMETRY: -1, EXPRESS: 0.8, SOCIAL: -0.3, RISK: 0.5 } },
      { id: "C", label: "一条下午四点才出现的光影刻度", weights: { ORDER: 0.7, GEOMETRY: 0.7, EXPRESS: -0.7, SOCIAL: -0.6, RISK: -0.3 } },
    ],
  },
  {
    id: "Q03",
    order: 3,
    kind: "projective",
    eyebrow: "潜意识施工 · 03",
    prompt: "梦里的城市只剩一种声音，你选哪个？",
    options: [
      { id: "A", label: "瓷片、铜铃和人声叠在一起", weights: { MAKING: 0.6, EXPRESS: 0.9, SOCIAL: 0.5, CONTEXT: 0.3, RISK: 0.3 } },
      { id: "B", label: "雨落在旧瓦上，偶尔混进鸟叫", weights: { TIME: 0.8, MAKING: 0.7, EXPRESS: -0.3, SOCIAL: -0.1, CONTEXT: 0.7, RISK: -0.4 } },
      { id: "C", label: "夜里的电梯、风机和轨道低声合奏", weights: { TIME: -0.7, MAKING: -0.8, EXPRESS: -0.6, SOCIAL: -0.4, CONTEXT: -0.7, RISK: 0.1 } },
    ],
  },
  {
    id: "Q04",
    order: 4,
    kind: "projective",
    eyebrow: "潜意识施工 · 04",
    prompt: "陌生聚会里，哪处空间先把你吸过去？",
    options: [
      { id: "A", label: "摆满半成品、谁都能搭手的长桌", weights: { SOCIAL: 0.7, MAKING: 0.6, ORDER: -0.5, CONTEXT: 0.4, TIME: 0.4 } },
      { id: "B", label: "门边刚好能看清全场的暗角", weights: { SOCIAL: -0.8, MAKING: -0.4, EXPRESS: -0.7, ORDER: 0.7 } },
      { id: "C", label: "正好能把一句话讲给全场的楼梯平台", weights: { SOCIAL: 0.2, EXPRESS: 0.8, ORDER: -0.3, MAKING: 0.4, RISK: 0.5, CONTEXT: 0.2 } },
    ],
  },
  {
    id: "Q05",
    order: 5,
    kind: "projective",
    eyebrow: "潜意识施工 · 05",
    prompt: "世界末日前，只准留下一间房，你选哪个？",
    options: [
      { id: "A", label: "把厨房和邻居都装进去的公共客厅", weights: { ORDER: 0.5, GEOMETRY: 0.7, SOCIAL: 0.9, EXPRESS: 0.1, RISK: -0.3, CONTEXT: -0.3 } },
      { id: "B", label: "墙和地面会跟着情绪改变的房间", weights: { ORDER: -0.8, GEOMETRY: -0.9, SOCIAL: -0.1, EXPRESS: 0.7, RISK: 0.6 } },
      { id: "C", label: "能看见天空、门却很好关的小房间", weights: { ORDER: 0.3, GEOMETRY: 0.2, SOCIAL: -0.8, EXPRESS: -0.8, RISK: -0.3, CONTEXT: 0.3 } },
    ],
  },
  {
    id: "Q06",
    order: 6,
    kind: "projective",
    eyebrow: "潜意识施工 · 06",
    prompt: "捡到一块来历不明的材料，你先做什么？",
    options: [
      { id: "A", label: "拿去做个小东西，允许它当场变卦", weights: { ORDER: -0.8, GEOMETRY: -0.7, RISK: 0.8, EXPRESS: 0.7, MAKING: 0.2, TIME: -0.4, CONTEXT: -0.3 } },
      { id: "B", label: "量好尺寸，看看能不能接进现有系统", weights: { TIME: -0.8, CONTEXT: -0.7, MAKING: -0.9, RISK: 0.1, ORDER: 0.8, GEOMETRY: 0.7 } },
      { id: "C", label: "擦干净，找出它以前待过的地方", weights: { TIME: 0.9, CONTEXT: 0.8, MAKING: 0.8, RISK: -0.5, ORDER: -0.3, GEOMETRY: -0.3 } },
    ],
  },
  {
    id: "Q07",
    order: 7,
    kind: "personality",
    eyebrow: "日常人格 · 07",
    prompt: "旅行计划临时全变了，你会先做什么？",
    options: [
      { id: "A", label: "重排顺序，保住最想去的两个地方", weights: { ORDER: 0.8, RISK: -0.4, CONTEXT: -0.7, SOCIAL: -0.5, GEOMETRY: 0.8 } },
      { id: "B", label: "看天气和街道，把今天交给现场", weights: { ORDER: -1, RISK: 0.6, CONTEXT: 0.9, SOCIAL: -0.2, GEOMETRY: -0.8 } },
      { id: "C", label: "先定一个大家都能跟上的集合点", weights: { ORDER: 0.5, RISK: -0.4, CONTEXT: -0.3, SOCIAL: 1, GEOMETRY: 0.2 } },
    ],
  },
  {
    id: "Q08",
    order: 8,
    kind: "personality",
    eyebrow: "日常人格 · 08",
    prompt: "房间乱到找不到桌面，你会怎么处理？",
    options: [
      { id: "A", label: "先清出一块能工作的岛，其他明天再说", weights: { ORDER: 0.8, TIME: -0.4, MAKING: -0.9, EXPRESS: -0.5, RISK: -0.2 } },
      { id: "B", label: "顺着东西的位置，慢慢给它们找新家", weights: { ORDER: 0.1, TIME: 0.8, MAKING: 0.6, EXPRESS: -0.3, RISK: -0.3 } },
      { id: "C", label: "换个灯，把现场升级成一件装置", weights: { ORDER: -0.9, TIME: -0.4, MAKING: 0.3, EXPRESS: 0.8, RISK: 0.5 } },
    ],
  },
  {
    id: "Q09",
    order: 9,
    kind: "personality",
    eyebrow: "日常人格 · 09",
    prompt: "意见撞在一起时，你通常靠什么推进？",
    options: [
      { id: "A", label: "先说出最激进的版本，让争论有个靶子", weights: { ORDER: -0.8, CONTEXT: -0.2, SOCIAL: -0.3, RISK: 0.6, EXPRESS: 0.8, MAKING: 0.4, TIME: 0.2 } },
      { id: "B", label: "做一个能被拆解和反驳的模型", weights: { ORDER: 0.8, CONTEXT: -0.6, SOCIAL: -0.3, RISK: 0.1, EXPRESS: -0.4, GEOMETRY: 0.6, MAKING: -0.6, TIME: -0.5 } },
      { id: "C", label: "把人带到现场，沿真实路线走一遍", weights: { ORDER: -0.1, CONTEXT: 0.9, SOCIAL: 0.6, RISK: -0.4, EXPRESS: -0.3, GEOMETRY: -0.7, MAKING: 0.3, TIME: 0.3 } },
    ],
  },
  {
    id: "Q10",
    order: 10,
    kind: "personality",
    eyebrow: "日常人格 · 10",
    prompt: "团队项目只剩一天，你最信哪种救场方式？",
    options: [
      { id: "A", label: "把所有人拉到一张表上，只保住共同骨架", weights: { ORDER: 0.8, RISK: -0.4, MAKING: -0.3, EXPRESS: -0.3, TIME: -0.2, SOCIAL: 0.4, GEOMETRY: 0.6 } },
      { id: "B", label: "删掉最平庸的折中，保住最有劲的一版", weights: { ORDER: -0.8, RISK: 0.7, MAKING: -0.6, EXPRESS: 0.5, TIME: -0.6, SOCIAL: -0.5, GEOMETRY: -0.5 } },
      { id: "C", label: "守住最关键的手感，让做得最熟的人收尾", weights: { RISK: -0.3, MAKING: 0.9, EXPRESS: -0.2, TIME: 0.8, SOCIAL: 0.1, GEOMETRY: -0.1 } },
    ],
  },
  {
    id: "Q11",
    order: 11,
    kind: "personality",
    eyebrow: "日常人格 · 11",
    prompt: "社交电量只剩 5%，但今晚不能缺席，你会怎么撑完？",
    options: [
      { id: "A", label: "找两个人躲到阳台，把话慢慢说完", weights: { SOCIAL: 0.1, EXPRESS: -0.7, CONTEXT: 0.8, GEOMETRY: -0.6, MAKING: 0.1, TIME: 0.3, RISK: -0.3 } },
      { id: "B", label: "负责现场流程，忙起来就不用寒暄", weights: { SOCIAL: 0.4, EXPRESS: -0.2, CONTEXT: -0.6, GEOMETRY: 0.7, MAKING: -0.7, TIME: -0.6, ORDER: 0.8 } },
      { id: "C", label: "把最后 5% 一次性放完，然后消失", weights: { SOCIAL: -0.5, EXPRESS: 0.9, CONTEXT: -0.2, GEOMETRY: -0.1, MAKING: 0.6, TIME: 0.3, ORDER: -0.8, RISK: 0.3 } },
    ],
  },
  {
    id: "Q12",
    order: 12,
    kind: "personality",
    eyebrow: "日常人格 · 12",
    prompt: "哪份礼物最容易让你舍不得丢？",
    options: [
      { id: "A", label: "一张目的地还空着的车票", weights: { RISK: 0.8, ORDER: -0.7, MAKING: -0.4, TIME: -0.8, EXPRESS: 0.7, CONTEXT: -0.4, GEOMETRY: -0.5 } },
      { id: "B", label: "一件尺寸刚好、能用很多年的工具", weights: { RISK: -0.4, ORDER: 0.9, MAKING: -0.6, TIME: -0.1, EXPRESS: -0.6, CONTEXT: -0.4, GEOMETRY: 0.8 } },
      { id: "C", label: "一件带着修补痕迹的旧物", weights: { RISK: -0.4, ORDER: -0.2, MAKING: 1, TIME: 0.9, EXPRESS: -0.1, CONTEXT: 0.8, GEOMETRY: -0.3 } },
    ],
  },
  {
    id: "Q13",
    order: 13,
    kind: "aesthetic",
    eyebrow: "建筑直觉 · 13",
    prompt: "哪栋建筑最像你今天的精神状态？",
    options: [
      { id: "A", label: "一块沉稳落地、把人稳稳托住的体量", visual: "mass", weights: { GEOMETRY: 0.7, ORDER: 0.6, RISK: -0.5, SOCIAL: 1 } },
      { id: "B", label: "一条正在加速、几乎不肯停下的曲面", visual: "flow", weights: { GEOMETRY: -1, ORDER: -1, RISK: 0.5, EXPRESS: 0.7, SOCIAL: -0.5 } },
      { id: "C", label: "一组轻得像能随时升级的结构模块", visual: "module", weights: { GEOMETRY: 0.8, ORDER: 0.7, RISK: 0.1, EXPRESS: -0.6, SOCIAL: -0.2 } },
    ],
  },
  {
    id: "Q14",
    order: 14,
    kind: "aesthetic",
    eyebrow: "建筑直觉 · 14",
    prompt: "哪个空间会让你忘记看时间？",
    options: [
      { id: "A", label: "暗处只有一道光，脚步也跟着慢下来", visual: "light", weights: { EXPRESS: -0.9, SOCIAL: -0.8, GEOMETRY: 0.4, MAKING: -0.7, RISK: -0.4 } },
      { id: "B", label: "树、风和座位围成一座没有主持人的院子", visual: "courtyard", weights: { EXPRESS: -0.1, SOCIAL: 0.6, GEOMETRY: -0.8, CONTEXT: 0.7, RISK: -0.2 } },
      { id: "C", label: "彩砖沿着楼梯一路爬到天花板", visual: "ornament", weights: { EXPRESS: 1, SOCIAL: 0.2, GEOMETRY: -0.5, CONTEXT: 0.3, MAKING: 0.7, RISK: 0.6 } },
    ],
  },
  {
    id: "Q15",
    order: 15,
    kind: "aesthetic",
    eyebrow: "建筑直觉 · 15",
    prompt: "伸手摸墙，你更想碰到哪种触感？",
    options: [
      { id: "A", label: "带着阳光温度、边缘微微不齐的旧砖", visual: "earth", weights: { MAKING: 0.8, TIME: 0.7, ORDER: -0.7, GEOMETRY: -0.7, CONTEXT: 0.7 } },
      { id: "B", label: "粗粝厚实、还留着模板纹的混凝土", visual: "concrete", weights: { ORDER: 0.8, GEOMETRY: 1, RISK: -0.5, EXPRESS: 0.3, CONTEXT: -0.2 } },
      { id: "C", label: "冷而精准、接缝几乎消失的金属", visual: "steel", weights: { MAKING: -0.8, TIME: -0.7, ORDER: 0.8, GEOMETRY: 0.7, CONTEXT: -0.6, EXPRESS: -0.4 } },
    ],
  },
  {
    id: "Q16",
    order: 16,
    kind: "aesthetic",
    eyebrow: "建筑直觉 · 16",
    prompt: "你会留下哪一种窗？",
    options: [
      { id: "A", label: "一条连续、水平、很守纪律的长窗", visual: "ribbon", weights: { GEOMETRY: 1, ORDER: 0.8, CONTEXT: -0.4, EXPRESS: -0.7, RISK: -0.4 } },
      { id: "B", label: "几扇只框住树梢、屋顶和人的小窗", visual: "framed", weights: { GEOMETRY: -0.6, ORDER: -0.1, CONTEXT: 0.9, EXPRESS: -0.1, RISK: -0.2 } },
      { id: "C", label: "一整面让天气闯进来的巨窗", visual: "giant", weights: { GEOMETRY: -0.4, ORDER: -0.7, CONTEXT: -0.5, EXPRESS: 0.8, RISK: 0.6 } },
    ],
  },
  {
    id: "Q17",
    order: 17,
    kind: "aesthetic",
    eyebrow: "建筑直觉 · 17",
    prompt: "城市给你一块地，你更愿意先兑现什么？",
    options: [
      { id: "A", label: "一条把旧巷、院落和新生活接起来的路径", visual: "repair", weights: { RISK: -0.6, GEOMETRY: -0.3, CONTEXT: 0.9, MAKING: 0.8, TIME: 0.8, EXPRESS: -0.2 } },
      { id: "B", label: "一片从地面一路翻上屋顶的开放公园", visual: "landscape", weights: { ORDER: -0.9, RISK: 0.7, GEOMETRY: -0.7, CONTEXT: -0.4, MAKING: -0.2, TIME: -0.5, EXPRESS: 0.8 } },
      { id: "C", label: "一套能不断加层、拆换和升级的公共骨架", visual: "module", weights: { ORDER: 0.8, RISK: 0.2, GEOMETRY: 0.7, CONTEXT: -0.6, MAKING: -0.8, TIME: -0.7, EXPRESS: -0.4 } },
    ],
  },
  {
    id: "Q18",
    order: 18,
    kind: "aesthetic",
    eyebrow: "建筑直觉 · 18",
    prompt: "哪种不完美，你反而愿意保留？",
    options: [
      { id: "A", label: "网格里故意空出来的一格", visual: "grid-gap", weights: { ORDER: 0.7, GEOMETRY: 0.7, MAKING: -0.2, RISK: -0.4, EXPRESS: -0.5, CONTEXT: -0.3 } },
      { id: "B", label: "材料慢慢开裂、长苔、变颜色", visual: "weather", weights: { ORDER: -0.2, GEOMETRY: -0.5, TIME: 0.9, MAKING: 0.8, RISK: -0.3, EXPRESS: -0.1, CONTEXT: 0.8 } },
      { id: "C", label: "一段现在还造不出来的悬空曲面", visual: "impossible", weights: { ORDER: -0.5, GEOMETRY: -0.2, TIME: -0.9, MAKING: -0.6, RISK: 0.7, EXPRESS: 0.6, CONTEXT: -0.5 } },
    ],
  },
] as const;

if (QUESTIONS.length !== 18) {
  throw new Error("The product contract requires exactly 18 questions.");
}
