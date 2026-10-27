"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2Icon, MicIcon } from "lucide-react";
import { useSettingsDialog } from "@/components/settings/settings-dialog";
import { Hint } from "@/components/ui/hint";
import { STT_MODEL_ROW } from "@/src/core";

/**
 * Voice dictation — the LOCAL engine (local STT wave, 2026-10-27; the
 * Deepgram cloud engine of STT wave 1 is gone — owner ruling).
 *
 * Architecture: the renderer captures mic audio in an AudioWorklet
 * (public/worklets/pcm-capture.js → linear16 16kHz mono) and streams it
 * to the bundled server's run API (/api/stt/runs — src/server/stt-runs.ts)
 * in ~0.5s batches. The server's Silero VAD splits on pauses and Parakeet
 * (sherpa-onnx, on-device) transcribes each phrase WHILE the learner
 * talks; the stop only waits on the last phrase. Audio never leaves the
 * machine. The model is opt-in (Settings → Keys → Dictation); without it
 * the button says DICTATION_NO_MODEL and deep-links there.
 *
 * Ported patterns from the owner's pi `dictate` extension (his words:
 * "very well tuned") — see ~/.pi/agent/extensions/dictate:
 *   - generation counter: every start/stop increments it; all async
 *     handlers no-op when stale, so a dying run's requests can never
 *     tear down the current one.
 *   - meter: latest-RMS-never-resets — the level ref keeps the last
 *     observed value, so a tick with no fresh audio re-renders the last
 *     level instead of dropping to silence (60ms tick samples the ref).
 *   - dB mapping floor −50 / ceiling −10: the sweet spot for showing
 *     conversational speech as mid-height bars without pegging.
 *   - stop: mic dies FIRST (no more audio enqueues), then the last batch,
 *     then the run's end (END_TIMEOUT_MS backstop).
 *   - no partial hypotheses, phrases commit ~300ms after a pause (his
 *     endpointing=300, carried into the VAD's minSilenceDuration — owner
 *     round 1: live words are distracting and shift the meter; the
 *     meter's width is FIXED while recording).
 *
 * Owner round 2 (2026-09-17, second live test):
 *   - DEFERRED transcript: the run's text lands in a buffer and flushes
 *     into the primary input ONCE, when the dictation ends (click-again →
 *     the server decodes the last phrase → one joined append; Esc
 *     discards). Nothing textual renders while recording — only the meter.
 *   - ADAPTIVE meter: the strip's cell count derives from its measured
 *     width (4px pitch, 8–48 cells, ResizeObserver) so narrow rows (the
 *     draft view's tighter column) show fewer bars instead of
 *     overflowing under their neighbors.
 *
 * Owner round 1 (2026-09-17, first live mic test):
 *   - ONE primary transcription input at all times: the pending
 *     quiz/ask question's field while one waits (text mode → the answer
 *     field, select modes → "Your thinking"), else the page's composer.
 *     Implemented as a module-level registry the question form claims on
 *     mount — see useDictationTarget below.
 *   - Click → meter IMMEDIATELY (optimistic): the meter strip renders
 *     from the click, run creation + TCC happen behind it.
 *
 * Meter rendering lives in <DictationBar> (own 60ms timer over the level
 * ref) so the 16-renders/sec never touch the page component — only the
 * tiny bar strip repaints.
 *
 * Start-latency mitigations (owner, 2026-09-27 — carried into the local
 * engine; the optimistic meter stays):
 *   - QUEUE-DON'T-DROP (A): frames arriving before the run exists buffer
 *     (capped, oldest dropped) and go out first, in order — captured
 *     speech is never lost, wherever in setup it lands (a stop during
 *     run creation waits for the run instead of dropping the queue).
 *   - MIC-GATED RUN (B): the run is created the moment the capture graph
 *     is live, never before — an OS TCC prompt can outlive the server's
 *     idle reap.
 *   - PERSISTENT GRAPH (C): one app-lifetime AudioContext + a memoized
 *     worklet module — per-run contexts paid context creation AND a
 *     worklet-module fetch on every start (through the dev server in dev).
 *   - WARM ENGINE (D, was the warm token): the recognizer pre-loads at
 *     page mount (POST /api/stt/warm), so the first click doesn't pay the
 *     seconds-long model load.
 *   - The honest floor stays: getUserMedia can't be pre-warmed (the mic
 *     indicator would stay lit) — hence the owner's optimistic meter.
 */

/** Meter tuning — the owner's tested values, see the file header. */
const METER_FLOOR_DB = -50;
const METER_CEILING_DB = -10;
export const METER_TICK_MS = 60;
/** Rolling history: 48 cells × 60ms ≈ 2.9s of recent loudness. */
export const METER_CELLS = 48;

export { STT_MODEL_ROW } from "@/src/core";

/** The client-authored NO-MODEL line (local STT wave, owner 2026-10-27 —
 * the successor of wave 1's keyless line). Exported for
 * pins; the errored idle button's click recognizes it and deep-links
 * Settings → Keys → the Dictation row. */
export const DICTATION_NO_MODEL = "Dictation needs a speech model";

/** Worklet frames per audio POST: 4 × 128ms ≈ 0.5s (owner-approved plan). */
export const BATCH_FRAMES = 4;
/** Frames captured before the run exists (mitigation A): capped at 256
 *  (≈32s), oldest dropped. */
export const PENDING_CAP = 256;
/** The stop's backstop: the server decodes the last phrase (and, cold,
 *  may still be loading the model) — past this the run ends as an error
 *  instead of spinning forever. */
export const END_TIMEOUT_MS = 30_000;

/** Join worklet frames (Int16 buffers) into one POST body. */
export function concatFrames(frames: ArrayBuffer[]): Uint8Array<ArrayBuffer> {
	const out = new Uint8Array(frames.reduce((n, f) => n + f.byteLength, 0));
	let at = 0;
	for (const f of frames) {
		out.set(new Uint8Array(f), at);
		at += f.byteLength;
	}
	return out;
}

/** A failed /api/stt response → the surface's line. The model-missing 503
 *  becomes the short client-authored line (the button deep-links on it);
 *  anything else carries the server's message. */
export async function sttFailure(res: Response): Promise<Error> {
	const data = (await res.json().catch(() => ({}))) as { code?: string; message?: string };
	if (data.code === "model_missing") return new Error(DICTATION_NO_MODEL);
	return new Error(data.message ?? `dictation ${res.status}`);
}

/** Pre-load the recognizer (page mount) — best-effort and silent: no model
 *  yet, or a failed load, just doesn't warm; the click path reports. */
function warmEngine() {
	fetch("/api/stt/warm", { method: "POST" }).catch(() => {});
}

/** Start a run → its id (throws the surface's line on refusal). */
async function startRun(): Promise<string> {
	const res = await fetch("/api/stt/runs", { method: "POST" });
	if (!res.ok) throw await sttFailure(res);
	return ((await res.json()) as { id: string }).id;
}

/** Fire-and-forget run discard (cancel / a run orphaned by a stale start). */
function discardRun(id: string) {
	fetch(`/api/stt/runs/${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {});
}

/* Persistent capture graph (mitigation C, owner 2026-09-27): one
 * app-lifetime AudioContext + a module-load memo. Created under the
 * click gesture (autoplay policy) and NEVER closed — per-run nodes
 * (source, worklet) disconnect at teardown instead. */
let sharedCtx: AudioContext | null = null;
let workletModule: Promise<void> | null = null;

function ensureAudioGraph(): { ctx: AudioContext; module: Promise<void> } {
	if (!sharedCtx) sharedCtx = new AudioContext({ sampleRate: 16000 });
	if (!workletModule) {
		workletModule = sharedCtx.audioWorklet.addModule("/worklets/pcm-capture.js").catch((e: unknown) => {
			workletModule = null; // failed load: retry next run
			throw e;
		});
	}
	return { ctx: sharedCtx, module: workletModule };
}

/** RMS (0..1) → normalized 0..1 across the audible dB window. */
export function rmsToMeter(rms: number): number {
	if (rms <= 0) return 0;
	const db = 20 * Math.log10(rms);
	const t = (db - METER_FLOOR_DB) / (METER_CEILING_DB - METER_FLOOR_DB);
	return Math.max(0, Math.min(1, t));
}

/**
 * The primary-input registry: at most ONE non-composer input can claim the
 * dictation target while mounted — the pending question's answer/thinking
 * field (question-dock.tsx). The page's `append` (the composer) is the
 * fallback when nobody claims. Module-level by design: the claimant is a
 * sibling subtree far from the hook's owner, and there is exactly one
 * window, one pending question, one target at a time.
 */
let questionTarget: ((text: string) => void) | null = null;

/* Is a dictation run live on this page? The Esc chain (keyboard wave A,
 * components/keyboard-shortcuts.tsx) needs a SYNCHRONOUS answer — the
 * stop handler can't report back through a CustomEvent. Set at start(),
 * cleared in cleanup() (every terminal path runs through cleanup). */
let dictationActiveFlag = false;

export function isDictationActive(): boolean {
	return dictationActiveFlag;
}

/* The finisher registry: submit paths FAR from the hook's owner (the
 * pending question's dock) need finish() without a prop bridge. Same
 * module-level pattern as questionTarget — one window, one instance,
 * one finisher. Empty registry (no hook mounted) → resolve immediately. */
let dictationFinisher: (() => Promise<void>) | null = null;

/** Finish any live dictation run before continuing (see Dictation.finish). */
export function finishDictation(): Promise<void> {
	return dictationFinisher ? dictationFinisher() : Promise.resolve();
}

/** Join a dictated final onto the current text (shared separator rule). */
export function joinDictation(current: string, final: string): string {
	return current ? current.replace(/\s+$/, "") + " " + final : final;
}

/**
 * Claim the dictation target while mounted (and `claimed` is true). The
 * unmount guard is identity-based so dev-mode double-invoked effects
 * can't clear another claimant.
 */
export function useDictationTarget(append: (text: string) => void, claimed: boolean) {
	useEffect(() => {
		if (!claimed) return;
		questionTarget = append;
		return () => {
			if (questionTarget === append) questionTarget = null;
		};
	}, [append, claimed]);
}

export type DictationPhase = "idle" | "connecting" | "recording" | "stopping";

export type Dictation = {
	phase: DictationPhase;
	/** Terminal-state explanation, shown inside the wide button (cleared on the next start). */
	error: string | null;
	/** Latest observed RMS, 0..1 — sampled by the meter's own tick, never reset. */
	levelRef: { current: number };
	/** Not idle — from the click until the stop completes (the optimistic window). */
	active: boolean;
	/** End + KEEP the transcript: flush the deferred buffer into the primary
	 *  input (the Stop pill and ⌘D). */
	toggle: () => void;
	stop: () => void;
	/** FINISH, THEN CONTINUE (owner, 2026-10-01 "nothing gets lost" round):
	 *  if a run is live, stop it and resolve only when the run has fully
	 *  ended — the run's last phrase has landed in the target field. A
	 *  submit path awaits this before building its payload, so a learner
	 *  who forgets to stop dictation before Enter never loses the spoken
	 *  reasoning. Idle → resolves immediately (the common no-run submit
	 *  pays nothing). Every terminal path runs cleanup(), and cleanup()
	 *  resolves the waiters — cancel (Esc) resolves them too, by its
	 *  discard semantics. */
	finish: () => Promise<void>;
	/** End + DISCARD the transcript: no flush, immediate teardown. The Esc
	 *  semantics (owner, 2026-09-17 round 3): Esc is a cancel, not a stop —
	 *  before, it flushed exactly like the toggle did. */
	cancel: () => void;
	/** Clear the terminal error without starting a run (zero-keys wave):
	 * the no-model click leaves for Settings and the surface must come
	 * back clean. */
	clearError: () => void;
};

/**
 * One dictation instance per composer-bearing page. `append` is the
 * composer fallback; the mounted question form's claim wins while a
 * question waits.
 */
export function useDictation({ append }: { append: (text: string) => void }): Dictation {
	const [phase, setPhase] = useState<DictationPhase>("idle");
	const [error, setError] = useState<string | null>(null);
	/** Latest RMS from the worklet — the meter samples this (dictate pattern). */
	const levelRef = useRef(0);
	/** The page's fallback append — kept fresh per render so a mid-recording
	 *  retarget (composer↔question) is honored on the very next final. */
	const appendRef = useRef(append);
	appendRef.current = append;

	// Live machinery (non-render values). The MediaStream tracks stop and
	// the per-run nodes disconnect on teardown; the run is recreated per
	// dictation; the AudioContext is app-lifetime (mitigation C).
	const streamRef = useRef<MediaStream | null>(null);
	/** Per-run graph nodes — the CONTEXT outlives runs (mitigation C). */
	const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
	const workletRef = useRef<AudioWorkletNode | null>(null);
	/** The server run's id — null until POST /api/stt/runs answers. */
	const runIdRef = useRef<string | null>(null);
	/** Frames captured before the run exists (mitigation A): handed to the
	 *  first upload in order; capped at PENDING_CAP with the oldest dropped;
	 *  cleared at teardown so a dead run's audio can't leak into the next. */
	const pendingRef = useRef<ArrayBuffer[]>([]);
	/** Frames accumulating toward the next ~0.5s upload. */
	const batchRef = useRef<ArrayBuffer[]>([]);
	/** Uploads go strictly one after another (the server appends in arrival
	 *  order); stop's end request rides the same chain. */
	const sendChainRef = useRef<Promise<void>>(Promise.resolve());
	/** The stop arrived while the run was still being created: start()
	 *  finalizes as soon as the id lands (no captured speech is dropped). */
	const stopRequestedRef = useRef(false);
	const genRef = useRef(0); // stale-handler guard (dictate pattern)
	/** The deferred transcript (owner round 2): the run's text lands here
	 *  at the end and flushes into the primary input once, at teardown. */
	const bufferRef = useRef<string[]>([]);
	/** Resolvers waiting for the run to fully end (finish(), owner
	 *  2026-10-01): released by cleanup() — every terminal path runs it. */
	const waitersRef = useRef<Array<() => void>>([]);

	/** Flush the buffered transcript into the primary input — question claim
	 *  first, composer fallback. Called exactly once per run, at cleanup; the
	 *  buffer clears itself so double-cleanup is a no-op. */
	const flush = useCallback(() => {
		if (bufferRef.current.length === 0) return;
		const text = bufferRef.current.join(" ");
		bufferRef.current = [];
		(questionTarget ?? appendRef.current)(text);
	}, []);

	/** Stop the mic and the per-run nodes (the AudioContext stays —
	 *  mitigation C). Mic dies FIRST on stop: no more audio enqueues. */
	const killMic = useCallback(() => {
		for (const track of streamRef.current?.getTracks() ?? []) track.stop();
		streamRef.current = null;
		sourceRef.current?.disconnect();
		sourceRef.current = null;
		workletRef.current?.disconnect();
		workletRef.current = null;
	}, []);

	/** Full teardown of one run's machinery. Idempotent; generation-guarded by callers. */
	const cleanup = useCallback(() => {
		genRef.current++;
		dictationActiveFlag = false;
		flush(); // the deferred transcript appears when the run ends (owner round 2)
		pendingRef.current = [];
		batchRef.current = [];
		sendChainRef.current = Promise.resolve();
		stopRequestedRef.current = false;
		runIdRef.current = null;
		killMic();
		setPhase("idle");
		// The finish() waiters ride until NOW — post-flush, post-teardown:
		// a submit path resuming after `await finishDictation()` reads the
		// target field with the dictated tail already in it.
		for (const w of waitersRef.current.splice(0)) w();
	}, [flush, killMic]);

	/** A live run failed: say so, drop the server run, end. */
	const fail = useCallback(
		(gen: number, e: unknown) => {
			if (gen !== genRef.current) return;
			const id = runIdRef.current;
			if (id) discardRun(id);
			setError(e instanceof Error ? e.message : "dictation failed");
			cleanup();
		},
		[cleanup],
	);

	/** Queue one upload of `frames` on the in-order chain. */
	const upload = useCallback(
		(gen: number, frames: ArrayBuffer[]) => {
			const id = runIdRef.current;
			if (!id || frames.length === 0) return;
			const body = concatFrames(frames);
			sendChainRef.current = sendChainRef.current.then(async () => {
				if (gen !== genRef.current) return;
				const res = await fetch(`/api/stt/runs/${encodeURIComponent(id)}/audio`, {
					method: "POST",
					headers: { "content-type": "application/octet-stream" },
					body,
				});
				if (!res.ok) throw await sttFailure(res);
			});
			sendChainRef.current.catch((e: unknown) => fail(gen, e));
		},
		[fail],
	);

	/** End the run: the last partial batch goes out, the server decodes the
	 *  last phrase, the run's text joins the deferred buffer, teardown. */
	const finalize = useCallback(
		(gen: number) => {
			const id = runIdRef.current!;
			upload(gen, batchRef.current.splice(0));
			sendChainRef.current
				.then(async () => {
					if (gen !== genRef.current) return;
					const res = await fetch(`/api/stt/runs/${encodeURIComponent(id)}/end`, {
						method: "POST",
						signal: AbortSignal.timeout(END_TIMEOUT_MS),
					});
					if (!res.ok) throw await sttFailure(res);
					const { text } = (await res.json()) as { text: string };
					if (gen !== genRef.current) return;
					if (text) bufferRef.current.push(text);
					cleanup();
				})
				.catch((e: unknown) => fail(gen, e));
		},
		[upload, cleanup, fail],
	);

	const start = useCallback(async () => {
		dictationActiveFlag = true;
		setError(null);
		setPhase("connecting");
		bufferRef.current = []; // fresh run, fresh buffer (round 2)
		pendingRef.current = []; // fresh run, fresh queue (mitigation A)
		batchRef.current = [];
		stopRequestedRef.current = false;
		const gen = ++genRef.current;

		// The mic is the long pole (macOS HAL + APM init) and gates
		// everything. 127.0.0.1 is a secure context, so getUserMedia works
		// without TLS; macOS TCC prompts on first use.
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
			});
			if (gen !== genRef.current) {
				for (const track of stream.getTracks()) track.stop();
				return;
			}
			streamRef.current = stream;

			// Mitigation C: app-lifetime context + memoized worklet module —
			// per-run costs (context creation, module fetch) are gone.
			const { ctx, module } = ensureAudioGraph();
			await module;
			if (ctx.state === "suspended") await ctx.resume();
			if (gen !== genRef.current) return;

			const worklet = new AudioWorkletNode(ctx, "pcm-capture");
			workletRef.current = worklet;
			worklet.port.onmessage = (e) => {
				const msg = e.data as { type: string; rms?: number; buffer?: ArrayBuffer };
				if (msg.type === "level") {
					levelRef.current = msg.rms ?? 0; // never reset to zero (dictate pattern)
				} else if (msg.type === "audio") {
					if (runIdRef.current) {
						batchRef.current.push(msg.buffer!);
						if (batchRef.current.length >= BATCH_FRAMES) upload(gen, batchRef.current.splice(0));
					} else {
						// Mitigation A: the run doesn't exist yet — queue, capped;
						// the first upload carries the queue in order.
						pendingRef.current.push(msg.buffer!);
						if (pendingRef.current.length > PENDING_CAP) pendingRef.current.shift();
					}
				}
			};
			const source = ctx.createMediaStreamSource(stream);
			sourceRef.current = source;
			source.connect(worklet);
			// Pull the graph with silence out (the worklet writes no output) —
			// an unconnected worklet node is never clocked.
			worklet.connect(ctx.destination);
		} catch (e) {
			if (gen !== genRef.current) return;
			const msg =
				e instanceof DOMException && (e.name === "NotAllowedError" || e.name === "SecurityError")
					? "Microphone permission denied"
					: e instanceof Error
						? e.message
						: "mic unavailable";
			setError(msg);
			cleanup();
			return;
		}

		// Mic-gated run creation (mitigation B's rule): an OS TCC prompt can
		// outlive the server's idle reap, so the run starts only once the
		// capture graph is live. A pre-warmed engine answers ~instantly.
		let id: string;
		try {
			id = await startRun();
		} catch (e) {
			if (gen !== genRef.current) return;
			setError(e instanceof Error ? e.message : "dictation unavailable");
			cleanup();
			return;
		}
		if (gen !== genRef.current) {
			discardRun(id); // cancelled while the run was being created
			return;
		}
		runIdRef.current = id;
		upload(gen, pendingRef.current.splice(0)); // mitigation A: in order
		if (stopRequestedRef.current) finalize(gen);
		else setPhase("recording");
	}, [upload, finalize, cleanup]);

	const stop = useCallback(() => {
		const gen = genRef.current;
		if (phase !== "recording" && phase !== "connecting") return;
		setPhase("stopping");
		const capturing = workletRef.current !== null;
		killMic(); // mic dies FIRST — no more audio enqueues (dictate pattern)
		if (runIdRef.current) finalize(gen);
		// The run is still being created: start() finalizes when it lands
		// (the speech captured so far is queued, never dropped).
		else if (capturing) stopRequestedRef.current = true;
		// Nothing captured yet (mic still being acquired): just end.
		else cleanup();
	}, [phase, killMic, finalize, cleanup]);

	const cancel = useCallback(() => {
		if (phase === "idle") return;
		// Discard first, teardown second — cleanup() flushes, and the now-empty
		// buffer makes that flush a no-op. Also kills a "stopping" run: the
		// end already underway is abandoned (stale generation).
		bufferRef.current = [];
		const id = runIdRef.current;
		if (id) discardRun(id);
		cleanup();
	}, [phase, cleanup]);

	const finish = useCallback((): Promise<void> => {
		return new Promise((resolve) => {
			if (phase === "idle") {
				resolve();
				return;
			}
			waitersRef.current.push(resolve);
			// "stopping" is already ending — the waiter just rides to cleanup.
			if (phase === "recording" || phase === "connecting") stop();
		});
	}, [phase, stop]);

	// Publish finish() for the sibling subtrees (the pending question's
	// dock) — registered for as long as this page owns the hook.
	useEffect(() => {
		dictationFinisher = finish;
		return () => {
			if (dictationFinisher === finish) dictationFinisher = null;
		};
	}, [finish]);

	const toggle = useCallback(() => {
		if (phase === "idle") void start();
		else if (phase === "recording" || phase === "connecting") stop();
		// "stopping" presses are ignored — the end is in flight.
	}, [phase, start, stop]);

	// Shortcut seams (keyboard wave A): ⌘D toggles from anywhere on the
	// page; the Esc chain lands here as a CANCEL (owner, round 3). Each
	// page owns ONE hook instance, and only the mounted page's listener is
	// attached.
	useEffect(() => {
		warmEngine(); // pre-load the recognizer at mount — silent without a model
	}, []);
	useEffect(() => {
		window.addEventListener("lh:kbd-toggle-dictation", toggle);
		return () => window.removeEventListener("lh:kbd-toggle-dictation", toggle);
	}, [toggle]);
	useEffect(() => {
		window.addEventListener("lh:kbd-cancel-dictation", cancel);
		return () => window.removeEventListener("lh:kbd-cancel-dictation", cancel);
	}, [cancel]);

	return {
		phase,
		error,
		levelRef,
		active: phase !== "idle",
		toggle,
		stop,
		finish,
		cancel,
		clearError: () => setError(null),
	};
}

/**
 * The stats-bar dictation slot (owner placement, round 1): the row's middle
 * is one strip that is always the full free width —
 *
 *   idle      a wide, quiet "Dictate" button (mic + label, grayed out — the
 *             whole middle is the affordance, per the owner).
 *   active    optimistic from the CLICK: red stop pill + the fixed-width
 *             meter (no interim text ever shifts it). Spinner while
 *             the server decodes the last phrase.
 *   error     the wide button again, label swapped for the failure reason
 *             (full text in the tooltip), cleared on the next click.
 */
export function DictationBar({ dictation }: { dictation: Dictation }) {
	const { phase, error, levelRef, toggle, active, clearError } = dictation;
	const { open: openSettings } = useSettingsDialog();
	/** The no-model click (zero-keys wave's keyless pattern, carried into
	 *  the local engine): the errored idle button deep-links Settings →
	 *  Keys → the Dictation row and clears the error — the surface is clean
	 *  when the user returns. Any other error keeps the old behavior
	 *  (click = retry, which clears). */
	const noModel = error === DICTATION_NO_MODEL;
	const [levels, setLevels] = useState<number[]>(() => new Array(METER_CELLS).fill(0));
	const recording = phase === "recording" || phase === "stopping";
	/** Adaptive cell count (owner round 2): derived from the meter's
	 *  measured width — narrow rows show fewer bars instead of
	 *  overflowing under neighbors. */
	const [cellCount, setCellCount] = useState(METER_CELLS);
	const meterRef = useRef<HTMLDivElement | null>(null);

	// The meter's own heartbeat — 60ms samples of the level ref into a
	// rolling ring. Only THIS strip re-renders; the page never does.
	useEffect(() => {
		if (!active) return;
		setLevels(new Array(METER_CELLS).fill(0));
		const id = setInterval(() => {
			setLevels((ring) => {
				const next = ring.slice(1);
				next.push(rmsToMeter(levelRef.current));
				return next;
			});
		}, METER_TICK_MS);
		return () => clearInterval(id);
	}, [active, levelRef]);

	// Fit the cell count to the available width (4px pitch per cell:
	// 2px bar + 2px gap, clamped 8..48). The meter div's width is set by
	// the row's free space — cells carry no minimum width — so measuring
	// it once per activation + on resize keeps the strip honest in the
	// draft/home rows where the slider leaves little middle.
	useEffect(() => {
		if (!active) return;
		const el = meterRef.current;
		if (!el) return;
		const fit = () => {
			const w = el.clientWidth;
			setCellCount(Math.max(8, Math.min(METER_CELLS, Math.floor(w / 4))));
		};
		fit();
		const ro = new ResizeObserver(fit);
		ro.observe(el);
		return () => ro.disconnect();
	}, [active]);

	if (!active) {
		return (
			<Hint
				// Errored: the button span truncates the line — the tooltip is its
				// full reveal. Otherwise the quiet label + the live ⌘D binding.
				label={error ?? "Dictate"}
				action={error ? undefined : "toggle-dictation"}
				side="top"
			>
				<button
					type="button"
					onClick={() => {
						if (noModel) {
							clearError();
							openSettings("keys", STT_MODEL_ROW);
						} else {
							toggle();
						}
					}}
					aria-label={error ? `Dictation failed: ${error}` : "Start dictation"}
					data-testid="dictation-toggle"
				// Same blurring as the floating chrome (owner, fix wave round 3),
			// but lower opacity — the mic stays quieter than the model pills.
			className="flex h-7 w-full items-center justify-center gap-1.5 rounded-md border border-border/50 bg-card/50 text-xs text-muted-foreground/70 shadow-lg backdrop-blur transition-colors hover:border-border hover:text-muted-foreground"
			>
					<MicIcon className="size-3.5" />
					<span className="max-w-full truncate">{error ?? "Dictate"}</span>
				</button>
			</Hint>
		);
	}

	return (
		<div className="flex w-full min-w-0 items-center gap-2" data-testid="dictation-bar">
			<Hint
				// The owner flagged this copy good ("Stop dictation (Esc)") —
				// kept verbatim; only the machinery moved to the styled tooltip.
				label="Stop dictation (Esc)"
				side="top"
			>
				<button
					type="button"
					onClick={toggle}
					disabled={phase === "stopping"}
					aria-label="Stop dictation"
				data-testid="dictation-toggle"
				className="flex h-7 shrink-0 items-center gap-1.5 rounded-md bg-destructive/10 px-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20"
			>
				{phase === "stopping" ? (
					<Loader2Icon className="size-3.5 animate-spin" />
				) : (
					<MicIcon className="size-3.5" />
				)}
					Stop
				</button>
			</Hint>
			<span className="size-1.5 shrink-0 animate-pulse rounded-full bg-destructive" aria-hidden />
			{/* Fixed width while recording — nothing ever appends text beside it
			    (no interims, owner round 1). Cells carry no minimum width; the
			    COUNT adapts to the measured row space (owner round 2). */}
			<div ref={meterRef} className="flex h-4 min-w-0 flex-1 items-center gap-[2px]" data-testid="dictation-meter">
				{levels.slice(-cellCount).map((v, i) => (
					<span
						key={i}
						className="min-w-0 flex-1 rounded-full bg-foreground/40"
						style={{ height: `${2 + Math.round(v * 14)}px` }}
					/>
				))}
			</div>
		</div>
	);
}
