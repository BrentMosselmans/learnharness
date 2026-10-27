/**
 * POST /api/stt/runs — start one dictation run (local STT wave,
 * 2026-10-27) → {id}. 503 {code: "model_missing"} when the model isn't
 * downloaded — the dictation button deep-links to Settings on it.
 * Lifecycle: src/server/stt-runs.ts.
 */
import { sttErrorResponse, sttRuns } from "@/src/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
	try {
		return Response.json({ id: await sttRuns().start() });
	} catch (e) {
		return sttErrorResponse(e);
	}
}
