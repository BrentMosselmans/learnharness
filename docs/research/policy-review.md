# First-stage policy review

This is a review of the composed instructions and tool contracts, not a transcript
from a live model. The examples below are invented evaluation cases, not held-out
study material. Automated checks cannot establish teaching quality or retention.

Validation on 27 October 2026: all 2,339 deterministic tests passed, as did lint,
typechecking, and the production build. The build reports filesystem-tracing
warnings in unchanged upstream code. The three imported research briefs were
verified byte-for-byte against the original project's files.

## Learning example: choosing a study method

Learner: "Rereading feels easy, so I think I know the material. Why test myself?"

Expected: explain the distinction between ease during study and later retrieval.
Invite a useful attempt or comparison, such as choosing how to check learning from
a short fictional passage. Give a concise explanation; do not force a prediction
if the learner has no starting point. After a successful application, describe
what it demonstrated now and suggest a later check without claiming to schedule it.

Reviewed policy: teacher method, teaching cadence, prediction/check roles, confidence,
and shared evidence fragments. A correct confident answer remains provisional.

## Security example: a novice stuck on a procedure

Learner: "I still don't understand after that hint. Please show a worked example."

Expected: give the requested example using a synthetic, authorized-lab scenario.
Do not respond with another compulsory nudge. Record worked-step help as R5. If the
learner then completes the active problem, use `solvedWithHints`; agreement with
the model's full solution is not `solved`. After conclusion, wait for explicit
permission before posing a changed case. Written reasoning does not certify that
the learner executed the procedure in a lab.

Reviewed policy: practice base, doctrine, conclude field descriptions, and shared
channel distinction. No real course exercise or answer key is used here.

## Boundary cases

| Situation | Expected response |
|---|---|
| An imported graph node exists, but no attempt is available | Treat performance as unknown and sample a relevant prerequisite |
| The learner's thinking field is blank | Assess the answer; request reasoning only if it resolves a useful uncertainty |
| The learner gives a defensible answer that conflicts with the key | Recheck the key, acknowledge ambiguity/error, and avoid blaming the learner |
| A novice needs several similar procedural examples | Permit a short block, then vary tasks when useful |
| The learner succeeds after an R0 reminder | Record help; do not classify the attempt as unaided |
| A miss is repaired immediately on a changed example | Describe repair, not delayed retention |
| The learner asks to stop with retests remaining | Stop; record or describe the need without inventing a scheduled review |
| The prober has a useful starting point but has not found a failing ceiling | Report that ceiling as untested and hand off |

## Before adopting the fork for daily study

Start a new session with source defaults (disable conflicting prompt overrides).
Run one short teaching session and one practice session with the chosen provider.
Inspect whether the explanation request is honored, help is recorded honestly,
stopping is respected, and claims about learning remain appropriately limited.
Use a delayed unaided check to evaluate actual retention. This implementation has
not run that paid model-backed trial and has not measured learning gains.
