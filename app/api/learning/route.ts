import { correctLearningEvidence, learningView } from "@/src/server";

export const dynamic = "force-dynamic";

export async function GET() {
	return Response.json({ nodes: learningView() });
}

export async function POST(request: Request) {
	const body: unknown = await request.json().catch(() => null);
	if (!body || typeof body !== "object") return Response.json({ error: "Invalid correction" }, { status: 400 });
	const { chatId, evidenceId, action } = body as Record<string, unknown>;
	if (typeof chatId !== "string" || typeof evidenceId !== "string" || typeof action !== "string" || !["disputed", "invalid", "restore"].includes(action)) {
		return Response.json({ error: "Invalid correction" }, { status: 400 });
	}
	if (!correctLearningEvidence(chatId, evidenceId, action as "disputed" | "invalid" | "restore")) {
		return Response.json({ error: "Evidence no longer exists" }, { status: 404 });
	}
	return Response.json({ ok: true });
}
