export function ContactForm() {
  return (
    <div className="cf" aria-hidden="true" inert>
      <svg className="cf-orb" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse />
        <ellipse />
        <ellipse />
      </svg>
      <div className="cf-gl" />
      <div className="cf-lead">
        <b>Try it now</b>
        <p>
          Load a sample or paste your own notice. ClaimGuard checks it against federal law in a
          few seconds.
        </p>
      </div>
      <div className="cf-in" />
    </div>
  );
}
