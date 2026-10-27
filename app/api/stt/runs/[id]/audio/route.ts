/** POST /api/stt/runs/:id/audio — one batch of linear16 16kHz mono PCM
 *  (raw bytes body). The renderer sends batches strictly in order. */
import { sttErrorResponse, sttRuns } from "@/src/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	try {
		sttRuns().append(id, new Uint8Array(await req.arrayBuffer()));
		return new Response(null, { status: 204 });
	} catch (e) {
		return sttErrorResponse(e);
	}
}
