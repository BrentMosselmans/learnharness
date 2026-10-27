/**
 * Dictation runs on the local engine (local STT wave, 2026-10-27) — the
 * server-side session the renderer streams PCM into (owner choice: the
 * server owns pause detection, so phrases transcribe WHILE the learner
 * talks and the stop only waits on the last one).
 *
 *   start   → a run id (model_missing refusal when not downloaded); the
 *             first run of the process loads the recognizer (seconds —
 *             the renderer pre-warms at page mount, and queues its frames
 *             meanwhile, so no speech is lost either way).
 *   append  → linear16 16kHz mono bytes into the run's Silero VAD; every
 *             finished speech segment queues for decoding immediately.
 *   end     → flush the VAD, wait for the queued segments, return the
 *             joined text (the renderer's DEFERRED flush — owner round 2).
 *   cancel  → drop the run; its in-flight decodes finish into nothing.
 *
 * ONE recognizer per process (loaded once, kept warm), so decodes are
 * serialized on one chain across runs; each run gets its own VAD. A run
 * nobody touches for STT_RUN_IDLE_MS (owner-approved 60s) is reaped — a
 * renderer that died mid-run can't pin a VAD forever.
 *
 * The engine is a port (SttEngine) so tests drive the lifecycle with a
 * fake; loadSherpaEngine below is the real adapter.
 */

import * as os from "node:os";
import * as path from "node:path";
import { randomUUID } from "node:crypto";
import { STT_MODEL_MISSING } from "../core/stt.ts";
import { sttModel, type SttModelManager } from "./stt-model.ts";

/** The renderer's capture format (public/worklets/pcm-capture.js). */
export const STT_SAMPLE_RATE = 16_000;

/** Reap a run untouched this long (owner-approved plan, 2026-10-27). */
export const STT_RUN_IDLE_MS = 60_000;

/** A voice-activity detector over one run's audio (sherpa's Vad, narrowed). */
export interface SttVad {
	acceptWaveform(samples: Float32Array): void;
	isEmpty(): boolean;
	/** The earliest finished speech segment (an owned copy of its samples). */
	front(): { samples: Float32Array };
	pop(): void;
	/** End of audio: emit whatever speech is still open as a segment. */
	flush(): void;
}

export interface SttEngine {
	createVad(): SttVad;
	transcribe(samples: Float32Array): Promise<string>;
}

export type SttEngineLoader = (modelDir: string) => Promise<SttEngine>;

/** The model isn't downloaded — the routes answer 503 {code: model_missing}. */
export class SttModelMissingError extends Error {
	readonly code = STT_MODEL_MISSING;
	constructor() {
		super("Dictation needs a speech model");
	}
}

/** Unknown, ended, cancelled or reaped run id — the routes answer 404. */
export class SttRunNotFoundError extends Error {
	constructor(id: string) {
		super(`no dictation run "${id}"`);
	}
}

/** The /api/stt routes' shared error mapping: model missing → 503 with
 *  its machine code (the renderer's deep-link trigger), unknown run → 404,
 *  anything else (a failed load or decode) → 500. */
export function sttErrorResponse(e: unknown): Response {
	if (e instanceof SttModelMissingError) return Response.json({ code: e.code, message: e.message }, { status: 503 });
	if (e instanceof SttRunNotFoundError) return Response.json({ message: e.message }, { status: 404 });
	return Response.json({ message: e instanceof Error ? e.message : "dictation failed" }, { status: 500 });
}

/** linear16 little-endian bytes → Float32 in [-1, 1) (a trailing odd byte
 *  is ignored — the worklet only ever posts whole samples). */
export function pcm16ToFloat32(bytes: Uint8Array): Float32Array {
	const n = bytes.length >> 1;
	const view = new DataView(bytes.buffer, bytes.byteOffset, n * 2);
	const out = new Float32Array(n);
	for (let i = 0; i < n; i++) out[i] = view.getInt16(i * 2, true) / 0x8000;
	return out;
}

export interface SttRuns {
	/** Load the recognizer now (page-mount pre-warm). */
	warm(): Promise<void>;
	start(): Promise<string>;
	append(id: string, pcm: Uint8Array): void;
	end(id: string): Promise<string>;
	cancel(id: string): void;
}

type Run = {
	engine: SttEngine;
	vad: SttVad;
	/** One slot per segment, filled in decode order (empty = no speech). */
	texts: string[];
	/** The run's latest queued decode — end() waits on it. */
	pending: Promise<void>;
	failure: unknown;
	timer: ReturnType<typeof setTimeout> | null;
};

export function createSttRuns({
	model,
	loadEngine,
	idleMs = STT_RUN_IDLE_MS,
	newId = randomUUID,
}: {
	model: Pick<SttModelManager, "dir" | "isReady" | "onRemoved">;
	loadEngine: SttEngineLoader;
	idleMs?: number;
	newId?: () => string;
}): SttRuns {
	let engine: Promise<SttEngine> | null = null;
	/** One recognizer → one decode at a time; never rejects (jobs catch). */
	let decodeChain: Promise<void> = Promise.resolve();
	const runs = new Map<string, Run>();

	const getEngine = (): Promise<SttEngine> => {
		if (!model.isReady()) return Promise.reject(new SttModelMissingError());
		return (engine ??= loadEngine(model.dir).catch((e: unknown) => {
			engine = null; // a failed load retries on the next call
			throw e;
		}));
	};

	const drop = (id: string) => {
		const run = runs.get(id);
		if (!run) return undefined;
		if (run.timer) clearTimeout(run.timer);
		runs.delete(id);
		return run;
	};

	const touch = (id: string, run: Run) => {
		if (run.timer) clearTimeout(run.timer);
		run.timer = setTimeout(() => drop(id), idleMs);
		run.timer.unref?.();
	};

	const take = (id: string) => {
		const run = runs.get(id);
		if (!run) throw new SttRunNotFoundError(id);
		return run;
	};

	/** Queue every finished segment for decoding, in order. */
	const drain = (run: Run) => {
		while (!run.vad.isEmpty()) {
			const { samples } = run.vad.front();
			run.vad.pop();
			const slot = run.texts.push("") - 1;
			const job = decodeChain
				.then(() => run.engine.transcribe(samples))
				.then(
					(text) => {
						run.texts[slot] = text.trim();
					},
					(e: unknown) => {
						run.failure ??= e;
					},
				);
			decodeChain = job;
			run.pending = job;
		}
	};

	// Removing the model drops the recognizer and every live run with it.
	model.onRemoved(() => {
		engine = null;
		for (const id of [...runs.keys()]) drop(id);
	});

	return {
		async warm() {
			await getEngine();
		},
		async start() {
			const eng = await getEngine();
			const id = newId();
			const run: Run = { engine: eng, vad: eng.createVad(), texts: [], pending: Promise.resolve(), failure: null, timer: null };
			runs.set(id, run);
			touch(id, run);
			return id;
		},
		append(id, pcm) {
			const run = take(id);
			touch(id, run);
			run.vad.acceptWaveform(pcm16ToFloat32(pcm));
			drain(run);
		},
		async end(id) {
			const run = take(id);
			drop(id);
			run.vad.flush();
			drain(run);
			await run.pending;
			if (run.failure) throw run.failure;
			return run.texts.filter(Boolean).join(" ");
		},
		cancel(id) {
			drop(id);
		},
	};
}

/** The real engine: sherpa-onnx's offline transducer (Parakeet TDT v3) +
 *  Silero VAD. Endpointing mirrors the owner's live-tuned Deepgram value
 *  (endpointing=300 → minSilenceDuration 0.3s); maxSpeechDuration caps a
 *  pause-free monologue's segment so the stop never waits on minutes. */
export const loadSherpaEngine: SttEngineLoader = async (dir) => {
	// CommonJS without analyzable named exports: `default` is module.exports
	// under Node's ESM interop (bundlers may hand the namespace itself).
	const mod = await import("sherpa-onnx-node");
	const sherpa = mod.default ?? mod;
	const numThreads = Math.max(1, Math.min(4, os.availableParallelism() - 1));
	const recognizer = await sherpa.OfflineRecognizer.createAsync({
		featConfig: { sampleRate: STT_SAMPLE_RATE, featureDim: 80 },
		modelConfig: {
			transducer: {
				encoder: path.join(dir, "encoder.int8.onnx"),
				decoder: path.join(dir, "decoder.int8.onnx"),
				joiner: path.join(dir, "joiner.int8.onnx"),
			},
			tokens: path.join(dir, "tokens.txt"),
			modelType: "nemo_transducer",
			numThreads,
			provider: "cpu",
			debug: 0,
		},
	});
	const vadConfig = {
		sileroVad: {
			model: path.join(dir, "silero_vad.onnx"),
			threshold: 0.5,
			minSilenceDuration: 0.3,
			minSpeechDuration: 0.25,
			windowSize: 512,
			maxSpeechDuration: 20,
		},
		sampleRate: STT_SAMPLE_RATE,
		numThreads: 1,
		provider: "cpu",
		debug: 0,
	};
	return {
		createVad() {
			const vad = new sherpa.Vad(vadConfig, 60);
			return {
				acceptWaveform: (samples) => vad.acceptWaveform(samples),
				isEmpty: () => vad.isEmpty(),
				// enableExternalBuffer=false: an OWNED copy — the decode runs
				// after pop(), which frees the native segment.
				front: () => vad.front(false),
				pop: () => vad.pop(),
				flush: () => vad.flush(),
			};
		},
		async transcribe(samples) {
			const stream = recognizer.createStream();
			stream.acceptWaveform({ samples, sampleRate: STT_SAMPLE_RATE });
			return (await recognizer.decodeAsync(stream)).text;
		},
	};
};

/** The process's runs registry (globalThis — the stt-model discipline). */
export function sttRuns(): SttRuns {
	const g = globalThis as typeof globalThis & { __lhSttRuns?: SttRuns };
	return (g.__lhSttRuns ??= createSttRuns({ model: sttModel(), loadEngine: loadSherpaEngine }));
}
