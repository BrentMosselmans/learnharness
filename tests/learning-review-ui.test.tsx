import React, { act } from "react";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createRoot, type Root } from "react-dom/client";
import { parseHTML } from "linkedom";
import { LearningReview } from "../components/learning-review.tsx";

const dom = parseHTML("<html><body></body></html>");
Object.assign(globalThis, { React, window: dom.window, self: dom.window, document: dom.document, Event: dom.window.Event, HTMLElement: dom.window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true });
const originalFetch = globalThis.fetch;
let root: Root | undefined;
let host: HTMLElement | undefined;
afterEach(async () => { await act(async () => root?.unmount()); host?.remove(); globalThis.fetch = originalFetch; });
async function mount(node: React.ReactNode) {
	host = document.createElement("div"); document.body.append(host); root = createRoot(host);
	await act(async () => root!.render(node));
}
const fixture = () => ({ id: "n", nodeId: "n", name: "Rule", statement: "A rule", status: "independent", reason: "Delayed retention still needs a later check.", independent: 1, assisted: 0, delayed: 0, excluded: 0, dueAt: 1, reviewKind: "changed-task", evidence: [{ id: "e", chatId: "chat", at: 1, statement: "Apply it", verdict: "Correct", outcome: "solved", grade: "confident", rung: null, submissions: [{ id: "s" }], attempts: [{ result: "correct" }], correction: undefined as string | undefined }] });

test("queue handles empty and failed loads with a working retry", async () => {
	let fail = true;
	globalThis.fetch = async () => fail ? new Response("", { status: 500 }) : Response.json({ nodes: [] });
	await mount(<LearningReview />);
	assert.ok(document.querySelector('[role="alert"]'));
	fail = false;
	await act(async () => document.querySelector<HTMLButtonElement>("button")!.click());
	assert.ok(document.body.textContent?.includes("No reviews yet"));
});

test("preparing a review uses the selected target and performs no session request", async () => {
	const requests: string[] = [];
	globalThis.fetch = async url => { requests.push(String(url)); return Response.json({ nodes: [fixture()] }); };
	let selected: unknown;
	await mount(<LearningReview onPractice={(node, kind) => { selected = [node.id, kind]; }} />);
	await act(async () => document.querySelector<HTMLButtonElement>("button")!.click());
	assert.deepEqual(selected, ["n", "changed-task"]);
	assert.ok(requests.every(url => url === "/api/learning"));
});

test("disputing, restoring, and marking a faulty question recomputes the panel", async () => {
	const node = fixture();
	globalThis.fetch = async (_url, options) => {
		if (options?.method === "POST") {
			const body = JSON.parse(String(options.body));
			assert.equal(body.evidenceId, "e");
			node.evidence[0]!.correction = body.action;
			node.independent = body.action === "restore" ? 1 : 0;
			node.excluded = body.action === "restore" ? 0 : 1;
			return Response.json({ ok: true });
		}
		return Response.json({ nodes: [node] });
	};
	await mount(<LearningReview nodeId="n" />);
	const click = async (label: string) => act(async () => [...document.querySelectorAll<HTMLButtonElement>("button")].find(b => b.textContent === label)!.click());
	await click("Dispute grade");
	assert.ok(document.body.textContent?.includes("0 independent"));
	await click("Restore");
	assert.ok(document.body.textContent?.includes("1 independent"));
	await click("Faulty question");
	assert.ok(document.body.textContent?.includes("0 independent"));
});
