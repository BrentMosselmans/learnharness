"use client";

import { useRef, useState } from "react";
import { CHAT_IMAGE_TYPES, MAX_CHAT_IMAGES, MAX_CHAT_IMAGE_BYTES, parseChatImages, type ChatImage } from "@/src/core";
import { ArrowRightIcon, CornerDownLeftIcon, SquareIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Hint } from "@/components/ui/hint";

/**
 * The chat composer — content row ONLY (the persistent rounded shell lives in
 * the chat view's overlay, so the shell can later morph chat → question
 * without remounting).
 *
 * Corner-radius math (concentric with the shell): shell rounded-2xl (16px) −
 * row padding p-1.5 (6px) = button rounded-[10px] = 25% of the 40px button.
 */
/** What one Enter press does, in precedence order: stop a busy stream,
 *  otherwise send the message, otherwise — practice sessions only — fire
 *  the next-problem signal while the between-problems pause is live
 *  (owner round 16: Enter on an EMPTY composer is the go-ahead; typing
 *  anything makes Enter a send again). Pure so the static-render harness
 *  can pin the decision (key events can't be simulated in
 *  renderToStaticMarkup). */
export function enterAction(state: {
	busy: boolean;
	canSend: boolean;
	/** The between-problems pause is live: practice session, nothing
	 *  active, no turn/compaction in flight (the caller's fold). */
	nextProblem?: boolean;
}): "stop" | "send" | "next" | "none" {
	// Composer steering (owner arc 2026-10-03): while a turn runs, typed
	// text makes Enter a STEER (the queue-and-redirect send); Enter with
	// an empty composer stays the stop shortcut. The button itself keeps
	// the square — Stop stays one click away at all times.
	if (state.busy) return state.canSend ? "send" : "stop";
	if (state.canSend) return "send";
	if (state.nextProblem) return "next";
	return "none";
}

export function Composer({
	busy,
	value,
	onChange,
	onSend,
	onStop,
	canSend,
	autoFocus,
	inputRef,
	onEscape,
	placeholder = "Ask, answer, or steer the lesson…",
	nextProblem = false,
	onNext,
	images = [],
	onImagesChange,
}: {
	busy: boolean;
	value: string;
	onChange: (v: string) => void;
	onSend: () => void;
	onStop: () => void;
	canSend: boolean;
	autoFocus?: boolean;
	/** The page's handle to the textarea — the dictation-end focus (owner,
	 *  2026-10-01): a run ending hands the cursor to the bare composer. */
	inputRef?: React.RefObject<HTMLTextAreaElement | null>;
	/** Escape while a dictation runs stops it (STT wave, 2026-09-17). No-op
	 *  when absent — Esc otherwise means nothing in the composer. */
	onEscape?: () => void;
	/** The textarea's placeholder (owner refinement round, 2026-09-24):
	 *  active sessions read "Ask, answer, or steer the lesson…"; the fresh
	 *  new-session page asks the graph view's opening question instead. */
	placeholder?: string;
	/** The practice pause is live (owner round 16): Enter on the empty
	 *  composer fires the next-problem signal instead of doing nothing —
	 *  the keyboard-first move-on. */
	nextProblem?: boolean;
	/** The signal's dispatcher (send({type:"next"})) — the chip and the
	 *  empty-Enter share it. */
	onNext?: () => void;
	images?: ChatImage[];
	onImagesChange?: React.Dispatch<React.SetStateAction<ChatImage[]>>;
}) {
	const [imageError, setImageError] = useState<string | null>(null);
	const [readingImages, setReadingImages] = useState(false);
	const readingRef = useRef(false);
	const act = () => {
		if (readingRef.current) return;
		const action = enterAction({ busy, canSend, nextProblem });
		if (action === "stop") onStop();
		else if (action === "send") onSend();
		else if (action === "next") onNext?.();
	};
	return (
		<div className="min-w-0 flex-1">
			{images.length > 0 && <div className="flex flex-wrap gap-2 px-3 pt-2" aria-label="Attached images">
				{images.map((image, index) => <div key={index} className="flex items-start gap-1 rounded border border-border p-1">
					{/* eslint-disable-next-line @next/next/no-img-element -- Clipboard data URLs are rendered directly, without an image optimizer. */}
					<img src={`data:${image.mimeType};base64,${image.data}`} alt={`Attached image ${index + 1}`} className="h-20 max-w-32 object-contain" />
					<button type="button" className="rounded px-2 text-muted-foreground hover:text-foreground focus-visible:outline" aria-label={`Remove image ${index + 1}`} onClick={() => onImagesChange?.((current) => current.filter((_, i) => i !== index))}>×</button>
				</div>)}
			</div>}
			{readingImages && <p role="status" className="px-3 text-xs text-muted-foreground">Reading image…</p>}
			{imageError && <p role="alert" className="px-3 text-xs text-destructive">{imageError}</p>}
		<form
			data-testid="composer"
			className="flex items-end gap-1.5 p-1.5"
			onSubmit={(e) => {
				e.preventDefault();
				act();
			}}
		>
			<textarea
				ref={inputRef}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onPaste={(e) => {
					if (!onImagesChange) return;
					const files = Array.from(e.clipboardData.items).filter((item) => item.kind === "file" && item.type.startsWith("image/")).map((item) => item.getAsFile()).filter((file): file is File => file !== null);
					if (!files.length) return;
					e.preventDefault();
					if (readingRef.current) return;
					setImageError(null);
					if (images.length + files.length > MAX_CHAT_IMAGES) { setImageError("Attach at most 3 images per message."); return; }
					readingRef.current = true;
					setReadingImages(true);
					void Promise.all(files.map(readPastedImage)).then((added) => {
						onImagesChange((current) => [...current, ...added]);
					}).catch((error) => setImageError((error as Error).message)).finally(() => {
						readingRef.current = false;
						setReadingImages(false);
					});
				}}
				onKeyDown={(e) => {
					// Esc ends dictation before anything else Esc might someday mean
					// here (the dictate decisions: click-again or Esc to stop).
					// stopPropagation claims the Esc (keyboard wave A): the
					// window-level chain must not also abort a turn under us.
					if (e.key === "Escape" && onEscape) {
						e.preventDefault();
						e.stopPropagation();
						onEscape();
						return;
					}
					// Chat convention: Enter sends, Shift+Enter is a newline.
					// ⌘/Ctrl+Enter also sends — the universal submit shortcut
					// across every input in the app (thinking field, answers).
					if (e.key === "Enter" && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
						e.preventDefault();
						act();
					}
				}}
				placeholder={placeholder}
				autoFocus={autoFocus}
				rows={1}
				className="field-sizing-content lh-input max-h-48 min-h-10 flex-1 resize-none bg-transparent px-2.5 py-2 outline-none placeholder:text-muted-foreground"
			/>
			{/* The button follows the text (owner report 2026-10-03): while
				 a turn runs WITH text typed it stays the SEND affordance
				 (click = steer — steering must be clickable, not Enter-only);
				 only an empty composer morphs it to Stop. ESC keeps its
				 confirm-popup abort in every state, so stop is never
				 unreachable. No tooltip — the ↵ glyph is the affordance
				 (owner, subtlety round 2026-09-25).

				 THE NEXT MORPH (owner round 16 refinement, 2026-10-06): an
				 empty composer in the practice pause morphs the button into
				 a wide green NEXT PROBLEM — the affordance IS the button
				 (click and Enter share one lane), and typing anything
				 returns the regular send. The green is the app's correct-
				 answer register (answered-card's green-500/600). */}
				{nextProblem && !busy && !canSend ? (
					<button
						type="submit"
						data-testid="next-problem-button"
						aria-label="Next problem"
						className="flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-[10px] bg-green-600 px-4 font-ui text-xs font-medium uppercase tracking-wide text-white transition-colors hover:bg-green-500"
					>
						Next problem
						<ArrowRightIcon className="size-4" />
					</button>
				) : (
					<button
						type="submit"
						aria-label={busy && !canSend ? "Stop" : "Send"}
						disabled={readingImages || (!busy && !canSend)}
						className={cn(
							"flex size-10 shrink-0 items-center justify-center rounded-[10px] transition-colors",
							busy && !canSend
								? "bg-secondary text-foreground hover:bg-accent"
								: "bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40",
						)}
					>
						{busy && !canSend ? <SquareIcon className="size-4" /> : <CornerDownLeftIcon className="size-5" />}
					</button>
				)}
		</form>
		</div>
	);
}

export async function readPastedImage(file: File): Promise<ChatImage> {
	if (!(CHAT_IMAGE_TYPES as readonly string[]).includes(file.type)) throw new Error("Paste a PNG, JPEG, WebP, or GIF image.");
	if (file.size > MAX_CHAT_IMAGE_BYTES) throw new Error("Each image must be no larger than 2 MB.");
	const dataUrl = await new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => reject(new Error("Could not read the pasted image. Please paste it again."));
		reader.readAsDataURL(file);
	});
	return parseChatImages([{ type: "image", mimeType: file.type, data: dataUrl.slice(dataUrl.indexOf(",") + 1) }])[0]!;
}
