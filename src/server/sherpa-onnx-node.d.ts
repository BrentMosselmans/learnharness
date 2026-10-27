/**
 * The slice of sherpa-onnx-node (JS + JSDoc only, no .d.ts) the local
 * dictation engine uses — src/server/stt-runs.ts loadSherpaEngine. Shapes
 * follow the package's own types.js (v2.0.1). The package is CommonJS
 * with a non-analyzable module.exports, so under ESM interop only
 * `default` carries the API — hence the default export.
 */
declare module "sherpa-onnx-node" {
	export interface Waveform {
		samples: Float32Array;
		sampleRate: number;
	}

	export class OfflineStream {
		acceptWaveform(obj: Waveform): void;
	}

	export class OfflineRecognizer {
		static createAsync(config: Record<string, unknown>): Promise<OfflineRecognizer>;
		createStream(): OfflineStream;
		decodeAsync(stream: OfflineStream): Promise<{ text: string }>;
	}

	export class Vad {
		constructor(config: Record<string, unknown>, bufferSizeInSeconds: number);
		acceptWaveform(samples: Float32Array): void;
		isEmpty(): boolean;
		front(enableExternalBuffer?: boolean): { start: number; samples: Float32Array };
		pop(): void;
		flush(): void;
	}

	const sherpa: { OfflineRecognizer: typeof OfflineRecognizer; Vad: typeof Vad };
	export default sherpa;
}
