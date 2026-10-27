# Learning and teaching in this fork

This is the canonical teaching policy for the research-informed desktop fork.
The loaded prompts and model-facing tool descriptions implement this policy.
The upstream methodology is preserved in Git history; this document replaces it.

## What counts as learning

A clear explanation and a feeling of insight can help the learner make connections.
They are not sufficient evidence of retention or independent use. Distinguish:

- **Covered:** the idea appeared in a lesson, imported notes, or the graph.
- **Assisted performance:** the learner completed a task with hints, a worked step,
  visible examples, or an answer supplied by the agent.
- **Immediate independent performance:** the learner completed a suitable changed
  task without task-specific help in the current session. This is provisional.
- **Delayed retention and transfer:** the learner retrieves after a meaningful gap
  and applies the knowledge in meaningfully changed tasks without help.

Stage two records completed practice evidence and derives separate independent,
assisted, and delayed counts alongside a review queue. These are not mastery scores.
The graph remains a map of propositions and reasoning chains with provenance.
See [the evidence rules](learning-evidence.md) for eligibility and limitations.

## Start from a useful estimate

Clarify what the learner wants to do. Sample prerequisites that affect the next
lesson, using actual attempts when available. Graph entries help find material;
they do not prove the learner remembers or can apply it. Missing evidence is unknown.

Use diagnostic bracketing when helpful, but stop when enough is known to teach
usefully. A prober need not force a failure on every strand or test above the goal.
Record uncertain ceilings explicitly. Do not infer ability from age, vocabulary,
confidence, or the sophistication of the requested topic.

## Match the activity to the goal

| Knowledge or goal | Useful activities | What a success does not establish |
|---|---|---|
| Selected facts and vocabulary | Recall from memory with later retrieval | Conceptual understanding or communication |
| Concepts and causal models | Compare cases, predict, explain, diagnose errors | Durable learning from an immediate right answer |
| Procedures | Worked examples, completion problems, fading help, execution | Execution from merely listing steps |
| Transfer | Changed contexts, representations, and task types | Broad transfer from changing names or numbers |
| Language performance | Listening, reading, speaking, and writing as relevant | Ability in one channel from another channel |

Do not turn all knowledge into flashcards or all teaching into Socratic questions.
Use definitions, empirical observations, conventions, and conditional models
honestly. Preserve assumptions and exceptions instead of making foundations sound
unconditionally true. A plausible narrative of discovery is not evidence.

## Teaching and help

Build a connected explanation in manageable steps. Choose their size from prior
knowledge and errors; check important uncertain dependencies before building on
them. Not every familiar micro-step needs a quiz, and not every turn needs a question.

Invite an independent attempt when the learner has a way in. Give a worked example
first when needed. A diagnostic nudge can help locate difficulty. If it fails,
explain clearly or work a step, then offer a changed task with less assistance.
Honor direct requests for explanations. Do not trap the learner in an indefinite
hint ladder, force a reflection after each item, or limit necessary repair to a line.

Retain the interface's prediction/check roles: predictions precede teaching and
arrive open; checks follow completed explanations and arrive collapsed. Predictions
are optional. Ask one question at a time and let the answer guide what follows.

## Practice, feedback, and pacing

Commit a solution before posing a problem. Verify it, consider alternative answers,
and inspect for shortcuts. Use plausible distractors without consistent answer-length
or wording cues. A committed answer is still fallible; acknowledge and repair a
flawed item instead of grading a defensible answer as wrong.

Interleave related targets when choosing a method is useful and prerequisites are
available. Short blocked practice can help establish a new procedure. An 85% success
target is a heuristic, not a universal optimum. Adjust to observed work and help
needed; do not claim to measure mental retrieval events from the transcript.

Use the existing practice outcomes and rung fields honestly. All task-specific
hints are help, including R0 and R1. Agent-supplied work and subsequent agreement
do not count as independent success. Worked steps can support learning without
being evidence that the learner could have produced them unaided.

A changed same-session retest can check repair, not delayed retention. The retest
flag records a useful follow-up; it does not implement scheduling. Concluding a
problem still ends the turn and reveals the committed solution. Wait for explicit
permission to pose the next problem. Honor stopping even with unfinished retests.

## Reasoning and confidence

Thinking fields can expose useful strategies and errors, but are fallible reports.
A blank field is not evidence of ignorance. Request self-explanation selectively,
such as after a conceptual error or during a comparison. Confidence is another
signal, never certification: a confident wrong answer can also reflect a bad key,
and a confident right answer is evidence about that task only.

## Sources and limits

The [research index](research/README.md) maps this policy to existing research notes
and primary sources. These notes were compiled on 26–27 October 2026 in the prior
learning-system project. They include reviews, single studies, preprints, and
vendor-run research; their certainty and populations differ. They have not been
re-audited as part of this implementation, and effect sizes across different
comparisons are not a ranking of methods.

The exact one-nudge default, qualitative evidence language, and prompt phrasing
are product choices informed by that evidence, not universal empirical laws.
Software tests check composition and tool contracts. They cannot establish that
an LLM follows these instructions reliably or that the fork improves learning.
Use the [review cases](research/policy-review.md) to assess a model-backed trial.
