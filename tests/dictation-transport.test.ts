/**
 * Unit tests — the dictation renderer's transport helpers (local STT
 * wave, 2026-10-27: components/dictation.tsx). Frames batch into one POST
 * body in order, and a refused /api/stt call becomes the surface's line —
 * the model-missing 503 the short owner-chosen one the button deep-links on.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, it } from "node:test";
import { BATCH_FRAMES, DICTATION_NO_MODEL, concatFrames, sttFailure } from "../components/dictation.tsx";

describe("concatFrames", () => {
	it("preserves PCM bytes from the actual worklet through upload batching", () => {
		const frames: ArrayBuffer[] = [];
		let Processor!: new () => { process(inputs: Float32Array[][]): boolean };
		runInNewContext(readFileSync(new URL("../public/worklets/pcm-capture.js", import.meta.url), "utf8"), {
			AudioWorkletProcessor: class {
				port = { postMessage(message: { type: string; buffer?: ArrayBuffer }, transfer: ArrayBuffer[] = []) {
					const received = structuredClone(message, { transfer });
					if (received.type === "audio") frames.push(received.buffer!);
				} };
			},
			registerProcessor: (_name: string, ctor: typeof Processor) => { Processor = ctor; },
		});
		const processor = new Processor();
		const samples = Float32Array.from({ length: 4096 }, (_, i) => i % 2 ? -0.5 : 0.5);
		for (let i = 0; i < samples.length; i += 128) processor.process([[samples.slice(i, i + 128)]]);
		assert.equal(frames.length, 2);
		const body = concatFrames(frames);
		assert.equal(body.byteLength, samples.length * 2);
		const view = new DataView(body.buffer);
		for (let i = 0; i < samples.length; i++) assert.equal(view.getInt16(i * 2, true), i % 2 ? -16384 : 16383);
	});

	it("joins worklet frames in order", () => {
		const a = new Int16Array([1, 2]).buffer;
		const b = new Int16Array([3]).buffer;
		const out = concatFrames([a, b]);
		assert.deepEqual([...new Int16Array(out.buffer)], [1, 2, 3]);
	});

	it("no frames → an empty body", () => {
		assert.equal(concatFrames([]).byteLength, 0);
	});

	it("a batch is ~0.5s of 128ms frames", () => {
		assert.equal(BATCH_FRAMES, 4);
	});
});

describe("sttFailure", () => {
	it("model_missing → the short no-model line", async () => {
		const res = Response.json({ code: "model_missing", message: "server words" }, { status: 503 });
		assert.equal((await sttFailure(res)).message, DICTATION_NO_MODEL);
	});

	it("any other refusal carries the server's message", async () => {
		const res = Response.json({ message: "decode broke" }, { status: 500 });
		assert.equal((await sttFailure(res)).message, "decode broke");
	});

	it("a body-less failure still says something honest", async () => {
		assert.equal((await sttFailure(new Response("", { status: 502 }))).message, "dictation 502");
	});
});
