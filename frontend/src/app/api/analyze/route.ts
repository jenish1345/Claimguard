// Proxies the demo to the FastAPI backend (backend/main.py), so the browser
// never needs CORS or the backend's address.
const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";
const MAX_TEXT = 50_000;
const MAX_PDF = 10 * 1024 * 1024;

const fail = (status: number, detail: string) => Response.json({ detail }, { status });

async function forward(path: string, init: RequestInit) {
  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}${path}`, { ...init, cache: "no-store", signal: AbortSignal.timeout(60_000) });
  } catch {
    return fail(502, `The ClaimGuard engine isn't reachable at ${BACKEND_URL}. Start it with: uvicorn main:app --port 8000`);
  }
  const body = await res.json().catch(() => ({ detail: "The engine returned an unreadable response." }));
  return Response.json(body, { status: res.status });
}

export async function POST(request: Request) {
  const type = request.headers.get("content-type") ?? "";

  if (type.startsWith("multipart/form-data")) {
    const form = await request.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File)) return fail(400, "Attach a PDF of the notice.");
    if (!file.name.toLowerCase().endsWith(".pdf")) return fail(400, "Only PDF files can be checked.");
    if (file.size > MAX_PDF) return fail(413, "That PDF is over 10 MB.");
    const out = new FormData();
    out.append("file", file, file.name);
    return forward("/analyze/pdf", { method: "POST", body: out });
  }

  const json = await request.json().catch(() => null);
  const text = typeof json?.text === "string" ? json.text : "";
  if (text.trim().length < 20) return fail(400, "Paste the full notice text — that's too short to check.");
  if (text.length > MAX_TEXT) return fail(413, "That notice is over 50,000 characters.");
  return forward("/analyze", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text, source: "paste" }),
  });
}

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, { cache: "no-store", signal: AbortSignal.timeout(3_000) });
    return Response.json(await res.json(), { status: res.status });
  } catch {
    return fail(502, "offline");
  }
}
