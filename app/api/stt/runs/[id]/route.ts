/** DELETE /api/stt/runs/:id — cancel a run, discarding its transcript (the
 *  Esc semantics). Idempotent: an unknown run is already gone. */
import { sttRuns } from "@/src/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	sttRuns().cancel(id);
	return new Response(null, { status: 204 });
}
