/** POST /api/stt/runs/:id/end — finish a run: the last phrase decodes,
 *  then {text} returns the whole run's transcript (the renderer's deferred
 *  flush lands it in the primary input). */
import { sttErrorResponse, sttRuns } from "@/src/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	try {
		return Response.json({ text: await sttRuns().end(id) });
	} catch (e) {
		return sttErrorResponse(e);
	}
}
