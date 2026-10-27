/**
 * THE PRACTICE AGENT (practice sessions, owner design 2026-10-04): the
 * tool gating law (an agent cannot pose while a problem is active, cannot
 * conclude with nothing active), the registry shape (problem + conclude
 * ONLY — no question, plan, or job tools), and the prompt composition
 * (practice composes its own directory alone — no teaching base, no
 * shared fragments).
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AssistantMessage, ToolResultMessage } from "@earendil-works/pi-ai";

import {
	activeProblemOf,
	PRACTICE_CONCLUDE_TOOL,
	PRACTICE_PROBLEM_TOOL,
	type LhMessage,
} from "../src/core/native-messages.ts";
import { CONCLUDE_ACK_TEXT, HANDOFF_TEXT } from "../src/core/contracts/chat.ts";
import { probeDoneInputSchema } from "../src/core/contracts/probe.ts";
import { probeDoneTool } from "../src/agent/tools/probe.ts";
import { concludeInputObject, concludeTool, createPracticeGate, problemTool, practiceTools } from "../src/agent/tools/practice.ts";
import { composeInstructions, createPracticeAgent } from "../src/agent/teacher-agent.ts";
import { allSegmentPaths } from "../src/agent/prompt-segments.ts";

// ── fixtures ─────────────────────────────────────────────────────────────────

const STAMPS = {
	api: "faux",
	provider: "test",
	model: "test-model",
	usage: {
		input: 0,
		output: 0,
		cacheRead: 0,
		cacheWrite: 0,
		totalTokens: 0,
		cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
	},
	stopReason: "toolUse",
} as const;

/** A record whose latest problem call is ACTIVE (pose + ack, nothing after). */
function activeProblemRecord(): LhMessage[] {
	const pose: LhMessage & AssistantMessage = {
		id: "msg_a1",
		role: "assistant",
		content: [
			{ type: "toolCall", id: "call_p1", name: PRACTICE_PROBLEM_TOOL, arguments: { statement: "Show…" } },
		],
		timestamp: 1,
		...STAMPS,
	};
	const ack: LhMessage & ToolResultMessage = {
		id: "msg_r1",
		role: "toolResult",
		toolCallId: "call_p1",
		toolName: PRACTICE_PROBLEM_TOOL,
		content: [{ type: "text", text: "Problem posed — the turn ends here…" }],
		details: null,
		isError: false,
		timestamp: 2,
	};
	return [pose, ack];
}

function recordStore(messages: LhMessage[]) {
	return {
		store: {
			getChat: (_id: string) => ({ messages, kind: "practice" }),
		},
	};
}

const ctxOf = (messages: LhMessage[]) => ({ chatId: "c1", chatStore: recordStore(messages).store });
const PROBLEM_INPUT = {
	statement: "Prove the sum is even.",
	mode: "recall",
	target: ["parity-sum"],
	modelSolution: "Pair them; each pair is even.",
} as const;

const CONCLUDE_INPUT = {
	outcome: "solved",
	verdict: "Clean — the pairing came unaided.",
	rung: null,
	missClass: null,
	retest: false,
} as const;

// ── the gating law ───────────────────────────────────────────────────────────

describe("the practice tool gating law", () => {
	it("problem acks on a quiet record and ends the turn (terminate)", async () => {
		const result = await problemTool(createPracticeGate(ctxOf([]))).execute("call_x", PROBLEM_INPUT as never);
		assert.equal(result.isError, undefined);
		assert.equal(result.terminate, true);
		assert.match((result.content[0] as { text: string }).text, /Problem posed/);
	});

	it("problem is REJECTED while a problem is active (conclude first)", async () => {
		const result = await problemTool(createPracticeGate(ctxOf(activeProblemRecord()))).execute("call_x", PROBLEM_INPUT as never);
		assert.equal(result.isError, true);
		assert.deepEqual((result.details as { problems: string[] }).problems, [
			"a problem is already active — call conclude on it before posing the next one",
		]);
	});

	it("conclude is REJECTED with nothing active", async () => {
		const result = await concludeTool(createPracticeGate(ctxOf([]))).execute("call_x", CONCLUDE_INPUT as never);
		assert.equal(result.isError, true);
		assert.deepEqual((result.details as { problems: string[] }).problems, [
			"no active problem to conclude — pose one first",
		]);
	});

	it("conclude acks on the active problem and the turn CONTINUES (no terminate)", async () => {
		const result = await concludeTool(createPracticeGate(ctxOf(activeProblemRecord()))).execute("call_x", CONCLUDE_INPUT as never);
		assert.equal(result.isError, undefined);
		assert.equal(result.terminate, undefined);
	});

	it("THE BKT INCIDENT — a mid-turn conclude → pose pair works (the gate is turn-scoped, not record-frozen)", async () => {
		// One turn, one toolset: the record froze at the write-ahead with
		// the old problem active. The gates used to re-read that frozen
		// record per execute, so the pose after a successful conclude
		// always died on "a problem is already active" until the model
		// gave up ("the problem slot is stuck").
		const gate = createPracticeGate(ctxOf(activeProblemRecord()));
		const tools = { problem: problemTool(gate), conclude: concludeTool(gate) };
		const conclude = await tools.conclude.execute("call_c1", CONCLUDE_INPUT as never);
		assert.equal(conclude.isError, undefined, "the conclude acks against the seeded record");
		const pose = await tools.problem.execute("call_p2", PROBLEM_INPUT as never);
		assert.equal(pose.isError, undefined, "the freed gate lets the next problem through — SAME turn");
		const greedy = await tools.problem.execute("call_p3", PROBLEM_INPUT as never);
		assert.equal(greedy.isError, true, "the gate re-arms on the successful pose");
	});
});

// ── target validation (the mastery-trace contract, owner round 9) ──────────

describe("target validation — names normalize to ids, unknowns reject", () => {
	const NODES = [
		{ id: "n_parity", name: "Parity of a sum", statement: "The sum of two odds is even." },
		{ id: "n_pairing", name: "Pairing", statement: "Pair elements to count parity." },
	] as const;
	const graphNodes = () => NODES;

	it("a NAME target silently normalizes to the canonical id (the record carries ids)", async () => {
		const healed = problemTool(createPracticeGate(ctxOf([])), graphNodes).prepareArguments!({
			...PROBLEM_INPUT,
			target: ["Parity of a sum", "pairing"],
		}) as { target: string[] };
		assert.deepEqual(healed.target, ["n_parity", "n_pairing"], "case-insensitive name → id, whole-graph set");
	});

	it("an id target passes through untouched (already canonical)", async () => {
		const healed = problemTool(createPracticeGate(ctxOf([])), graphNodes).prepareArguments!({
			...PROBLEM_INPUT,
			target: ["n_parity"],
		}) as { target: string[] };
		assert.deepEqual(healed.target, ["n_parity"]);
	});

	it("an UNKNOWN target rejects with a one-line error and does NOT arm the gate", async () => {
		const gate = createPracticeGate(ctxOf([]));
		const tool = problemTool(gate, graphNodes);
		const rejected = await tool.execute("call_x", { ...PROBLEM_INPUT, target: ["ghost-prop"] } as never);
		assert.equal(rejected.isError, true);
		assert.match((rejected.details as { problems: string[] }).problems[0]!, /ghost-prop/);
		assert.match((rejected.details as { problems: string[] }).problems[0]!, /proposition ids from the session context/);
		// the message teaches the exit (round 12): omitting always works
		assert.match((rejected.details as { problems: string[] }).problems[0]!, /omit target entirely/);
		// honest activation (the BKT law): a rejected pose frees the slot —
		// the next, valid pose goes through.
		const valid = await tool.execute("call_y", { ...PROBLEM_INPUT, target: ["n_parity"] } as never);
		assert.equal(valid.isError, undefined);
	});

	it("UNTAGGED PROBLEMS (owner round 12): absent target poses freely; [] heals away to absent", async () => {
		const tool = problemTool(createPracticeGate(ctxOf([])), graphNodes);
		const absent = await tool.execute("call_a", { statement: "S", mode: "recall", modelSolution: "M" } as never);
		assert.equal(absent.isError, undefined, "no targets = an untagged problem, never a rejection");
		const healed = tool.prepareArguments!({ statement: "S", mode: "recall", target: [], modelSolution: "M" }) as {
			target?: string[];
		};
		assert.ok(!healed.target || healed.target.length === 0, "an explicit [] is the model saying no-targets — healed away");
	});

	it("NO node source (the legacy/test wiring) = no validation, free strings ack", async () => {
		const result = await problemTool(createPracticeGate(ctxOf([]))).execute("call_x", PROBLEM_INPUT as never);
		assert.equal(result.isError, undefined);
	});
});

// ── the registry + the agent ────────────────────────────────────────────────

describe("the practice agent", () => {
	it("bare registry: the session pair + the learner-filesystem set — no question, plan, or lesson tools", () => {
		const tools = practiceTools(ctxOf([]));
		assert.deepEqual(
			Object.keys(tools).sort(),
			["conclude", "find", "grep", "ls", "problem", "read"],
		);
	});

	it("THE RARELY-NEEDED SET (owner round 10): jobs + map readers compose in when their roots are passed", () => {
		const jobs = { chatId: "c1", jobStore: null as never, spawn: (() => {}) as never, searchAvailable: () => false };
		const graph = { chatStore: null as never, graphStore: null as never };
		const tools = practiceTools({ ...ctxOf([]), jobs, graph });
		// Both jobs remain available keylessly; the prober's two map
		// readers stay behind their existing settings gate. Practice does
		// not apply the teacher/prober user tool-toggle filter.
		assert.deepEqual(
			Object.keys(tools).sort(),
			["conclude", "find", "grep", "list_propositions", "list_sessions", "ls", "pdf", "problem", "read", "research"],
		);
		const withSearch = practiceTools({ ...ctxOf([]), jobs: { ...jobs, searchAvailable: () => true }, graph });
		assert.ok(withSearch.research, "a live engine also keeps research");
	});

	it("constructs with exactly the two practice tools", () => {
		// baseAgentOptions needs an engine (the BYOK thrower is the only
		// fallback) — inject a never-streamed faux engine for the smoke.
		const agent = createPracticeAgent(ctxOf([]), {
			engine: {
				model: { api: "faux", provider: "faux", id: "faux-model", contextWindow: 8192 } as never,
				streamFn: (async () => {
					throw new Error("not streamed in this test");
				}) as never,
			},
		});
		// The agent built with the live turn API (the registry itself is
		// pinned above; pi's Agent exposes no state getter).
		assert.equal(typeof agent.prompt, "function");
		assert.equal(typeof agent.steer, "function");
		assert.equal(typeof agent.waitForIdle, "function");
	});
});

// These checks inspect the instructions sent to the model; they do not simulate learning.
describe("research-informed practice policy", () => {
	const normalizeWhitespace = (text: string) => text.replace(/\s+/g, " ").trim();
	const descriptionOf = (schema: unknown) => (schema as { description: string }).description;

	it("keeps the probe tool, assessment schema, and teacher handoff consistent with uncertain evidence", () => {
		const description = probeDoneTool({} as never).probe_done!.description;
		assert.match(description, /Report untested ceilings and missing evidence as uncertain/);
		assert.doesNotMatch(description, /every strand.*bracketed/);
		const assessment = descriptionOf(probeDoneInputSchema.properties.assessment.properties.strands.items.properties.assessment);
		assert.match(assessment, /explicit uncertainty if untested/);
		assert.match(HANDOFF_TEXT, /Immediate success is provisional/);
		assert.doesNotMatch(HANDOFF_TEXT, /unconditional truths|obviously true/);
	});

	it("honors explanation requests and replaces repeated unsuccessful nudges with instruction", () => {
		const prompt = normalizeWhitespace(composeInstructions("practice"));
		assert.match(prompt, /After that nudge fails, provide a clear explanation or worked step/);
		assert.match(prompt, /Honor an explicit request for an explanation immediately/);
		assert.doesNotMatch(prompt, /A failed attempt is never a reason to reveal/);
		assert.doesNotMatch(prompt, /Never teach beyond a surgical line/);
		assert.doesNotMatch(prompt, /one rung per request\. A trace/);
	});

	it("distinguishes assisted completion, supplied answers, repair, and delayed retention", () => {
		const prompt = normalizeWhitespace(composeInstructions("practice"));
		assert.match(prompt, /Even R0 or R1 is help/);
		assert.match(prompt, /solvedWithHints/);
		assert.match(prompt, /An explanation supplied by you does not become a learner-produced solution/);
		assert.match(prompt, /A same-session retest checks repair/);
		assert.match(prompt, /it does not schedule a future session/);
		assert.match(prompt, /Immediate|immediately after instruction/);
	});

	it("preserves explicit progression and stopping without forcing every retest", () => {
		const prompt = normalizeWhitespace(composeInstructions("practice"));
		assert.match(prompt, /Concluding reveals the committed solution and ends the turn/);
		assert.match(prompt, /The next problem requires the learner's explicit go-ahead/);
		assert.match(prompt, /Respect a request to stop even when retests remain/);
		assert.match(prompt, /The learner may discard a problem/);
		for (const rung of ["R0", "R1", "R2", "R3", "R4", "R5"]) assert.ok(prompt.includes(rung));
		assert.doesNotMatch(prompt, /Nothing that failed in the session ends the session unretested/);
	});

	it("keeps solution commitment while adapting difficulty and variation", () => {
		const prompt = normalizeWhitespace(composeInstructions("practice"));
		assert.match(prompt, /Commit a complete model solution before the learner sees the statement/);
		assert.match(prompt, /A second model's agreement alone is not proof/);
		assert.match(prompt, /Short blocks of same-target work can help a novice/);
		assert.match(prompt, /85% success rate is an adjustable heuristic/);
		assert.doesNotMatch(prompt, /Never issue blocks of same-target problems/);
		assert.match(descriptionOf(concludeInputObject.properties.verdict), /do not credit an agent-supplied solution/);
		assert.match(descriptionOf(concludeInputObject.properties.rung), /most revealing help actually given/);
		assert.match(descriptionOf(concludeInputObject.properties.retest), /does not schedule delayed review/);
	});

	it("aligns the conclude description with the canonical ack without changing outcomes or the runtime pause mechanism", async () => {
		const tool = concludeTool(createPracticeGate(ctxOf(activeProblemRecord())));
		const description = normalizeWhitespace(tool.description);
		assert.match(description, /records the outcome \+ verdict, reveals the committed solution, and frees the learner's composer/);
		assert.match(description, /After the result, say your closing words about the learner's work if useful, then END YOUR TURN — no further tool calls/);
		assert.ok(description.includes(CONCLUDE_ACK_TEXT.slice(CONCLUDE_ACK_TEXT.indexOf("The next problem"))));
		assert.match(description, /Nothing may conclude unless a problem is active/);
		assert.doesNotMatch(description, /turn CONTINUES|reveal, then pose the next problem/);
		assert.deepEqual(concludeInputObject.properties.outcome.anyOf.map((outcome) => outcome.const), [
			"solved", "solvedWithHints", "movedOn", "surrendered", "dismissed",
		]);
		const result = await tool.execute("call_persistent_nudges", CONCLUDE_INPUT as never);
		assert.equal((result.content[0] as { text: string }).text, CONCLUDE_ACK_TEXT);
		assert.equal(result.terminate, undefined, "closing prose stays possible; the pause remains an instruction, not a new runtime gate");
	});
});

// ── the prompt composition ──────────────────────────────────────────────────

describe("practice prompt composition (own directory + the formatting appendix)", () => {
	it("composes practice policy and shared evidence without teaching-only tools", () => {
		const prompt = composeInstructions("practice");
		assert.match(prompt, /# The practice session/);
		assert.match(prompt, /## Reasoning and evidence/);
		assert.doesNotMatch(prompt, /# The teaching method/);
		assert.doesNotMatch(prompt, /## Confidence is self-assessment/);
		assert.doesNotMatch(prompt, /plan_init|ask_user_question/);
	});

	it("shares accuracy, voice, and fallible evidence rules across agents", () => {
		for (const kind of ["practice", "teacher", "prober"] as const) {
			const prompt = composeInstructions(kind);
			assert.match(prompt, /one confidently-delivered hallucination poisons that/);
			assert.match(prompt, /Everything in this section deletes a default/);
			assert.match(prompt, /fallible self-report/);
			assert.match(prompt, /graph records ideas and their sources, not verified ability/);
			assert.doesNotMatch(prompt, /Memorized facts rot|Understood facts don't|solid knowledge — move on/);
		}
	});

	it("uses a provisional probe and preserves the plan presentation contract", () => {
		const prober = composeInstructions("prober").replace(/\s+/g, " ");
		assert.match(prober, /Stop probing when there is enough evidence to start useful teaching/);
		assert.match(prober, /Label an untested ceiling as untested/);
		assert.doesNotMatch(prober, /A strand that never breaks is not done/);
		const teacher = composeInstructions("teacher").replace(/\s+/g, " ");
		assert.match(teacher, /The tool presents the map; do not duplicate it in prose/);
		assert.match(teacher, /Ask for confirmation and end the turn/);
		assert.match(teacher, /Not every turn needs a question/);
		assert.match(teacher, /Immediate success is provisional/);
	});

	it("the SHARED formatting guide composes (owner, 2026-10-04 late): LaTeX delimiters in every setting", () => {
		const prompt = composeInstructions("practice");
		// The standard delimiter law is shared by all three authoring agents.
		for (const agent of ["practice", "prober", "teacher"] as const) {
			const instructions = composeInstructions(agent);
			assert.ok(instructions.includes("Inline `$f(x)$`, display `$$` fenced on its own lines."));
			assert.ok(!instructions.includes("NEVER `$` or `$$`"));
		}
		assert.ok(prompt.indexOf("# The practice session") < prompt.indexOf("## Formatting"), "formatting rides as the appendix");
	});

	it("base precedes doctrine (00- sorts before 10-)", () => {
		const prompt = composeInstructions("practice");
		assert.ok(prompt.indexOf("The agent") < prompt.indexOf("# The practice session"));
	});

	it("the segment registry knows practice (override paths resolve)", () => {
		assert.ok(allSegmentPaths().includes("practice/00-base.md"));
		assert.ok(allSegmentPaths().includes("practice/10-doctrine.md"));
	});
});
