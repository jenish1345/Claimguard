export function Portfolio() {
  return (
    <div className="pf" aria-hidden="true">
      <div className="pf-in">
        <svg className="pf-lines" viewBox="0 0 1328 3515" fill="none">
          <g className="pf-ticks" />
        </svg>
        <i className="pf-head">
          <b />
        </i>
      </div>
      <div className="pf-fix">
        <div className="pf-g pf-g--fix" data-g="0" style={{ width: 360, "--gap": "14px" } as React.CSSProperties}>
          <span className="pf-chip" style={{ width: 92 }}>
            <b>Federal rules</b>
          </span>
          <h2 className="pf-h" style={{ width: 280 }}>
            <span className="ln">
              <i>Everything a notice must say,</i>
            </span>
            <span className="ln">
              <i>checked in seconds.</i>
            </span>
          </h2>
          <p className="pf-b" style={{ marginTop: 26 }}>
            Federal law says what a notice that cuts benefits has to tell you: when, why, by how
            much, and how to appeal. ClaimGuard checks every item.
          </p>
        </div>
        <div className="pf-g pf-g--fix" data-g="1" style={{ width: 360, "--gap": "13px" } as React.CSSProperties}>
          <span className="pf-chip" style={{ width: 92 }}>
            <b>Federal rules</b>
          </span>
          <h2 className="pf-h" style={{ width: 280 }}>
            <span className="ln">
              <i>Claude reads the notice.</i>
            </span>
            <span className="ln">
              <i>The rules make the call.</i>
            </span>
          </h2>
          <p className="pf-b" style={{ marginTop: 25 }}>
            Claude only turns the letter into fields. Ten fixed checks decide, so the same notice
            gets the same answer every time.
          </p>
        </div>
        <div className="pf-g pf-g--fix" data-g="2" style={{ width: 384, "--gap": "17px" } as React.CSSProperties}>
          <span className="pf-chip" style={{ width: 98 }}>
            <b>Plain language</b>
          </span>
          <h2 className="pf-h" style={{ width: 384 }}>
            <span className="ln">
              <i>A missing appeal deadline, a</i>
            </span>
            <span className="ln">
              <i>“reduction” that raises the amount,</i>
            </span>
            <span className="ln">
              <i>ten days’ notice that was really</i>
            </span>
            <span className="ln">
              <i>seven. Each one is a defect.</i>
            </span>
          </h2>
          <p className="pf-b" style={{ width: 360, marginTop: 27 }}>
            Each defect is explained in plain words, with the regulation it breaks and what to do
            next: request a fair hearing, ask for benefits to continue, or call legal aid. Nothing
            you paste is stored.
          </p>
        </div>
      </div>
    </div>
  );
}
