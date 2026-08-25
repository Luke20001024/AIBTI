import type { ReactNode } from "react";

export const QUESTION_VISUAL_KINDS = [
  "mass",
  "flow",
  "module",
  "light",
  "courtyard",
  "ornament",
  "earth",
  "concrete",
  "steel",
  "giant",
  "framed",
  "ribbon",
  "repair",
  "landscape",
  "grid-gap",
  "weather",
  "impossible",
] as const;

export type QuestionVisualKind = (typeof QUESTION_VISUAL_KINDS)[number];

type QuestionVisualProps = {
  kind: QuestionVisualKind;
  selected?: boolean;
};

const COLOR = {
  paper: "#efe9dd",
  paperSelected: "#e2e9f3",
  paperDeep: "#d8d0c1",
  ink: "#171919",
  line: "#817d74",
  blue: "#245aa6",
  bluePale: "#9fb8d1",
  green: "#5c765d",
  greenPale: "#a5b59b",
  brick: "#a34f36",
  ochre: "#c38b34",
  violet: "#66529a",
  concrete: "#9a9994",
  steel: "#70858f",
} as const;

const line = {
  fill: "none",
  stroke: COLOR.ink,
  strokeWidth: 1,
  strokeLinecap: "square" as const,
  strokeLinejoin: "miter" as const,
  vectorEffect: "non-scaling-stroke" as const,
};

function VisualDiagram({ kind }: { kind: QuestionVisualKind }): ReactNode {
  switch (kind) {
    case "mass":
      return (
        <>
          <path d="M15 84H146" {...line} />
          <path d="M28 37H122L139 52H45Z" fill={COLOR.concrete} stroke={COLOR.ink} />
          <path d="M45 52H139V84H45Z" fill="#777874" stroke={COLOR.ink} />
          <path d="M28 37L45 52V84L28 68Z" fill="#b7b4aa" stroke={COLOR.ink} />
          <path d="M75 57H106V84H75Z" fill={COLOR.ink} />
          <path d="M75 57L86 65H106V57Z" fill={COLOR.blue} />
          <path d="M19 31H106" stroke={COLOR.blue} strokeWidth="4" />
        </>
      );

    case "flow":
      return (
        <>
          <path d="M11 85H149" {...line} />
          <path
            d="M18 76C38 38 61 27 89 30C113 32 133 47 148 27C138 65 119 81 88 80C59 79 40 65 18 76Z"
            fill={COLOR.violet}
            stroke={COLOR.ink}
          />
          <path
            d="M24 73C48 58 59 44 84 44C111 44 123 58 139 46C128 69 110 75 87 72C60 68 48 58 24 73Z"
            fill={COLOR.paper}
            stroke={COLOR.ink}
          />
          <path d="M100 30C116 33 131 45 148 27" stroke={COLOR.ochre} strokeWidth="5" fill="none" />
          <circle cx="83" cy="83" r="2.5" fill={COLOR.blue} />
        </>
      );

    case "module":
      return (
        <>
          <path d="M14 87H147" {...line} />
          <path d="M38 24H111V87H38Z" fill={COLOR.paperDeep} stroke={COLOR.ink} />
          {[0, 1, 2].map((row) =>
            [0, 1, 2, 3].map((column) => (
              <rect
                key={`${row}-${column}`}
                x={42 + column * 17}
                y={29 + row * 18}
                width="13"
                height="13"
                fill={row === 1 && column === 2 ? COLOR.blue : row === 2 && column === 0 ? COLOR.green : COLOR.paper}
                stroke={COLOR.ink}
              />
            )),
          )}
          <path d="M111 42L131 31V46L111 57Z" fill={COLOR.blue} stroke={COLOR.ink} />
          <path d="M116 65H143V84H116Z" fill={COLOR.ink} />
          <path d="M119 68H140V81H119Z" fill={COLOR.paper} />
        </>
      );

    case "light":
      return (
        <>
          <path d="M17 18H143V88H17Z" fill={COLOR.ink} />
          <path d="M75 18H85V88H75Z" fill={COLOR.paper} />
          <path d="M75 24L31 88H75Z" fill={COLOR.bluePale} />
          <path d="M85 24L129 88H85Z" fill="#f4d997" />
          <path d="M17 88H143" stroke={COLOR.ink} />
          <circle cx="113" cy="76" r="3" fill={COLOR.brick} />
          <path d="M113 79V87" stroke={COLOR.brick} strokeWidth="1.5" />
        </>
      );

    case "courtyard":
      return (
        <>
          <path d="M19 32L80 17L141 32L80 47Z" fill={COLOR.paperDeep} stroke={COLOR.ink} />
          <path d="M19 32V74L80 90V47Z" fill="#c3b7a2" stroke={COLOR.ink} />
          <path d="M141 32V74L80 90V47Z" fill="#ded5c6" stroke={COLOR.ink} />
          <path d="M48 40L80 32L112 40L80 48Z" fill={COLOR.greenPale} stroke={COLOR.ink} />
          <path d="M48 40V63L80 72V48Z" fill={COLOR.paper} stroke={COLOR.ink} />
          <path d="M112 40V63L80 72V48Z" fill={COLOR.paper} stroke={COLOR.ink} />
          <path d="M80 48V68" stroke={COLOR.ink} />
          <circle cx="80" cy="43" r="8" fill={COLOR.green} stroke={COLOR.ink} />
          <path d="M80 51V64" stroke={COLOR.ink} strokeWidth="2" />
        </>
      );

    case "ornament":
      return (
        <>
          <path d="M26 19H134V88H26Z" fill={COLOR.paperDeep} stroke={COLOR.ink} />
          <path d="M26 19L45 11L134 19" fill={COLOR.ochre} stroke={COLOR.ink} />
          <path d="M43 88V48C43 34 62 34 62 48V88Z" fill={COLOR.brick} stroke={COLOR.ink} />
          <path d="M72 88V43C72 27 91 27 91 43V88Z" fill={COLOR.blue} stroke={COLOR.ink} />
          <path d="M101 88V48C101 34 120 34 120 48V88Z" fill={COLOR.green} stroke={COLOR.ink} />
          <circle cx="52.5" cy="29" r="4" fill={COLOR.violet} stroke={COLOR.ink} />
          <circle cx="81.5" cy="23" r="4" fill={COLOR.brick} stroke={COLOR.ink} />
          <circle cx="110.5" cy="29" r="4" fill={COLOR.ochre} stroke={COLOR.ink} />
          <path d="M33 73L126 52M33 52L126 73" stroke={COLOR.paper} strokeWidth="1" opacity=".9" />
        </>
      );

    case "earth":
      return (
        <>
          <path d="M14 87H146" {...line} />
          <path d="M25 29H132V87H25Z" fill="#a66f4c" stroke={COLOR.ink} />
          <path d="M25 40C45 37 58 43 77 40C96 37 111 43 132 39M25 53C43 50 60 56 80 52C100 48 114 55 132 51M25 68C42 64 58 71 77 67C98 63 115 70 132 66" {...line} stroke={COLOR.paperDeep} />
          <path d="M52 87V57H86V87" fill="#76513c" stroke={COLOR.ink} />
          <path d="M91 29V44H132" fill="none" stroke={COLOR.ink} />
          <path d="M105 81C115 72 125 74 134 84" fill={COLOR.green} stroke={COLOR.ink} />
          <path d="M19 33L40 23L65 29L84 18L108 29" stroke={COLOR.ochre} strokeWidth="3" fill="none" />
        </>
      );

    case "concrete":
      return (
        <>
          <path d="M19 18H141V88H19Z" fill={COLOR.concrete} stroke={COLOR.ink} />
          <path d="M60 18V88M101 18V88M19 42H141M19 65H141" stroke="#706f6c" strokeWidth="1" />
          {[
            [39, 30], [80, 30], [121, 30], [39, 54], [80, 54], [121, 54], [39, 76], [80, 76], [121, 76],
          ].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.8" fill={COLOR.ink} />)}
          <path d="M61 66H100V88H61Z" fill={COLOR.ink} />
          <path d="M65 66V88" stroke={COLOR.blue} strokeWidth="4" />
        </>
      );

    case "steel":
      return (
        <>
          <path d="M15 88H146" {...line} />
          <path d="M27 22H133V88H27Z" fill={COLOR.bluePale} stroke={COLOR.ink} />
          <path d="M27 22H133M27 44H133M27 66H133M53 22V88M80 22V88M107 22V88" stroke={COLOR.ink} strokeWidth="2" />
          <path d="M27 22L53 44L27 66M53 22L27 44L53 66M107 44L133 22M107 66L133 44" stroke={COLOR.brick} strokeWidth="1.4" fill="none" />
          <path d="M18 18H142" stroke={COLOR.blue} strokeWidth="4" />
          <path d="M117 69H129V88H117Z" fill={COLOR.paper} stroke={COLOR.ink} />
        </>
      );

    case "giant":
      return (
        <>
          <path d="M20 14H140V90H20Z" fill={COLOR.ink} />
          <path d="M26 20H134V84H26Z" fill={COLOR.bluePale} />
          <path d="M80 20V84" stroke={COLOR.ink} strokeWidth="3" />
          <path d="M26 67L57 48L80 60L104 37L134 58V84H26Z" fill={COLOR.greenPale} stroke={COLOR.ink} />
          <circle cx="108" cy="31" r="8" fill="#e8c878" />
          <circle cx="51" cy="68" r="7" fill={COLOR.green} stroke={COLOR.ink} />
          <path d="M51 75V84" stroke={COLOR.ink} strokeWidth="2" />
          <circle cx="72" cy="72" r="3" fill={COLOR.brick} />
          <path d="M72 75V84M68 79H76" stroke={COLOR.brick} strokeWidth="1.5" />
        </>
      );

    case "framed":
      return (
        <>
          <path d="M13 18H147V88H13Z" fill={COLOR.paperDeep} stroke={COLOR.ink} />
          <rect x="23" y="29" width="31" height="44" fill={COLOR.bluePale} stroke={COLOR.ink} strokeWidth="4" />
          <rect x="64" y="23" width="32" height="55" fill="#e5c979" stroke={COLOR.ink} strokeWidth="4" />
          <rect x="106" y="34" width="31" height="39" fill={COLOR.greenPale} stroke={COLOR.ink} strokeWidth="4" />
          <path d="M23 63L37 50L54 62V73H23ZM64 57L79 41L96 55V78H64Z" fill={COLOR.green} stroke={COLOR.ink} />
          <circle cx="121" cy="50" r="8" fill={COLOR.green} stroke={COLOR.ink} />
          <path d="M121 58V73" stroke={COLOR.ink} strokeWidth="2" />
          <path d="M19 84H141" stroke={COLOR.blue} strokeWidth="3" />
        </>
      );

    case "ribbon":
      return (
        <>
          <path d="M16 82H145" {...line} />
          <path d="M22 26H138V82H22Z" fill={COLOR.paperDeep} stroke={COLOR.ink} />
          <path d="M22 41H138V61H22Z" fill={COLOR.ink} />
          <path d="M28 44H132V58H28Z" fill={COLOR.bluePale} />
          <path d="M48 41V61M75 41V61M104 41V61" stroke={COLOR.paper} strokeWidth="1" />
          <path d="M22 26H95L108 18H138V26" fill={COLOR.paper} stroke={COLOR.ink} />
          <path d="M33 68H65V82H33Z" fill={COLOR.blue} />
        </>
      );

    case "repair":
      return (
        <>
          <path d="M12 88H148" {...line} />
          <path d="M19 40L48 22L75 40V88H19Z" fill="#ae7e5a" stroke={COLOR.ink} />
          <path d="M85 33L115 16L142 33V88H85Z" fill="#8d785e" stroke={COLOR.ink} />
          <path d="M75 49L85 44V88H75Z" fill={COLOR.blue} stroke={COLOR.ink} />
          <path d="M30 52H46V70H30ZM99 45H116V65H99Z" fill={COLOR.ink} />
          <path d="M52 33L59 41L55 50L64 57L58 70" stroke={COLOR.paper} strokeWidth="2" fill="none" />
          <path d="M21 73L35 66L51 73L63 64L75 70V88H21Z" fill={COLOR.greenPale} stroke={COLOR.ink} />
          <path d="M90 80H140M94 68H136M98 56H132M99 46V88M116 39V88M132 35V88" stroke={COLOR.ochre} strokeWidth="1" />
        </>
      );

    case "landscape":
      return (
        <>
          <path d="M10 88H150" {...line} />
          <path d="M14 78C34 77 42 58 61 56C82 54 87 70 106 65C125 60 129 38 148 31V88H14Z" fill={COLOR.greenPale} stroke={COLOR.ink} />
          <path d="M20 75C41 74 45 48 69 46C91 44 98 59 116 54C132 49 135 31 148 24" stroke={COLOR.green} strokeWidth="7" fill="none" />
          <path d="M30 82V74H52V82M96 80V68H121V80" fill={COLOR.paper} stroke={COLOR.ink} />
          <path d="M13 48C37 47 44 30 64 31C81 32 91 43 108 39C124 35 134 20 148 19" stroke={COLOR.blue} strokeWidth="1.5" fill="none" />
          <circle cx="78" cy="43" r="3" fill={COLOR.brick} />
          <path d="M78 46V54" stroke={COLOR.brick} strokeWidth="1.5" />
        </>
      );

    case "grid-gap":
      return (
        <>
          <path d="M23 18H137V88H23Z" fill={COLOR.paper} stroke={COLOR.ink} />
          {[45, 68, 91, 114].map((x) => <path key={`v-${x}`} d={`M${x} 18V88`} stroke={COLOR.line} />)}
          {[41, 64].map((y) => <path key={`h-${y}`} d={`M23 ${y}H137`} stroke={COLOR.line} />)}
          <path d="M24 19H44V40H24ZM46 42H67V63H46ZM69 65H90V87H69Z" fill={COLOR.ink} />
          <path d="M92 42H113V63H92Z" fill={COLOR.blue} />
          <path d="M115 67H136V88H115Z" fill={COLOR.ink} transform="translate(5 -4)" />
          <path d="M114 64L121 57" stroke={COLOR.brick} strokeWidth="2" />
          <circle cx="122" cy="56" r="3" fill={COLOR.brick} />
        </>
      );

    case "weather":
      return (
        <>
          <path d="M20 19H140V88H20Z" fill="#8c7b65" stroke={COLOR.ink} />
          <path d="M20 38H140M20 59H140M52 19V38M91 19V38M34 38V59M73 38V59M119 38V59M57 59V88M101 59V88" stroke="#b4a58f" />
          <path d="M81 19L75 31L84 40L73 53L78 65L68 88" stroke={COLOR.ink} strokeWidth="2" fill="none" />
          <path d="M20 69C33 62 43 67 52 78C61 66 73 72 78 88H20Z" fill={COLOR.green} />
          <path d="M114 19V55M122 19V48M130 19V61" stroke={COLOR.blue} strokeWidth="2" />
          <path d="M103 66C116 60 130 67 140 77V88H102Z" fill={COLOR.ochre} opacity=".78" />
          <circle cx="42" cy="54" r="3" fill={COLOR.greenPale} />
        </>
      );

    case "impossible":
      return (
        <>
          <path d="M13 88H148" {...line} />
          <path d="M27 76L70 20L87 20L50 67H96L78 88H18Z" fill={COLOR.violet} stroke={COLOR.ink} />
          <path d="M70 20L132 20L143 34L87 34Z" fill={COLOR.blue} stroke={COLOR.ink} />
          <path d="M143 34L105 83H88L126 34Z" fill={COLOR.brick} stroke={COLOR.ink} />
          <path d="M50 67L105 67L88 88H78L96 67Z" fill={COLOR.ochre} stroke={COLOR.ink} />
          <path d="M87 34L105 83H88L70 34Z" fill={COLOR.paper} stroke={COLOR.ink} />
          <circle cx="133" cy="72" r="3" fill={COLOR.ink} />
          <path d="M133 75V87M129 80H137" stroke={COLOR.ink} strokeWidth="1.5" />
        </>
      );
  }
}

export function QuestionVisual({ kind, selected = false }: QuestionVisualProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 160 104"
      width="160"
      height="104"
      preserveAspectRatio="xMidYMid meet"
      data-kind={kind}
      data-selected={selected || undefined}
      style={{ display: "block", width: "100%", height: "auto" }}
    >
      <rect
        x="0.5"
        y="0.5"
        width="159"
        height="103"
        fill={selected ? COLOR.paperSelected : COLOR.paper}
        stroke={selected ? COLOR.blue : COLOR.line}
        vectorEffect="non-scaling-stroke"
      />
      <VisualDiagram kind={kind} />
    </svg>
  );
}
