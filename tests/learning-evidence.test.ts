import assert from "node:assert/strict";
import { after, test } from "node:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { appendLearningEvidence, collectLearningEvidence, learningProgress, REVIEW_DAY as DAY, type LearningEvidence } from "../src/core/learning-evidence.ts";
import { newGraphContextMessage, newThinkingMessage, type LhMessage } from "../src/core/native-messages.ts";

const directory = fs.mkdtempSync(path.join(os.tmpdir(), "lh-evidence-"));
process.env.LH_DATA_DIR = directory;
after(() => fs.rmSync(directory, { recursive: true, force: true }));

function pair(name: string, id: string, args: import("@earendil-works/pi-ai").ToolCall["arguments"], at: number, isError = false): LhMessage[] {
	return [
		{ id: `a_${id}`, role: "assistant", content: [{ type: "toolCall", id, name, arguments: args }], timestamp: at,
			api: "faux", provider: "test", model: "test", stopReason: "toolUse", usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalTokens: 0, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 } } },
		{ id: `r_${id}`, role: "toolResult", toolCallId: id, toolName: name, content: [], timestamp: at, isError },
	];
}

function transcript(): LhMessage[] {
	const submission = newThinkingMessage("p", "My answer");
	return [
		...pair("problem", "p", { target: ["n"], statement: "Apply the rule", variant: "a", knowledgeKind: "concept", priorExposure: "new", mode: "composition" }, 100),
		{ ...submission, timestamp: 150 },
		...pair("conclude", "c", { outcome: "solved", rung: null, grade: "confident", verdict: "Correct", attempts: [{ submissionId: submission.id, result: "correct", assisted: false }] }, 200),
	];
}

function entry(overrides: Partial<LearningEvidence> = {}): LearningEvidence {
	return { ...collectLearningEvidence("chat", transcript())[0]!, ...overrides };
}

test("acknowledgements are required; failed/dangling calls and duplicate results earn nothing", () => {
	const messages = transcript();
	assert.equal(collectLearningEvidence("chat", messages.slice(0, -1)).length, 0);
	const failed = structuredClone(messages);
	if (failed[1]?.role === "toolResult") failed[1].isError = true;
	assert.equal(collectLearningEvidence("chat", failed).length, 0);
	assert.equal(collectLearningEvidence("chat", [...messages, messages.at(-1)!]).length, 1);
	assert.equal(appendLearningEvidence([entry()], [entry(), entry()]).length, 1);
});

test("independent is provisional; delayed checks use the pose timestamp and changed demands", () => {
	const first = entry();
	assert.equal(learningProgress("n", [first], []).status, "independent");
	const later = entry({ id: "later", statement: "Different application", variant: "b", posedAt: 2 * DAY, at: 2 * DAY + 100 });
	const progress = learningProgress("n", [first, later], []);
	assert.equal(progress.delayed, 1);
	assert.equal(progress.dueAt, later.at + 3 * DAY);
	assert.equal(learningProgress("n", [first, { ...later, posedAt: 300 }], []).delayed, 0);
	assert.equal(learningProgress("n", [first, { ...later, variant: "a" }], []).delayed, 0);
	assert.equal(learningProgress("n", [first, { ...later, statement: first.statement }], []).delayed, 0);
	assert.equal(learningProgress("n", [first, later], [], [later.posedAt - 100]).delayed, 0);
});

test("help at every rung, retries, uncertainty, and missing metadata cannot earn independence", () => {
	for (const rung of ["R0", "R1", "R2", "R3", "R4", "R5"]) {
		const p = learningProgress("n", [entry({ rung })], []);
		assert.equal(p.independent, 0);
		assert.equal(p.assisted, 1);
	}
	for (const overrides of [
		{ grade: "uncertain" as const }, { grade: "invalid" as const }, { priorExposure: "unknown" as const },
		{ priorExposure: "seen" as const }, { variant: "" }, { attempts: [] },
		{ outcome: "solvedWithHints" }, { outcome: "surrendered" }, { outcome: "dismissed" },
		{ attempts: [{ submissionId: "x", result: "incorrect" as const, assisted: false }, ...entry().attempts] },
	]) assert.equal(learningProgress("n", [entry(overrides)], []).independent, 0, JSON.stringify(overrides));
});

test("disputes and invalid tasks are excluded; restoring cannot upgrade uncertain grades", () => {
	const e = entry();
	const correction = { evidenceId: e.id, action: "disputed" as const, at: 300 };
	assert.equal(learningProgress("n", [e], [correction]).independent, 0);
	assert.equal(learningProgress("n", [e], [correction]).excluded, 1);
	assert.equal(learningProgress("n", [e], [correction, { ...correction, action: "restore" }]).independent, 1);
	assert.equal(learningProgress("n", [{ ...e, grade: "uncertain" }], [{ ...correction, action: "restore" }]).independent, 0);
	assert.equal(learningProgress("other", [e], []).status, "unknown");
});

test("only selected facts use recall scheduling", () => {
	assert.equal(learningProgress("n", [entry({ kind: "fact", mode: "recall" })], []).reviewKind, "recall");
	assert.equal(learningProgress("n", [entry({ kind: "concept", mode: "recall" })], []).reviewKind, "changed-task");
});

test("a miss resets spacing even when earlier delayed successes remain in the history", () => {
	const first = entry();
	const delayed = entry({ id: "delayed", variant: "b", statement: "Changed problem", posedAt: 2 * DAY, at: 2 * DAY + 100 });
	const miss = entry({ id: "miss", variant: "c", statement: "Hard problem", posedAt: 6 * DAY, at: 6 * DAY + 100, outcome: "movedOn" });
	const repair = entry({ id: "repair", variant: "d", statement: "Changed repair", posedAt: 6 * DAY + 200, at: 6 * DAY + 300 });
	const p = learningProgress("n", [first, delayed, miss, repair], []);
	assert.equal(p.delayed, 1);
	assert.equal(p.dueAt, repair.at + DAY);
});

test("wrong answers remain before a retry and invented submission IDs do not earn credit", () => {
	const messages = transcript().slice(0, 3);
	const first = messages[2]!;
	const second = newThinkingMessage("p", "My corrected answer");
	messages.push(second, ...pair("conclude", "c", { outcome: "solved", rung: null, grade: "confident", attempts: [
		{ submissionId: first.id, result: "incorrect", assisted: false },
		{ submissionId: second.id, result: "correct", assisted: false },
		{ submissionId: "invented", result: "correct", assisted: false },
	] }, 300));
	const e = collectLearningEvidence("chat", messages)[0]!;
	assert.equal(e.attempts.length, 2);
	assert.equal(e.attempts[0]!.result, "incorrect");
	assert.equal(learningProgress("n", [e], []).independent, 0);
});

test("durable storage survives replay and compaction; corrections recompute; deletion removes evidence", async () => {
	const { chatStore } = await import("../src/store/chats.ts");
	const chat = chatStore.createChat("Practice", "practice");
	const messages = transcript();
	chatStore.saveMessages(chat.id, messages);
	chatStore.saveMessages(chat.id, messages);
	assert.equal(chatStore.getChat(chat.id)?.learningEvidence?.length, 1);
	chatStore.saveMessages(chat.id, []);
	const stored = chatStore.getChat(chat.id)!;
	assert.equal(stored.learningEvidence?.length, 1);
	assert.equal("learningEvidence" in chatStore.listChats()[0]!, false);
	chatStore.correctEvidence(chat.id, { evidenceId: stored.learningEvidence![0]!.id, action: "invalid", at: 300 });
	const disk = JSON.parse(fs.readFileSync(path.join(directory, "chats", `${chat.id}.json`), "utf8"));
	assert.equal(learningProgress("n", disk.learningEvidence, disk.evidenceCorrections).independent, 0);
	assert.throws(() => chatStore.correctEvidence(chat.id, { evidenceId: "missing", action: "restore", at: 400 }));
	chatStore.deleteChat(chat.id);
	assert.equal(chatStore.getChat(chat.id), null);
});

test("learning API validates corrections and review context excludes past solutions", async () => {
	const { stores } = await import("../src/server/stores.ts");
	const { GET, POST } = await import("../app/api/learning/route.ts");
	const { reviewContext, learningView } = await import("../src/server/learning.ts");
	stores.graphStore.appendNode({ id: "n", name: "Rule", statement: "The rule", aliases: [], provenance: [], createdAt: new Date().toISOString() });
	const chat = stores.chatStore.createChat("API practice", "practice");
	stores.chatStore.saveMessages(chat.id, transcript());
	const e = stores.chatStore.getChat(chat.id)!.learningEvidence![0]!;
	const correct = (body: unknown) => POST(new Request("http://test/api/learning", { method: "POST", body: JSON.stringify(body) }));
	assert.equal((await correct({ action: "promote" })).status, 400);
	assert.equal((await correct({ chatId: chat.id, evidenceId: e.id, action: ["restore"] })).status, 400);
	assert.equal((await correct({ chatId: chat.id, evidenceId: "missing", action: "restore" })).status, 404);
	assert.equal((await correct({ chatId: chat.id, evidenceId: e.id, action: "disputed" })).status, 200);
	const response = await (await GET()).json();
	assert.equal(response.nodes[0].independent, 0);
	assert.equal(response.nodes[0].excluded, 1);
	const context = reviewContext(["n"]);
	assert.ok(context.includes("Apply the rule"));
	assert.ok(!context.includes("My answer"));
	stores.graphStore.rewriteLedgers({ nodes: [] });
	assert.deepEqual(learningView(), []);
	assert.equal(reviewContext(["n"]), "");
	stores.graphStore.appendNode({ id: "n", name: "Rule", statement: "The rule", aliases: [], provenance: [], createdAt: new Date().toISOString() });
	stores.chatStore.deleteChat(chat.id);
	assert.equal(learningView()[0]!.dueAt, null);
});

test("unfinished practice and mapped teaching prevent a false delayed check", async () => {
	const { stores } = await import("../src/server/stores.ts");
	const { learningView } = await import("../src/server/learning.ts");
	const first = stores.chatStore.createChat("First", "practice");
	stores.chatStore.saveMessages(first.id, transcript());
	const later = stores.chatStore.createChat("Later", "practice");
	const messages = transcript().map(m => ({ ...m, timestamp: m.timestamp + 2 * DAY }));
	const pose = messages[0]!;
	if (pose.role === "assistant" && pose.content[0]?.type === "toolCall") {
		pose.content[0].arguments.variant = "changed";
		pose.content[0].arguments.statement = "Apply in a different context";
	}
	stores.chatStore.saveMessages(later.id, messages);
	assert.equal(learningView()[0]!.delayed, 1);
	const unfinished = stores.chatStore.createChat("Still working", "practice");
	stores.chatStore.saveMessages(unfinished.id, pair("problem", "unfinished", { target: ["n"] }, 2 * DAY - 100));
	assert.equal(learningView()[0]!.delayed, 0);
	stores.chatStore.deleteChat(unfinished.id);
	const teaching = stores.chatStore.createChat("Recent explanation");
	stores.chatStore.saveMessages(teaching.id, [{ ...newGraphContextMessage([{ id: "n", name: "Rule", statement: "The rule" }], []), timestamp: 2 * DAY - 100 }]);
	assert.equal(learningView()[0]!.delayed, 0);
	for (const chat of [first, later, teaching]) stores.chatStore.deleteChat(chat.id);
});
