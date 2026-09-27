export const DOT_PATH =
  "M12 0Q13.1 10.9 24 12Q13.1 13.1 12 24Q10.9 13.1 0 12Q10.9 10.9 12 0Z";

export function DotIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={DOT_PATH} />
    </svg>
  );
}
