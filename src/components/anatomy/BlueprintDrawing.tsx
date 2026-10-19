import { memo, useId } from "react";
import type { AssemblyId } from "./assemblies";
import { assemblies } from "./assemblies";

const n = (value: number) => Number(value.toFixed(2));

type Ink = { hatch: string; fine: string; wash: string };

function Coachwork({ hatch, fine, wash }: Ink) {
  const silhouette =
    "M112 302 Q112 279 149 263 L209 230 Q313 204 452 188 L528 115 Q558 88 616 87 L683 91 Q748 100 802 158 L858 165 Q896 168 907 195 L903 236 L804 273 Q797 220 751 224 Q701 226 695 301 L329 360 Q325 296 278 293 Q223 295 218 371 L139 355 Q102 344 112 302Z";
  const glass =
    "M478 190 L540 124 Q562 111 611 110 L628 166Z M644 111 L681 115 Q733 124 775 166 L651 187Z";
  return (
    <>
      <path
        d={`${silhouette} ${glass}`}
        fill={`url(#${wash})`}
        fillRule="evenodd"
        strokeWidth="2.2"
      />
      <path
        d={silhouette}
        fill="none"
        transform="translate(1.4 -.8)"
        opacity=".25"
        strokeWidth=".7"
      />
      <path d={glass} fill="none" strokeWidth="1.6" />
      <path
        d="M209 230 Q321 224 448 205 L478 190 M150 263 Q296 238 459 211 L483 211 L650 190 Q776 171 858 165 M140 312 Q304 277 484 248 L828 193 M333 336 L689 277 M486 214 L470 312 L685 278 L688 202 M507 210 L504 223 L528 219 L528 208 M689 203 L710 199 L710 209 L689 212"
        fill="none"
      />
      <path
        d="M226 241 Q311 221 415 211 L447 237 L260 270Z"
        fill={`url(#${hatch})`}
        strokeWidth=".8"
      />
      <path
        d="M238 245 Q327 231 418 218 M248 251 Q337 236 427 223 M257 258 L433 229"
        fill="none"
        opacity=".4"
        strokeWidth=".6"
      />
      <path
        d="M629 168 L639 110 M645 187 L643 122 M802 158 L779 167 M809 174 L856 175 L885 197 L827 204Z"
        fill={`url(#${fine})`}
      />
      <path
        d="M135 295 Q162 280 198 284 L197 317 Q162 333 135 324Z"
        fill="#e9dfc9"
        strokeWidth="1.8"
      />
      {Array.from({ length: 10 }, (_, i) => (
        <path
          key={i}
          d={`M${141 + i * 5} ${295 - i * 0.7} l0 25`}
          strokeWidth=".65"
          opacity=".8"
        />
      ))}
      <path
        d="M137 306 L194 296 M137 316 L194 307 M124 333 Q157 347 208 331 L218 335 M336 343 L688 285 M811 253 L901 223"
        fill="none"
        strokeWidth="2.8"
      />
      <ellipse
        cx="220"
        cy="269"
        rx="21"
        ry="26"
        transform="rotate(18 220 269)"
        fill="#f5efdf"
        strokeWidth="2"
      />
      <ellipse
        cx="220"
        cy="269"
        rx="15"
        ry="21"
        transform="rotate(18 220 269)"
        fill={`url(#${fine})`}
      />
      <ellipse
        cx="137"
        cy="277"
        rx="10"
        ry="15"
        transform="rotate(20 137 277)"
        fill="#f5efdf"
      />
      <path
        d="M124 275 L144 280 M208 268 L230 270 M786 208 L801 206 M849 185 L876 181"
        fill="none"
        strokeWidth=".8"
      />
      <path
        d="M454 224 L456 207 Q440 197 436 205 Q435 211 454 211 M656 178 L665 165 Q680 163 679 174 L663 178"
        fill="#e5d8bf"
      />
      <path
        d="M235 359 Q237 305 278 306 Q315 307 315 357 M710 293 Q715 237 750 236 Q785 234 792 273"
        fill="none"
        opacity=".4"
      />
      <path
        d="M130 376 L915 249 M169 235 L839 135 M280 285 l-19 99 M747 212 l-12 94"
        className="construction-line"
      />
      <path
        d="M271 381 L735 307 M271 374 v14 M735 300 v14"
        className="dimension-line"
      />
      <text
        x="480"
        y="350"
        transform="rotate(-9 480 350)"
        className="diagram-label"
      >
        WHEELBASE / 2 620
      </text>
      <path d="M539 96 Q605 75 673 84" className="pencil-ghost" />
      <path d="M227 222 Q358 193 449 182" className="pencil-ghost" />
      <text
        x="812"
        y="148"
        transform="rotate(-9 812 148)"
        className="diagram-handnote"
      >
        form follows feeling
      </text>
    </>
  );
}

function Chassis({ hatch, fine }: Ink) {
  const tubes = [
    "M187 300 L719 211 L849 244 L312 340Z",
    "M187 300 L190 316 L310 356 L849 259 L849 244",
    "M312 340 L310 356 M719 211 L721 227 L849 259",
    "M217 293 L335 337 M270 284 L387 328 M365 269 L482 312 M449 256 L566 299 M552 240 L669 280 M654 223 L773 257",
    "M217 293 L387 328 M335 337 L270 284 M365 269 L566 299 M482 312 L449 256 M552 240 L773 257 M669 280 L654 223",
    "M299 278 L413 265 L531 301 L423 320Z",
    "M413 265 L530 247 L644 282 L531 301 M530 247 L643 230 L753 263 L644 282",
    "M227 294 L244 258 L322 245 L338 273 M687 216 L698 188 L776 177 L802 232",
    "M243 258 L337 273 M244 258 L322 245 L316 283",
    "M698 188 L802 232 M776 177 L760 249",
  ];
  return (
    <>
      <path
        d="M236 302 L714 222 L803 246 L325 330Z"
        fill={`url(#${hatch})`}
        strokeWidth=".6"
      />
      <path
        d="M435 272 L577 249 L646 269 L503 293Z"
        fill="#eee5d1"
        strokeWidth="1.8"
      />
      {tubes.map((d, i) => (
        <g key={i}>
          <path
            d={d}
            fill="none"
            stroke="#e7dbc4"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path
            d={d}
            fill="none"
            strokeWidth={i < 3 ? 1.8 : 1.1}
            strokeLinejoin="round"
          />
        </g>
      ))}
      {[
        [217, 293],
        [335, 337],
        [270, 284],
        [387, 328],
        [365, 269],
        [482, 312],
        [449, 256],
        [566, 299],
        [552, 240],
        [669, 280],
        [654, 223],
        [773, 257],
        [244, 258],
        [322, 245],
        [698, 188],
        [776, 177],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="#f6efdf" strokeWidth=".9" />
      ))}
      <path
        d="M181 303 L145 309 L146 330 L194 322 M833 237 L876 231 L883 245 L848 254"
        fill={`url(#${fine})`}
        strokeWidth="1.8"
      />
      <path
        d="M164 286 L735 191 M169 366 L871 249 M196 275 L196 341 M843 215 L843 277"
        className="construction-line"
      />
      <path
        d="M353 374 L688 317 M353 367 v14 M688 310 v14"
        className="dimension-line"
      />
      <text
        x="471"
        y="345"
        transform="rotate(-9 471 345)"
        className="diagram-label"
      >
        TRIANGULATED / Ø 32
      </text>
      <path d="M316 358 Q515 322 715 286" className="pencil-ghost" />
    </>
  );
}

function Powertrain({ hatch, fine }: Ink) {
  return (
    <>
      <path
        d="M279 265 L424 239 L493 259 L352 288Z M279 265 L281 303 L352 327 L352 288 M352 288 L493 259 L489 295 L352 327"
        fill={`url(#${hatch})`}
        strokeWidth="1.8"
      />
      <path
        d="M296 291 L349 306 L471 282 L471 299 L351 321 L298 305Z"
        fill="#e5d7bd"
      />
      <path
        d="M311 286 L449 259 L459 268 L323 296Z"
        fill={`url(#${fine})`}
        strokeWidth="1.3"
      />
      <path
        d="M275 246 L409 222 L437 237 L302 264Z M275 246 L275 261 L301 279 L302 264 M302 264 L437 237 L436 252 L301 279"
        fill="#e8e1d1"
        strokeWidth="1.6"
      />
      <path
        d="M327 269 L461 243 L490 255 L353 282Z M327 269 L329 281 L355 295 L353 282 M353 282 L490 255 L489 268 L355 295"
        fill="#f2ead8"
        strokeWidth="1.6"
      />
      {Array.from({ length: 6 }, (_, i) => {
        const x = 296 + i * 23;
        const y = 246 - i * 4.2;
        return (
          <g key={i}>
            <path
              d={`M${x} ${y} l18 8 M${x + 1} ${y + 4} l18 8 M${x + 53} ${y + 21} l18 7 M${x + 54} ${y + 25} l18 7`}
              fill="none"
              strokeWidth=".8"
            />
            <path
              d={`M${x + 20} ${y + 1} l-3 -21 l10 -2 l3 20`}
              fill="#e2d3b5"
            />
            <ellipse
              cx={x + 22}
              cy={y - 21}
              rx="8.5"
              ry="5"
              fill="#f6efdf"
              strokeWidth="1.1"
            />
            <ellipse
              cx={x + 22}
              cy={y - 21}
              rx="4.8"
              ry="2.6"
              fill="#b0a48e"
              strokeWidth=".5"
            />
            <path
              d={`M${x + 42} ${y + 5} l1 -20 l10 -2 l-1 20`}
              fill="#e2d3b5"
            />
            <ellipse
              cx={x + 48}
              cy={y - 17}
              rx="8.5"
              ry="5"
              fill="#f6efdf"
              strokeWidth="1.1"
            />
            <ellipse
              cx={x + 48}
              cy={y - 17}
              rx="4.8"
              ry="2.6"
              fill="#b0a48e"
              strokeWidth=".5"
            />
            <path
              d={`M${x + 63} ${y + 48} q12 16 -1 24 l-25 6`}
              fill="none"
              strokeWidth="2"
            />
          </g>
        );
      })}
      <path
        d="M485 268 L518 263 L552 273 L551 297 L517 308 L485 295Z"
        fill={`url(#${fine})`}
        strokeWidth="1.8"
      />
      <path
        d="M552 273 L588 276 L602 286 L584 297 L551 297 M602 286 L657 277"
        fill="#e9dfca"
        strokeWidth="2"
      />
      <path
        d="M510 269 L510 303 M522 271 L522 302 M534 273 L534 299 M567 279 L566 292"
        fill="none"
        strokeWidth=".8"
      />
      <ellipse
        cx="280"
        cy="282"
        rx="19"
        ry="27"
        transform="rotate(-16 280 282)"
        fill={`url(#${fine})`}
        strokeWidth="1.5"
      />
      <ellipse
        cx="280"
        cy="282"
        rx="9"
        ry="14"
        transform="rotate(-16 280 282)"
        fill="#ddd0b6"
      />
      <path
        d="M280 259 L280 306 M264 271 L296 293 M264 294 L296 270"
        strokeWidth="2"
      />
      <path
        d="M342 316 Q316 344 267 337 L228 334 M427 301 Q450 326 508 315 L720 278 M228 334 L213 340 M715 278 L748 275"
        fill="none"
        strokeWidth="3"
      />
      <path
        d="M253 217 L500 172 M250 340 L512 294"
        className="construction-line"
      />
      <path
        d="M293 185 L428 161 M293 179 v13 M428 155 v13"
        className="dimension-line"
      />
      <text
        x="322"
        y="169"
        transform="rotate(-10 322 169)"
        className="diagram-label"
      >
        6 × 2 / 60° V12
      </text>
      <text
        x="564"
        y="321"
        transform="rotate(-9 564 321)"
        className="diagram-handnote"
      >
        the mechanical heart
      </text>
    </>
  );
}

function WireWheel({
  x,
  y,
  scale = 1,
}: {
  x: number;
  y: number;
  scale?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale}) rotate(12)`}>
      <ellipse rx="45" ry="63" fill="#e7dfcf" strokeWidth="2" />
      <ellipse rx="39" ry="57" fill="#f8f1e1" strokeWidth="1.2" />
      <ellipse rx="32" ry="49" fill="none" strokeWidth=".8" />
      <ellipse rx="35" ry="52" fill="none" opacity=".4" strokeDasharray="2 3" />
      {Array.from({ length: 36 }, (_, i) => {
        const angle = (i * Math.PI) / 18;
        return (
          <g key={i} strokeWidth=".6" opacity=".8">
            <path
              d={`M${n(Math.cos(angle) * 8)} ${n(Math.sin(angle) * 11)} L${n(Math.cos(angle + 0.38) * 32)} ${n(Math.sin(angle + 0.38) * 49)}`}
            />
            <path
              d={`M${n(Math.cos(angle) * 8)} ${n(Math.sin(angle) * 11)} L${n(Math.cos(angle - 0.38) * 32)} ${n(Math.sin(angle - 0.38) * 49)}`}
            />
          </g>
        );
      })}
      <ellipse rx="9" ry="13" fill="#e0d2b6" strokeWidth="1.3" />
      <path
        d="M0 -8 L3 -1 L10 3 L1 4 L-6 11 L-4 1 L-9 -5Z"
        fill="#b9aa8d"
        strokeWidth="1"
      />
      <path d="M-51 0 H51 M0 -70 V70" className="construction-line" />
      <path
        d="M-29 -51 Q-52 -26 -38 27 M20 -54 Q44 -27 39 9"
        fill="none"
        opacity=".3"
      />
    </g>
  );
}

function Suspension() {
  return (
    <>
      <path
        d="M348 250 L269 322 M830 199 L748 265 M308 289 L785 224"
        fill="none"
        strokeWidth="2.5"
      />
      <WireWheel x={348} y={250} scale={0.77} />
      <WireWheel x={830} y={199} scale={0.77} />
      <g fill="#e7ddc6" strokeWidth="1.3">
        <path d="M267 323 L332 269 L386 290Z M267 336 L331 300 L382 311Z M747 265 L696 213 L650 242Z M747 280 L693 245 L653 258Z" />
        <path d="M348 250 L378 263 L331 280Z M830 199 L768 202 L783 221Z" />
      </g>
      <g fill="none" strokeWidth="1.5">
        <path d="M278 318 L317 273 M755 257 L720 216" />
        <path d="M287 310 l-4 -8 l13 3 l-5 -12 l13 4 l-5 -12 l13 3 l-4 -9 M746 248 l10 -1 l-14 -7 l8 -5 l-13 -6 l8 -5 l-12 -7" />
        <path d="M290 330 L348 286 L380 296 M751 280 L702 245 L670 253" />
        <path d="M282 340 Q476 345 739 279" />
      </g>
      <WireWheel x={268} y={331} />
      <WireWheel x={748} y={267} scale={0.94} />
      <path
        d="M204 409 L807 306 M257 410 L257 421 M748 318 L748 329"
        className="dimension-line"
      />
      <text
        x="435"
        y="377"
        transform="rotate(-10 435 377)"
        className="diagram-label"
      >
        INDEPENDENT / FOUR CORNERS
      </text>
      <text x="143" y="413" className="diagram-handnote">
        72 spokes. no shortcuts.
      </text>
    </>
  );
}

function TouringSeat({ x, y, hatch }: { x: number; y: number; hatch: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d="M-15 9 L-17 -45 Q-16 -60 0 -61 L29 -64 Q42 -62 43 -50 L48 -2 L64 16 Q66 25 55 30 L15 40 Q1 43 -7 35 L-24 20 Q-27 14 -15 9Z"
        fill="#e7cdb3"
        strokeWidth="1.6"
      />
      <path
        d="M-8 5 L-10 -42 Q-8 -51 2 -51 L27 -55 Q34 -55 35 -44 L40 -5Z"
        fill={`url(#${hatch})`}
      />
      <path d="M-8 7 L40 -4 L53 18 L9 30Z" fill="#eedcc2" />
      <path
        d="M-4 32 L53 22 M-12 -43 L-6 10 L10 34 M34 -53 L41 -2 L59 18"
        fill="none"
        stroke="#8c2d19"
        strokeDasharray="2 3"
        strokeWidth=".8"
      />
      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          d={`M${i * 8} -45 l4 43 l15 23`}
          fill="none"
          strokeWidth=".6"
          opacity=".6"
        />
      ))}
      <path d="M-10 37 L-7 46 L53 32 L55 27" fill="none" strokeWidth="2" />
    </g>
  );
}

function Cockpit({ hatch, fine }: Ink) {
  return (
    <>
      <path
        d="M444 244 L634 210 L758 248 L553 291Z"
        fill={`url(#${fine})`}
        strokeWidth="1.2"
      />
      <path
        d="M454 239 L464 197 L630 167 L677 190 L663 222"
        fill="#e6d4b3"
        strokeWidth="1.7"
      />
      <path d="M466 197 L630 167 L652 177 L487 209Z" fill={`url(#${hatch})`} />
      <path d="M487 209 L486 226 L650 195 L652 177Z" fill="#eee2cb" />
      {[
        [502, 212, 8],
        [523, 207, 10],
        [548, 203, 7],
        [566, 199, 5],
        [580, 196, 5],
      ].map(([x, y, r], i) => (
        <g key={i}>
          <ellipse
            cx={x}
            cy={y}
            rx={r}
            ry={r * 0.8}
            fill="#f9f2e1"
            strokeWidth="1.1"
          />
          <path
            d={`M${x} ${y} l-2 -${r - 2}`}
            fill="none"
            stroke="#8c2d19"
            strokeWidth=".8"
          />
        </g>
      ))}
      <TouringSeat x={642} y={215} hatch={hatch} />
      <TouringSeat x={573} y={242} hatch={hatch} />
      <path
        d="M577 266 L642 254 L657 263 L589 278Z M617 254 l-4 -21"
        fill="#dbc39f"
        strokeWidth="1.4"
      />
      <ellipse cx="612" cy="232" rx="5" ry="4" fill="#9d7e58" />
      <g transform="translate(508 236) rotate(-14)">
        <path d="M0 0 L16 -24" strokeWidth="3" />
        <ellipse
          rx="24"
          ry="20"
          fill="#f4e9d3"
          fillOpacity=".85"
          stroke="#795032"
          strokeWidth="3.5"
        />
        <ellipse rx="20" ry="16" fill="none" strokeWidth=".7" />
        <path
          d="M-20 -1 L-3 4 L-1 16 M20 -1 L3 4 L1 16"
          fill="none"
          strokeWidth="2.6"
        />
        <circle r="4" fill="#dfccb0" />
      </g>
      <path
        d="M466 247 l-6 14 M475 245 l-6 14 M485 243 l-6 14 M451 261 l6 2 M460 259 l6 2 M470 257 l6 2"
        strokeWidth="2.4"
      />
      <path
        d="M681 183 L738 205 L749 242 L708 250 M691 197 L731 212 M696 210 L735 223"
        fill="none"
        strokeWidth="1.3"
      />
      <path
        d="M428 256 L730 201 M526 303 L780 251"
        className="construction-line"
      />
      <text
        x="667"
        y="290"
        transform="rotate(-10 667 290)"
        className="diagram-handnote"
      >
        made for being there.
      </text>
    </>
  );
}

/** Five original vector studies in a shared axonometric coordinate system. */
function BlueprintDrawing({ part }: { part: AssemblyId }) {
  const uid = useId().replace(/:/g, "");
  const ids = {
    hatch: `hatch-${uid}`,
    fine: `fine-${uid}`,
    wash: `wash-${uid}`,
  };
  const assembly = assemblies.find((item) => item.id === part)!;
  return (
    <svg
      viewBox="70 40 870 400"
      className="blueprint-svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern
          id={ids.hatch}
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(32)"
        >
          <path
            d="M0 0 V6"
            stroke="currentColor"
            strokeWidth=".7"
            opacity=".22"
          />
        </pattern>
        <pattern
          id={ids.fine}
          width="3"
          height="3"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-36)"
        >
          <path
            d="M0 0 V3"
            stroke="currentColor"
            strokeWidth=".4"
            opacity=".2"
          />
        </pattern>
        <linearGradient id={ids.wash} x1="0" y1="0" x2=".4" y2="1">
          <stop offset="0" stopColor="#f3ead7" />
          <stop offset=".55" stopColor="#e8d2bb" />
          <stop offset="1" stopColor="#f4ecdc" />
        </linearGradient>
      </defs>
      <g
        className="part-ink"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {part === "coachwork" && <Coachwork {...ids} />}
        {part === "chassis" && <Chassis {...ids} />}
        {part === "powertrain" && <Powertrain {...ids} />}
        {part === "suspension" && <Suspension />}
        {part === "cockpit" && <Cockpit {...ids} />}
      </g>
      <circle
        className="part-anchor"
        data-anchor={part}
        cx={assembly.anchor[0]}
        cy={assembly.anchor[1]}
        r=".5"
        fill="transparent"
        stroke="none"
      />
    </svg>
  );
}

export default memo(BlueprintDrawing);
