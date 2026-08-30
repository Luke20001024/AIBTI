export type VoidV2Source = {
  subject: string;
  label: string;
  url: string;
};

export const VOID_V2_SOURCES = [
  {
    subject: "安藤忠雄",
    label: "Pritzker Prize · Biography: Tadao Ando",
    url: "https://www.pritzkerprize.com/biography-tadao-ando",
  },
  {
    subject: "光之教堂 · 1989",
    label: "The Museum of Modern Art · Tadao Ando works",
    url: "https://www.moma.org/artists/7055-tadao-ando",
  },
  {
    subject: "水御堂 · 1991",
    label: "Japan National Tourism Organization · Honpukuji Water Temple",
    url: "https://www.japan.travel/id/spot/491/",
  },
  {
    subject: "水御堂 · 方案故事",
    label: "Google Arts & Culture · Tadao Ando Architect & Associates",
    url: "https://artsandculture.google.com/story/ZAXxgA9pAi7vIA?hl=ja",
  },
  {
    subject: "地中美术馆 · 2004",
    label: "Benesse Art Site Naoshima · Chichu Art Museum",
    url: "https://benesse-artsite.jp/en/art/chichu.html",
  },
  {
    subject: "路易斯·康",
    label: "Kimbell Art Museum · The Louis I. Kahn Building",
    url: "https://50.kimbellart.org/architecture/the-louis-i-kahn-building/",
  },
  {
    subject: "彼得·卒姆托",
    label: "Pritzker Prize · Biography: Peter Zumthor",
    url: "https://www.pritzkerprize.com/biography-peter-zumthor",
  },
  {
    subject: "金贝尔艺术博物馆 · 真实照片",
    label: "Wikimedia Commons · Kevin Muncie · CC BY-SA 2.0",
    url: "https://commons.wikimedia.org/wiki/File:Kimbell_Art_Museum_with_Moore_sculpture.jpg",
  },
  {
    subject: "瓦尔斯温泉 · 真实照片",
    label: "Wikimedia Commons · Micha L. Rieser · Attribution",
    url: "https://commons.wikimedia.org/wiki/File:Therme_Vals_facade,_Vals,_Graub%C3%BCnden,_Switzerland_-_20090809.jpg",
  },
  {
    subject: "沃思堡现代艺术博物馆",
    label: "Modern Art Museum of Fort Worth · The Building",
    url: "https://www.themodern.org/building",
  },
  {
    subject: "21_21 DESIGN SIGHT",
    label: "21_21 DESIGN SIGHT · About the Architecture",
    url: "https://www.2121designsight.jp/en/information/",
  },
] as const satisfies readonly VoidV2Source[];
