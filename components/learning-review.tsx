"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LearningProgress, EvidenceCorrection } from "@/src/core";

type ReviewNode = LearningProgress & { id: string; name: string; statement: string };
export type ReviewPick = { id: string; name: string; statement: string };
const button = "rounded-md border px-2 py-1 text-xs hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50";
const labels = { unknown: "Not assessed", practising: "Practising", independent: "Independent performance", delayed: "Delayed check passed" };

export function LearningReview({ nodeId, onPractice }: { nodeId?: string; onPractice?: (node: ReviewPick, kind: LearningProgress["reviewKind"]) => void }) {
	const [nodes, setNodes] = useState<ReviewNode[] | null>(null);
	const [error, setError] = useState("");
	const [pending, setPending] = useState(false);
	const [revision, setRevision] = useState(0);
	useEffect(() => {
		const refresh = () => setRevision(r => r + 1);
		window.addEventListener("learning-evidence-changed", refresh);
		window.addEventListener("focus", refresh);
		return () => {
			window.removeEventListener("learning-evidence-changed", refresh);
			window.removeEventListener("focus", refresh);
		};
	}, []);
	useEffect(() => {
		const controller = new AbortController();
		fetch("/api/learning", { signal: controller.signal }).then(async response => {
			if (!response.ok) throw new Error("Could not load learning evidence.");
			const data = await response.json() as { nodes: ReviewNode[] };
			setNodes(data.nodes);
			setError("");
		}).catch((err: Error) => { if (!controller.signal.aborted) setError(err.message); });
		return () => controller.abort();
	}, [nodeId, revision]);

	async function correct(chatId: string, evidenceId: string, action: EvidenceCorrection["action"]) {
		setPending(true);
		try {
			const response = await fetch("/api/learning", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chatId, evidenceId, action }) });
			if (!response.ok) throw new Error("Could not save the correction. Please retry.");
			window.dispatchEvent(new Event("learning-evidence-changed"));
		} catch (err) { setError(err instanceof Error ? err.message : "Could not save the correction."); }
		finally { setPending(false); }
	}

	const feedback = error ? <div role="alert" className="text-xs">{error} <button className={button} onClick={() => setRevision(r => r + 1)}>Retry</button></div>
		: !nodes ? <p role="status" className="text-xs text-muted-foreground">Loading evidence…</p> : null;
	if (nodeId) {
		const node = nodes?.find(n => n.id === nodeId);
		return <section className="mt-3 border-t pt-3" aria-label="Learning evidence">
			{feedback}
			{node && <>
				<p className="text-xs font-medium">{labels[node.status]}</p>
				<p className="mt-1 text-xs text-muted-foreground">{node.reason}</p>
				<p className="mt-2 text-xs">{node.independent} independent · {node.assisted} assisted · {node.delayed} delayed · {node.excluded} excluded</p>
				<p className="mt-1 text-xs text-muted-foreground">{node.dueAt === null ? "No review scheduled yet." : `Next review: ${new Date(node.dueAt).toLocaleDateString()}`}</p>
				{onPractice && <button className={`${button} mt-2`} onClick={() => onPractice(node, node.reviewKind)}>Prepare practice</button>}
				<details className="mt-2 text-xs">
					<summary className="cursor-pointer">Evidence and corrections ({node.evidence.length})</summary>
					<p className="my-2 text-muted-foreground">AI assessments can be wrong. Disputing a grade or marking a faulty question excludes it from progress. Restore removes your exclusion.</p>
					{node.evidence.length === 0 && <p>No completed practice tasks.</p>}
					{[...node.evidence].reverse().map(e => <article key={e.id} className="space-y-2 border-t py-2">
						<Link className="underline" href={`/chat/${e.chatId}`}>{new Date(e.at).toLocaleString()} · {e.outcome}</Link>
						<p>{e.statement}</p><p className="text-muted-foreground">{e.verdict}</p>
						<p>Grade: {e.grade}. Help: {e.rung ?? "none recorded"}. {e.correction && e.correction !== "restore" ? e.correction : ""}</p>
						<p>{e.submissions.length} submissions · {e.attempts.filter(a => a.result === "incorrect").length} recorded failed answers</p>
						<div className="flex flex-wrap gap-1">
							<button className={button} disabled={pending} onClick={() => void correct(e.chatId, e.id, "disputed")}>Dispute grade</button>
							<button className={button} disabled={pending} onClick={() => void correct(e.chatId, e.id, "invalid")}>Faulty question</button>
							{e.correction && e.correction !== "restore" && <button className={button} disabled={pending} onClick={() => void correct(e.chatId, e.id, "restore")}>Restore</button>}
						</div>
					</article>)}
				</details>
			</>}
		</section>;
	}
	const scheduled = nodes?.filter(n => n.dueAt !== null).sort((a, b) => a.dueAt! - b.dueAt!) ?? [];
	const now = Date.now();
	const due = scheduled.filter(n => n.dueAt! <= now);
	return <details className="lh-no-drag relative text-sm" onToggle={event => { if (event.currentTarget.open) setRevision(r => r + 1); }}>
		<summary className={`${button} cursor-pointer bg-card`}>Reviews{nodes ? ` (${due.length} due)` : ""}</summary>
		<section aria-label="Review queue" className="absolute left-0 top-full z-30 mt-2 max-h-[60vh] w-80 overflow-y-auto rounded-md border bg-card p-3 shadow-lg">
			{feedback}
			<p className="mb-2 text-xs text-muted-foreground">Reviews start after one day and spread out after successful delayed checks. Timing is a starting point, not a mastery score.</p>
			{nodes && scheduled.length === 0 && <p className="text-xs">No reviews yet. Practise a map proposition to start recording evidence.</p>}
			{scheduled.map(node => <div key={node.id} className="flex items-start justify-between gap-2 border-t py-2">
				<div><p className="text-xs font-medium">{node.name}</p><p className="text-xs text-muted-foreground">{node.dueAt! <= now ? "Due" : new Date(node.dueAt!).toLocaleDateString()} · {node.reviewKind === "recall" ? "Fact recall" : "Changed task"}</p></div>
				{onPractice && <button className={button} onClick={() => onPractice(node, node.reviewKind)}>Prepare</button>}
			</div>)}
		</section>
	</details>;
}
