"use client";
/**
 * The Dictation row (local STT wave, owner 2026-10-27): the opt-in local
 * speech model in Settings → Keys → Dictation — where the Deepgram key row
 * used to be. KeyTableRow's look (label left, mono status right, text
 * actions), but the actions drive the model, not a key:
 *
 *   absent       "not downloaded · 672 MB"     Download
 *   downloading  progress bar + "42% · …MB"   Cancel (deletes partials)
 *   ready        "ready · 672 MB"               Remove
 *   error        the reason (red)               Download (retry)
 *
 * The credit line beneath is the model license's attribution (CC-BY-4.0).
 * Truth: GET/POST/DELETE /api/stt/model; polled while downloading (the
 * download keeps running server-side if the dialog closes).
 */

import { useEffect, useRef, useState } from "react";
import { STT_MODEL_BYTES, STT_MODEL_CREDIT, STT_MODEL_LABEL, type SttModelStatus } from "@/src/core";

/** Poll cadence while a download runs. */
export const MODEL_POLL_MS = 500;

const mb = (bytes: number) => `${Math.round(bytes / 1e6)} MB`;

/** The row's status line. Pure — exported for pins. */
export function modelStatusLine(status: SttModelStatus): string {
	switch (status.state) {
		case "absent":
			return `not downloaded · ${mb(STT_MODEL_BYTES)}`;
		case "downloading": {
			const pct = status.total ? Math.floor((status.received / status.total) * 100) : 0;
			return `${pct}% · ${mb(status.received)} / ${mb(status.total)}`;
		}
		case "ready":
			return `ready · ${mb(status.bytes)}`;
		case "error":
			return status.message;
	}
}

export function SpeechModelRow({ focus = false }: { focus?: boolean }) {
	const [status, setStatus] = useState<SttModelStatus | null>(null);
	const [busy, setBusy] = useState(false);
	const rowRef = useRef<HTMLDivElement | null>(null);

	const call = (method: "GET" | "POST" | "DELETE") =>
		fetch("/api/stt/model", { method })
			.then((r) => r.json() as Promise<SttModelStatus>)
			.then(setStatus)
			.catch(() => setStatus({ state: "error", message: "Model status unavailable" }));

	useEffect(() => {
		void call("GET");
	}, []);

	// Follow a running download (server-side; this only reads it).
	const downloading = status?.state === "downloading";
	useEffect(() => {
		if (!downloading) return;
		const id = setInterval(() => void call("GET"), MODEL_POLL_MS);
		return () => clearInterval(id);
	}, [downloading]);

	// The dictation button's no-model deep-link lands here.
	useEffect(() => {
		if (focus) rowRef.current?.scrollIntoView({ block: "center" });
	}, [focus]);

	const act = async (method: "POST" | "DELETE") => {
		setBusy(true);
		await call(method);
		setBusy(false);
	};

	const action =
		status === null
			? null
			: status.state === "downloading"
				? { label: "Cancel", method: "DELETE" as const }
				: status.state === "ready"
					? { label: "Remove", method: "DELETE" as const }
					: { label: "Download", method: "POST" as const };

	return (
		<div ref={rowRef} data-testid="stt-model">
			<div className="flex items-center justify-between gap-3 rounded-sm px-1 py-1.5">
				<span className="font-ui text-xs text-foreground">{STT_MODEL_LABEL}</span>
				<span className="flex min-w-0 items-center gap-2">
					{status?.state === "downloading" && (
						<span className="h-1 w-24 shrink-0 overflow-hidden rounded-full bg-muted" aria-hidden>
							<span
								className="block h-full bg-foreground/50 transition-[width]"
								style={{ width: `${status.total ? (status.received / status.total) * 100 : 0}%` }}
							/>
						</span>
					)}
					<span
						data-testid="stt-model-status"
						role={status?.state === "error" ? "alert" : undefined}
						className={`truncate font-mono text-[11px] ${status?.state === "error" ? "text-red-500" : "text-muted-foreground"}`}
					>
						{status ? modelStatusLine(status) : "…"}
					</span>
					{action && (
						<button
							type="button"
							onClick={() => void act(action.method)}
							disabled={busy}
							data-testid="stt-model-action"
							className="shrink-0 text-xs text-foreground underline-offset-2 hover:underline disabled:text-muted-foreground/40 disabled:no-underline"
						>
							{action.label}
						</button>
					)}
				</span>
			</div>
			<p className="px-1 text-[10px] text-muted-foreground/60">{STT_MODEL_CREDIT}</p>
		</div>
	);
}
