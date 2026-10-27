# Research brief 3: the Keep Learning courses, checked against the evidence

27 October 2026. This brief reviews two courses by Benjamin Keep, a learning scientist with a PhD from Stanford's Graduate School of Education ([profile](https://mentorexplorer.com/en/mentor/benjamin-keep)), from his Keep Learning Community ([benjaminkeep.com/community](https://www.benjaminkeep.com/community/)):

- **Fundamentals of Learning (F)**: how learning works, built on research about memory, expertise, attention, encoding, comparison, motivation, practice conditions, feedback, prior knowledge and metacognition.
- **The Practice of Learning (P)**: how to study and practise, covering what to remember, skill practice, self-monitoring, notes, review, choosing resources, goals and habits.

Lesson references give the course letter, then section and lesson number: P07/06 is *The Practice of Learning*, section 07, lesson 06 ("Practice Tests"). This brief complements [RESEARCH.md](RESEARCH.md) (R1 to R12) and [RESEARCH-MASTERY.md](RESEARCH-MASTERY.md) (M1 to M11). Its sections are C1 to C6.

## How this was done

- **Material.** All 124 video lessons that were downloaded, 60 from F and 64 from P: about 153,000 words of machine transcripts (Whisper large-v3). Question and exercise pages were not downloaded, and neither were nine lessons:
  - F: The Forgetting Curve; Scripts, Schemas, and Models; Complications to Working Memory; Desirable Difficulties; Activating Prior Knowledge; Retrieval Revisited
  - P: Moving Through Material; A Tale of Two Lectures; My Favorite Format: Books
- **Reading.** Five agents (Codex gpt-6.1-sol, high reasoning) each read a fifth of the lessons in full and graded 189 claims against the two earlier briefs. For claims those briefs do not cover, they ran 51 Exa searches, preferring meta-analyses and large or preregistered trials.
- **Verification.** Three corrections in C2 were checked against the original papers: highlighting, habit cues and micro-breaks.
- **Notes.** Lesson-by-lesson notes are in `sources/keep-learning/notes/`. That folder is git-ignored because the notes summarise paid course material.
- **Limits.** Keep usually describes experiments without naming them, so the studies cited here are our checks, not necessarily the ones he had in mind. The transcripts contain repeated lines and garbled passages; no conclusion below rests on a garbled passage alone.

## Verdict

The courses are careful. Keep qualifies most claims himself, warns against over-elaborate notes and reflection, and presents techniques as tools chosen for a purpose. The 189 graded claims break down as follows:

| Grade | Claims | Meaning |
|---|---|---|
| Supported | 49 | Consistent with meta-analyses or strong trials |
| Conditional | 97 | Holds under conditions the evidence names, which Keep often names too |
| Weak | 28 | Little or poor evidence, often a personal routine stated as a rule |
| Contradicted | 5 | Good evidence against the claim as stated |
| Unchecked | 10 | Low relevance to this system |

His most useful contributions to this project are practical:

1. deciding what deserves memorising, and how precisely
2. separating fluent skill from flexible skill, and assisted performance from independent performance
3. a concrete practice cycle with mistake analysis
4. distinguishing capability, achievement and activity goals, and planning around real capacity
5. treating habits as cue-response associations rather than willpower

Where he overreaches, it is mostly a personal routine turned into a general rule (C2).

The course is domain-general. It mentions ChatGPT once in passing (P02/10) and programming in a few examples, so the rules for computing topics and for AI tutoring still come from M3 to M7 and M9.

## C1. Where the course and the evidence agree

These points shape the plan directly.

| Course idea | Evidence | In the system |
|---|---|---|
| Facts, concepts and skills are connected parts of competence, and techniques should be chosen for their function (F01/02, P02/02) | KLI framework (M1) | Every KC has a knowledge type, and activities are chosen by type |
| Correct answers given with cues or help can hide weak independent skill. Keep's example is Clever Hans, the horse that read its questioner's cues (P05/01-02, P02/08) | M8, M10 | Every attempt records the help used; mastery counts only unaided, delayed performance on changed tasks |
| Fluent study inflates confidence, and delayed self-tests correct it (F16/02-03, P05/02) | [Rhodes & Tauber 2011](https://pubmed.ncbi.nlm.nih.gov/21219059/) (M8) | Predictions and confidence ratings before checks; calibration shown over time |
| Retrieval beats rereading, and harder, higher-order retrieval helps more (F12/05, P07/01) | R3; M2 | Retrieval is the default form of review; concept reviews ask application questions |
| Space practice out; interleave related categories, not arbitrary subjects (F12/02-03, P04/12) | R3; [Brunmair & Richter 2019](https://pubmed.ncbi.nlm.nih.gov/31556629/) (M2) | Confusable KCs are interleaved after a supported introduction |
| Comparing cases reveals structure; compare methods, errors and related concepts (F09/02-04, P03/06) | [Alfieri et al. 2013](https://www.tandfonline.com/doi/abs/10.1080/00461520.2013.775712) (M2) | Contrasting-case activities with paired code, packet traces or sentences |
| Worked examples help novices and lose value as skill grows (F04/03, F14/03) | M2; expertise reversal (M3) | Worked example, then faded completion, then independent work, with fading driven by demonstrated competence |
| Explain why a misconception fails, then give the replacement (F14/04) | Refutation texts, g=0.41 over 44 comparisons ([Schroeder & Kucera 2022](https://doi.org/10.1007/s10648-021-09656-z)) | Misconception repair, followed by a new case to test it |
| Specific, actionable feedback beats global judgement, and feedback that threatens identity distracts (F13/04-05) | [Wisniewski et al. 2020](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2019.03087/full), d=0.48 over 435 studies; [Kluger & DeNisi 1996](https://doi.org/10.1037/0033-2909.119.2.254) | Feedback names the error, the reason and a next step, without praise formulas |
| Flashcards rehearse cue-target links efficiently but do not build integrated skill (P07/04) | R3, R4, M7 | Cards only for items that need exact recall; competence is tested with tasks |
| Generating an answer beats reading it (F06/04) | Generation effect, d≈0.40 over 86 studies ([Bertsch et al. 2007](https://pubmed.ncbi.nlm.nih.gov/17645161/)) | Prediction and completion tasks, followed by feedback |
| Practise the way you will use the knowledge (F06/08) | Transfer-appropriate processing ([Morris, Bransford & Franks 1977](https://www.sciencedirect.com/science/article/abs/pii/S0022537177800169)); M10 | Assessments ask you to execute, diagnose and explain, not only to recall |
| Commit to an answer before seeing a solution (P07/06) | M2, M9; [Kumar et al. 2025](https://dlnext.acm.org/doi/10.1007/978-3-031-98459-4_5) | Attempt first, in the help policy |
| Measure a skill by performance on similar tasks after a delay (P04/01, P09/07) | M8, M10 | Monthly benchmarks on held-out variants |
| Guided projects beat both following a recipe and exploring alone (P08/05) | [Alfieri et al. 2011](https://app.nova.edu/toolbox/instructionalproducts/edd8124/articles/2011-Alfieri_et_al.pdf) (M2) | Labs whose scaffolds fade, followed by a changed variant |
| Keep durable capability, achievements and activities apart when setting goals (P09/03) | M8, M10 | Three linked goal types |
| Habits are cue-response links formed by repetition in a stable context, and one missed day does not reset them (P10/03-04) | [Wood & Rünger 2016](https://www.annualreviews.org/content/journals/10.1146/annurev-psych-122414-033417); [Lally et al. 2010](https://doi.org/10.1002/ejsp.674) | A stable start cue, and no streak to lose |

## C2. Course claims the evidence does not support

| Course claim | What the evidence shows | What the system does instead |
|---|---|---|
| Highlighting while reading adds essentially nothing (P06/03) | **Contradicted.** Across 36 articles and 85 effects, highlighting by learners improved memory (d=0.36) but not reliably comprehension (0.20); highlighting supplied by an instructor improved both (0.44) ([Ponce, Mayer & Méndez 2022](https://doi.org/10.1007/s10648-021-09654-1)) | Highlighting is allowed and never counts as evidence of understanding |
| Cues tied to a routine event work better than clock times for building habits (P10/04) | **Contradicted as a general rule.** In an 84-day randomised trial with 192 adults, routine and time cues produced the same automaticity; repeating the planned behaviour predicted it ([Keller et al. 2021](https://doi.org/10.1111/bjhp.12504)) | Either kind of cue; the system tracks whether sessions actually start |
| Multiple representations hinder novices (F14/03) | **Contradicted as a general rule.** Coordinated words and pictures helped low-knowledge learners most ([Mayer 1997](https://www.uky.edu/~gmswan3/544/mayer_1997.pdf)), and extra representations gave a small benefit when learners were supported ([Rexigel et al. 2024](https://link.springer.com/article/10.1007/s10648-024-09958-y)) | Diagrams with their correspondences spelled out, such as packet diagrams and memory tables |
| Practice that already feels easy offers little more learning (P04/02) | **Contradicted as a general rule.** Fluency practice deliberately uses easy material (M7), and spaced review maintains what you know (R3). Keep's later lessons say much the same | Fluency and maintenance practice stay in the plan |
| Reading every item aloud cancels the memory benefit of saying words aloud (F06/06) | **Contradicted** for recognition by an [updated meta-analysis](https://doi.org/10.1037/cep0000302) | Speaking practice stays wherever it serves pronunciation or communication |
| Feedback should usually be delayed (F13/03) | **Weak.** No timing wins in general, and in [one randomised trial](https://pubmed.ncbi.nlm.nih.gov/27082020/) immediate computer feedback helped mastery even for learners with more prior knowledge | Correction comes promptly after an attempt; language corrections wait until a fluency turn ends |
| Negative feedback is generally more useful than positive (F13/03) | **Weak.** Over a third of feedback interventions lowered performance, and whether feedback was positive or negative did not explain which ([Kluger & DeNisi 1996](https://doi.org/10.1037/0033-2909.119.2.254)) | Feedback states specifically what was right and what was wrong |
| About 90 minutes is the limit for demanding practice (P04/08) | **Weak.** Micro-breaks reduced fatigue (d=0.35) but did not significantly improve performance (d=0.16), and showed no benefit after cognitive tasks ([Albulescu et al. 2022](https://doi.org/10.1371/journal.pone.0272460)) | Breaks are optional, with no hard cutoff |
| Reviewing in your head is the weakest kind of review (P07/02; Keep says he is unsure of the research) | **Weak.** Silent and spoken retrieval gave similar retention in four lab experiments ([Smith, Roediger & Karpicke 2013](https://pubmed.ncbi.nlm.nih.gov/23815513/)) | Mental review is fine, but only recorded answers count as evidence |
| Free recall generally beats cued recall (P07/05) | **Weak as a ranking.** Which format works best depends on the task ([Adesope et al. 2017](https://doi.org/10.3102/0034654316689306); [Karpicke 2025](https://learninglab.psych.purdue.edu/downloads/2025/2025_Karpicke_Retrieval_Based_Learning_Review.pdf)) | Cards for associations, free recall for connected explanations, problems for application |
| Mistakes generally teach more than correct answers (P07/06) | **Weak as a general comparison.** Errors followed by corrective feedback can help ([Metcalfe 2017](https://doi.org/10.1146/annurev-psych-010416-044022)), but that does not make them better than successful retrieval | Errors are welcome, but tasks are not designed to make you fail |
| Experts seldom use flashcards, so understanding-centred study is better (P09/09) | **Weak.** Informal conversations with experts are confounded by what they already know; the evidence for retrieval and vocabulary study is strong (R3, M7) | Cards for the facts that need them, alongside meaningful practice |
| Challenging goals do not matter early in learning (P09/02) | **Weak.** Specific, challenging learning goals help beginners too ([Locke & Latham 2002](https://www-2.rotman.utoronto.ca/facbios/file/09%20-%20Locke%20&%20Latham%202002%20AP.pdf)) | Specific learning goals from the start; speed and score targets later, as P09/06 suggests |
| Frequent multitasking erodes the ability to focus (P10/05) | **Weak.** The small association disappeared after correcting for small-study bias ([Wiradhany & Nieuwenstein 2017](https://doi.org/10.3758/s13414-017-1408-4)) | One task at a time during a session, without claims of lasting damage |
| Misconceptions never fully disappear (F14/04) | **Weak.** Recurrence in some experts does not show permanence in everyone ([conceptual-change review](https://doi.org/10.1002/tea.21887)) | Misconceptions are rechecked after a delay, without assuming they will return |
| Adaptive expertise necessarily costs routine efficiency (F03/02) | **Weak.** A [systematic review of adaptive expertise](https://doi.org/10.1016/j.edurev.2014.03.001) did not establish such a trade-off | Routine fluency and adaptation are measured separately |

## C3. Tensions with the earlier briefs, and how the plan settles them

1. **Mistake analysis versus practice volume.** Keep puts error analysis at the centre of review (P07/07), while saying that real use is quicker than his worked demonstrations. Adding reflection to detailed AI feedback doubled time on feedback, cut practice by 40% and improved nothing (Asher et al. 2026, M3). That direct trial is the better guide to implementation. **Plan:** a short correction by default. A full cause-and-remedy entry only for errors that recur, reveal a conceptual gap or were made with high confidence. The time this takes is logged.
2. **Invent-then-explain versus Socratic questioning.** Keep's contrasting-case sequence ends with an explicit explanation (F09/03). Turning it into a chain of tutor questions conflicts with Liding et al. (2026), where Socratic hints made 178 CS1 students slower, with more repeated errors and no long-term gain (M3). **Plan:** a short, time-boxed attempt or comparison, then a clear explanation.
3. **Preparation for future learning.** Keep's "invent first" lessons can sound like a general transfer advantage. In the primary study, inventing first helped ninth graders when the test included a new learning resource; on unaided transfer the groups were equal ([Schwartz & Martin 2004](https://doi.org/10.1207/s1532690xci2202_1); see also [Schwartz & Bransford 1998](https://aaalab.stanford.edu/papers/time_for_telling.pdf)). **Plan:** learning from new documentation is measured separately from unaided mastery and tried as an N=1 experiment.
4. **Practice without feedback.** Keep suggests that knowledgeable learners can sometimes practise without feedback (F13/06). The evidence is narrow, from children's maths ([Fyfe & Rittle-Johnson 2016](https://doi.org/10.1037/edu0000053)), and [a randomised trial](https://pubmed.ncbi.nlm.nih.gov/27082020/) points the other way. **Plan:** checking your own work before feedback is an N=1 experiment; correction is never withheld by default.
5. **Facts first?** Keep argues that interesting problems need not wait until every fact is memorised (P03/03); the earlier briefs stress prerequisites for novices (M1, M4). Neither supports a fixed order. **Plan:** teach enough to engage with a real problem, then connect facts, explanation and use. Anything that repeatedly blocks you becomes a card.
6. **Approximate versus exact knowledge.** Keep's "clouds" and approximate anchors suit orientation (P03/04, P03/07). Operational work often needs exact answers: a subnet mask, a command flag, a verb ending. **Plan:** every item records the precision it needs.
7. **AI as an expert model.** The course values watching experts and getting their feedback. In the Anthropic trial, AI help while learning a library lowered understanding by 17 percentage points (M4). **Plan:** code from Claude counts as a worked example. You modify and rebuild it, then pass an unaided changed task.
8. **Real work as review.** Keep says authentic work can eventually replace separate review (P07/05), but real work does not exercise every skill evenly. **Plan:** unaided use in a project counts as review evidence for the KCs it exercises, and a coverage check schedules review for the rest.

## C4. What the plan takes from the course

**Build**

| Idea | Grade | Feature |
|---|---|---|
| Decide what to memorise, and how precisely (P03/01-07) | Conditional | Each item is marked exact recall, reconstruct, or look up; only exact-recall items become cards |
| Provisional knowledge, Keep's "clouds" (P03/04) | Conditional | A KC state for gist-level knowledge that lists its open questions. It is revisited through prediction or conversation and never counts as mastery |
| Mistake repair (P07/07) | Conditional; indirectly, debriefs d=0.67 ([Tannenbaum & Cerasoli 2013](https://pubmed.ncbi.nlm.nih.gov/23516804/)) | An error-log entry holds the attempt, a likely cause, one remedy and a delayed check on a changed task; it closes only when that check passes |
| Free recall with a coverage check (P07/05) | Conditional | For example, "explain DNS resolution from memory", scored against a list of components, with unaided and prompted parts recorded separately |
| Answer before seeing the options (P07/06) | Conditional | Multiple-choice options stay hidden while the question can stand alone; you predict and rate your confidence first |
| Comparisons with a stated purpose (F09/04) | Conditional | Each comparison declares what it is for: shared structure, the feature that tells two things apart, an alternative method, or a plausible error |
| Use the correction (F13/02) | Conditional | A correction is followed by a nearby changed problem |
| Analyse expert decisions when authoring (F03/03) | Conditional; cognitive task analysis g=0.87, from few studies ([meta-analysis](https://doi.org/10.1177/1555343412474821)) | An authoring checklist for procedures: cues, alternatives, decisions, checks |
| Practise transitions, not only components (P04/04) | Conditional | Tasks that require choosing a method, or moving from a diagnosis to a test |
| Return to the model after trying (P04/13) | Conditional | Mark the step you could not do, revisit it, then retry unaided |
| Goal types and planning around capacity (P09/03, P09/05) | Supported, and conditional | Review and assessment time is planned before new material; forecasts carry uncertainty |
| A checklist for learning resources (P08/02) | Supported | Rate a resource on accuracy, structure, practice, feedback and prerequisite fit before adopting it |

**Try as N=1 experiments**

| Idea | Grade | Test |
|---|---|---|
| Free recall before a related new lesson (P07/05) | Conditional | Two minutes recalling prerequisites before half of comparable lessons |
| Changing what you attend to across attempts (P04/12) | Conditional; indirect evidence ([Kramer et al. 1995](https://doi.org/10.1037//1076-898x.1.1.50)) | Separate passes for correctness then efficiency, or meaning then pronunciation, against ordinary practice |
| Alternating precise and playful practice (P04/07, P04/13) | Weak | A constrained task followed by a free variation |
| Quiet rest after a session (F05/01, P04/08) | Conditional; wakeful rest g≈0.2 in adults, mostly on word-list memory ([2026 meta-analysis](https://link.springer.com/article/10.3758/s13423-025-02778-3)) | Five to ten quiet minutes after half of matched sessions |
| Checking your own work before feedback (F13/06) | Conditional | You check against the specification before the system does |
| Hypothesis-and-test note headings for labs (P06/05) | Conditional | Structured notes in half of lab sessions |
| A closing "next action" note (P10/06) | Weak | Does the next session start sooner? |
| Learning from unfamiliar documentation (F09/03) | Conditional; ninth-grade studies | After instruction, learn a new API or grammar point from its documentation alone |

**Skip**

- **Changing rooms for context variety** (F02/05, P04/12): the effects are small and depend on cues ([Smith & Vela 2001](https://pubmed.ncbi.nlm.nih.gov/11495110/)), and the friction is real.
- **Points and rewards** (F11/04): expected rewards can reduce interest once they stop ([Deci, Koestner & Ryan 1999](https://pubmed.ncbi.nlm.nih.gov/10589297/)), and there is nothing here that needs them.
- **Mandatory routines:** Cornell notes, written brain dumps, celebration rituals, fixed timers and inbox-zero targets. Their advantage over simpler routines is unproven, and they take time from practice.
- **Mood-based routing and memory-palace tooling** (F05/02, F06/05): unchecked and low priority.
- **A community platform** (F17/01): existing communities serve this better.

## C5. Shared vocabulary

| Course term | Meaning | Term in the plan |
|---|---|---|
| Facts, concepts, skills | Kinds of knowledge (F01/02) | KC types: fact, concept, procedure, causal model, integrated skill |
| Lynchpins | Knowledge that unlocks much else (P03/04) | Core KCs, the ones with many dependants |
| Clouds | Partial, gist-level knowledge around a lynchpin (P03/04) | Provisional state |
| Learning in layers | Each pass reveals more because you know more (P02/03) | Planned revisits |
| Approximation and triangulation | Using the right precision, and cross-checking through several organisations of the material (P03/07) | Required precision; cross-checks between representations |
| Bundling | Treating several steps as one unit (F01/03) | Chunking |
| Routine and adaptive expertise | Efficient on familiar tasks, able to handle new ones (F03/02) | Fluency and transfer dimensions |
| Expert blindness | Experts leave out steps they no longer notice (F03/03) | The reason for decision analysis when authoring |
| Metacognitive gaps | Feeling you know something you cannot yet do (P05/02) | Calibration |
| Sanity check | Checking a result by another route (P05/03) | Cross-check |
| Practice cycle | Attempt, feedback, another attempt (P04/02) | Attempt-feedback loop |
| Figuring out the game | Working out what a setting actually rewards (P04/06) | Task analysis of an assessment |
| Fluency and flexibility | Automatic performance that still adapts (P04/10) | Fluency and transfer dimensions |
| Three kinds of variety | Varying the context, the task and the focus of attention (P04/12) | Variation, interleaving, attention passes |
| Back-and-forth variety | Alternating study and practice (P04/13) | Study-practice cycles |
| Mistake analysis | Locate the error, find its cause, choose a remedy (P07/07) | Error log |
| Learning, performance and activity goals | What you can do, what you achieve, what you do (P09/03) | Capability, achievement and activity goals |
| Invent and tell | Attempt a solution before the explanation (F09/03) | Attempt, then explanation |
| Ego threat | Feedback that becomes about you instead of the task (F13/05) | Task-focused feedback |

## C6. Other sources checked

Sources the agents used that are not linked above, grouped by topic.

- **Memory and encoding:** generating text, g=0.41 ([meta-analysis](https://link.springer.com/article/10.1007/s10648-023-09758-w)); drawing to remember, d=0.65 over 103 experiments ([meta-analysis](https://devpsy.bnu.edu.cn/EN/Y2024/V40/I1/29)); acting out phrases, g=1.23 ([meta-analysis](https://doi.org/10.1037/bul0000360)); causes of forgetting ([review](https://www.sciencedirect.com/science/article/abs/pii/S1074742721000484); [Wixted 2004](https://www.annualreviews.org/content/journals/10.1146/annurev.psych.55.090902.141555)); retrieval-induced forgetting ([Murayama et al. 2014](https://andymatuschak.org/prompts/Murayama2014.pdf)).
- **Attention, load and the body:** seductive details ([meta-analysis](https://www.sciencedirect.com/science/article/abs/pii/S1747938X12000413)); a critique of cognitive load theory ([Kalyuga 2011](https://link.springer.com/article/10.1007/s10648-010-9150-7)); sleep deprivation ([meta-analysis](https://pmc.ncbi.nlm.nih.gov/articles/PMC8893218/)); wakeful rest ([2025 meta-analysis](https://doi.org/10.3758/s13423-025-02665-x)); exercise ([umbrella review](https://www.nature.com/articles/s41562-023-01554-4); [broader umbrella review](https://doi.org/10.1136/bjsports-2024-108589)).
- **Practice:** deliberate practice in sport ([Macnamara et al. 2016](https://doi.org/10.1177/1745691616635591); [Ericsson's reply](https://doi.org/10.1177/1745691616635600)); contextual interference in motor learning ([Czyż et al. 2024](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2024.1377122/full)); short tests during lectures reduced mind wandering ([Szpunar et al. 2013](https://pmc.ncbi.nlm.nih.gov/articles/PMC3631699/)); concreteness fading ([Fyfe et al. 2014](https://doi.org/10.1007/s10648-014-9249-3)).
- **Representations and media:** multimedia design ([Noetel et al. 2022](https://doi.org/10.3102/00346543211052329); [Cromley & Chen 2025](https://doi.org/10.1016/j.edurev.2025.100730)); video in higher education ([Noetel et al. 2021](https://journals.sagepub.com/doi/10.3102/0034654321990713)).
- **Testing:** effects on related material ([replication](https://link.springer.com/article/10.1007/s00426-022-01729-0)); testing earlier material helps later learning ([review](https://pubmed.ncbi.nlm.nih.gov/30265011/)).
- **Motivation:** incentives ([synthesis](https://doi.org/10.1037/a0035661)); achievement goals ([meta-analysis](https://pubmed.ncbi.nlm.nih.gov/20438145/)); self-efficacy ([review](https://doi.org/10.1037/bul0000098)); growth-mindset interventions ([Macnamara & Burgoyne 2023](https://pubmed.ncbi.nlm.nih.gov/36326645/); [Burnette et al. 2023](https://psycnet.apa.org/doiLanding?doi=10.1037%2Fbul0000368)).
- **Notes:** note-taking ([Kobayashi 2005](https://doi.org/10.1016/j.cedpsych.2004.10.001)); handwriting versus typing ([Urry et al. 2021](https://doi.org/10.1177/0956797620965541); [Flanigan et al. 2024](https://doi.org/10.1007/s10648-024-09914-w)); segmenting material ([Rey et al. 2019](https://doi.org/10.1007/s10648-018-9456-4)); structured notes ([Siegel 2020](https://doi.org/10.1017/S0261444820000476)).
- **Self-regulation and habits:** goal phases in a motor skill ([Zimmerman & Kitsantas 1997](https://ssrlsig.org/wp-content/uploads/2018/02/zimmerman-kitsantas-1997-dev-phases-in-self-reg.pdf)); progress monitoring, d=0.40 ([Harkin et al. 2016](https://www.apa.org/pubs/journals/releases/bul-bul0000025.pdf)); time management ([Aeon et al. 2021](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0245066)); multitasking ([May & Elder 2018](https://link.springer.com/article/10.1186/s41239-018-0096-z)); immediate rewards and persistence ([Woolley & Fishbach 2016](https://doi.org/10.1093/jcr/ucv098); [Kilb & Labudek 2022](https://pubmed.ncbi.nlm.nih.gov/35962435/)).
