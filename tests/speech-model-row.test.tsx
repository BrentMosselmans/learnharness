/**
 * The Dictation row (components/settings/speech-model-row.tsx — local STT
 * wave, owner 2026-10-27): the opt-in local model's states and actions —
 * Download while absent (and to retry an error), progress + Cancel while
 * downloading, Remove when ready — plus the license credit line.
 */
import React, { act } from "react";
(globalThis as Record<string, unknown>).React = React;
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { createRoot, type Root } from "react-dom/client";
import { parseHTML } from "linkedom";
import { SpeechModelRow, modelStatusLine } from "../components/settings/speech-model-row.tsx";
import { STT_MODEL_BYTES, STT_MODEL_CREDIT, type SttModelStatus } from "../src/core/index.ts";

const dom = parseHTML("<html><body></body></html>");
Object.assign(globalThis, {
	window: dom.window,
	document: dom.document,
	Element: dom.window.Element,
	HTMLElement: dom.window.HTMLElement,
	IS_REACT_ACT_ENVIRONMENT: true,
});

const originalFetch = globalThis.fetch;
let root: Root | undefined;
let host: HTMLElement | undefined;
afterEach(async () => {
	await act(async () => root?.unmount());
	host?.remove();
	root = undefined;
	globalThis.fetch = originalFetch;
});

const byTest = (id: string) => document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;

/** A server double: GET answers the current status; POST/DELETE move it. */
function server(initial: SttModelStatus, on: { POST?: SttModelStatus; DELETE?: SttModelStatus } = {}) {
	let status = initial;
	const calls: string[] = [];
	globalThis.fetch = (async (url: string, init?: RequestInit) => {
		assert.equal(url, "/api/stt/model");
		const method = init?.method ?? "GET";
		calls.push(method);
		if (method === "POST" && on.POST) status = on.POST;
		if (method === "DELETE" && on.DELETE) status = on.DELETE;
		return Response.json(status);
	}) as typeof fetch;
	return calls;
}

async function mount() {
	host = document.createElement("div");
	document.body.append(host);
	root = createRoot(host);
	await act(async () => root!.render(<SpeechModelRow />));
}

const downloading: SttModelStatus = { state: "downloading", received: 168_000_000, total: STT_MODEL_BYTES };

describe("modelStatusLine", () => {
	it("each state reads at a glance", () => {
		assert.equal(modelStatusLine({ state: "absent" }), "not downloaded · 672 MB");
		assert.equal(modelStatusLine(downloading), "24% · 168 MB / 672 MB");
		assert.equal(modelStatusLine({ state: "ready", bytes: STT_MODEL_BYTES }), "ready · 672 MB");
		assert.equal(modelStatusLine({ state: "error", message: "encoder.int8.onnx: download failed (HTTP 503)" }), "encoder.int8.onnx: download failed (HTTP 503)");
	});
});

describe("SpeechModelRow", () => {
	it("absent → Download starts it (POST) and shows progress + Cancel", async () => {
		const calls = server({ state: "absent" }, { POST: downloading });
		await mount();
		assert.equal(byTest("stt-model-status").textContent, "not downloaded · 672 MB");
		assert.equal(byTest("stt-model-action").textContent, "Download");
		assert.ok(document.body.textContent?.includes(STT_MODEL_CREDIT), "the license credit shows");
		await act(async () => byTest("stt-model-action").click());
		assert.deepEqual(calls, ["GET", "POST"]);
		assert.equal(byTest("stt-model-status").textContent, "24% · 168 MB / 672 MB");
		assert.equal(byTest("stt-model-action").textContent, "Cancel");
	});

	it("downloading → Cancel deletes (DELETE) back to absent", async () => {
		const calls = server(downloading, { DELETE: { state: "absent" } });
		await mount();
		await act(async () => byTest("stt-model-action").click());
		assert.deepEqual(calls.filter((c) => c !== "GET"), ["DELETE"]);
		assert.equal(byTest("stt-model-action").textContent, "Download");
	});

	it("ready → Remove", async () => {
		server({ state: "ready", bytes: STT_MODEL_BYTES }, { DELETE: { state: "absent" } });
		await mount();
		assert.equal(byTest("stt-model-action").textContent, "Remove");
		await act(async () => byTest("stt-model-action").click());
		assert.equal(byTest("stt-model-status").textContent, "not downloaded · 672 MB");
	});

	it("error → the reason (alert) + Download to retry", async () => {
		server({ state: "error", message: "tokens.txt: downloaded file failed verification" });
		await mount();
		assert.equal(byTest("stt-model-status").getAttribute("role"), "alert");
		assert.equal(byTest("stt-model-action").textContent, "Download");
	});
});
