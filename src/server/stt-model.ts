/**
 * The local dictation model on disk (local STT wave, 2026-10-27): status,
 * the opt-in download, cancel, remove. The model is never bundled (owner:
 * opt-in from Settings → Keys → Dictation) — it lands under
 * PATHS.models/<STT_MODEL_ID>/ (userData in the desktop app).
 *
 * Integrity: every file is pinned to an immutable Hugging Face revision
 * (core/stt.ts STT_MODEL_FILES) and streams to `<name>.part` while it is
 * hashed; only a size + SHA-256 match renames it to its real name. So a
 * real-named file is ALWAYS a verified one — `ready` is a cheap stat of
 * the sizes, never a 650MB re-hash. A failed/interrupted run keeps its
 * verified files (the next Download skips them); Cancel and Remove delete
 * the whole directory.
 *
 * One manager per process (module singleton below); fetch + the directory
 * are injected so tests never touch the network or the real data dir.
 */

import { createHash } from "node:crypto";
import { once } from "node:events";
import * as fs from "node:fs";
import * as path from "node:path";
import { PATHS } from "../../config.ts";
import { STT_MODEL_FILES, STT_MODEL_ID, type SttModelFile, type SttModelStatus } from "../core/stt.ts";

type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

export interface SttModelManager {
	/** The model directory (the recognizer's file paths resolve here). */
	readonly dir: string;
	status(): SttModelStatus;
	isReady(): boolean;
	/** Start the download (idempotent: a running download or a ready model
	 *  is left alone). Returns the status right after the call. */
	download(): SttModelStatus;
	/** Cancel a running download and/or delete the model. Resolves once the
	 *  download has stopped and the directory is gone. */
	remove(): Promise<SttModelStatus>;
	/** Called after remove() deletes the files — the runs module drops its
	 *  loaded recognizer here. Returns the unsubscribe. */
	onRemoved(fn: () => void): () => void;
	/** Resolves when the current download settles (tests; no-op when idle). */
	settled(): Promise<void>;
}

export function createSttModelManager({
	dir,
	files = STT_MODEL_FILES,
	fetchFn = fetch,
}: {
	dir: string;
	files?: readonly SttModelFile[];
	fetchFn?: FetchLike;
}): SttModelManager {
	const total = files.reduce((sum, f) => sum + f.bytes, 0);
	let running: { controller: AbortController; received: number; done: Promise<void> } | null = null;
	let lastError: string | null = null;
	const removedListeners = new Set<() => void>();

	const verifiedOnDisk = (f: SttModelFile) => {
		try {
			return fs.statSync(path.join(dir, f.name)).size === f.bytes;
		} catch {
			return false;
		}
	};
	const isReady = () => files.every(verifiedOnDisk);

	async function fetchFile(f: SttModelFile, signal: AbortSignal, onBytes: (n: number) => void) {
		const res = await fetchFn(f.url, { signal });
		if (!res.ok || !res.body) throw new Error(`${f.name}: download failed (HTTP ${res.status})`);
		const part = path.join(dir, `${f.name}.part`);
		const out = fs.createWriteStream(part);
		const hash = createHash("sha256");
		let bytes = 0;
		try {
			for await (const chunk of res.body as unknown as AsyncIterable<Uint8Array>) {
				hash.update(chunk);
				bytes += chunk.length;
				onBytes(chunk.length);
				if (!out.write(chunk)) await once(out, "drain");
			}
			out.end();
			await once(out, "finish");
		} catch (e) {
			out.destroy();
			fs.rmSync(part, { force: true });
			throw e;
		}
		if (bytes !== f.bytes || hash.digest("hex") !== f.sha256) {
			fs.rmSync(part, { force: true });
			throw new Error(`${f.name}: downloaded file failed verification`);
		}
		fs.renameSync(part, path.join(dir, f.name));
	}

	function start() {
		const controller = new AbortController();
		const run = { controller, received: 0, done: Promise.resolve() };
		run.done = (async () => {
			fs.mkdirSync(dir, { recursive: true });
			for (const f of files) {
				if (verifiedOnDisk(f)) {
					run.received += f.bytes; // kept from an earlier, interrupted run
					continue;
				}
				await fetchFile(f, controller.signal, (n) => (run.received += n));
			}
		})()
			.then(() => {
				lastError = null;
			})
			.catch((e: unknown) => {
				// Cancel is not an error — remove() owns that path.
				if (!controller.signal.aborted) lastError = e instanceof Error ? e.message : "download failed";
			})
			.finally(() => {
				if (running === run) running = null;
			});
		running = run;
	}

	const manager: SttModelManager = {
		dir,
		isReady,
		status() {
			if (running) return { state: "downloading", received: running.received, total };
			if (isReady()) return { state: "ready", bytes: total };
			if (lastError) return { state: "error", message: lastError };
			return { state: "absent" };
		},
		download() {
			if (!running && !isReady()) {
				lastError = null;
				start();
			}
			return manager.status();
		},
		async remove() {
			if (running) {
				const { controller, done } = running;
				controller.abort();
				await done;
			}
			lastError = null;
			fs.rmSync(dir, { recursive: true, force: true });
			for (const fn of removedListeners) fn();
			return manager.status();
		},
		onRemoved(fn) {
			removedListeners.add(fn);
			return () => removedListeners.delete(fn);
		},
		settled() {
			return running ? running.done : Promise.resolve();
		},
	};
	return manager;
}

/** The process's model manager (the /api/stt routes + the runs module).
 *  On globalThis, the dismissal-park discipline: every route must see the
 *  SAME running download, or a status poll reads a world where none runs. */
export function sttModel(): SttModelManager {
	const g = globalThis as typeof globalThis & { __lhSttModel?: SttModelManager };
	return (g.__lhSttModel ??= createSttModelManager({ dir: path.join(PATHS.models, STT_MODEL_ID) }));
}
