export function Fin() {
  return (
    <div className="fin" aria-hidden="true">
      <div className="fin-g" data-f="0">
        <div className="fin-top">
          <div className="fin-soak">
            <h2 className="fin-h" style={{ width: 540 }}>
              <span className="ln">
                <i>Free. No account.</i>
              </span>
              <span className="ln">
                <i>Nothing stored.</i>
              </span>
            </h2>
          </div>
        </div>
        <div className="fin-bot">
          <div className="fin-soak">
            <p className="fin-l" style={{ width: 545 }}>
              ClaimGuard is free for the households it’s built for. Notice text is checked in
              memory and never saved or logged.
            </p>
            <div className="fin-row">
              <span className="fin-chip">
                <b>Full disclosure</b>
              </span>
              <p className="fin-s" style={{ width: 315 }}>
                ClaimGuard is not a law firm and doesn’t give legal advice. It shows where a
                notice falls short of federal rules. A legal aid office or the fair hearing decides
                what that means for your case.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="fin-g" data-f="1">
        <div className="fin-top">
          <div className="fin-soak">
            <h2 className="fin-h" style={{ width: 614 }}>
              <span className="ln">
                <i>A flawed notice</i>
              </span>
              <span className="ln">
                <i>can be challenged.</i>
              </span>
            </h2>
          </div>
        </div>
        <div className="fin-bot">
          <div className="fin-soak">
            <p className="fin-l" style={{ width: 595 }}>
              If a notice leaves out what federal law requires, you can raise it at a fair
              hearing. Ask before the effective date and benefits may continue while you wait.
            </p>
            <div className="fin-row">
              <span className="fin-chip">
                <b>Full disclosure</b>
              </span>
              <p className="fin-s" style={{ width: 338 }}>
                The checks cover the federal floor in 7 CFR 273.13 and 273.10(g). States can add
                their own rules, so a clean result means the federal basics are there, not that the
                decision is right.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
