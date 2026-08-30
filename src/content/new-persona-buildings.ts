import type { Building, SourceRef } from "./schema";
import { BUILDING_GALLERIES } from "./building-galleries";

const ref = (label: string, url: string, credit?: string): SourceRef => ({
  label,
  url,
  credit,
  status: "prototype-source-noted",
});

const IMAGE_SOURCE_BY_FILE: Record<string, SourceRef> = {
  "japan-pavilion-2000.webp": ref("Wikimedia Commons · Japan Pavilion Expo 2000", "https://commons.wikimedia.org/wiki/File:La_pavillon_du_Japon_(Expo._universelle_de_Hanovre_2000)_(4936016394).jpg"),
  "tuwaiq-palace.webp": ref("Wikimedia Commons · Tuwaiq Palace", "https://commons.wikimedia.org/wiki/File:Tuwaiq_Palace.jpg"),
  "opera-village-laongo.webp": ref("Wikimedia Commons · Kere operndorf", "https://commons.wikimedia.org/wiki/File:Kere_operndorf_1.jpg"),
  "yanweizhou-park.webp": ref("Wikimedia Commons · Yanweizhou Park", "https://commons.wikimedia.org/wiki/File:202403_Yanweizhou_Park_and_Duohu_CBD.jpg"),
  "zhongshan-shipyard-park.webp": ref("Wikimedia Commons · Qijiang Park", "https://commons.wikimedia.org/wiki/File:Qijiang_Park_1.jpg"),
  "exeter-library.webp": ref("Wikimedia Commons · Phillips Exeter Academy Library", "https://commons.wikimedia.org/wiki/File:Phillips-Exeter-Academy-Library-Interior-Exeter-New-Hampshire-Apr-2014-a.jpg"),
  "iim-ahmedabad.webp": ref("Wikimedia Commons · Louis Kahn Plaza, IIM Ahmedabad", "https://commons.wikimedia.org/wiki/File:Louis_Kahn_Plaza,_IIM_Ahmedabad.jpg"),
  "mcasd-la-jolla.webp": ref("Wikimedia Commons · Museum of Contemporary Art, La Jolla", "https://commons.wikimedia.org/wiki/File:Museum_of_Contemporary_Art,_La_Jolla,_2007.jpg"),
  "allen-memorial-museum.webp": ref("Wikimedia Commons · Allen Memorial Art Museum", "https://commons.wikimedia.org/wiki/File:Oberlin_College_-_Allen_Memorial_Art_Museum.jpg"),
  "new-museum-nyc.webp": ref("Wikimedia Commons · New Museum", "https://commons.wikimedia.org/wiki/File:New_Museum_(7606481064).jpg"),
  "serpentine-sanaa-2009.webp": ref("Wikimedia Commons · Serpentine Summer Pavilion 2009", "https://commons.wikimedia.org/wiki/File:Serpentine_Summer_Pavilion_2009.JPG"),
  "de-rotterdam.webp": ref("Wikimedia Commons · De Rotterdam", "https://commons.wikimedia.org/wiki/File:Gebouw_De_Rotterdam.jpg"),
  "kunsthal-rotterdam.webp": ref("Wikimedia Commons · Kunsthal Rotterdam", "https://commons.wikimedia.org/wiki/File:Rotterdam_-_Kunsthal_(6).jpg"),
  "nantes-school-architecture.webp": ref("Wikimedia Commons · Nantes School of Architecture", "https://commons.wikimedia.org/wiki/File:L%27%C3%A9cole_d%27architecture_(Nantes)_(9304278276).jpg"),
  "frac-dunkirk.webp": ref("Wikimedia Commons · FRAC Nord-Pas de Calais", "https://commons.wikimedia.org/wiki/File:FRAC_Nord_Pas_de_Calais_(48564446512).jpg"),
};

const work = (item: {
  id: string;
  name: string;
  originalName: string;
  location: string;
  years: string;
  architectIds: readonly string[];
  hook: string;
  lookFor: readonly string[];
  story: string;
  imageFile: string;
  gallery?: Building["gallery"];
  sourceLabel: string;
  sourceUrl: string;
}): Building => ({
  id: item.id,
  name: item.name,
  originalName: item.originalName,
  location: item.location,
  years: item.years,
  architectIds: item.architectIds,
  hook: item.hook,
  lookFor: item.lookFor,
  story: item.story,
  gallery: item.gallery ?? BUILDING_GALLERIES[item.id],
  image: {
    src: `/images/buildings/${item.imageFile}`,
    alt: `${item.name}建筑摄影`,
    source: IMAGE_SOURCE_BY_FILE[item.imageFile] ?? ref("Wikimedia Commons · 实景图与许可记录", "https://commons.wikimedia.org/", "具体文件、作者与许可见项目素材登记表"),
  },
  sources: [ref(item.sourceLabel, item.sourceUrl)],
});

export const NEW_PERSONA_BUILDINGS: readonly Building[] = [
  work({
    id: "BLD-EXPO67-GERMAN", name: "德国馆 Expo 67", originalName: "German Pavilion, Expo 67", location: "Montreal, Canada", years: "1967", architectIds: ["ARCH-FREI-OTTO"], imageFile: "expo67-german-pavilion.webp",
    hook: "一片可拆装的张拉屋顶，把国家展馆做得像临时天空",
    lookFor: ["桅杆、拉索与膜面共同受力", "屋顶高低变化跟随场地", "临时建筑仍拥有完整公共空间"],
    story: "展馆由 Frei Otto 与 Rolf Gutbrod 等合作完成，网索和膜面先通过模型找形，再被放大为覆盖展览与公共活动的连续屋顶。轻量在这里来自受力效率与可拆装逻辑",
    sourceLabel: "Pritzker Prize · Frei Otto", sourceUrl: "https://www.pritzkerprize.com/laureates/2015",
  }),
  work({
    id: "BLD-MUNICH-OLYMPIC", name: "慕尼黑奥林匹克公园屋顶", originalName: "Munich Olympic Stadium Roof", location: "Munich, Germany", years: "1968—1972", architectIds: ["ARCH-FREI-OTTO"], imageFile: "munich-olympic-roof.webp",
    hook: "巨大的透明网壳跨过场馆和地形，远看像一片被风托住的山谷",
    lookFor: ["连续索网跨越多个场馆", "桅杆把张力导向基础", "透明表皮让公园仍保持开放"],
    story: "项目由 Behnisch & Partner、Frei Otto 与多方工程团队共同推进。屋顶沿地形展开，既是公共基础设施，也成为战后德国开放形象的重要表达",
    sourceLabel: "Olympiapark München · Architecture", sourceUrl: "https://www.olympiapark.de/en/the-olympic-park/architecture",
  }),
  work({
    id: "BLD-MULTIHALLE", name: "曼海姆多功能厅", originalName: "Multihalle Mannheim", location: "Mannheim, Germany", years: "1974—1975", architectIds: ["ARCH-FREI-OTTO"], imageFile: "multihalle-mannheim.webp",
    hook: "薄木条在地面编成网，再整体抬起，变成覆盖不规则空间的自由曲面",
    lookFor: ["双向木格栅形成连续网壳", "曲面来自抬升过程与边界约束", "极薄构件覆盖大而复杂的平面"],
    story: "木网先平铺组装，再通过抬升和固定形成双曲面。它把建造动作直接转化为形态，也证明复杂曲面不必依赖大量厚重材料",
    sourceLabel: "Mannheim · Multihalle", sourceUrl: "https://www.mannheim.de/en/culture-experiencing/multihalle",
  }),
  work({
    id: "BLD-JAPAN-PAVILION-2000", name: "日本馆 Expo 2000", originalName: "Japan Pavilion, Expo 2000", location: "Hanover, Germany", years: "2000", architectIds: ["ARCH-FREI-OTTO"], imageFile: "japan-pavilion-2000.webp",
    hook: "纸管与薄膜搭成可回收的大跨度壳体，让临时展馆认真面对拆除后的材料去向",
    lookFor: ["纸管网格形成主壳体", "端部与基础尽量便于拆解", "材料选择回应展后回收"],
    story: "项目由 Shigeru Ban、Frei Otto 与工程团队合作。纸管把轻结构、临时性与材料循环放进同一个工程问题",
    sourceLabel: "Shigeru Ban Architects · Japan Pavilion", sourceUrl: "https://shigerubanarchitects.com/works/2000_japan-pavilion-hannover-expo-2000/",
  }),
  work({
    id: "BLD-TUWAIQ-PALACE", name: "图瓦伊克宫", originalName: "Tuwaiq Palace", location: "Riyadh, Saudi Arabia", years: "1982—1985", architectIds: ["ARCH-FREI-OTTO"], imageFile: "tuwaiq-palace.webp",
    hook: "厚重弯墙与白色帐篷结构并肩出现，防护和轻盈在沙漠里形成一组反差",
    lookFor: ["弧形实体墙围合内部花园", "轻质帐篷跨越公共活动空间", "阴影与材料共同回应极端气候"],
    story: "项目由 Omrania、Frei Otto 与 Buro Happold 合作。热容量、围合与张拉膜面各自处理不同的气候和公共活动，轻结构只承担它擅长的部分",
    sourceLabel: "Aga Khan Award · Tuwaiq Palace", sourceUrl: "https://www.archnet.org/sites/159",
  }),

  work({
    id: "BLD-GANDO-SCHOOL", name: "甘多小学", originalName: "Gando Primary School", location: "Gando, Burkina Faso", years: "1999—2001", architectIds: ["ARCH-KERE"], imageFile: "gando-primary-school.webp",
    hook: "双层屋顶用阴影和通风替代昂贵空调，学校也由社区一起建出来",
    lookFor: ["金属外屋顶被抬离砖砌天花", "热空气从两层之间排出", "当地材料在结构上得到改进"],
    story: "Kéré 为家乡设计学校时，把筹资、培训与建造组织在一起。压制土砖降低成本，双层屋顶改善酷热环境，参与施工的社区也获得可以继续使用的技能",
    sourceLabel: "Kéré Architecture · Gando Primary School", sourceUrl: "https://www.kerearchitecture.com/work/building/gando-primary-school-3",
  }),
  work({
    id: "BLD-LYCEE-SCHORGE", name: "施奥尔盖中学", originalName: "Lycée Schorge Secondary School", location: "Koudougou, Burkina Faso", years: "2014—2016", architectIds: ["ARCH-KERE"], imageFile: "lycee-schorge.webp",
    hook: "九个教室围成共享院落，木构遮阳层让校园边界变成可以坐、走和交流的廊道",
    lookFor: ["模块围合中央公共院落", "桉木构件形成第二层遮阳表皮", "通风与阴影进入教室日常"],
    story: "项目以重复模块降低建造复杂度，同时用环形布置和外廊建立清楚的校园共同体。材料策略服务气候，也让当地可获得资源进入当代建筑表达",
    sourceLabel: "Kéré Architecture · Lycée Schorge", sourceUrl: "https://www.kerearchitecture.com/work/building/lycee-schorge-secondary-school",
  }),
  work({
    id: "BLD-SERPENTINE-KERE", name: "蛇形画廊展亭 2017", originalName: "Serpentine Pavilion 2017", location: "London, UK", years: "2017", architectIds: ["ARCH-KERE"], imageFile: "serpentine-kere-2017.webp",
    hook: "树冠式屋顶把陌生人聚到中央，伦敦的雨也顺着漏斗成为空间事件",
    lookFor: ["分离屋顶制造连续阴影", "中央开口收集雨水", "开放墙体允许多方向进入"],
    story: "展亭把 Gando 村庄树下集会的经验转译到伦敦。蓝色模块墙与大屋顶共同组织聚集，天气变化会直接改变人在内部的行为",
    sourceLabel: "Serpentine Galleries · Francis Kéré", sourceUrl: "https://www.serpentinegalleries.org/whats-on/serpentine-pavilion-2017-designed-francis-kere/",
  }),
  work({
    id: "BLD-OPERA-VILLAGE", name: "拉昂戈歌剧村", originalName: "Opera Village Laongo", location: "Laongo, Burkina Faso", years: "2010—", architectIds: ["ARCH-KERE"], imageFile: "opera-village-laongo.webp",
    hook: "一个歌剧计划先长出学校、医疗与公共设施，文化建筑被重新放回日常需求",
    lookFor: ["建筑群顺地形分散生长", "屋顶和院落回应热带气候", "文化设施与教育医疗共同推进"],
    story: "项目由 Christoph Schlingensief 发起，Kéré 负责总体规划与建筑。长期分期建设把文化、教育与社区服务连接起来，歌剧院也进入当地日常",
    sourceLabel: "Kéré Architecture · Opera Village", sourceUrl: "https://www.kerearchitecture.com/work/building/opera-village",
  }),
  work({
    id: "BLD-STARTUP-LIONS", name: "Startup Lions 创业园", originalName: "Startup Lions Campus", location: "Turkana County, Kenya", years: "2019—2021", architectIds: ["ARCH-KERE"], imageFile: "startup-lions-campus.webp",
    hook: "高高的通风塔像一排耳朵，把沙漠热空气抽走，也让园区拥有醒目的共同形象",
    lookFor: ["通风塔利用烟囱效应", "厚墙与遮阳控制室内温度", "院落组织学习与社交"],
    story: "校园为数字教育与创业培训服务。被动通风、当地材料和清楚的公共院落降低运行负担，也把技术教育项目锚定在真实气候中",
    sourceLabel: "Kéré Architecture · Startup Lions Campus", sourceUrl: "https://www.kerearchitecture.com/work/building/startup-lions-campus",
  }),

  work({
    id: "BLD-YONGNING-RIVER", name: "永宁江公园", originalName: "Yongning River Park", location: "Taizhou, China", years: "2002—2004", architectIds: ["ARCH-YU"], imageFile: "yongning-river-park.webp",
    hook: "河岸不再被一堵硬堤切断，洪水、湿地与人的步道获得不同高程的共处方式",
    lookFor: ["可淹没地带保留洪泛过程", "高架步道在水位变化中保持连接", "恢复植被承担生态与防洪"],
    story: "项目用分层防洪和可淹没景观替代单一硬质河堤，让河流过程继续发生。公众可以沿路径靠近水体，也能在不同季节读到水位变化",
    sourceLabel: "Turenscape · Yongning River Park", sourceUrl: "https://www.turenscape.com/en/project/detail/464.html",
  }),
  work({
    id: "BLD-HOUTAN-PARK", name: "上海后滩公园", originalName: "Shanghai Houtan Park", location: "Shanghai, China", years: "2007—2010", architectIds: ["ARCH-YU"], imageFile: "shanghai-houtan-park.webp",
    hook: "连续湿地把受污染水体变成可被净化、观看和穿行的世博滨水空间",
    lookFor: ["梯田湿地串联净化流程", "工业遗存进入新的步行系统", "高低路径适应水位与活动"],
    story: "黄浦江边的旧工业场地被转化为会工作的公共景观。湿地承担水质改善和生境功能，步道、平台与保留构筑物让生态过程同时成为城市体验",
    sourceLabel: "Turenscape · Shanghai Houtan Park", sourceUrl: "https://www.turenscape.com/en/project/detail/462.html",
  }),
  work({
    id: "BLD-QUNLI-PARK", name: "群力雨洪公园", originalName: "Qunli Stormwater Park", location: "Harbin, China", years: "2009—2011", architectIds: ["ARCH-YU"], imageFile: "qunli-stormwater-park.webp",
    hook: "城市中央湿地被保留下来，雨水先在这里停、渗、净化，再进入更大的水系统",
    lookFor: ["保留中央天然湿地", "外围过滤带接收城市雨水", "环形步道让公众进入而不压垮核心"],
    story: "面对周边快速开发，项目把湿地升级为雨洪基础设施。景观承担调蓄和净化，也为高密度社区提供可达公共空间",
    sourceLabel: "Turenscape · Qunli Stormwater Park", sourceUrl: "https://www.turenscape.com/en/project/detail/466.html",
  }),
  work({
    id: "BLD-YANWEIZHOU", name: "燕尾洲公园", originalName: "Yanweizhou Park", location: "Jinhua, China", years: "2013—2014", architectIds: ["ARCH-YU"], imageFile: "yanweizhou-park.webp",
    hook: "一座会被洪水越过的桥把三条河流、城市两岸和季节变化接在一起",
    lookFor: ["弹性步道适应周期性淹没", "彩色桥梁连接多片场地", "保留河漫滩而非全面硬化"],
    story: "项目接受河漫滩会被淹没，通过不同高程的路径和耐水植被保持生态过程。公共桥梁把分散城市空间连接起来，洪水不再自动等于公园失效",
    sourceLabel: "Turenscape · Yanweizhou Park", sourceUrl: "https://www.turenscape.com/en/project/detail/455.html",
  }),
  work({
    id: "BLD-ZHONGSHAN-SHIPYARD", name: "中山岐江公园", originalName: "Zhongshan Shipyard Park", location: "Zhongshan, China", years: "1999—2001", architectIds: ["ARCH-YU"], imageFile: "zhongshan-shipyard-park.webp",
    hook: "旧船厂的机器、铁轨和水岸被保留，工业废墟继续成为普通城市生活的背景",
    lookFor: ["工业构件作为真实遗存保留", "新步道穿过旧生产空间", "潮汐与水岸生态重新进入公园"],
    story: "设备、结构和生产记忆与新的公共活动并置，工业场地保留了来处，也成为中国早期工业遗产景观再利用的重要案例",
    sourceLabel: "Turenscape · Zhongshan Shipyard Park", sourceUrl: "https://www.turenscape.com/en/project/detail/468.html",
  }),

  work({
    id: "BLD-SALK", name: "索尔克研究所", originalName: "Salk Institute", location: "La Jolla, California, USA", years: "1959—1965", architectIds: ["ARCH-KAHN"], imageFile: "salk-institute.webp",
    hook: "两排实验楼把最重要的位置留给天空、海平线和一条极细水线",
    lookFor: ["中央庭院保持近乎空白", "水线精确指向太平洋", "实验空间与服务塔清楚分开"],
    story: "Jonas Salk 希望研究所既支持科学工作，也提供值得停留的精神空间。Kahn 与 Luis Barragán 对庭院的讨论最终让中央保持克制，空场本身成为建筑最强的公共房间",
    sourceLabel: "Salk Institute · Architecture", sourceUrl: "https://www.salk.edu/about/architecture/",
  }),
  work({
    id: "BLD-KIMBELL", name: "金贝尔艺术博物馆", originalName: "Kimbell Art Museum", location: "Fort Worth, Texas, USA", years: "1966—1972", architectIds: ["ARCH-KAHN"], imageFile: "kimbell-art-museum.webp",
    hook: "重复拱顶把自然光从顶部柔和散开，展厅安静得像光自己在呼吸",
    lookFor: ["拱顶单元建立连续节奏", "反光器把天光送到曲面", "庭院与廊道控制展厅尺度"],
    story: "Kahn 与工程师 August Komendant 等合作发展拱顶系统。结构、采光与展览尺度从同一个重复单元生长，光直接进入空间组织的核心",
    sourceLabel: "Kimbell Art Museum · Louis I. Kahn Building", sourceUrl: "https://kimbellart.org/art-architecture/architecture/kahn-building",
  }),
  work({
    id: "BLD-BANGLADESH-PARLIAMENT", name: "孟加拉国国民议会大厦", originalName: "Jatiya Sangsad Bhaban", location: "Dhaka, Bangladesh", years: "1962—1983", architectIds: ["ARCH-KAHN"], imageFile: "bangladesh-parliament.webp",
    hook: "圆、三角和方形开口被切进厚墙，国家制度因此获得既原始又现代的公共形象",
    lookFor: ["巨大几何开口控制光与尺度", "水体围绕议会核心", "主厅与服务空间形成清楚层级"],
    story: "项目跨越政治变动与独立过程，在 Kahn 去世后才完成。厚重体量与本地光、水和公共制度相遇，也要求叙事看见当地建筑师 Muzharul Islam 等人的推动与合作",
    sourceLabel: "ArchNet · National Assembly Building", sourceUrl: "https://www.archnet.org/sites/439",
  }),
  work({
    id: "BLD-EXETER-LIBRARY", name: "菲利普斯埃克塞特图书馆", originalName: "Phillips Exeter Academy Library", location: "Exeter, New Hampshire, USA", years: "1965—1972", architectIds: ["ARCH-KAHN"], imageFile: "exeter-library.webp",
    hook: "巨大圆孔让书架、阅读区和中央空厅彼此看见，知识的结构直接写在剖面里",
    lookFor: ["圆形开口切开内层混凝土墙", "外围砖墙保持校园尺度", "阅读席靠近自然光与书架"],
    story: "图书馆从外部看安静克制，进入后才出现巨大中心空厅。书、阅读者与光线分布在不同圈层，空间秩序帮助人直觉理解建筑如何使用",
    sourceLabel: "Phillips Exeter Academy · Class of 1945 Library", sourceUrl: "https://www.exeter.edu/academics/library",
  }),
  work({
    id: "BLD-IIM-AHMEDABAD", name: "印度管理学院艾哈迈达巴德校区", originalName: "Indian Institute of Management Ahmedabad", location: "Ahmedabad, India", years: "1962—1974", architectIds: ["ARCH-KAHN"], imageFile: "iim-ahmedabad.webp",
    hook: "厚砖墙、圆形开口和庭院把校园做成一组能慢慢穿行的学习城",
    lookFor: ["砖拱与圆孔建立强烈原型", "庭院连接教学与宿舍", "阴影深度回应炎热气候"],
    story: "Kahn 与 B. V. Doshi 等印度建筑师和团队合作推进项目。材料与几何形成纪念性，同时通过院落、廊道和遮阳回应真实校园生活与气候",
    sourceLabel: "IIMA · Heritage Campus", sourceUrl: "https://www.iima.ac.in/the-institute/campus/heritage-campus",
  }),

  work({
    id: "BLD-VANNA-VENTURI", name: "范娜·文丘里住宅", originalName: "Vanna Venturi House", location: "Philadelphia, USA", years: "1962—1964", architectIds: ["ARCH-VENTURI-SCOTT-BROWN"], imageFile: "vanna-venturi-house.webp",
    hook: "一眼像房子，第二眼却发现山墙、烟囱、门和楼梯全在故意唱反调",
    lookFor: ["大山墙被中央裂缝切开", "入口故意缩在阴影中", "楼梯与烟囱在内部制造矛盾"],
    story: "这是 Robert Venturi 为母亲设计的早期住宅。它借用普通住宅符号，又用尺度、错位和不对称挑战单一纯度，成为《建筑的复杂性与矛盾性》的空间版本",
    sourceLabel: "VSBA · Vanna Venturi House", sourceUrl: "https://venturiscottbrown.org/project/vanna-venturi-house/",
  }),
  work({
    id: "BLD-GUILD-HOUSE", name: "吉尔德之家", originalName: "Guild House", location: "Philadelphia, USA", years: "1960—1963", architectIds: ["ARCH-VENTURI-SCOTT-BROWN"], imageFile: "guild-house.webp",
    hook: "普通红砖、拱形入口和屋顶电视天线被认真端上立面，养老住宅也有权拥有城市表情",
    lookFor: ["熟悉材料压低建造成本", "立面中心轴线被轻微扰动", "电视天线成为大众生活符号"],
    story: "项目拒绝用昂贵形式替社会住宅制造虚假高雅。普通构件与略带戏谑的构图共同说明，大众文化和日常生活本来就值得进入建筑语言",
    sourceLabel: "VSBA · Guild House", sourceUrl: "https://venturiscottbrown.org/project/guild-house/",
  }),
  work({
    id: "BLD-SAINSBURY-WING", name: "国家美术馆塞恩斯伯里翼", originalName: "Sainsbury Wing, National Gallery", location: "London, UK", years: "1986—1991", architectIds: ["ARCH-VENTURI-SCOTT-BROWN"], imageFile: "sainsbury-wing.webp",
    hook: "古典柱式先向老馆打招呼，再通过错位和透视把人带进一条完全当代的参观路线",
    lookFor: ["历史语汇与现代构造并置", "入口回应特拉法加广场人流", "展厅序列沿城市边界展开"],
    story: "新馆需要连接既有国家美术馆、城市广场和复杂展览要求。VSBA 把熟悉语汇拆开重组，让历史关系成为可读的当代设计",
    sourceLabel: "National Gallery · Sainsbury Wing", sourceUrl: "https://www.nationalgallery.org.uk/about-us/history/the-sainsbury-wing",
  }),
  work({
    id: "BLD-MCASD", name: "圣迭戈当代艺术博物馆扩建", originalName: "Museum of Contemporary Art San Diego", location: "La Jolla, USA", years: "1996", architectIds: ["ARCH-VENTURI-SCOTT-BROWN"], imageFile: "mcasd-la-jolla.webp",
    hook: "新旧建筑通过比例、色彩和熟悉构件展开对话，扩建不需要假装自己从未出现",
    lookFor: ["新体量回应旧馆尺度", "符号和颜色帮助识别入口", "不同年代的建筑保持可读差异"],
    story: "VSBA 把既有环境看成一套可以继续书写的语言系统。新部分建立独立识别，也通过构图和路径延续原有公共关系",
    sourceLabel: "VSBA · Museum of Contemporary Art San Diego", sourceUrl: "https://venturiscottbrown.org/project/museum-of-contemporary-art-san-diego/",
  }),
  work({
    id: "BLD-ALLEN-MEMORIAL", name: "艾伦纪念艺术博物馆扩建", originalName: "Allen Memorial Art Museum Addition", location: "Oberlin, Ohio, USA", years: "1973—1977", architectIds: ["ARCH-VENTURI-SCOTT-BROWN"], imageFile: "allen-memorial-museum.webp",
    hook: "扩建没有复制旧馆，却用颜色、尺度和碎片化历史语汇保持一场带幽默的邻里对话",
    lookFor: ["新旧入口关系被重新组织", "墙面图案提示历史而非复刻", "内部路线适应展览与教学"],
    story: "项目用细微引用与错位处理真实校园环境，展示了后现代主义更克制的一面。意义来自具体上下文，脱离地点的符号包很快会失效",
    sourceLabel: "VSBA · Allen Memorial Art Museum", sourceUrl: "https://venturiscottbrown.org/project/allen-memorial-art-museum/",
  }),

  work({
    id: "BLD-KANAZAWA-21", name: "金泽 21 世纪美术馆", originalName: "21st Century Museum of Contemporary Art, Kanazawa", location: "Kanazawa, Japan", years: "1999—2004", architectIds: ["ARCH-SANAA"], imageFile: "kanazawa-21.webp",
    hook: "圆形建筑没有唯一正门，分散展厅像小房子一样漂在连续公共地面上",
    lookFor: ["多入口削弱正反面", "独立展厅分散在圆盘内部", "透明边界让城市与公共区域互相看见"],
    story: "SANAA 用圆形外轮廓接住来自不同街道的人流，内部不设唯一中心轴线。展览空间保持独立，公共活动则在它们之间自由穿行",
    sourceLabel: "21st Century Museum of Contemporary Art, Kanazawa", sourceUrl: "https://www.kanazawa21.jp/data_list.php?g=11&d=1&lng=e",
  }),
  work({
    id: "BLD-ROLEX-LEARNING", name: "劳力士学习中心", originalName: "Rolex Learning Center", location: "Lausanne, Switzerland", years: "2004—2010", architectIds: ["ARCH-SANAA"], imageFile: "rolex-learning-center.webp",
    hook: "一整片地面缓慢起伏，图书馆、学习区和路线不靠硬墙也能彼此区分",
    lookFor: ["连续曲面同时形成地面与屋顶", "圆形庭院把光引入深处", "坡度组织停留、视线和移动"],
    story: "建筑几乎像一间巨大单层房间，局部高低变化创造不同学习气氛。轻松体验背后是复杂结构、施工和声学控制，边界蒸发并不等于问题消失",
    sourceLabel: "EPFL · Rolex Learning Center", sourceUrl: "https://www.epfl.ch/campus/visitors/buildings/rolex-learning-center/",
  }),
  work({
    id: "BLD-LOUVRE-LENS", name: "卢浮宫朗斯分馆", originalName: "Louvre-Lens", location: "Lens, France", years: "2005—2012", architectIds: ["ARCH-SANAA"], imageFile: "louvre-lens.webp",
    hook: "低矮反射体量几乎消进旧矿区地景，展览沿一条清楚但不封闭的线展开",
    lookFor: ["多个轻薄体量微微转折", "铝质表皮反射天空和场地", "长廊建立非传统时间序列"],
    story: "博物馆被放在工业遗址而非历史城市中心。SANAA 把建筑压低并分散，让场地、景观和展览关系保持开放，也避免新馆用巨大姿态取代地方记忆",
    sourceLabel: "Louvre-Lens · Architecture", sourceUrl: "https://www.louvrelens.fr/en/my-visit/architecture/",
  }),
  work({
    id: "BLD-NEW-MUSEUM", name: "纽约新当代艺术博物馆", originalName: "New Museum", location: "New York, USA", years: "2003—2007", architectIds: ["ARCH-SANAA"], imageFile: "new-museum-nyc.webp",
    hook: "七个白色盒子轻轻错开堆叠，在狭窄城市地块上挤出天光、露台和可变展厅",
    lookFor: ["错位体量回应不同楼层需求", "金属网皮统一复杂叠层", "侧向开口把光带进深层空间"],
    story: "狭窄地块要求博物馆向上生长。SANAA 让楼层体量逐层错位，为展览、办公、结构和采光争取不同的空间余量",
    sourceLabel: "New Museum · Building", sourceUrl: "https://www.newmuseum.org/about/building/",
  }),
  work({
    id: "BLD-SERPENTINE-SANAA", name: "蛇形画廊展亭 2009", originalName: "Serpentine Pavilion 2009", location: "London, UK", years: "2009", architectIds: ["ARCH-SANAA"], imageFile: "serpentine-sanaa-2009.webp",
    hook: "一片极薄反光屋顶绕着树木和活动轻轻漂浮，柱子像临时落下的雨线",
    lookFor: ["自由轮廓避让场地树木", "抛光顶面反射天空和人群", "细柱弱化结构存在感"],
    story: "展亭几乎只保留一片变化高度的屋顶，用覆盖范围和柱网给不同聚会方式提供松散边界",
    sourceLabel: "Serpentine Galleries · SANAA Pavilion", sourceUrl: "https://www.serpentinegalleries.org/whats-on/serpentine-gallery-pavilion-2009-sanaa/",
  }),

  work({
    id: "BLD-TOUR-BOIS", name: "Bois-le-Prêtre 塔楼改造", originalName: "Tour Bois-le-Prêtre Transformation", location: "Paris, France", years: "2005—2011", architectIds: ["ARCH-LACATON-VASSAL"], imageFile: "tour-bois-le-pretre.webp",
    hook: "旧塔楼没被判死刑，外扩冬季花园和阳台直接把更多空间送回住户",
    lookFor: ["外加结构扩大每户面积", "透明表皮改善采光与气候缓冲", "施工尽量减少居民搬离"],
    story: "Lacaton & Vassal 与 Frédéric Druot 通过拆除旧立面、外加预制结构提升住宅性能，在控制成本的同时增加可使用面积和生活选择",
    sourceLabel: "Lacaton & Vassal · Tour Bois-le-Prêtre", sourceUrl: "https://www.lacatonvassal.com/index.php?idp=56",
  }),
  work({
    id: "BLD-GRAND-PARC", name: "波尔多大公园住宅改造", originalName: "Transformation of 530 Dwellings, Grand Parc", location: "Bordeaux, France", years: "2011—2017", architectIds: ["ARCH-LACATON-VASSAL"], imageFile: "grand-parc-bordeaux.webp",
    hook: "三栋社会住宅边住边改，每户多出一片冬季花园，更新不再自动等于搬家",
    lookFor: ["预制外扩模块快速安装", "冬季花园成为可变生活空间", "既有结构和住户关系被保留"],
    story: "项目由 Lacaton & Vassal、Frédéric Druot 与 Christophe Hutin 合作。530 户住宅在尽量不搬迁的情况下完成性能提升，空间加法也改变了改造成本与居住权的讨论",
    sourceLabel: "Lacaton & Vassal · Grand Parc", sourceUrl: "https://www.lacatonvassal.com/index.php?idp=80",
  }),
  work({
    id: "BLD-PALAIS-TOKYO", name: "巴黎东京宫改造", originalName: "Palais de Tokyo", location: "Paris, France", years: "1999—2012", architectIds: ["ARCH-LACATON-VASSAL"], imageFile: "palais-de-tokyo.webp",
    hook: "预算优先用来开放更多空间，旧建筑保留了粗粝和自由度",
    lookFor: ["保留裸露结构与既有痕迹", "大尺度空间容纳不确定展览", "有限动作提高公众可达面积"],
    story: "改造把未完成感作为资源，但并非简单追求粗糙。设计重点是安全、流线、基础设施与开放面积，让艺术机构能够不断改变而不被昂贵装饰锁死",
    sourceLabel: "Lacaton & Vassal · Palais de Tokyo", sourceUrl: "https://www.lacatonvassal.com/index.php?idp=20",
  }),
  work({
    id: "BLD-FRAC-DUNKIRK", name: "敦刻尔克 FRAC", originalName: "FRAC Nord-Pas de Calais", location: "Dunkirk, France", years: "2009—2013", architectIds: ["ARCH-LACATON-VASSAL"], imageFile: "frac-dunkirk.webp",
    hook: "旧船厂大厅被完整保留，旁边再加一座同体量透明建筑，把历史空间和新功能并排交给城市",
    lookFor: ["新旧双体量保持同等尺度", "透明外壳容纳可变楼层", "旧大厅继续用于大型公共活动"],
    story: "一座新建筑承担主要功能，旧工业大厅因此保持开放和未来可能性。这个加法避开了保存与使用之间的零和选择",
    sourceLabel: "Lacaton & Vassal · FRAC Dunkerque", sourceUrl: "https://www.lacatonvassal.com/index.php?idp=61",
  }),
  work({
    id: "BLD-NANTES-ARCH", name: "南特建筑学院", originalName: "Nantes School of Architecture", location: "Nantes, France", years: "2003—2009", architectIds: ["ARCH-LACATON-VASSAL"], imageFile: "nantes-school-architecture.webp",
    hook: "超大结构给学生远多于标准教室的空间，坡道和平台把整座学校变成可以占用的工作场",
    lookFor: ["大跨结构提供用途余量", "外部坡道连接城市与屋顶", "可变空间支持模型、展览和临时活动"],
    story: "设计把预算优先用于更多面积与承载能力，学生能用、改、占据和重新布置空间，慷慨因此变成具体的教育基础设施",
    sourceLabel: "Lacaton & Vassal · Nantes School of Architecture", sourceUrl: "https://www.lacatonvassal.com/index.php?idp=55",
  }),

  work({
    id: "BLD-SEATTLE-LIBRARY", name: "西雅图中央图书馆", originalName: "Seattle Central Library", location: "Seattle, USA", years: "1999—2004", architectIds: ["ARCH-OMA"], imageFile: "seattle-central-library.webp",
    hook: "图书馆不再是一排安静房间，稳定功能平台与连续公共路线一起组成内部城市",
    lookFor: ["功能平台被压成不同体量", "书籍螺旋保持分类连续", "公共路线穿过阅读、会议与城市视线"],
    story: "OMA 与 LMN 等团队把不断变化的公共功能和较稳定的藏书、办公分开处理。外部斜网包住复杂剖面，方向与后勤则靠清楚的平台和路线维持",
    sourceLabel: "OMA · Seattle Central Library", sourceUrl: "https://www.oma.com/projects/seattle-central-library",
  }),
  work({
    id: "BLD-CASA-MUSICA", name: "波尔图音乐厅", originalName: "Casa da Música", location: "Porto, Portugal", years: "1999—2005", architectIds: ["ARCH-OMA"], imageFile: "casa-da-musica.webp",
    hook: "不规则混凝土盒里塞进两座音乐厅，后台、公共路线和城市视线在空隙中互相串台",
    lookFor: ["主音乐厅贯穿体量", "公共路径绕过多个功能空腔", "巨大玻璃面把演出与城市对接"],
    story: "项目从住宅竞赛方案转化而来，不规则外壳容纳复杂演出流程。建筑的冲突感需要声学、结构与后勤精确配合，才不会只剩一块奇怪石头",
    sourceLabel: "OMA · Casa da Música", sourceUrl: "https://www.oma.com/projects/casa-da-musica",
  }),
  work({
    id: "BLD-CCTV", name: "中央电视台总部大楼", originalName: "CCTV Headquarters", location: "Beijing, China", years: "2002—2012", architectIds: ["ARCH-OMA"], imageFile: "cctv-headquarters.webp",
    hook: "两座塔在空中和地面连成环，把电视生产的多个部门塞进一条连续组织路线",
    lookFor: ["环形体量连接不同生产部门", "外部斜网回应不均匀受力", "悬挑制造巨大的城市门洞"],
    story: "OMA、工程团队与本地合作方把高层建筑从单一直塔改成连续环路。几何带来新的部门关系，也带来极高结构与施工复杂度，混合程序必须由工程和运营共同托住",
    sourceLabel: "OMA · CCTV Headquarters", sourceUrl: "https://www.oma.com/projects/cctv-headquarters",
  }),
  work({
    id: "BLD-KUNSTHAL", name: "鹿特丹美术馆", originalName: "Kunsthal Rotterdam", location: "Rotterdam, Netherlands", years: "1987—1992", architectIds: ["ARCH-OMA"], imageFile: "kunsthal-rotterdam.webp",
    hook: "一条连续坡道把道路、公园、展厅和屋顶缝在一起，参观路线像城市交通一样交叉",
    lookFor: ["坡道贯穿多个楼层与功能", "不同材料并置而不追求统一", "城市路径穿过建筑内部"],
    story: "Kunsthal 用紧凑体量容纳多个独立展厅、礼堂和服务空间。路径既连接功能，也制造冲突和视线交叉，剖面成为项目真正的平面图",
    sourceLabel: "OMA · Kunsthal Rotterdam", sourceUrl: "https://www.oma.com/projects/kunsthal-rotterdam",
  }),
  work({
    id: "BLD-DE-ROTTERDAM", name: "鹿特丹大厦", originalName: "De Rotterdam", location: "Rotterdam, Netherlands", years: "1997—2013", architectIds: ["ARCH-OMA"], imageFile: "de-rotterdam.webp",
    hook: "办公、住宅、酒店和公共功能被叠成一座竖向城市，三座塔在不同高度错开换位",
    lookFor: ["共享基座连接多种功能", "塔楼体量在高处错动", "交通与后勤维持高密度混合"],
    story: "项目通过巨大的混合体量回应港区再开发。程序叠加带来全天候使用，也要求入口、电梯、消防和后勤被清楚分区，复杂性必须有可读系统",
    sourceLabel: "OMA · De Rotterdam", sourceUrl: "https://www.oma.com/projects/de-rotterdam",
  }),
] as const;
