export type DirectoryPersona = {
  code: string;
  slug: string;
  name: string;
  language: string;
  judgment: string;
  accent: string;
  accentSoft: string;
  poster?: string;
};

export type PersonaFamily = {
  id: string;
  index: string;
  title: string;
  summary: string;
  personas: readonly DirectoryPersona[];
};

export const PERSONA_FAMILIES: readonly PersonaFamily[] = [
  {
    id: "rules",
    index: "01",
    title: "骨架与法则",
    summary: "先处理结构、规则、系统和共同秩序",
    personas: [
      {
        code: "GRID",
        slug: "grid",
        name: "网格秩序者",
        language: "理性秩序",
        judgment: "先让每个动作站得住，再谈自由",
        accent: "#245aa6",
        accentSoft: "#dfe9f7",
        poster: "/images/personas/grid/hero-poster-v1.webp",
      },
      {
        code: "SPAN",
        slug: "span",
        name: "轻量撑场者",
        language: "张力找形",
        judgment: "用最少材料，把最大的空间托起来",
        accent: "#177f98",
        accentSoft: "#d8eef0",
        poster: "/images/personas/span/hero-poster-v1.webp",
      },
      {
        code: "MASS",
        slug: "mass",
        name: "混凝土嘴硬者",
        language: "粗粝集体",
        judgment: "把公共生活做进承重结构",
        accent: "#a63f32",
        accentSoft: "#f1dfdb",
        poster: "/images/personas/mass/hero-poster-v1.webp",
      },
      {
        code: "TECH",
        slug: "tech",
        name: "系统外挂者",
        language: "显性系统",
        judgment: "能运行、能维护、能升级，才算真正酷",
        accent: "#0b8f8a",
        accentSoft: "#d7ecea",
        poster: "/images/personas/tech/hero-poster-v1.webp",
      },
    ],
  },
  {
    id: "site",
    index: "02",
    title: "场所与气候",
    summary: "先听光、地形、社区和水怎么说",
    personas: [
      {
        code: "VOID",
        slug: "void",
        name: "光影留白者",
        language: "诗意留白",
        judgment: "先筛掉噪音，让光和脚步重新被看见",
        accent: "#14569b",
        accentSoft: "#e1e8ef",
        poster: "/images/personas/void/hero-poster-v1.webp",
      },
      {
        code: "ROOT",
        slug: "root",
        name: "场所生长者",
        language: "有机生长",
        judgment: "房子长对地方，比长得抢眼更重要",
        accent: "#466d43",
        accentSoft: "#e1eadc",
        poster: "/images/personas/root/hero-poster-v1.webp",
      },
      {
        code: "EAVE",
        slug: "eave",
        name: "屋檐召集者",
        language: "气候共建",
        judgment: "先把人叫到阴影里，再谈建筑姿态",
        accent: "#c68a24",
        accentSoft: "#f2e6ca",
        poster: "/images/personas/eave/hero-poster-v1.webp",
      },
      {
        code: "TIDE",
        slug: "tide",
        name: "雨水驯兽师",
        language: "生态基础设施",
        judgment: "别急着赶走洪水，先找回水原来的路",
        accent: "#126f75",
        accentSoft: "#d7e9e7",
        poster: "/images/personas/tide/hero-poster-v1.webp",
      },
    ],
  },
  {
    id: "memory",
    index: "03",
    title: "记忆与符号",
    summary: "先处理时间、材料、文化语言和表达",
    personas: [
      {
        code: "RUIN",
        slug: "ruin",
        name: "永恒预演者",
        language: "原型纪念性",
        judgment: "让今天的建筑拥有更长的时间尺度",
        accent: "#8c5a2f",
        accentSoft: "#eadfce",
        poster: "/images/personas/ruin/hero-poster-v1.webp",
      },
      {
        code: "HAND",
        slug: "hand",
        name: "旧料收藏者",
        language: "材料记忆",
        judgment: "材料有前半生，设计负责它的下一段",
        accent: "#2c6590",
        accentSoft: "#dce7ec",
        poster: "/images/personas/hand/hero-poster-v1.webp",
      },
      {
        code: "SIGN",
        slug: "sign",
        name: "建筑玩梗者",
        language: "符号叙事",
        judgment: "严肃建筑也能用大家听得懂的语言",
        accent: "#a14737",
        accentSoft: "#efe0d8",
        poster: "/images/personas/sign/hero-poster-v1.webp",
      },
      {
        code: "ORNA",
        slug: "orna",
        name: "装饰上头者",
        language: "装饰生命",
        judgment: "结构、工艺和故事都值得拥有戏份",
        accent: "#bd5a31",
        accentSoft: "#f0dfd2",
        poster: "/images/personas/orna/hero-poster-v1.webp",
      },
    ],
  },
  {
    id: "rewrite",
    index: "04",
    title: "流动与改写",
    summary: "先改变边界、路径、存量和功能关系",
    personas: [
      {
        code: "VEIL",
        slug: "veil",
        name: "边界蒸发者",
        language: "轻盈渗透",
        judgment: "门可以有，最好让人感觉它没关",
        accent: "#5f7f96",
        accentSoft: "#e0e8ec",
        poster: "/images/personas/veil/hero-poster-v1.webp",
      },
      {
        code: "FLOW",
        slug: "flow",
        name: "直线逃犯",
        language: "流动未来",
        judgment: "地面、墙和屋顶最好一起起跑",
        accent: "#6950b7",
        accentSoft: "#e7e1f1",
        poster: "/images/personas/flow/hero-poster-v1.webp",
      },
      {
        code: "PLUS",
        slug: "plus",
        name: "拒绝拆除者",
        language: "空间加法",
        judgment: "旧楼先别判死刑，先多给生活一点空间",
        accent: "#79872f",
        accentSoft: "#e7ead7",
        poster: "/images/personas/plus/hero-poster-v1.webp",
      },
      {
        code: "MIX",
        slug: "mix",
        name: "功能串台者",
        language: "程序混合",
        judgment: "让本来不该相遇的功能先挤一桌",
        accent: "#c94b35",
        accentSoft: "#f3ded5",
        poster: "/images/personas/mix/hero-poster-v1.webp",
      },
    ],
  },
] as const;

export const DIRECTORY_PERSONAS = PERSONA_FAMILIES.flatMap((family) => family.personas);
