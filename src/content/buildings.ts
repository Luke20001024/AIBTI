import type { Building, SourceRef } from "./schema";
import { NEW_PERSONA_BUILDINGS } from "./new-persona-buildings";
import { BUILDING_GALLERIES } from "./building-galleries";

const source = (label: string, url: string, credit?: string): SourceRef => ({
  label,
  url,
  credit,
  status: "prototype-source-noted",
});

const building = (
  item: Omit<Building, "image" | "sources"> & {
    imageFile: string;
    sourceLabel: string;
    sourceUrl: string;
    imageSourceLabel?: string;
    imageSourceUrl?: string;
    photoCredit?: string;
  },
): Building => {
  const contentSource = source(item.sourceLabel, item.sourceUrl);
  const imageSource = source(
    item.imageSourceLabel ?? item.sourceLabel,
    item.imageSourceUrl ?? item.sourceUrl,
    item.photoCredit,
  );
  return {
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
      source: imageSource,
    },
    sources: [contentSource],
  };
};

export const BUILDINGS: readonly Building[] = [
  building({
    id: "BLD-PAVILION", name: "巴塞罗那馆", originalName: "Barcelona Pavilion", location: "Barcelona, Spain", years: "1929；1986 原址重建", architectIds: ["ARCH-MIES"], imageFile: "barcelona-pavilion.webp",
    hook: "一个看似只有屋顶和墙的展馆，却把空间边界拆得比迷宫更自由",
    lookFor: ["墙、玻璃和屋顶彼此错开", "十字钢柱几乎从视线中消失", "石材、水面与雕塑不断制造倒影"],
    story: "它由 Mies van der Rohe 与 Lilly Reich 为 1929 年巴塞罗那国际博览会设计，博览会后被拆除，1986 年才在原址重建。现代主义的经典，在很长时间里其实只存在于照片、图纸和记忆中",
    sourceLabel: "Fundació Mies van der Rohe", sourceUrl: "https://miesbcn.com/the-pavilion/", imageSourceLabel: "Neil Shelby Long · German Pavilion", imageSourceUrl: "https://www.neilshelbylong.com/blog/photographing-the-german-pavilion-by-mies-van-der-rohe", photoCredit: "建筑摄影：Neil Shelby Long；研究原型图像，公开发布前复核授权",
  }),
  building({
    id: "BLD-FARNSWORTH", name: "范斯沃斯住宅", originalName: "Edith Farnsworth House", location: "Plano, Illinois, USA", years: "1945—1951", architectIds: ["ARCH-MIES"], imageFile: "farnsworth-house.webp",
    hook: "八根白色钢柱托起一间透明住宅，把生活放进一只极精确的玻璃盒",
    lookFor: ["平台抬离洪泛地面", "结构与玻璃表皮分开", "中央服务核心组织全部生活"],
    story: "这栋住宅把极简推到日常生活的边界，也因造价、隐私与居住体验引发业主 Edith Farnsworth 与建筑师之间的冲突。它提醒人们：形式纯度与真实生活并不总能自动和解",
    sourceLabel: "Edith Farnsworth House", sourceUrl: "https://edithfarnsworthhouse.org/", imageSourceLabel: "Wikimedia Commons · Farnsworth House", imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Farnsworth_House_by_Mies_Van_Der_Rohe_-_exterior-8.jpg", photoCredit: "原型图像：Wikimedia Commons；作者与许可见原文件页",
  }),
  building({
    id: "BLD-SEAGRAM", name: "西格拉姆大厦", originalName: "Seagram Building", location: "New York, USA", years: "1954—1958", architectIds: ["ARCH-MIES"], imageFile: "seagram-building.webp",
    hook: "铜色立面很醒目，真正奢侈的是它在昂贵的曼哈顿主动空出一块广场",
    lookFor: ["塔楼退离街线", "深色玻璃与青铜竖梃的严格节奏", "广场把城市人流带到建筑前"],
    story: "大厦由 Mies 设计，Philip Johnson 等参与。立面外附的竖向构件负责表达结构秩序，真正的承重体系藏在防火层后",
    sourceLabel: "The Cultural Landscape Foundation", sourceUrl: "https://www.tclf.org/landscapes/seagram-building", imageSourceLabel: "Wikimedia Commons · Seagram Building", imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Seagram_Building_(35098307116).jpg", photoCredit: "原型图像：Wikimedia Commons；作者与许可见原文件页",
  }),
  building({
    id: "BLD-FALLINGWATER", name: "流水别墅", originalName: "Fallingwater", location: "Mill Run, Pennsylvania, USA", years: "1935—1939", architectIds: ["ARCH-WRIGHT"], imageFile: "fallingwater.webp",
    hook: "房子直接把生活架到瀑布上，水流从客厅和露台下方穿过",
    lookFor: ["混凝土平台像岩层一样向外伸", "当地石墙从地面继续长进室内", "水声贯穿居住体验"],
    story: "Wright 将一系列钢筋混凝土“托盘”锚进自然岩石。这个惊人决定也带来长期结构维护问题，使它成为美学野心、工程风险与保存技术共同书写的建筑",
    sourceLabel: "Frank Lloyd Wright Foundation · Fallingwater", sourceUrl: "https://franklloydwright.org/site/fallingwater/", imageSourceLabel: "Wikimedia Commons · Fallingwater", imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Fallingwater3.jpg", photoCredit: "原型图像：Wikimedia Commons；作者与许可见原文件页",
  }),
  building({
    id: "BLD-ROBIE", name: "罗比住宅", originalName: "Frederick C. Robie House", location: "Chicago, USA", years: "1908—1910", architectIds: ["ARCH-WRIGHT"], imageFile: "robie-house.webp",
    hook: "一栋把水平线拉到极限的住宅，让屋檐像地平线一样压低城市噪音",
    lookFor: ["二十英尺悬挑屋檐", "带状艺术玻璃窗", "以壁炉为核心的开放空间"],
    story: "它在 1950 年代一度面临拆除，Wright 本人曾回到现场为它发声。如今它被视为草原住宅最清晰的代表之一",
    sourceLabel: "Frank Lloyd Wright Foundation", sourceUrl: "https://franklloydwright.org/site/robie-house/", photoCredit: "图源：Frank Lloyd Wright Foundation / 原页面署名",
  }),
  building({
    id: "BLD-TALIESIN-WEST", name: "西塔里埃森", originalName: "Taliesin West", location: "Scottsdale, Arizona, USA", years: "1937 起", architectIds: ["ARCH-WRIGHT"], imageFile: "taliesin-west.webp",
    hook: "一群人在沙漠里多年反复拆、搭、改，把总部做成持续生长的生活实验",
    lookFor: ["沙漠石砌进混凝土墙", "低矮屋顶顺着山麓", "室内外边界随季节变化"],
    story: "Taliesin West 既是 Wright 的冬季住宅和工作室，也是学徒共同建造的实验场。建筑在多年使用中持续变化，和“完美定稿”的现代主义对象完全不同",
    sourceLabel: "Frank Lloyd Wright Foundation", sourceUrl: "https://franklloydwright.org/taliesin-west/", photoCredit: "图源：Frank Lloyd Wright Foundation / 原页面署名",
  }),
  building({
    id: "BLD-UNITE", name: "马赛公寓", originalName: "Unité d'Habitation de Marseille", location: "Marseille, France", years: "1945—1952", architectIds: ["ARCH-CORBU"], imageFile: "unite-habitation.webp",
    hook: "一座把住宅、街道、商店和屋顶公共生活压进同一体量的垂直城市",
    lookFor: ["粗壮架空柱释放地面", "跨层住宅互相咬合", "屋顶成为公共设施而非设备剩余"],
    story: "项目总结了 Le Corbusier 二十多年关于集体住宅的研究，由其工作室、André Wogenscky 与 ATBAT 等共同实现。内部商业街位于建筑中段，让“街”真正进入高层住宅",
    sourceLabel: "Fondation Le Corbusier", sourceUrl: "https://www.fondationlecorbusier.fr/en/work-architecture/achievements-unite-dhabitation-marseille-france-1945-1952/", photoCredit: "图源：FLC / ADAGP / 原页面署名",
  }),
  building({
    id: "BLD-LA-TOURETTE", name: "拉图雷特修道院", originalName: "Couvent Sainte-Marie de La Tourette", location: "Éveux, France", years: "1953—1960", architectIds: ["ARCH-CORBU"], imageFile: "la-tourette.webp",
    hook: "最粗粝的混凝土，反而被光和安静调成了一种非常精确的精神空间",
    lookFor: ["建筑顺坡架起", "僧侣房间组成严密重复", "教堂光线从缝隙与光炮进入"],
    story: "修道院把个人小室、学习和共同礼拜组织在同一复杂体量中。它的外表几乎不讨好人，真正的核心需要从路径与内部光线中体验",
    sourceLabel: "Fondation Le Corbusier", sourceUrl: "https://www.fondationlecorbusier.fr/oeuvre-architecture/realisations-couvent-sainte-marie-de-la-tourette-eveux-sur-larbresle-france-1953-1960/", photoCredit: "图源：Fondation Le Corbusier / 原页面署名",
  }),
  building({
    id: "BLD-CHANDIGARH", name: "昌迪加尔议会建筑群", originalName: "Capitol Complex", location: "Chandigarh, India", years: "1951—1965", architectIds: ["ARCH-CORBU"], imageFile: "chandigarh.webp",
    hook: "制度被变成巨型遮阳板、屋顶和广场，一整片城市像政治舞台",
    lookFor: ["纪念性混凝土体量", "适应强日照的深遮阳", "建筑之间由巨大开放场地联系"],
    story: "昌迪加尔是独立后印度的重要现代城市实验。观看它时要同时看到宏大愿景、当地团队，以及人在巨大尺度中的真实体验",
    sourceLabel: "UNESCO World Heritage Centre", sourceUrl: "https://whc.unesco.org/en/list/1321/", imageSourceLabel: "Wikimedia Commons · Palace of Assembly Chandigarh", imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Palace_of_Assembly_Chandigarh_2006.jpg", photoCredit: "原型图像：Wikimedia Commons；作者与许可见原文件页",
  }),
  building({
    id: "BLD-CHURCH-LIGHT", name: "光之教堂", originalName: "Church of the Light", location: "Ibaraki, Osaka, Japan", years: "1989", architectIds: ["ARCH-ANDO"], imageFile: "church-light.webp",
    hook: "十字切缝让光成为空间里最强的材料，混凝土退到背景",
    lookFor: ["入口路径先绕过斜墙", "十字开口直接面对会众", "极少材料放大明暗变化"],
    story: "教堂空间克制到近乎空白，但并不冷淡。时间、天气和人的移动持续改变十字光线，使同一房间每天都不完全相同",
    gallery: [
      { src: "/images/void-v2/works/details/church-light-detail-cross.webp", alt: "光之教堂内部十字形开口把自然光切入混凝土空间", source: source("Wikimedia Commons · Church of the Light", "https://commons.wikimedia.org/wiki/File:Ibaraki_Kasugaoka_Church_light_cross.jpg") },
      { src: "/images/void-v2/works/details/church-light-exterior.webp", alt: "光之教堂外部清水混凝土墙与十字形开口", source: source("Wikimedia Commons · Church of the Light", "https://commons.wikimedia.org/wiki/File:Ibaraki_Kasugaoka_Church_light_cross.jpg") },
    ],
    sourceLabel: "The Pritzker Architecture Prize", sourceUrl: "https://www.pritzkerprize.com/laureates/1995", imageSourceLabel: "Wikimedia Commons · Church of the Light", imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Ibaraki_Kasugaoka_Church_light_cross.jpg", photoCredit: "原型图像：Wikimedia Commons；作者与许可见原文件页",
  }),
  building({
    id: "BLD-CHICHU", name: "地中美术馆", originalName: "Chichu Art Museum", location: "Naoshima, Japan", years: "2004", architectIds: ["ARCH-ANDO"], imageFile: "chichu-art-museum.webp",
    hook: "一座美术馆大部分藏进地下，却不靠封闭灯箱，而靠天光让作品与时间一起变化",
    lookFor: ["几何庭院切开地下体量", "自然光进入展厅", "路径不断收窄、转折再释放"],
    story: "建筑为保护岛屿景观而埋入地下，开口、庭院和天光继续建立方向。观众经过一连串光暗变化，感知逐步调整后才抵达作品",
    gallery: [
      { src: "/images/void-v2/works/details/chichu-entry.webp", alt: "地中美术馆被树木与地形遮蔽的入口路径", source: source("Benesse Art Site Naoshima · Chichu Art Museum", "https://benesse-artsite.jp/en/art/chichu.html") },
      { src: "/images/void-v2/works/details/chichu-art-museum.webp", alt: "地中美术馆的地下几何空间与自然光", source: source("Benesse Art Site Naoshima · Chichu Art Museum", "https://benesse-artsite.jp/en/art/chichu.html") },
    ],
    sourceLabel: "Benesse Art Site Naoshima", sourceUrl: "https://benesse-artsite.jp/en/art/chichu.html", photoCredit: "图源：Benesse Art Site Naoshima / 原页面署名",
  }),
  building({
    id: "BLD-WATER-TEMPLE", name: "水御堂", originalName: "Water Temple / Honpukuji", location: "Awaji, Japan", years: "1991", architectIds: ["ARCH-ANDO"], imageFile: "water-temple.webp",
    hook: "寺庙没有先出现屋顶，人先看见一池荷花，再从水面中央向下消失",
    lookFor: ["椭圆荷花池成为屋顶", "楼梯切开水面向下", "地下朱红空间与外部清水混凝土反差"],
    story: "传统宗教空间被重新组织为一段身体路径：从开放天空、平静水面到向下进入的红色礼拜空间，安静由路线逐步制造",
    gallery: [
      { src: "/images/void-v2/works/details/water-temple-pond.webp", alt: "水御堂椭圆荷花池与水面边界", source: source("JNTO · Honpukuji Water Temple", "https://www.japan.travel/en/spot/491/") },
      { src: "/images/void-v2/works/details/water-temple-interior.webp", alt: "水御堂地下朱红礼拜空间", source: source("JNTO · Honpukuji Water Temple", "https://www.japan.travel/en/spot/491/") },
    ],
    sourceLabel: "The Pritzker Architecture Prize", sourceUrl: "https://www.pritzkerprize.com/sites/default/files/file_fields/field_files_inline/1995_bio.pdf", imageSourceLabel: "JNTO · Honpukuji Water Temple", imageSourceUrl: "https://www.japan.travel/en/spot/491/", photoCredit: "原型图像：Japan National Tourism Organization / 原页面署名",
  }),
  building({
    id: "BLD-HSBC", name: "香港汇丰总行大厦", originalName: "Hongkong and Shanghai Bank Headquarters", location: "Hong Kong, China", years: "1979—1986", architectIds: ["ARCH-FOSTER"], imageFile: "hsbc-hong-kong.webp",
    hook: "它像一台在城市中心现场组装的大机器，甚至把地面留给人群穿过",
    lookFor: ["外露桁架悬挂无柱楼层", "自动扶梯斜穿高大中庭", "预制部件从多地运来装配"],
    story: "Foster + Partners 重新质疑银行总部应该长什么样，连风水顾问也进入项目过程。大楼抬起底层，让城市人流从下面穿过，这个公共动作至今仍是它最有生命力的部分",
    sourceLabel: "Foster + Partners", sourceUrl: "https://www.fosterandpartners.com/projects/hongkong-and-shanghai-bank-headquarters/", imageSourceLabel: "Wikimedia Commons · HSBC Main Building", imageSourceUrl: "https://commons.wikimedia.org/wiki/File:HK_HSBC_Main_Building_2008.jpg", photoCredit: "原型图像：Wikimedia Commons；作者与许可见原文件页",
  }),
  building({
    id: "BLD-REICHSTAG", name: "德国国会大厦改造", originalName: "Reichstag, New German Parliament", location: "Berlin, Germany", years: "1992—1999", architectIds: ["ARCH-FOSTER"], imageFile: "reichstag.webp",
    hook: "公众沿玻璃穹顶走到议会之上，透明直接成为政治空间的表达",
    lookFor: ["双螺旋坡道让公众上升", "反光锥把日光导入议会厅", "新穹顶与历史墙体明确区分"],
    story: "改造保留历史痕迹，同时加入可步行的玻璃穹顶和环境系统。人们可以在议员上方行走，建筑把公众监督转化成直观空间关系",
    sourceLabel: "Foster + Partners", sourceUrl: "https://www.fosterandpartners.com/projects/reichstag-new-german-parliament/", imageSourceLabel: "Wikimedia Commons · Reichstag", imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Berlin_reichstag_west_panorama_2.jpg", photoCredit: "原型图像：Wikimedia Commons；作者与许可见原文件页",
  }),
  building({
    id: "BLD-HEARST", name: "赫斯特大厦", originalName: "Hearst Tower", location: "New York, USA", years: "2000—2006", architectIds: ["ARCH-FOSTER"], imageFile: "hearst-tower.webp",
    hook: "一张三角斜网从历史石砌基座上长出，让结构直接成为城市表情",
    lookFor: ["diagrid 三角网格", "新塔楼与旧基座之间的切换", "中庭把旧立面包入室内"],
    story: "项目保留 1920 年代的历史基座，再向上插入新结构。斜网体系减少传统竖向钢框架的材料需求，也让技术逻辑成为可见立面",
    sourceLabel: "Foster + Partners", sourceUrl: "https://www.fosterandpartners.com/projects/hearst-headquarters/", imageSourceLabel: "Wikimedia Commons · Hearst Tower", imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Hearst_Tower_(August_2024).jpg", photoCredit: "原型图像：Wikimedia Commons；作者与许可见原文件页",
  }),
  building({
    id: "BLD-HEYDAR", name: "盖达尔·阿利耶夫中心", originalName: "Heydar Aliyev Centre", location: "Baku, Azerbaijan", years: "2007—2012", architectIds: ["ARCH-ZAHA"], imageFile: "heydar-aliyev-centre.webp",
    hook: "地面、墙和屋顶像同一张白色表皮连续翻起，传统正立面直接逃跑",
    lookFor: ["广场地面卷成建筑外壳", "曲面接缝控制巨大尺度", "室内外流线连续"],
    story: "Zaha Hadid Architects 在 2007 年竞赛后受任。项目以连续地形回应巴库城市环境，也应在科普中保留其国家形象工程的政治背景，不把形式完全与语境切开",
    sourceLabel: "Zaha Hadid Architects", sourceUrl: "https://www.zaha-hadid.com/architecture/heydar-aliyev-centre/", imageSourceLabel: "Wikimedia Commons · Heydar Aliyev Center", imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Heydar_Aliyev_Cultural_Center.jpg", photoCredit: "原型图像：Wikimedia Commons；作者与许可见原文件页",
  }),
  building({
    id: "BLD-MAXXI", name: "MAXXI 国立二十一世纪艺术博物馆", originalName: "MAXXI", location: "Rome, Italy", years: "1998—2009", architectIds: ["ARCH-ZAHA"], imageFile: "maxxi.webp",
    hook: "多条城市道路在同一建筑里交叠、分叉和回头，展厅也跟着流动起来",
    lookFor: ["黑色楼梯穿过白色空间", "平行又交叉的展线", "线性天窗强调流动方向"],
    story: "MAXXI 把博物馆组织成流线场。观众不断选择路径，空间体验接近在城市中游走，也给展览策划带来很高自由度和挑战",
    sourceLabel: "Zaha Hadid Architects", sourceUrl: "https://www.zaha-hadid.com/architecture/maxxi/", imageSourceLabel: "Wikimedia Commons · MAXXI", imageSourceUrl: "https://commons.wikimedia.org/wiki/File:MAXXI_(27483747665).jpg", photoCredit: "原型图像：Wikimedia Commons；作者与许可见原文件页",
  }),
  building({
    id: "BLD-DAXING", name: "北京大兴国际机场", originalName: "Beijing Daxing International Airport", location: "Beijing, China", years: "2014—2019", architectIds: ["ARCH-ZAHA"], imageFile: "beijing-daxing.webp",
    hook: "六条指廊从中央大厅放射出去，用连续屋顶把巨大客流压缩成可理解的方向",
    lookFor: ["放射状总体减少步行距离", "屋顶曲面与柱网共同导向", "天窗把自然光带进中央空间"],
    story: "大型交通建筑的曲线同时解决航站流程、行李、轨道接驳与数以万计旅客的方向感，背后是一整套团队工程",
    sourceLabel: "Zaha Hadid Architects", sourceUrl: "https://www.zaha-hadid.com/architecture/beijing-daxing-international-airport/", imageSourceLabel: "Wikimedia Commons · Beijing Daxing", imageSourceUrl: "https://commons.wikimedia.org/wiki/File:%E5%8C%97%E4%BA%AC%E5%A4%A7%E5%85%B4%E6%9C%BA%E5%9C%BA%E8%88%AA%E7%AB%99%E6%A5%BC,_2023-02-20_(1).jpg", photoCredit: "原型图像：Wikimedia Commons；作者与许可见原文件页",
  }),
  building({
    id: "BLD-SAGRADA", name: "圣家堂", originalName: "Basílica de la Sagrada Família", location: "Barcelona, Spain", years: "1883 起，持续建设", architectIds: ["ARCH-GAUDI"], imageFile: "sagrada-familia.webp",
    hook: "柱子像森林分叉，彩色光在石头里移动，一座建筑把几代人的时间一起装进去",
    lookFor: ["树状柱将力分散到空间", "几何曲面同时服务结构与装饰", "不同立面用雕塑讲述不同叙事"],
    story: "Gaudí 1883 年接手项目并不断重构设计。建筑在他去世后由多代建筑师、工程师和工匠继续推进，未完成状态本身就是作品历史的一部分",
    sourceLabel: "Basílica de la Sagrada Família", sourceUrl: "https://sagradafamilia.org/en/architecture", imageSourceLabel: "Wikimedia Commons · Sagrada Família", imageSourceUrl: "https://commons.wikimedia.org/wiki/File:SF_maig_2_cropped.jpg", photoCredit: "原型图像：Wikimedia Commons；作者与许可见原文件页",
  }),
  building({
    id: "BLD-CASA-BATLLO", name: "巴特罗之家", originalName: "Casa Batlló", location: "Barcelona, Spain", years: "1904—1906 改造", architectIds: ["ARCH-GAUDI"], imageFile: "casa-batllo.webp",
    hook: "面具阳台、骨状柱和龙鳞屋顶，让一栋普通住宅改造变成整条街的神话角色",
    lookFor: ["波浪状立面反射不同光线", "彩色碎瓷与回收材料", "屋顶可被读成龙背与圣乔治传说"],
    story: "原建筑 1877 年建成，Gaudí 没有按最初设想拆除，而在 1904—1906 年彻底改造立面、采光井和室内。许多符号没有唯一官方答案，观众的想象本来就是作品的一部分",
    sourceLabel: "Casa Batlló", sourceUrl: "https://www.casabatllo.es/en/antoni-gaudi/casa-batllo/facade/", photoCredit: "图源：Casa Batlló / 原页面署名",
  }),
  building({
    id: "BLD-PARK-GUELL", name: "桂尔公园", originalName: "Park Güell", location: "Barcelona, Spain", years: "1900—1914", architectIds: ["ARCH-GAUDI"], imageFile: "park-guell.webp",
    hook: "一个商业上失败的住宅区计划，最后靠曲线、碎瓷和地形变成公共乐园",
    lookFor: ["长椅顺着广场边缘起伏", "高架廊道兼顾交通与排水", "碎瓷拼贴把废料变成连续表皮"],
    story: "Eusebi Güell 原本委托 Gaudí 建造受英国住宅公园启发的开发项目，但交通和销售困难使工程停止，只完成两栋住宅。1926 年后它作为市政公园开放",
    sourceLabel: "Casa Batlló · Park Güell", sourceUrl: "https://www.casabatllo.es/en/antoni-gaudi/park-guell/", photoCredit: "图源：Casa Batlló / 原页面署名",
  }),
  building({
    id: "BLD-NINGBO", name: "宁波历史博物馆", originalName: "Ningbo History Museum", location: "Ningbo, China", years: "2003—2008", architectIds: ["ARCH-WANG-LU"], imageFile: "ningbo-history-museum.webp",
    hook: "被拆村落的旧砖瓦作为新墙材料重新进入城市，记忆也跟着回来",
    lookFor: ["瓦爿墙混合不同年代砖瓦", "巨大体量像被切开的山", "不规则开口打断纪念性"],
    story: "博物馆使用周边城市化过程中回收的大量旧砖瓦，并结合地方瓦爿墙工法，让真实旧材料与当代大型公共建筑发生冲突",
    sourceLabel: "The Pritzker Architecture Prize", sourceUrl: "https://www.pritzkerprize.com/sites/default/files/file_fields/field_files_inline/2013_essay.pdf", imageSourceLabel: "Wikimedia Commons · Ningbo Museum", imageSourceUrl: "https://commons.wikimedia.org/wiki/File:South_Gate_of_Ningbo_Museum.jpg", photoCredit: "原型图像：Wikimedia Commons；作者与许可见原文件页",
  }),
  building({
    id: "BLD-XIANGSHAN", name: "中国美术学院象山校区", originalName: "Xiangshan Campus, China Academy of Art", location: "Hangzhou, China", years: "2002—2007", architectIds: ["ARCH-WANG-LU"], imageFile: "xiangshan-campus.webp",
    hook: "校园没有靠一条宏大轴线统治山水，而用院落、廊桥和屋顶拼出可以迷路的日常",
    lookFor: ["建筑围绕象山与水系展开", "旧瓦形成连续屋面肌理", "廊道和院落构成慢速路径"],
    story: "两期校园通过不同建筑围合出复杂公共空间。形式看似自由，却不断引用江南聚落的尺度、屋顶和绕行经验，使学习发生在教室之外",
    sourceLabel: "The Pritzker Architecture Prize", sourceUrl: "https://www.pritzkerprize.com/sites/default/files/inline-files/2012_Essay_0.pdf", imageSourceLabel: "Pritzker Prize · Xiangshan Campus", imageSourceUrl: "https://www.pritzkerprize.com/laureates/2012", photoCredit: "建筑摄影：吕恒中；图源：The Pritzker Architecture Prize",
  }),
  building({
    id: "BLD-WENCUN", name: "富阳文村村落改造", originalName: "Wencun Village", location: "Hangzhou Fuyang, China", years: "2012—2016", architectIds: ["ARCH-WANG-LU"], imageFile: "wencun-village.webp",
    hook: "新房继续说旧材料、窄巷和公共生活的语言，村庄更新没有抹掉原来的声调",
    lookFor: ["新旧材料并置", "房屋尺度保持村落节奏", "公共路径与院落优先于孤立造型"],
    story: "项目尝试在真实村落生活、现代居住需求和传统建造记忆之间寻找中间状态。它不把乡村冻结成景区，也不接受一键清空式的新建",
    sourceLabel: "ArchDaily · Kenneth Frampton on Wang Shu and Lu Wenyu", sourceUrl: "https://www.archdaily.com/867419/kenneth-frampton-on-the-work-of-wang-shu-and-lu-wenyu", imageSourceLabel: "ArchDaily · Wencun Village", imageSourceUrl: "https://www.archdaily.com/867419/kenneth-frampton-on-the-work-of-wang-shu-and-lu-wenyu", photoCredit: "建筑摄影：Iwan Baan；图片由 Louisiana 提供；图源：ArchDaily",
  }),
  building({
    id: "BLD-NEUE-NATIONALGALERIE", name: "新国家美术馆", originalName: "Neue Nationalgalerie", location: "Berlin, Germany", years: "1965—1968", architectIds: ["ARCH-MIES"], imageFile: "neue-nationalgalerie.jpg",
    hook: "一片巨大的黑色钢屋顶只由八根柱子托住，展厅像城市里一间透明而安静的大厅",
    lookFor: ["屋顶与玻璃幕墙彼此分开", "转角没有柱子", "基座把下层展厅藏进城市地面"],
    story: "这是 Mies 晚年在欧洲完成的重要作品，极少构件承担了极强秩序，也让展览如何适应开放大厅成为持续被讨论的问题",
    sourceLabel: "Staatliche Museen zu Berlin", sourceUrl: "https://www.smb.museum/en/museums-institutions/neue-nationalgalerie/about-us/the-building/", imageSourceLabel: "Wikimedia Commons · Neue Nationalgalerie", imageSourceUrl: "https://commons.wikimedia.org/wiki/File:2021-09-02-Neue-Nationalgalerie-2021-a.jpg", photoCredit: "原型图像：Wikimedia Commons；作者与许可见原文件页",
  }),
  building({
    id: "BLD-CROWN-HALL", name: "克朗楼", originalName: "S. R. Crown Hall", location: "Chicago, USA", years: "1950—1956", architectIds: ["ARCH-MIES"], imageFile: "crown-hall.jpg",
    hook: "四榀外露钢架把屋顶从上方吊起，室内因此得到一整片几乎无柱的建筑工作室",
    lookFor: ["黑色钢架跨过整座大厅", "玻璃下半部以磨砂控制视线", "开放平面让教学持续重组"],
    story: "Crown Hall 是伊利诺伊理工学院建筑学院的核心空间，结构被放到外部，内部则留给不断变化的桌子、模型和讨论",
    sourceLabel: "Mies van der Rohe Society", sourceUrl: "https://miessociety.org/crown-hall", imageSourceLabel: "Wikimedia Commons · Crown Hall", imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Crown_Hall_2.jpg", photoCredit: "原型图像：Wikimedia Commons；作者与许可见原文件页",
  }),
  building({
    id: "BLD-GUGGENHEIM", name: "古根海姆博物馆", originalName: "Solomon R. Guggenheim Museum", location: "New York, USA", years: "1943—1959", architectIds: ["ARCH-WRIGHT"], imageFile: "guggenheim-new-york.jpg",
    hook: "观众先乘电梯到顶层，再沿连续螺旋坡道一边看展一边缓慢回到城市",
    lookFor: ["白色螺旋体量对比街区网格", "中央天窗照亮通高大厅", "坡道同时是路线与展厅"],
    story: "Wright 花了十多年反复推进设计，建筑在他去世后开放，也让博物馆空间究竟应当服务作品还是拥有自身主角地位成为经典争论",
    sourceLabel: "Solomon R. Guggenheim Museum", sourceUrl: "https://www.guggenheim.org/the-frank-lloyd-wright-building", imageSourceLabel: "Wikimedia Commons · Guggenheim Museum", imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Solomon_R._Guggenheim_Museum_(48059131351).jpg", photoCredit: "原型图像：Wikimedia Commons；作者与许可见原文件页",
  }),
  building({
    id: "BLD-JOHNSON-WAX", name: "约翰逊制蜡公司总部", originalName: "S. C. Johnson Administrative Complex", location: "Racine, Wisconsin, USA", years: "1936—1950", architectIds: ["ARCH-WRIGHT"], imageFile: "johnson-wax.jpg",
    hook: "细得惊人的柱脚向上张成睡莲圆盘，把没有传统窗户的办公室变成一片明亮室内森林",
    lookFor: ["蘑菇状混凝土柱", "玻璃管带来漫射天光", "研究塔楼从中央核心悬挑楼板"],
    story: "创新结构和玻璃管也带来工程难题，屋顶漏水时业主甚至在桌上放桶接水，这座总部同时展示了空间想象和技术试错",
    sourceLabel: "Frank Lloyd Wright Foundation", sourceUrl: "https://franklloydwright.org/site/s-c-johnson-administrative-complex/", imageSourceLabel: "Architecture History · Johnson Wax Building", imageSourceUrl: "https://architecture-history.org/architects/architects/WRIGHT/OBJECTS/1936-1939%2C%20Johnson%20Wax%20Building%2C%20RACINE%2C%20WISCONSIN%2C%20UNITED%20STATES.html", photoCredit: "原型图像：Architecture History / 原页面署名；公开前复核授权",
  }),
  building({
    id: "BLD-VILLA-SAVOYE", name: "萨伏伊别墅", originalName: "Villa Savoye", location: "Poissy, France", years: "1928—1931", architectIds: ["ARCH-CORBU"], imageFile: "villa-savoye.jpg",
    hook: "白色住宅像一件物体轻放在草地上，汽车转弯、坡道上升和屋顶花园共同决定它的形状",
    lookFor: ["细柱抬起主要体量", "自由立面开出水平长窗", "坡道把入口连接到屋顶"],
    story: "它是现代建筑五点的集中展示，也经历过漏水、战时破坏和险些拆除，经典并不意味着真实居住没有代价",
    sourceLabel: "Fondation Le Corbusier", sourceUrl: "https://www.fondationlecorbusier.fr/oeuvre-architecture/realisations-villa-savoye-et-loge-du-jardinier-poissy-france-1928-1931/", imageSourceLabel: "SketchUp Community · Villa Savoye", imageSourceUrl: "https://forums.sketchup.com/t/modeling-an-icon-le-corbusier-s-villa-savoye-live/345587", photoCredit: "原型图像：SketchUp Community / 原页面署名；公开前复核授权",
  }),
  building({
    id: "BLD-RONCHAMP", name: "朗香教堂", originalName: "Notre-Dame du Haut", location: "Ronchamp, France", years: "1950—1955", architectIds: ["ARCH-CORBU"], imageFile: "ronchamp.jpg",
    hook: "厚墙、弯曲屋顶和大小不一的彩色开口，把现代主义的直线纪律突然推向雕塑和光",
    lookFor: ["屋顶像漂浮的巨大壳体", "南墙深洞捕捉彩色光", "三座采光塔组织小礼拜空间"],
    story: "它证明 Le Corbusier 的现代主义并不只有标准化盒子，晚期作品重新拥抱曲线、重量、象征和不可复制的场所体验",
    sourceLabel: "Colline Notre-Dame du Haut", sourceUrl: "https://www.collinenotredameduhaut.com/", imageSourceLabel: "Architectural Digest · Ronchamp", imageSourceUrl: "https://www.architecturaldigest.com/gallery/modern-architecture-buildings-you-must-visit-before-you-die", photoCredit: "图源：Architectural Digest / 原页面署名；公开前复核授权",
  }),
  building({
    id: "BLD-MODERN-FORT-WORTH", name: "沃思堡现代艺术博物馆", originalName: "Modern Art Museum of Fort Worth", location: "Fort Worth, Texas, USA", years: "1997—2002", architectIds: ["ARCH-ANDO"], imageFile: "modern-fort-worth.jpg",
    hook: "五片平顶展馆落在水池边，巨大的 Y 形混凝土柱让屋顶显得同时沉重又漂浮",
    lookFor: ["水面把建筑复制成倒影", "Y 形柱支撑深远屋顶", "玻璃外皮包围更安静的展厅盒子"],
    story: "建筑把安藤熟悉的混凝土、光与水放进德州尺度，白天清晰克制，夜晚则依靠倒影把博物馆变成发光的水平地景",
    sourceLabel: "Modern Art Museum of Fort Worth", sourceUrl: "https://www.themodern.org/building", imageSourceLabel: "Modern Art Museum of Fort Worth", imageSourceUrl: "https://www.themodern.org/program/art-101-andos-architecture", photoCredit: "图源：Modern Art Museum of Fort Worth / 原页面署名",
  }),
  building({
    id: "BLD-2121", name: "21_21 DESIGN SIGHT", originalName: "21_21 DESIGN SIGHT", location: "Tokyo, Japan", years: "2004—2007", architectIds: ["ARCH-ANDO"], imageFile: "2121-design-sight.jpg",
    hook: "一片折叠钢屋顶低低贴住草坡，大部分展览空间安静地藏到地下",
    lookFor: ["折板屋顶来自一块布的动作", "狭长开口贴近地面", "地下空间由清水混凝土和天光组织"],
    story: "项目与服装设计师三宅一生的创意方向相连，建筑不靠巨大体量抢占公园，而用折线屋顶给设计研究留下一个克制入口",
    sourceLabel: "21_21 DESIGN SIGHT", sourceUrl: "https://www.2121designsight.jp/en/information/", imageSourceLabel: "21_21 DESIGN SIGHT", imageSourceUrl: "https://www.2121designsight.jp/en/information/", photoCredit: "图源：21_21 DESIGN SIGHT / 原页面署名",
  }),
  building({
    id: "BLD-30-ST-MARY", name: "圣玛丽斧街 30 号", originalName: "30 St Mary Axe", location: "London, UK", years: "1997—2004", architectIds: ["ARCH-FOSTER"], imageFile: "30-st-mary-axe.jpg",
    hook: "圆形平面和旋转上升的通风中庭，让一座办公塔摆脱普通玻璃盒子的能耗和体态",
    lookFor: ["三角斜网直接承担结构", "螺旋光井引入空气和日光", "收窄底部把地面还给城市"],
    story: "这座被称作小黄瓜的塔楼用空气动力学外形和自然通风策略重新塑造伦敦天际线，也让技术性能成为公众能一眼认出的城市形象",
    sourceLabel: "Foster + Partners", sourceUrl: "https://www.fosterandpartners.com/news/30-st-mary-axe-london", imageSourceLabel: "ArchKite · 30 St Mary Axe", imageSourceUrl: "https://archkite.ir/gherkin/", photoCredit: "原型图像：ArchKite；原页面署名与许可待复核",
  }),
  building({
    id: "BLD-MILLAU", name: "米约高架桥", originalName: "Millau Viaduct", location: "Aveyron, France", years: "1996—2004", architectIds: ["ARCH-FOSTER"], imageFile: "millau-viaduct.jpg",
    hook: "七根极细桥墩把道路抬过山谷，工程体量巨大，落在风景里的动作却尽可能轻",
    lookFor: ["桥墩向道路处分叉", "连续钢桥面跨越 2.46 公里", "桅杆与拉索形成稳定节奏"],
    story: "项目由 Foster + Partners 与工程师 Michel Virlogeux 等合作，结构效率和景观表达从一开始就被当作同一个问题",
    sourceLabel: "Foster + Partners", sourceUrl: "https://www.fosterandpartners.com/projects/millau-viaduct/", imageSourceLabel: "Xataka · Millau Viaduct", imageSourceUrl: "https://www.xataka.com/otros/asi-viaducto-millau-obra-maestra-ingenieria-343-metros-alto-inmenso-valle", photoCredit: "原型图像：Xataka / 原页面署名；公开前复核授权",
  }),
  building({
    id: "BLD-LONDON-AQUATICS", name: "伦敦水上运动中心", originalName: "London Aquatics Centre", location: "London, UK", years: "2005—2011", architectIds: ["ARCH-ZAHA"], imageFile: "london-aquatics-centre.jpg",
    hook: "一片起伏屋顶像水面波浪跨过泳池，奥运临时看台拆除后又缩回日常社区尺度",
    lookFor: ["屋顶以单一曲面覆盖主池", "永久体量与临时座席分开", "两侧玻璃重新打开公园视线"],
    story: "建筑从奥运赛事模式转换为公共泳馆，曲线在这里不仅负责姿态，也要处理大跨度、观众视线和赛后长期使用",
    sourceLabel: "Zaha Hadid Architects", sourceUrl: "https://www.zaha-hadid.com/2021/07/30/london-aquatics-centre-completed-10-years-ago/", imageSourceLabel: "Domus · London Aquatics Centre", imageSourceUrl: "https://www.domusweb.it/en/architecture/2014/02/27/london_aquatics_centre.html", photoCredit: "图源：Domus / 原页面署名；公开前复核授权",
  }),
  building({
    id: "BLD-GUANGZHOU-OPERA", name: "广州大剧院", originalName: "Guangzhou Opera House", location: "Guangzhou, China", years: "2003—2010", architectIds: ["ARCH-ZAHA"], imageFile: "guangzhou-opera-house.jpg",
    hook: "两块被河流侵蚀的巨石落在珠江边，折线峡谷把城市人流和自然光带进建筑内部",
    lookFor: ["双体量回应河岸与城市", "折线切开入口和公共大厅", "表皮接缝把复杂几何拆成可建造单元"],
    story: "设计从地质、河谷和侵蚀得到空间逻辑，外部看似自由的形体背后，是声学、表演流程与复杂幕墙工程的共同结果",
    sourceLabel: "Zaha Hadid Architects", sourceUrl: "https://www.zaha-hadid.com/wp-content/uploads/2019/12/guangzhouoperahouse.pdf", imageSourceLabel: "Advisor.Travel · Guangzhou Opera House", imageSourceUrl: "https://uz.advisor.travel/poi/Guangzhou-Opera-House-19981", photoCredit: "原型图像：Advisor.Travel / 原页面署名；公开前复核授权",
  }),
  building({
    id: "BLD-CASA-MILA", name: "米拉之家", originalName: "Casa Milà / La Pedrera", location: "Barcelona, Spain", years: "1906—1912", architectIds: ["ARCH-GAUDI"], imageFile: "casa-mila.jpg",
    hook: "石头立面像海浪连续起伏，屋顶烟囱又变成一队戴头盔的陌生角色",
    lookFor: ["自由石材立面不直接承重", "内院把光带进深处住宅", "屋顶通风塔与烟囱成为雕塑"],
    story: "这是 Gaudí 最后完成的民用住宅作品，结构、采光、车库和屋顶设备都被重新设计，功能创新没有被装饰遮住",
    sourceLabel: "La Pedrera Official", sourceUrl: "https://www.lapedrera.com/en/casa-mila/", imageSourceLabel: "Wikimedia Commons · Casa Milà", imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Casa_Mil%C3%A0,_general_view.jpg", photoCredit: "原型图像：Wikimedia Commons；作者与许可见原文件页",
  }),
  building({
    id: "BLD-PALAU-GUELL", name: "桂尔宫", originalName: "Palau Güell", location: "Barcelona, Spain", years: "1886—1890", architectIds: ["ARCH-GAUDI"], imageFile: "palau-guell.jpg",
    hook: "狭窄街道里的深色宫殿把马车、会客、音乐和屋顶奇异烟囱组织成一场垂直戏剧",
    lookFor: ["抛物线拱门让马车进入", "中央大厅贯通多层并由顶部采光", "每座烟囱都有不同碎瓷表情"],
    story: "早期作品已经显示 Gaudí 如何把结构、工艺和社会仪式编在一起，外立面克制，真正的戏剧逐层藏在内部",
    sourceLabel: "Palau Güell", sourceUrl: "https://www.palauguell.cat/en", imageSourceLabel: "Wikimedia Commons · Palau Güell", imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Palau_G%C3%BCell,_Antoni_Gaudi,_Barcelona_2.jpg", photoCredit: "原型图像：Wikimedia Commons；作者与许可见原文件页",
  }),
  building({
    id: "BLD-CERAMIC-HOUSE", name: "金华瓷屋", originalName: "Ceramic House", location: "Jinhua, China", years: "2003—2006", architectIds: ["ARCH-WANG-LU"], imageFile: "ceramic-house.jpg",
    hook: "一座很小的茶室把陶瓷碎片、墨色墙面和不规则开口压缩成可进入的材料实验",
    lookFor: ["陶片覆盖弯曲外墙", "小尺度路径不断转折", "手工表面与精确几何并置"],
    story: "它体量不大，却清楚展示了业余建筑工作室对材料、工艺和当代空间的兴趣，代表作不一定都靠宏大规模成立",
    sourceLabel: "The Pritzker Architecture Prize", sourceUrl: "https://www.pritzkerprize.com/laureates/2012", imageSourceLabel: "Pritzker Prize · Ceramic House", imageSourceUrl: "https://www.pritzkerprize.com/laureates/2012", photoCredit: "建筑摄影：吕恒中；图源：The Pritzker Architecture Prize",
  }),
  building({
    id: "BLD-WENZHENG-LIBRARY", name: "文正学院图书馆", originalName: "Library of Wenzheng College", location: "Suzhou, China", years: "1999—2000", architectIds: ["ARCH-WANG-LU"], imageFile: "wenzheng-library.jpg",
    hook: "图书馆把主要体量压到水面以下，零散小屋和廊道则继续苏州园林的步行尺度",
    lookFor: ["主体下沉以避开巨型纪念感", "路径跨水连接不同体量", "白墙、深色屋顶与当代结构并置"],
    story: "作品借用藏、露、绕行和临水关系，让一座现代校园图书馆继续保有地方空间经验",
    sourceLabel: "The Pritzker Architecture Prize", sourceUrl: "https://www.pritzkerprize.com/laureates/2012", imageSourceLabel: "Pritzker Prize · Library of Wenzheng College", imageSourceUrl: "https://www.pritzkerprize.com/laureates/2012", photoCredit: "建筑摄影：陆文宇；图源：The Pritzker Architecture Prize",
  }),
  ...NEW_PERSONA_BUILDINGS,
] as const;

export const BUILDING_BY_ID = Object.fromEntries(
  BUILDINGS.map((item) => [item.id, item]),
) as Record<string, Building>;
