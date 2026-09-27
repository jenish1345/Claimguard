const CHAPTERS = [
  { href: "#model", at: "0.012", ch: "Ch. 1", label: "How it works" },
  { href: "#work", at: "0.232", ch: "Ch. 2", label: "The rules" },
  { href: "#terms", at: "0.400", ch: "Ch. 3", label: "The stakes" },
  { href: "#questions", at: "0.628", ch: "Ch. 4", label: "Questions" },
];

export function MenuOverlay() {
  return (
    <div className="nvm" id="nvm" aria-hidden="true">
      {CHAPTERS.map((c) => (
        <a key={c.href} href={c.href} data-at={c.at}>
          <b>{c.ch}</b>
          <em>{c.label}</em>
        </a>
      ))}
    </div>
  );
}

export { CHAPTERS };
