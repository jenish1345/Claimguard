import type { CSSProperties } from "react";
import { DOT_PATH } from "./icons";
import { CHAPTERS } from "./MenuOverlay";

const SHIELD_MARK_PATH =
  "M152.5 30L268 70V188C268 282 218 348 152.5 386C87 348 37 282 37 188V70Z";

function Ruler({
  vertical,
  right,
  out,
  style,
  delay,
}: {
  vertical?: boolean;
  right?: boolean;
  out: string;
  style: CSSProperties;
  delay: string;
}) {
  return (
    <span className={vertical ? (right ? "gv gv--r" : "gv") : "gh"} data-out={out} style={style}>
      <i style={{ animationDelay: delay }} />
      <svg className="wob" aria-hidden="true">
        <path d="" />
      </svg>
    </span>
  );
}

function CornerMark({
  lock,
  out,
  style,
  delay,
}: {
  lock?: boolean;
  out: string;
  style: CSSProperties;
  delay?: string;
}) {
  return (
    <i className={lock ? "gx gx--lock" : "gx"} data-out={out} style={style}>
      <span style={delay ? { animationDelay: delay } : undefined}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d={DOT_PATH} />
        </svg>
      </span>
    </i>
  );
}

export function Overlay() {
  return (
    <div className="ov">
      <Ruler vertical out="l" style={{ left: "var(--v1)" } as CSSProperties} delay=".20s" />
      <Ruler vertical right out="r" style={{ left: "var(--v2)" } as CSSProperties} delay=".30s" />
      <Ruler out="u" style={{ top: "var(--h1)" } as CSSProperties} delay=".25s" />
      <Ruler out="d" style={{ top: "var(--h2)" } as CSSProperties} delay=".40s" />
      <span className="fill" data-out="d" aria-hidden="true" />
      <CornerMark
        out="ld"
        style={{ left: "var(--v1)", top: "var(--h2)" } as CSSProperties}
        delay="1.05s"
      />
      <CornerMark
        out="rd"
        style={{ left: "var(--v2)", top: "var(--h2)" } as CSSProperties}
        delay="1.18s"
      />
      <CornerMark lock out="lu" style={{ left: "var(--v1)", top: "var(--h1)" } as CSSProperties} />
      <CornerMark lock out="ru" style={{ left: "var(--v2)", top: "var(--h1)" } as CSSProperties} />
      <canvas className="lines" aria-hidden="true" />
      <a className="mark" href="#top" aria-label="ClaimGuard">
        <svg viewBox="0 0 305 415" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            pathLength={1}
            d={SHIELD_MARK_PATH}
            strokeWidth={40}
            strokeMiterlimit={10}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
      <button className="menu" type="button" aria-label="Menu">
        <span />
        <span />
        <span />
        <span />
      </button>
      <nav className="hdr label">
        <a className="apply" href="/dashboard">
          Try it <span className="arw">→</span>
        </a>
      </nav>
      <nav className="rail" aria-label="Chapters">
        {CHAPTERS.map((c) => (
          <a key={c.href} href={c.href} data-at={c.at}>
            <i />
            <em>{c.label}</em>
          </a>
        ))}
      </nav>
      <div className="col-head">
        <div className="bk" data-beat="0">
          <h1>
            <span className="ln">
              <i>Your notice, checked.</i>
            </span>
          </h1>
          <p className="subhead">
            <span className="ln">
              <i>Benefits cut by a letter,</i>
            </span>
            <span className="ln">
              <i>held to the letter of the law.</i>
            </span>
          </p>
          <a className="cta" href="#top">
            <span className="face">
              Check a notice <span className="arw">→</span>
            </span>
            <span className="flood" aria-hidden="true">
              <span className="face">
                Check a notice <span className="arw">→</span>
              </span>
            </span>
          </a>
        </div>
        <div className="bk" data-beat="1">
          <div className="beat">
            <span className="ln">
              <i>We read it.</i>
            </span>
          </div>
        </div>
        <div className="bk" data-beat="2">
          <div className="beat">
            <span className="ln">
              <i>We check it.</i>
            </span>
          </div>
        </div>
        <div className="bk" data-beat="3">
          <div className="beat">
            <span className="ln">
              <i>You appeal,</i>
            </span>
            <span className="ln">
              <i>citations in hand.</i>
            </span>
          </div>
        </div>
      </div>
      <div className="col-stand">
        <div className="bk" data-beat="0">
          <p className="stand">
            Paste a SNAP notice. Claude reads the dates, amounts and appeal rights; a rule engine
            checks them against federal law. If the notice breaks the rules, you’ll see which ones.
          </p>
        </div>
        <div className="bk" data-beat="1">
          <p className="stand">Claude reads it the way a caseworker would.</p>
        </div>
        <div className="bk" data-beat="2">
          <p className="stand">Ten fixed rules. No guessing, no invented law.</p>
        </div>
        <div className="bk" data-beat="3">
          <p className="stand">Every defect comes with its citation and next step.</p>
        </div>
      </div>
      <span className="tag">For SNAP households</span>
    </div>
  );
}
