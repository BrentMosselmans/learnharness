/**
 * Unit tests — dictation runs on the local engine (src/server/stt-runs.ts,
 * local STT wave 2026-10-27), driven by a fake engine: segments decode in
 * order while the run is live, end() returns the joined text after the
 * last phrase, cancel/idle-reap drop the run, model removal drops the
 * recognizer, and a missing model refuses with its machine code.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	createSttRuns,
	pcm16ToFloat32,
	sttErrorResponse,
	SttModelMissingError,
	SttRunNotFoundError,
	type SttEngine,
	type SttVad,
} from "../src/server/stt-runs.ts";

/** Fake VAD: every NON-ZERO sample batch is one finished segment; flush()
 *  emits the open one. The sample count stands in for the phrase. */
function fakeVad(): SttVad & { open: Float32Array | null } {
	const done: Float32Array[] = [];
	const vad = {
		open: null as Float32Array | null,
		acceptWaveform(s: Float32Array) {
			if (s.some((x) => x !== 0)) done.push(s);
			else if (s.length) vad.open = s; // zeros = "speech still open"
		},
		isEmpty: () => done.length === 0,
		front: () => ({ samples: done[0]! }),
		pop: () => void done.shift(),
		flush() {
			if (vad.open) done.push(vad.open);
			vad.open = null;
		},
	};
	return vad;
}

function fakeEngine(transcribe: (s: Float32Array) => Promise<string> = async (s) => `w${s.length}`) {
	let loads = 0;
	const decoded: number[] = [];
	const engine: SttEngine = {
		createVad: fakeVad,
		transcribe: async (s) => {
			decoded.push(s.length);
			return transcribe(s);
		},
	};
	const loadEngine = async () => {
		loads++;
		return engine;
	};
	return { loadEngine, decoded, loads: () => loads };
}

function fakeModel(ready = true) {
	let removed: (() => void) | null = null;
	return {
		dir: "/models/x",
		ready,
		isReady() {
			return this.ready;
		},
		onRemoved(fn: () => void) {
			removed = fn;
			return () => {};
		},
		remove: () => removed?.(),
	};
}

/** `n` int16 samples of value v as little-endian bytes. */
const pcm = (n: number, v = 1000) => {
	const b = new Uint8Array(n * 2);
	const dv = new DataView(b.buffer);
	for (let i = 0; i < n; i++) dv.setInt16(i * 2, v, true);
	return b;
};

let ids = 0;
const newId = () => `run-${++ids}`;

describe("pcm16ToFloat32", () => {
	it("little-endian int16 → [-1, 1), trailing odd byte ignored", () => {
		const b = new Uint8Array([0x00, 0x80, 0xff, 0x7f, 0x00, 0x00, 0x42]);
		const f = pcm16ToFloat32(b);
		assert.equal(f.length, 3);
		assert.equal(f[0], -1);
		assert.equal(f[1], 0x7fff / 0x8000);
		assert.equal(f[2], 0);
	});
});

describe("stt runs", () => {
	it("phrases decode while live; end() returns them joined in order", async () => {
		const e = fakeEngine();
		const runs = createSttRuns({ model: fakeModel(), loadEngine: e.loadEngine, newId });
		const id = await runs.start();
		runs.append(id, pcm(3));
		runs.append(id, pcm(5));
		await new Promise((r) => setTimeout(r, 0));
		assert.deepEqual(e.decoded, [3, 5], "decoded before the stop");
		runs.append(id, pcm(7, 0)); // the last phrase is still open at stop
		assert.equal(await runs.end(id), "w3 w5 w7");
		assert.throws(() => runs.append(id, pcm(1)), SttRunNotFoundError, "an ended run is gone");
	});

	it("blank decodes are dropped from the join", async () => {
		const e = fakeEngine(async (s) => (s.length === 4 ? "  " : `w${s.length}`));
		const runs = createSttRuns({ model: fakeModel(), loadEngine: e.loadEngine, newId });
		const id = await runs.start();
		runs.append(id, pcm(3));
		runs.append(id, pcm(4));
		runs.append(id, pcm(5));
		assert.equal(await runs.end(id), "w3 w5");
	});

	it("an empty run ends with empty text", async () => {
		const runs = createSttRuns({ model: fakeModel(), loadEngine: fakeEngine().loadEngine, newId });
		assert.equal(await runs.end(await runs.start()), "");
	});

	it("the recognizer loads once and stays warm across runs", async () => {
		const e = fakeEngine();
		const runs = createSttRuns({ model: fakeModel(), loadEngine: e.loadEngine, newId });
		await runs.warm();
		await runs.end(await runs.start());
		await runs.end(await runs.start());
		assert.equal(e.loads(), 1);
	});

	it("a failed load retries on the next call", async () => {
		let fail = true;
		const e = fakeEngine();
		const loadEngine = async () => {
			if (fail) throw new Error("bad model");
			return e.loadEngine();
		};
		const runs = createSttRuns({ model: fakeModel(), loadEngine, newId });
		await assert.rejects(runs.start(), /bad model/);
		fail = false;
		assert.ok(await runs.start());
	});

	it("a missing model refuses with model_missing (503 at the route)", async () => {
		const runs = createSttRuns({ model: fakeModel(false), loadEngine: fakeEngine().loadEngine, newId });
		const err = await runs.start().then(
			() => null,
			(e: unknown) => e,
		);
		assert.ok(err instanceof SttModelMissingError);
		const res = sttErrorResponse(err);
		assert.equal(res.status, 503);
		assert.deepEqual(await res.json(), { code: "model_missing", message: "Dictation needs a speech model" });
		assert.equal(sttErrorResponse(new SttRunNotFoundError("x")).status, 404);
		assert.equal(sttErrorResponse(new Error("boom")).status, 500);
	});

	it("a decode failure fails end() honestly", async () => {
		const e = fakeEngine(async () => {
			throw new Error("decode broke");
		});
		const runs = createSttRuns({ model: fakeModel(), loadEngine: e.loadEngine, newId });
		const id = await runs.start();
		runs.append(id, pcm(3));
		await assert.rejects(runs.end(id), /decode broke/);
	});

	it("cancel drops the run (idempotent)", async () => {
		const runs = createSttRuns({ model: fakeModel(), loadEngine: fakeEngine().loadEngine, newId });
		const id = await runs.start();
		runs.cancel(id);
		runs.cancel(id);
		assert.throws(() => runs.append(id, pcm(1)), SttRunNotFoundError);
		await assert.rejects(runs.end(id), SttRunNotFoundError);
	});

	it("an untouched run is reaped after the idle window; appends keep it alive", async () => {
		const runs = createSttRuns({ model: fakeModel(), loadEngine: fakeEngine().loadEngine, newId, idleMs: 30 });
		const id = await runs.start();
		await new Promise((r) => setTimeout(r, 20));
		runs.append(id, pcm(2)); // touch
		await new Promise((r) => setTimeout(r, 20));
		runs.append(id, pcm(2)); // still alive: the touch reset the window
		await new Promise((r) => setTimeout(r, 60));
		assert.throws(() => runs.append(id, pcm(1)), SttRunNotFoundError);
	});

	it("removing the model drops live runs and the loaded recognizer", async () => {
		const model = fakeModel();
		const e = fakeEngine();
		const runs = createSttRuns({ model, loadEngine: e.loadEngine, newId });
		const id = await runs.start();
		model.remove();
		assert.throws(() => runs.append(id, pcm(1)), SttRunNotFoundError);
		model.ready = false;
		await assert.rejects(runs.start(), SttModelMissingError);
		model.ready = true;
		await runs.start();
		assert.equal(e.loads(), 2, "reloaded after the re-download");
	});
});
