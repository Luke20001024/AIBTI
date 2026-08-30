import type { Question } from "./schema";

export const DISCRIMINATOR_QUESTIONS: readonly Question[] = [
  {
    id: "T01", order: 19, kind: "personality", eyebrow: "最后判断 · 01", prompt: "一块旧砖和一片长满苔的坡地同时等你，你先听谁的？",
    options: [
      { id: "A", label: "先顺着坡地找建筑该长在哪里", evidence: "你先让地形、气候与自然过程决定位置", weights: { CONTEXT: 0.95, GEOMETRY: -0.65, TIME: 0.2 } },
      { id: "B", label: "先追这块砖以前属于哪栋房子", evidence: "你先读材料来源、手工与记忆", weights: { MAKING: 0.95, TIME: 0.85, CONTEXT: 0.25 } },
      { id: "C", label: "让砖沿坡地砌成可以坐的边界", evidence: "你希望材料记忆与场地关系一起工作", weights: { CONTEXT: 0.65, MAKING: 0.65, SOCIAL: 0.35 } },
    ],
  },
  {
    id: "T02", order: 20, kind: "personality", eyebrow: "最后判断 · 02", prompt: "结构已经能站住了，你下一步最想确认什么？",
    options: [
      { id: "A", label: "它能不能托住更多人的共同生活", evidence: "你把结构看作集体生活的底盘", weights: { SOCIAL: 0.95, GEOMETRY: 0.65, ORDER: 0.4 } },
      { id: "B", label: "设备、节点和升级路线能不能被看懂", evidence: "你更在意系统可读、可维护与可升级", weights: { MAKING: -0.95, TIME: -0.85, ORDER: 0.6 } },
      { id: "C", label: "表面能不能留下真实受力和建造痕迹", evidence: "你希望体量与系统都对建造保持诚实", weights: { ORDER: 0.45, MAKING: 0.1, EXPRESS: -0.25 } },
    ],
  },
  {
    id: "T03", order: 21, kind: "personality", eyebrow: "最后判断 · 03", prompt: "同样只有一道光，你希望它照出什么？",
    options: [
      { id: "A", label: "一段必须放慢脚步的空路", evidence: "你让光控制节奏、独处与留白", weights: { EXPRESS: -0.95, SOCIAL: -0.8, GEOMETRY: 0.1 } },
      { id: "B", label: "一面像已经存在百年的厚墙", evidence: "你让光显示重量、原型与时间", weights: { TIME: 0.95, GEOMETRY: 0.85, ORDER: 0.55 } },
      { id: "C", label: "一个刚好容纳几个人沉默停留的房间", evidence: "你在安静与公共纪念之间保留中间尺度", weights: { EXPRESS: -0.55, SOCIAL: 0.05, TIME: 0.45 } },
    ],
  },
  {
    id: "T04", order: 22, kind: "personality", eyebrow: "最后判断 · 04", prompt: "建筑需要开口说话时，你更信哪种语言？",
    options: [
      { id: "A", label: "让结构、色彩和工艺一起长成故事", evidence: "你让装饰从材料、结构与手工里生长", weights: { MAKING: 0.9, GEOMETRY: -0.75, EXPRESS: 0.8 } },
      { id: "B", label: "借一个大家都懂的符号，再故意拧一下", evidence: "你用熟悉符号和反讽进入大众语境", weights: { TIME: 0.75, EXPRESS: 0.95, GEOMETRY: 0.35 } },
      { id: "C", label: "把故事藏在走近才看见的细节里", evidence: "你保留叙事，但降低它抢占空间的音量", weights: { EXPRESS: 0.35, MAKING: 0.45, TIME: 0.4 } },
    ],
  },
  {
    id: "T05", order: 23, kind: "personality", eyebrow: "最后判断 · 05", prompt: "暴雨和高温一起到来，你先让场地做什么？",
    options: [
      { id: "A", label: "顺地形把水引回原来的低处", evidence: "你先恢复场地自己的地形秩序", weights: { CONTEXT: 0.95, GEOMETRY: -0.8, RISK: 0.1 } },
      { id: "B", label: "抬起一片能通风、遮阳、聚人的大屋顶", evidence: "你先用气候构件支持共同生活", weights: { SOCIAL: 0.95, MAKING: 0.85, RISK: -0.45 } },
      { id: "C", label: "把道路、公园和湿地接成储水系统", evidence: "你把自然循环升级为城市基础设施", weights: { CONTEXT: 0.9, RISK: 0.8, GEOMETRY: -0.95 } },
    ],
  },
  {
    id: "T06", order: 24, kind: "personality", eyebrow: "最后判断 · 06", prompt: "要跨过一座大空间，你更相信哪种轻？",
    options: [
      { id: "A", label: "节点清楚、部件可换的装配骨架", evidence: "你相信可读、可修和可升级的系统轻量", weights: { ORDER: 0.8, MAKING: -0.95, TIME: -0.85 } },
      { id: "B", label: "顺着受力自然下垂的网和薄膜", evidence: "你让张力与物理模型先找到形状", weights: { RISK: 0.85, GEOMETRY: -0.9, MAKING: -0.55 } },
      { id: "C", label: "把跨度藏进一条精确水平线", evidence: "你更愿意用克制秩序消化工程难度", weights: { ORDER: 0.95, GEOMETRY: 0.8, EXPRESS: -0.7 } },
    ],
  },
  {
    id: "T07", order: 25, kind: "personality", eyebrow: "最后判断 · 07", prompt: "旧楼住得挤，但大家还不想离开，你先做什么？",
    options: [
      { id: "A", label: "拆下旧材料，按生活痕迹重新组织", evidence: "你先保存材料、工法与地方记忆", weights: { MAKING: 0.95, TIME: 0.9, CONTEXT: 0.55 } },
      { id: "B", label: "保留主体，直接外挂阳台和冬季花园", evidence: "你用空间加法减少搬离并增加自由", weights: { SOCIAL: 0.95, TIME: 0.75, MAKING: -0.2 } },
      { id: "C", label: "先修最影响日常的一段，让使用继续", evidence: "你偏向小步保留，让改变与生活同步", weights: { SOCIAL: 0.6, CONTEXT: 0.55, TIME: 0.65 } },
    ],
  },
  {
    id: "T08", order: 26, kind: "personality", eyebrow: "最后判断 · 08", prompt: "人越来越多，原来的平面不够用了，你会怎样让它继续？",
    options: [
      { id: "A", label: "把地面和墙一起推成连续的新路线", evidence: "你用连续形体和速度重写空间", weights: { RISK: 0.9, TIME: -0.9, GEOMETRY: -0.55 } },
      { id: "B", label: "让互相冲突的功能上下穿插", evidence: "你用剖面和拥挤制造新的城市事件", weights: { SOCIAL: 0.95, EXPRESS: 0.7, GEOMETRY: 0.65 } },
      { id: "C", label: "减少固定隔墙，让空间彼此借用", evidence: "你用轻边界和无中心布局容纳更多关系", weights: { SOCIAL: 0.9, EXPRESS: -0.5, MAKING: -0.6 } },
    ],
  },
] as const;

export const DISCRIMINATOR_BY_ID = Object.fromEntries(
  DISCRIMINATOR_QUESTIONS.map((question) => [question.id, question]),
) as Record<string, Question>;
