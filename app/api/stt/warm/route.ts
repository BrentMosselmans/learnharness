/**
 * POST /api/stt/warm — load the local recognizer now (local STT wave,
 * 2026-10-27): the dictation hook pre-warms at page mount so the first
 * click doesn't pay the seconds-long model load. 503 {code:
 * "model_missing"} when the model isn't downloaded (silently tolerated by
 * the caller).
 */
import { sttErrorResponse, sttRuns } from "@/src/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
	try {
		await sttRuns().warm();
		return new Response(null, { status: 204 });
	} catch (e) {
		return sttErrorResponse(e);
	}
}
