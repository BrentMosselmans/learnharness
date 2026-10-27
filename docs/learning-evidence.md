# Learning evidence and reviews

Stage two uses the existing desktop map and practice sessions. Open **Reviews** on
the home screen, or select a proposition and choose **Prepare practice**. This fills
the existing composer; sending it uses the normal model/key setup and starts the
session. Nothing runs or spends API credit merely because a review is due.

Each completed practice problem appends an immutable evidence entry to its chat
record: target IDs, committed task, task variant, prior exposure, kind, submissions,
answer assessments, outcome, help, grade confidence, timestamps, and verdict.
Unfinished work remains in the transcript. Only successful tool-call/result pairs
count. Repeated saves are idempotent, and transcript compaction does not remove
already recorded evidence. Chat writes replace the file atomically.

The map derives counts from these records. A confident AI grade remains an AI
judgment. Independent evidence requires a solved, new, meaningfully changed task,
one recorded submission assessed correct, and no recorded help. Missing metadata,
unknown exposure, retries, duplicate task variants, or the same task text do not
qualify. Assisted success remains visible separately. This conservative initial rule
also withholds independent credit when working notes precede the answer.

A delayed check requires an eligible task posed at least 24 hours after the previous
recorded exposure. Leaving a task open overnight cannot earn delayed credit.
Unfinished mapped practice and explicitly mapped teaching sessions count as exposures,
not performance. Teaching
plan slugs are not global graph IDs, so unlinked lesson quizzes are not automatically
mapped or treated as independent evidence. Unrecorded study and semantic task
similarity cannot be reliably detected; the model must report exposure honestly.

Review defaults are one day after practice, then 3, 7, 14, and 30 days as delayed
checks succeed. Assisted, failed, uncertain, and excluded results request an earlier
replacement check. These are heuristics in `src/core/learning-evidence.ts`, not a
validated memory model or user-calibrated intervals. Fact recall is selected only
for tasks explicitly classified as facts in recall mode. Concepts, procedures, and
unknown targets receive changed application tasks. Reviews include prior task
statements and variants for the agent, but do not inject previous solutions.

In a proposition's **Evidence and corrections**, use **Dispute grade** or **Faulty
question** to exclude an entry from progress. Corrections append to the record;
**Restore** removes the learner exclusion but does not upgrade an uncertain AI
grade. Counts and dates are recomputed. Earlier failures remain in the transcript
and evidence. Deleting a chat removes its evidence; deleting a graph node removes
it from progress and the queue. No old-app records are imported.

These checks validate software behavior. They do not establish educational
effectiveness or replace a real model-backed practice trial.
