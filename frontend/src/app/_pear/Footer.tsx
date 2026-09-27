import { DotIcon } from "./icons";

export function Footer() {
  return (
    <>
      <div className="ft" aria-hidden="true">
        <div className="ft-in">
          <i className="ft-r h" style={{ top: 125 }} />
          <i className="ft-r h" style={{ top: 982 }} />
          <i className="ft-r v" style={{ left: 675 }} />
          <i className="ft-r v" style={{ left: 1262 }} />
          <svg className="ft-box" viewBox="0 0 587 857" fill="none">
            <rect x={0.5} y={0.5} width={586} height={856} />
          </svg>
          <i className="ft-st" style={{ left: 675, top: 125 }}>
            <DotIcon />
          </i>
          <i className="ft-st" style={{ left: 1262, top: 982 }}>
            <DotIcon />
          </i>
          <div className="ft-mark">
            <svg viewBox="0 0 524.211 180" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text
                x={0}
                y={128}
                textLength={524}
                lengthAdjust="spacing"
                fill="#EBEBEB"
                style={{ font: "400 112px var(--title)", letterSpacing: "-0.02em" }}
              >
                ClaimGuard.
              </text>
            </svg>
          </div>
          <p className="ft-tag">
            <span className="ln">
              <i>Benefits cut by a letter, held</i>
            </span>
            <span className="ln">
              <i>to the letter of the law.</i>
            </span>
          </p>
          <p className="ft-meta l">CLAIMGUARD · SNAP NOTICE CHECKER</p>
          <p className="ft-meta r">
            NOT LEGAL ADVICE
          </p>
        </div>
      </div>
      <canvas className="trans" aria-hidden="true" />
      <video
        className="foot"
        src="/films/footer-loop.mp4"
        muted
        loop
        playsInline
        preload="none"
      />
      <canvas className="ftx" aria-hidden="true" />
    </>
  );
}
