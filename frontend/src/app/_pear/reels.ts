export type Reel = {
  id: string;
  src: string;
  poster: string;
  origin: [number, number];
  pos: [number, number, number];
  bridge: string;
};

export const REELS: Reel[] = [
  {
    id: "signal",
    src: "/films/signal.mp4",
    poster: "/films/signal-poster.jpg",
    origin: [0.707, 0.926],
    pos: [0.72, 0.72, 1],
    bridge: "v28",
  },
  {
    id: "colossus",
    src: "/films/colossus.mp4",
    poster: "/films/colossus-poster.jpg",
    origin: [0.732, 0.54],
    pos: [0.72, 0.6, 1],
    bridge: "v51",
  },
  {
    id: "reveal",
    src: "/films/reveal.mp4",
    poster: "/films/reveal-poster.jpg",
    origin: [0.84, 0.63],
    pos: [0.72, 0.62, 1],
    bridge: "v61",
  },
];

export function pickReel(): Reel {
  if (typeof window === "undefined") return REELS[REELS.length - 1];
  const wanted = (new URLSearchParams(location.search).get("hero") || "").toLowerCase();
  return REELS.find((r) => r.id === wanted) || REELS[Math.floor(Math.random() * REELS.length)];
}
