# Research behind this fork

The three research briefs in this directory are verbatim copies from Brent's
learning-system project at commit `770d5f8`, compiled on 26–27 October 2026.
Their citations, dates, qualifications, and original wording are preserved. This
implementation did not repeat their literature searches or independently verify
every cited result. They are research notes, not a validated specification.

- [General learning and AI tutoring](RESEARCH.md): R1–R12.
- [Understanding and mastery](RESEARCH-MASTERY.md): M1–M11.
- [Learning-course claims and corrections](RESEARCH-COURSE.md): C1–C6.

The original general brief's relative `PLAN.md` link refers to the previous
project, not this fork. Its operational recommendations are historical context.
The current specification is [teaching-methodology.md](../teaching-methodology.md).
No course transcripts, held-out questions, answer keys, or learner records are
included in this research import.

## Evidence to policy

| Policy | Research basis | Qualification |
|---|---|---|
| Match activities to knowledge and performance goals | M1–M2; [Koedinger et al.](https://doi.org/10.1111/j.1551-6709.2012.01245.x) | A framework for choosing instruction, not a universal task recipe |
| Use higher-order retrieval and changed applications | M2, M10; [Agarwal](https://pdf.poojaagarwal.com/Agarwal_2019_JEdPsych.pdf), [Pan & Rickard](https://pubmed.ncbi.nlm.nih.gov/29733621/) | Transfer depends on the tasks and cues; it is not automatic |
| Distinguish immediate performance from delayed retention | R3, M10, C1–C2 | Stage one changes language and instruction, not scheduling |
| Attempt when useful, then explain; fade examples and help | M2–M3, M9; [Kumar et al.](https://dlnext.acm.org/doi/10.1007/978-3-031-98459-4_5) | The one-nudge default is our product choice, not a proven optimal cutoff |
| Avoid compulsory reflection after every answer | M3; [Asher et al.](https://doi.org/10.1145/3774398.3811598) | A finding about a particular feedback design, not a ban on reflection |
| Record assistance separately from independent work | R1, M9; [Bastani et al.](https://www.pnas.org/doi/10.1073/pnas.2422633122) | Prompt compliance and AI grading remain fallible |
| Use interleaving and difficulty targets adaptively | R3, M3, C2–C4 | No universal 85% optimum or mandatory switching policy |
| Verify generated answers and admit uncertainty | R7, M10 | Model agreement alone is not verification |

Effect sizes across these studies compare different populations, interventions,
and outcomes. Do not rank techniques by their reported effect sizes or promise
the same gains for this app. Prefer syntheses for general claims; label narrow or
contested findings. A specific teaching choice remains an adjustable hypothesis.

## What runs

The prober and teacher compose `system-prompt.md`, their own fragments, then shared
fragments. Practice has its own base/doctrine and a curated shared appendix. The
shared reasoning policy reaches all three; practice's evidence and stopping rules
also live in its doctrine. Tool descriptions and the probe-to-teacher handoff were
updated so they do not reintroduce the old rules.

Existing enabled prompt overrides still take precedence over source defaults.
They are never overwritten by this fork. To try the new policy, turn off overrides
for changed segments in Settings and start a new session; old transcripts can
still contain earlier instructions. Restart a development process after editing
prompts because the source-only composition is cached at module load.

See [policy-review.md](policy-review.md) for concrete cases and validation limits.
