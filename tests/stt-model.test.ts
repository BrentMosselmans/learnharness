/**
 * Unit tests — the local dictation model on disk (src/server/stt-model.ts,
 * local STT wave 2026-10-27): the opt-in download verifies every file
 * before it may land under its real name, a failure is honest, cancel and
 * remove delete everything, and verified files survive a failed run.
 */

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, it } from "node:test";
import { createSttModelManager } from "../src/server/stt-model.ts";
import type { SttModelFile } from "../src/core/stt.ts";

const sha = (b: Uint8Array) => createHash("sha256").update(b).digest("hex");
const body = (s: string): Uint8Array<ArrayBuffer> => new TextEncoder().encode(s);

const A = body("alpha-model-bytes");
const B = body("beta");
const FA: SttModelFile = { name: "a.onnx", url: "https://hf.test/a.onnx", bytes: A.length, sha256: sha(A) };
const FB: SttModelFile = { name: "b.txt", url: "https://hf.test/b.txt", bytes: B.length, sha256: sha(B) };
const FILES = [FA, FB];

const dirs: string[] = [];
const tmpDir = () => {
	const d = fs.mkdtempSync(path.join(os.tmpdir(), "lh-stt-model-"));
	dirs.push(d);
	return path.join(d, "model");
};
afterEach(() => {
	for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

/** A fetch serving fixed bodies by URL, counting calls. */
function fakeFetch(bodies: Record<string, Uint8Array<ArrayBuffer>>) {
	const calls: string[] = [];
	const fn = async (url: string) => {
		calls.push(url);
		const b = bodies[url];
		return b ? new Response(b) : new Response("nope", { status: 404 });
	};
	return { fn, calls };
}

describe("stt model manager", () => {
	it("absent → download → ready, every file verified under its real name", async () => {
		const dir = tmpDir();
		const { fn } = fakeFetch({ [FA.url]: A, [FB.url]: B });
		const m = createSttModelManager({ dir, files: FILES, fetchFn: fn });
		assert.deepEqual(m.status(), { state: "absent" });
		assert.equal(m.download().state, "downloading");
		await m.settled();
		assert.deepEqual(m.status(), { state: "ready", bytes: A.length + B.length });
		assert.equal(fs.readFileSync(path.join(dir, "a.onnx"), "utf8"), "alpha-model-bytes");
		assert.deepEqual(fs.readdirSync(dir).sort(), ["a.onnx", "b.txt"], "no .part leftovers");
	});

	it("download is idempotent while running and when ready", async () => {
		const dir = tmpDir();
		const { fn, calls } = fakeFetch({ [FA.url]: A, [FB.url]: B });
		const m = createSttModelManager({ dir, files: FILES, fetchFn: fn });
		m.download();
		m.download();
		await m.settled();
		m.download();
		assert.equal(calls.length, 2, "one fetch per file, ever");
	});

	it("a hash mismatch never lands — honest error, then a retry can succeed", async () => {
		const dir = tmpDir();
		const bodies: Record<string, Uint8Array<ArrayBuffer>> = { [FA.url]: A, [FB.url]: body("evil") };
		const m = createSttModelManager({ dir, files: FILES, fetchFn: fakeFetch(bodies).fn });
		m.download();
		await m.settled();
		const s = m.status();
		assert.equal(s.state, "error");
		if (s.state === "error") assert.match(s.message, /b\.txt.*verification/);
		assert.ok(!fs.existsSync(path.join(dir, "b.txt")) && !fs.existsSync(path.join(dir, "b.txt.part")));
		assert.ok(fs.existsSync(path.join(dir, "a.onnx")), "the verified file is kept");

		bodies[FB.url] = B; // the mirror recovers
		const { fn, calls } = fakeFetch(bodies);
		const retry = createSttModelManager({ dir, files: FILES, fetchFn: fn });
		retry.download();
		await retry.settled();
		assert.equal(retry.status().state, "ready");
		assert.deepEqual(calls, [FB.url], "the kept file is not re-fetched");
	});

	it("an HTTP failure surfaces as an error status", async () => {
		const m = createSttModelManager({ dir: tmpDir(), files: FILES, fetchFn: fakeFetch({}).fn });
		m.download();
		await m.settled();
		const s = m.status();
		assert.equal(s.state, "error");
		if (s.state === "error") assert.match(s.message, /HTTP 404/);
	});

	it("progress counts received bytes against the manifest total", async () => {
		let release!: () => void;
		const gate = new Promise<void>((r) => (release = r));
		const fn = async (url: string) => {
			if (url === FB.url) await gate;
			return new Response(url === FA.url ? A : B);
		};
		const m = createSttModelManager({ dir: tmpDir(), files: FILES, fetchFn: fn });
		m.download();
		await new Promise((r) => setTimeout(r, 20));
		assert.deepEqual(m.status(), { state: "downloading", received: A.length, total: A.length + B.length });
		release();
		await m.settled();
	});

	it("remove() cancels a running download: no error, directory gone, listeners told", async () => {
		const dir = tmpDir();
		const fn = (_url: string, init: RequestInit) =>
			new Promise<Response>((_resolve, reject) => {
				init.signal!.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
			});
		const m = createSttModelManager({ dir, files: FILES, fetchFn: fn });
		let removed = 0;
		m.onRemoved(() => removed++);
		m.download();
		assert.equal(m.status().state, "downloading");
		assert.deepEqual(await m.remove(), { state: "absent" }, "cancel is not an error");
		assert.ok(!fs.existsSync(dir));
		assert.equal(removed, 1);
	});

	it("remove() deletes a ready model", async () => {
		const dir = tmpDir();
		const m = createSttModelManager({ dir, files: FILES, fetchFn: fakeFetch({ [FA.url]: A, [FB.url]: B }).fn });
		m.download();
		await m.settled();
		assert.deepEqual(await m.remove(), { state: "absent" });
		assert.ok(!fs.existsSync(dir));
	});
});
