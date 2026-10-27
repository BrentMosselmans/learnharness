/**
 * OFFLINE local-dictation native gate (local STT wave, 2026-10-27).
 *
 * The HTTP smoke never loads sherpa-onnx: without a downloaded model every
 * /api/stt route refuses before touching the binding. So this probe proves
 * the PAYLOAD itself — sherpa-onnx-node and its platform package (the
 * .node + the onnxruntime/sherpa shared libraries it loads from $ORIGIN)
 * resolve INSIDE the standalone tree and dlopen under the given runtime
 * (Electron's bundled Node in release: ELECTRON_RUN_AS_NODE, exactly how
 * the shell spawns the server), then exercises one native call. No model,
 * no network.
 *
 * node scripts/smoke-stt-runtime.mjs [--standalone <dir>] [--runtime <Node/Electron>]
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import { createRequire } from "node:module";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { probeEnv } from "./smoke-demo-runtime.mjs";

const MARKER = "local dictation native binding loaded";

export function verifySttRuntime(standalone, runtime = process.execPath) {
	const home = fs.mkdtempSync(path.join(os.tmpdir(), "lh-stt-runtime-"));
	try {
		const result = spawnSync(runtime, [fileURLToPath(import.meta.url), "--probe", path.resolve(standalone)], {
			cwd: home,
			env: { ...probeEnv(process.env, home), ELECTRON_RUN_AS_NODE: "1" },
			encoding: "utf8", timeout: 30_000, maxBuffer: 128 * 1024,
		});
		if (result.status !== 0 || result.error) {
			throw new Error(`stt runtime probe failed (${result.error?.message ?? result.status}):\n${result.stdout ?? ""}${result.stderr ?? ""}`);
		}
		assert.ok(result.stdout.includes(MARKER), "probe exited without success marker");
		process.stdout.write(result.stdout);
	} finally {
		fs.rmSync(home, { recursive: true, force: true });
	}
}

function probe(standalone) {
	const root = fs.realpathSync(standalone);
	const inside = (file) => {
		const relative = path.relative(root, fs.realpathSync(file));
		assert.ok(relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative),
			`dependency escaped standalone payload: ${file}`);
	};
	const require = createRequire(path.join(root, "server.js"));
	inside(require.resolve("sherpa-onnx-node")); // never a silent checkout fallback
	const sherpa = require("sherpa-onnx-node");
	// The platform package the binding dlopened must be the payload's own.
	const platform = `sherpa-onnx-${os.platform() === "win32" ? "win" : os.platform()}-${os.arch()}`;
	const loaded = Object.keys(require.cache).filter((f) => f.endsWith(".node") && f.includes(platform));
	assert.ok(loaded.length > 0, `no ${platform} binding in the module cache`);
	for (const f of loaded) inside(f);
	// One real native round-trip (no model needed).
	const buf = new sherpa.CircularBuffer(16);
	buf.push(new Float32Array([0.25, -0.5]));
	assert.equal(buf.size(), 2);
	console.log(`[smoke-stt] ${MARKER} (${platform}, sherpa-onnx ${sherpa.version}, onnxruntime ${sherpa.onnxruntimeVersion})`);
}

if (process.argv[2] === "--probe") {
	probe(process.argv[3]);
} else if (import.meta.url === `file://${process.argv[1]}` || process.argv[1] === fileURLToPath(import.meta.url)) {
	const arg = (name) => {
		const i = process.argv.indexOf(name);
		return i === -1 ? undefined : process.argv[i + 1];
	};
	const root = path.resolve(import.meta.dirname, "..");
	verifySttRuntime(arg("--standalone") ?? path.join(root, ".next", "standalone"), arg("--runtime") ?? process.execPath);
}
