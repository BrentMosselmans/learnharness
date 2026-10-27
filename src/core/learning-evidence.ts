import type { LhMessage } from "./native-messages.ts";

export type KnowledgeKind = "fact" | "concept" | "procedure";
export interface LearningEvidence {
	id: string;
	chatId: string;
	problemId: string;
	at: number;
	posedAt: number;
	targets: string[];
	statement: string;
	variant: string;
	kind: KnowledgeKind | "unknown";
	priorExposure: "new" | "seen" | "unknown";
	mode: string;
	submissions: { id: string; text: string; at: number }[];
	attempts: { submissionId: string; result: "correct" | "incorrect" | "uncertain"; assisted: boolean }[];
	outcome: string;
	rung: string | null;
	verdict: string;
	grade: "confident" | "uncertain" | "invalid";
	retest: boolean;
}

export interface EvidenceCorrection {
	evidenceId: string;
	at: number;
	action: "disputed" | "invalid" | "restore";
}

const object = (value: unknown): Record<string, unknown> =>
	typeof value === "object" && value !== null ? value as Record<string, unknown> : {};
const string = (value: unknown): string => typeof value === "string" ? value : "";

/** Only acknowledged calls contribute. IDs join the durable transcript to the ledger. */
export function collectLearningEvidence(chatId: string, messages: readonly LhMessage[]): LearningEvidence[] {
	const calls = new Map<string, { name: string; args: Record<string, unknown> }>();
	let active: { id: string; at: number; args: Record<string, unknown>; submissions: LearningEvidence["submissions"] } | undefined;
	const evidence: LearningEvidence[] = [];
	const completed = new Set<string>();
	for (const message of messages) {
		if (message.role === "assistant") {
			for (const block of message.content) {
				if (block.type === "toolCall") calls.set(block.id, { name: block.name, args: object(block.arguments) });
			}
		} else if (message.role === "custom" && message.customType === "practice-thinking" && active) {
			const details = object(message.details);
			if (details.problemCallId === active.id && !active.submissions.some(s => s.id === message.id)) {
				active.submissions.push({ id: message.id, text: string(details.text), at: message.timestamp });
			}
		} else if (message.role === "toolResult" && !message.isError) {
			const call = calls.get(message.toolCallId);
			if (!call || completed.has(message.toolCallId) || call.name !== message.toolName) continue;
			completed.add(message.toolCallId);
			if (call.name === "problem" && !active) {
				active = { id: message.toolCallId, at: message.timestamp, args: call.args, submissions: [] };
			} else if (call.name === "conclude" && active) {
				const p = active.args;
				const c = call.args;
				const attempts: LearningEvidence["attempts"] = [];
				for (const raw of Array.isArray(c.attempts) ? c.attempts : []) {
					const a = object(raw);
					const submission = active.submissions.find(s => s.id === a.submissionId);
					if (submission && !attempts.some(a => a.submissionId === submission.id)) {
						attempts.push({ submissionId: submission.id, result: a.result === "correct" || a.result === "incorrect" ? a.result : "uncertain", assisted: a.assisted !== false });
					}
				}
				evidence.push({
					id: `${chatId}:${active.id}`, chatId, problemId: active.id, at: message.timestamp, posedAt: active.at,
					targets: Array.isArray(p.target) ? [...new Set(p.target.filter((t): t is string => typeof t === "string"))] : [],
					statement: string(p.statement), variant: string(p.variant),
					kind: p.knowledgeKind === "fact" || p.knowledgeKind === "concept" || p.knowledgeKind === "procedure" ? p.knowledgeKind : "unknown",
					priorExposure: p.priorExposure === "new" || p.priorExposure === "seen" ? p.priorExposure : "unknown",
					mode: string(p.mode), submissions: active.submissions, attempts,
					outcome: string(c.outcome), rung: c.rung === null ? null : string(c.rung) || "unknown",
					verdict: string(c.verdict), grade: c.grade === "confident" || c.grade === "invalid" ? c.grade : "uncertain",
					retest: c.retest === true,
				});
				active = undefined;
			}
		}
	}
	return evidence;
}

export function appendLearningEvidence(previous: readonly LearningEvidence[], incoming: readonly LearningEvidence[]): LearningEvidence[] {
	const ids = new Set(previous.map(e => e.id));
	const result = [...previous];
	for (const entry of incoming) {
		if (ids.has(entry.id)) continue;
		ids.add(entry.id);
		result.push(entry);
	}
	return result;
}

export interface LearningProgress {
	nodeId: string;
	status: "unknown" | "practising" | "independent" | "delayed";
	reason: string;
	independent: number;
	assisted: number;
	delayed: number;
	excluded: number;
	dueAt: number | null;
	reviewKind: "recall" | "changed-task";
	evidence: (LearningEvidence & { correction?: EvidenceCorrection["action"] })[];
}

export const REVIEW_DAY = 24 * 60 * 60 * 1000;

/** Intervals are transparent product heuristics, not mastery probabilities. */
export function learningProgress(nodeId: string, records: readonly LearningEvidence[], corrections: readonly EvidenceCorrection[], exposures: readonly number[] = []): LearningProgress {
	const latest = new Map(corrections.map(c => [c.evidenceId, c.action]));
	const evidence = [...new Map(records.filter(e => e.targets.includes(nodeId)).map(e => [e.id, e])).values()]
		.sort((a, b) => a.at - b.at || a.id.localeCompare(b.id))
		.map(e => ({ ...e, correction: latest.get(e.id) }));
	let independent = 0, assisted = 0, delayed = 0, excluded = 0;
	let spacingStep = 0;
	let dueAt: number | null = null;
	let lastExposure: number | undefined;
	let reviewKind: LearningProgress["reviewKind"] = "changed-task";
	const variants = new Set<string>();
	const statements = new Set<string>();
	for (const e of evidence) {
		const normalized = e.statement.trim().replace(/\s+/g, " ").toLowerCase();
		const novel = !!e.variant && !variants.has(e.variant) && !statements.has(normalized);
		variants.add(e.variant);
		statements.add(normalized);
		const prior = exposures.filter(at => at <= e.posedAt);
		const mostRecent = Math.max(lastExposure ?? -Infinity, ...prior);
		const gap = Number.isFinite(mostRecent) ? e.posedAt - mostRecent : 0;
		lastExposure = e.at;
		if (e.outcome === "dismissed") continue;
		if (e.grade !== "confident" || (e.correction && e.correction !== "restore")) {
			++excluded;
			spacingStep = 0;
			dueAt = e.at + REVIEW_DAY;
			continue;
		}
		const success = e.outcome === "solved" || e.outcome === "solvedWithHints";
		const helped = e.rung !== null || e.outcome === "solvedWithHints" || e.attempts.some(a => a.assisted);
		if (success && helped) ++assisted;
		// A retry, ungraded submission, or remembered solution cannot establish independence.
		const unaided = e.outcome === "solved" && !helped && e.priorExposure === "new" && novel
			&& e.attempts.length === 1 && e.attempts[0]?.result === "correct"
			&& e.submissions.length === 1;
		if (unaided) {
			++independent;
			if (gap >= REVIEW_DAY) { ++delayed; ++spacingStep; }
		} else spacingStep = 0;
		reviewKind = e.kind === "fact" && e.mode === "recall" ? "recall" : "changed-task";
		const interval = unaided ? [1, 3, 7, 14, 30][Math.min(spacingStep, 4)]! : 1;
		dueAt = e.at + interval * REVIEW_DAY;
	}
	const status = delayed > 0 ? "delayed" : independent > 0 ? "independent" : evidence.length > 0 ? "practising" : "unknown";
	const reason = status === "delayed" ? "Unaided success on a changed task at least a day after the previous recorded exposure. This is evidence, not a mastery guarantee."
		: status === "independent" ? "Unaided success on a new task. Delayed retention still needs a later check."
		: status === "practising" ? "Practice is recorded; help, retries, repetition, or uncertain grading prevent an independent-performance claim."
		: "No assessed practice yet. Map coverage and teaching checks do not establish retention.";
	return { nodeId, status, reason, independent, assisted, delayed, excluded, dueAt, reviewKind, evidence };
}
