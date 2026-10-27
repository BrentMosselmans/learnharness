/**
 * Local speech-to-text — the browser-safe half (local STT wave, 2026-10-27).
 * PURE: the model's identity + the status shape the Settings row and the
 * dictation button both read. The server half (download, recognizer, runs)
 * lives in src/server/stt-model.ts + src/server/stt-runs.ts.
 *
 * Owner decisions (2026-10-27): Deepgram is gone; dictation runs on-device
 * via sherpa-onnx in the bundled server; the model is NVIDIA Parakeet TDT
 * 0.6B v3 (int8 — English + 25 European languages, auto-detected); it is
 * OPT-IN — downloaded from Settings → Keys → Dictation, never bundled.
 */

/** The single local model (its directory name under PATHS.models). */
export const STT_MODEL_ID = "parakeet-tdt-0.6b-v3-int8";

/** The Settings → Keys → Dictation row's deep-link id (the dictation
 *  button's no-model click lands here; KeysSection scrolls it into view). */
export const STT_MODEL_ROW = "stt-model";

/** The Settings row's label. */
export const STT_MODEL_LABEL = "Parakeet v3 (local)";

/** CC-BY-4.0 requires attribution — shown in the Settings row. */
export const STT_MODEL_CREDIT = "Parakeet TDT 0.6B v3 by NVIDIA, CC-BY-4.0 · Silero VAD, MIT";

/** One downloadable file: pinned to an immutable Hugging Face revision and
 *  verified against its SHA-256 before it may land under its real name. */
export interface SttModelFile {
	name: string;
	url: string;
	bytes: number;
	sha256: string;
}

const PARAKEET = "https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8/resolve/2bda32ec70b097a55adaa07d9a7173915b43cc78";
const VAD = "https://huggingface.co/csukuangfj/vad/resolve/fba88cd2e921609e7675c3aaf51e0b9b295da4bc";

/** The manifest: the sherpa-onnx maintainer's Parakeet export + Silero VAD
 *  (the v4 model sherpa-onnx's own examples use). Hashes are the LFS
 *  oids, re-verified against a real download (2026-10-27). */
export const STT_MODEL_FILES: readonly SttModelFile[] = [
	{ name: "tokens.txt", url: `${PARAKEET}/tokens.txt`, bytes: 93_939, sha256: "d58544679ea4bc6ac563d1f545eb7d474bd6cfa467f0a6e2c1dc1c7d37e3c35d" },
	{ name: "decoder.int8.onnx", url: `${PARAKEET}/decoder.int8.onnx`, bytes: 11_845_275, sha256: "179e50c43d1a9de79c8a24149a2f9bac6eb5981823f2a2ed88d655b24248db4e" },
	{ name: "joiner.int8.onnx", url: `${PARAKEET}/joiner.int8.onnx`, bytes: 6_355_277, sha256: "3164c13fc2821009440d20fcb5fdc78bff28b4db2f8d0f0b329101719c0948b3" },
	{ name: "encoder.int8.onnx", url: `${PARAKEET}/encoder.int8.onnx`, bytes: 652_184_281, sha256: "acfc2b4456377e15d04f0243af540b7fe7c992f8d898d751cf134c3a55fd2247" },
	{ name: "silero_vad.onnx", url: `${VAD}/silero_vad.onnx`, bytes: 1_807_522, sha256: "a35ebf52fd3ce5f1469b2a36158dba761bc47b973ea3382b3186ca15b1f5af28" },
];

/** The model files' combined size in bytes (the Settings row shows it
 *  before any download). */
export const STT_MODEL_BYTES = STT_MODEL_FILES.reduce((sum, f) => sum + f.bytes, 0);

/** The run-creation refusal's machine code: the model is not downloaded
 *  (the dictation button deep-links to the Settings row on it). */
export const STT_MODEL_MISSING = "model_missing";

/** The model's lifecycle as GET /api/stt/model reports it. */
export type SttModelStatus =
	| { state: "absent" }
	| { state: "downloading"; received: number; total: number }
	| { state: "ready"; bytes: number }
	| { state: "error"; message: string };
