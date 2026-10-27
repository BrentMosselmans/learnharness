# Research-informed desktop fork

Status: first stage approved by Brent and implemented on 27 October 2026. The
teaching policy, loaded prompts, tool descriptions, and handoff are reconciled.
See [the research index](research/README.md) and [review cases](research/policy-review.md).
Stage two adds persistent practice evidence, derived progress, a review queue, and
map evidence/correction controls. See [the implemented rules](learning-evidence.md).
No migration is needed: Brent chose a fresh start.

## Product direction

Use LearnHarness as the desktop application. Preserve its graph, lesson navigation,
adaptive teaching, practice sessions, and visual explanations. Phone support is no
longer a requirement. Develop this fork separately from the existing learning-system
app; keep that app and its learner records available during the transition.

Upstream: https://github.com/amosblomqvist/learnharness

Fork: https://github.com/BrentMosselmans/learnharness

## Findings from the initial inspection

- The graph represents propositions and reasoning chains, with provenance back to
  sessions. It intentionally does not represent quiz outcomes or demonstrated
  understanding (`src/core/contracts/graph.ts`). Keep that distinction.
- The teaching methodology uses the goal feeling obviously true as its terminal
  condition. This can describe an experience of understanding, but is insufficient
  evidence of retention or independent application (`docs/teaching-methodology.md`).
- Practice already includes varied demands, committed solutions, hint levels, and
  fresh-surface retests. Retain these strengths. Its absolute rules about indefinite
  minimal hints, interleaving, and an 85% success target need qualification
  (`src/agent/prompts/practice/10-doctrine.md`).
- Prompt changes can improve teaching immediately. They cannot, on their own,
  implement a reliable cross-session evidence model or delayed-review scheduler.

## First implementation: teaching policy

1. Bring the existing general-learning and mastery research documents into a
   documented research directory, preserving citations and their original dates.
   These are existing research notes, not a newly replicated literature review.
2. Reconcile the canonical methodology and loaded agent prompts together, rather
   than append a second prompt with contradictory instructions.
3. Define a successful teaching interaction as a useful explanation plus an
   appropriate check. Treat immediate success as provisional; do not call it durable
   mastery or infer it from confidence, agreement, or a graph node's existence.
4. Choose activities by what is being learned: recall for selected facts;
   predictions, comparisons, and explanations for concepts; worked examples with
   fading support and execution for procedures; varied tasks for transfer.
5. Invite an independent attempt when it is useful and feasible. After a diagnostic
   nudge fails, provide a clear explanation or worked step and then a changed task.
   Honor explicit requests for an explanation. Avoid an indefinite hint ladder.
6. Use self-explanation and confidence selectively. Adapt step size and checking
   cadence to prior knowledge and errors. Treat interleaving and success-rate targets
   as adjustable heuristics, not universal laws.
7. Keep assisted success distinct from unaided success in the teaching language and
   existing practice records. Preserve solution commitment and content verification.
8. Run the fork's required lint, typecheck, and deterministic tests; inspect a small
   teaching/practice example before using it as the daily app. Automated tests verify
   software behavior, not educational effectiveness.

## Second implementation: persistent learning evidence

Approved by Brent on 27 October 2026. Add an evidence ledger alongside
the knowledge graph: target, task variant, attempt, help used, outcome, timestamp,
and source. Derive evidence summaries in tested code. Add delayed retrieval and
transfer checks, with a graph detail view explaining the evidence and next review.
Do not label reading, importing notes, or generating graph nodes as mastery. Do not
apply flashcard scheduling indiscriminately to procedural or conceptual competence.

## Fresh start (Brent's decision, 27 October 2026)

Start fresh in LearnHarness; do not migrate the old app's learning records or
progress. The old study records and the fork's existing local session/graph records
were cleared. API configuration, preferences, research, source content, and lesson
media were retained. Stage two therefore needs no historical-progress importer or
cross-app evidence mapping.

Start with Learning and Security as familiar trial subjects. Reuse their goals,
source maps, and research as useful. Do not import held-out questions or answer keys
into the learner-visible graph. New skills start with unknown performance until
the new harness records evidence. Chinese audio and performance assessment need a
separate integration decision. No key files or personal records go into Git.

## Evidence carried from the existing project

- `learning-system/docs/RESEARCH.md`: retrieval, spacing, feedback, and verification.
- `learning-system/docs/RESEARCH-MASTERY.md`, M1–M3 and M8–M11: matching activities,
  selective reflection, AI help, calibration, transfer, and delayed assessment.
- `learning-system/docs/RESEARCH-COURSE.md`: learning-course claims and corrections.
- `learning-system/docs/PLAN.md`, P1–P12: the current project's operational choices;
  these are design decisions informed by research, not universal empirical rules.

Useful primary references already recorded in those notes:

- Koedinger et al., knowledge–learning–instruction framework:
  https://doi.org/10.1111/j.1551-6709.2012.01245.x
- Pan & Rickard, transfer of test-enhanced learning:
  https://pubmed.ncbi.nlm.nih.gov/29733621/
- Agarwal, higher-order retrieval practice:
  https://pdf.poojaagarwal.com/Agarwal_2019_JEdPsych.pdf

## Approval boundary

Upstream `AGENTS.md` requires investigation and an approved plan before implementation.
Brent approved the first implementation and subsequently instructed implementation
of stage two. The fresh-start decision excludes historical-progress migration.
