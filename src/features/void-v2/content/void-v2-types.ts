export type VoidReactionId = "light" | "boundary" | "path";
export type VoidStyleId = "modernism" | "minimalism" | "regionalism";
export type VoidWorkId = "cut" | "detour" | "bury";

export type VoidPersonalityFacet = {
  index: string;
  title: string;
  body: readonly string[];
};

export type VoidReaction = {
  id: VoidReactionId;
  index: string;
  title: string;
  glyph: string;
  role: string;
  headline: readonly string[];
  body: readonly string[];
  condition: string;
  counterexample: string;
  keywords: readonly string[];
  image: string;
  imageAlt: string;
  objectPosition: string;
};

export type VoidStyleLayer = {
  id: VoidStyleId;
  index: string;
  name: string;
  role: string;
  body: readonly string[];
  contribution: string;
};

export type VoidWork = {
  id: VoidWorkId;
  instinct: string;
  action: string;
  name: string;
  originalName: string;
  year: string;
  location: string;
  hook: readonly string[];
  cardHook: string;
  detailTitle: string;
  takeawayTitle: string;
  cta: string;
  observations: readonly string[];
  story: readonly string[];
  significance: string;
  keyFact: string;
  takeaway: string;
  image: string;
  imageAlt: string;
  objectPosition: string;
  gallery: readonly {
    image: string;
    imageAlt: string;
  }[];
};

export type VoidLineageItem = {
  name: string;
  originalName: string;
  years: string;
  method: string;
  body: readonly string[];
  detailTitle: string;
  detailBody: string;
  relation: string;
  featuredWork: string;
  workNote: string;
  cta: string;
  keywords: readonly string[];
  image: string;
  imageAlt: string;
  tone: "light" | "dark";
};

export type VoidFurtherWork = {
  name: string;
  originalName: string;
  years: string;
  hook: string;
  keywords: readonly string[];
  image: string;
  imageAlt: string;
};

export type VoidLineageDimension = {
  label: string;
  values: readonly string[];
};

export type VoidV2Content = {
  hero: {
    code: string;
    title: string;
    statement: readonly string[];
    traits: readonly string[];
    styles: readonly string[];
    poster: string;
    posterAlt: string;
    background: string;
    backgroundAlt: string;
    persona: string;
    personaAlt: string;
  };
  digest: {
    label: string;
    title: string;
    body: readonly string[];
    styleBridge: string;
    caveat: string;
  };
  personality: {
    title: string;
    passport: readonly {
      label: string;
      value: string;
    }[];
    facets: readonly VoidPersonalityFacet[];
    logicTitle: string;
    logic: readonly string[];
  };
  reactions: {
    title: string;
    lead: string;
    counterpoint: string;
    items: readonly VoidReaction[];
  };
  shadow: {
    headline: readonly string[];
    desiredTitle: string;
    desired: readonly string[];
    rejectedTitle: string;
    rejected: readonly string[];
    darkTitle: string;
    darkLead: string;
    darkBody: readonly string[];
  };
  styles: {
    title: string;
    lead: readonly string[];
    image: string;
    imageAlt: string;
    layers: readonly VoidStyleLayer[];
    closing: readonly string[];
  };
  architect: {
    lead: readonly string[];
    interruption: string;
    actionLead: string;
    actions: readonly string[];
    name: string;
    originalName: string;
    years: string;
    descriptor: string;
    storyTitle: string;
    story: readonly string[];
    image: string;
    imageAlt: string;
    sectionLabel: string;
    sectionTitle: readonly string[];
    summary: string;
    detailTitle: string;
    detailBody: string;
    methodTitle: string;
    methodBody: string;
    cta: string;
  };
  works: {
    title: string;
    lead: string;
    items: readonly VoidWork[];
  };
  lineage: {
    title: readonly string[];
    lead: string;
    comparisonHeads: readonly string[];
    comparison: readonly VoidLineageDimension[];
    items: readonly VoidLineageItem[];
    furtherTitle: string;
    further: readonly VoidFurtherWork[];
  };
  ending: {
    judgment: readonly string[];
    primaryAction: string;
    secondaryAction: string;
    socialPrompt: string;
    previewCaption: string;
    generateError: string;
    saveNotice: string;
    shareSuccess: string;
    retest: string;
    sources: string;
  };
};
