import { learningProgress, type EvidenceCorrection, type LearningEvidence } from "../core/learning-evidence.ts";
import { activeProblemOf } from "../core/native-messages.ts";
import { stores } from "./stores.ts";

export function learningView() {
	const evidence: LearningEvidence[] = [];
	const corrections: EvidenceCorrection[] = [];
	const exposures = new Map<string, number[]>();
	for (const summary of stores.chatStore.listChats()) {
		const chat = stores.chatStore.getChat(summary.id);
		evidence.push(...(chat?.learningEvidence ?? []));
		corrections.push(...(chat?.evidenceCorrections ?? []));
		if (chat?.kind === "practice") {
			const active = activeProblemOf(chat.messages);
			const targets = (active?.input as { target?: unknown } | undefined)?.target;
			if (Array.isArray(targets)) {
				const start = chat.messages.findIndex(m => m.role === "toolResult" && m.toolCallId === active?.toolCallId);
				const times = chat.messages.slice(Math.max(0, start)).map(m => m.timestamp);
				for (const target of targets) {
					if (typeof target === "string") exposures.set(target, [...(exposures.get(target) ?? []), ...times]);
				}
			}
		}
		// Teaching plan slugs are not graph IDs. Only explicitly selected graph targets can be joined.
		if (chat && chat.kind !== "practice") {
			for (const m of chat.messages) {
				if (m.role !== "custom" || m.customType !== "graph-context") continue;
				const details = m.details as { propositions?: { id: string }[] } | undefined;
				for (const p of details?.propositions ?? []) {
					exposures.set(p.id, [...(exposures.get(p.id) ?? []), ...chat.messages.map(message => message.timestamp)]);
				}
			}
		}
	}
	return stores.graphStore.readNodes().map(node => ({
		id: node.id, name: node.name, statement: node.statement,
		...learningProgress(node.id, evidence, corrections, exposures.get(node.id)),
	}));
}

export function correctLearningEvidence(chatId: string, evidenceId: string, action: EvidenceCorrection["action"]): boolean {
	const chat = stores.chatStore.getChat(chatId);
	if (!chat?.learningEvidence?.some(e => e.id === evidenceId)) return false;
	stores.chatStore.correctEvidence(chatId, { evidenceId, action, at: Date.now() });
	return true;
}

/** Supply task history, never past solutions, to the next practice agent. */
export function reviewContext(nodeIds: readonly string[]): string {
	return learningView().filter(node => nodeIds.includes(node.id)).map(node => {
		const history = node.evidence.slice(-20).map(e => ({
			statement: e.statement, variant: e.variant, at: new Date(e.at).toISOString(),
			outcome: e.outcome, help: e.rung, grade: e.grade, correction: e.correction,
		}));
		return `Review target [${node.id}]: ${node.reviewKind}. ${node.reason}\nPrior tasks (avoid repeats; disputed or invalid tasks need replacement): ${JSON.stringify(history)}`;
	}).join("\n\n");
}
