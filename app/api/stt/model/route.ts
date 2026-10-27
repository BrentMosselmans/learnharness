/**
 * The local dictation model (local STT wave, 2026-10-27) — the Settings →
 * Keys → Dictation row's seam. Opt-in: nothing downloads until POST.
 *
 *   GET    → SttModelStatus (the row polls this while downloading)
 *   POST   → start the download (idempotent) → the status after starting
 *   DELETE → cancel a running download and/or delete the model → status
 */
import { sttModel } from "@/src/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
	return Response.json(sttModel().status());
}

export async function POST() {
	return Response.json(sttModel().download());
}

export async function DELETE() {
	return Response.json(await sttModel().remove());
}
