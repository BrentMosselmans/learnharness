# Research brief: evidence for an AI-integrated learning system

Compiled 26 October 2026 with Exa web search (about 40 searches plus targeted fetches). Each claim links to its source. Preprints, vendor-run studies and small samples are labelled as such. Section numbers (R1, R2, ...) are referenced from [PLAN.md](PLAN.md).

## Top findings

1. **The same AI can help or harm; design decides.** Unguarded GPT-4 access raised practice scores 48% but lowered later unassisted exam scores 17%. A guarded tutor version removed the harm ([Bastani et al., PNAS 2025](https://www.pnas.org/doi/10.1073/pnas.2422633122)). Using AI to *explain* produced lasting gains, using it to *write* did not ([Contractor & Reyes, IZA 2026](https://docs.iza.org/dp18792.pdf)).
2. **Structured, curriculum-embedded AI shows the largest effects.** A research-designed physics tutor beat in-class active learning by 0.73-1.3 SD ([Kestin et al. 2025](https://www.nature.com/articles/s41598-025-97652-6)). Teacher-integrated Gemini Guided Learning gave +0.258 SD in 8 weeks ([DeepMind 2026](https://deepmind.google/blog/measuring-the-impact-of-learning-with-ai-in-sierra-leone-and-beyond/)).
3. **Access is not use.** A two-year Khanmigo RCT found +0.06-0.08 SD per year, no better than Khan practice without AI. Students used the tutor in only 17% of sessions where they made a mistake ([Oreopoulos & Low, NBER 2026](https://www.nber.org/papers/w35620)).
4. **Pre-generated, validated AI feedback works at scale and is cheap.** Feedback for common wrong answers raised next-problem success 7% for low-knowledge students, matching teacher-written feedback at $0.05-0.10 per cached message ([Worden et al., L@S 2026](https://dl.acm.org/doi/10.1145/3774398.3811594)).
5. **Hint buttons invite bypassing.** Premature hint requests and superficial hint reading consistently predict lower learning gains, most for low-prior-knowledge students ([An et al., LAK 2026](https://dl.acm.org/doi/full/10.1145/3785022.3785040)).
6. **Specialised models beat LLMs at predicting learners.** Knowledge-tracing models outperform LLMs at predicting student responses and are orders of magnitude cheaper ([Eedi 2026](https://arxiv.org/abs/2603.02830)). FSRS is the most accurate open, widely deployed memory scheduler: FSRS-6 ships in Anki, and FSRS-7 is now the default in the TypeScript library ts-fsrs v6 ([srs-benchmark](https://github.com/open-spaced-repetition/srs-benchmark); [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs)). All of its benchmarks are card-level, though.
7. **The classic learning-science effects are the foundation.** Retrieval practice (g≈0.50), prequestions (g=0.54 for tested material), elaborated feedback (d≈0.48) and spacing remain the most reliable levers.
8. **AI can draft content but needs verification.** LLM questions can match expert items psychometrically after critique-and-revise loops, but distractors and discrimination are frequent weak points, and LLMs misjudge difficulty.
9. **LLM feedback changes with perceived identity.** Feedback shifted in stereotype-aligned ways when prompts mentioned race, language background or disability ([Tan, Phalen, Demszky 2026](https://arxiv.org/abs/2603.12471)).
10. **Regulation is concrete now.** EU AI Act prohibitions (including emotion recognition in education) apply since February 2025. High-risk obligations for education systems apply from 2 December 2027 after the Digital Omnibus ([European Commission](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai)).

---

## R1. AI tutoring outcomes

### R1.1 Key studies

| Study | Setting | Design | Result | Caveats |
|---|---|---|---|---|
| [Kestin et al. 2025, Sci. Reports](https://www.nature.com/articles/s41598-025-97652-6) | Harvard intro physics | Crossover RCT vs in-class active learning, 2 weeks | Median gains more than double; 0.73-1.3 SD; time on task unrelated to score | Short units; tutor prompts carried expert step-by-step solutions |
| [Bastani et al. 2025, PNAS](https://www.pnas.org/doi/10.1073/pnas.2422633122) | ~1,000 Turkish high-school math students | Field RCT, 3 arms | GPT Base: +48% practice, -17% unassisted exam. GPT Tutor: +127% practice, ≈0 exam | GPT-4 era; students did not notice the harm |
| [Oreopoulos & Low 2026, NBER w35620](https://www.nber.org/papers/w35620) | 18 Tennessee middle schools, 2 years | Cluster RCT, Khanmigo set to coach | +0.06-0.08 SD/yr (≈ Khan without AI); full-year active use ≈0.14 SD. Median student messaged on a third of practice days, in 17% of sessions with a mistake | Working paper |
| [DeepMind & Fab AI 2026](https://deepmind.google/blog/measuring-the-impact-of-learning-with-ai-in-sierra-leone-and-beyond/) ([prereg](https://doi.org/10.1257/rct.16651-2.0)) | 1,763 students, 48 classrooms, Sierra Leone | Preregistered cluster RCT; teachers used Guided Learning in 2 of 4 weekly periods | +0.258 SD over 8 weeks; 69% met usage targets | Vendor-run; low-income-country baseline |
| [LearnLM & Eedi 2025](https://arxiv.org/html/2512.23633) | 165 students, 5 UK schools | Exploratory RCT; expert tutors approved every AI draft | 76.4% of drafts sent with zero or minimal edits; transfer to next topic 66.2% vs 60.7% (human tutor) vs 56.2% (static hint) | Small; vendor co-authored; human in the loop |
| [Worden et al. 2026, L@S](https://dl.acm.org/doi/10.1145/3774398.3811594) | 21,478 students, 572 problems (ASSISTments) | 2 RCTs | Pre-generated feedback for 3,862 common wrong answers: +16% fix current answer, +7% next-problem success, only for low-knowledge students; comparable to teacher-written | Short-term outcomes |
| [Contractor & Reyes 2026, IZA DP 18792](https://docs.iza.org/dp18792.pdf) | 211 undergraduates | Proctored RCT, AI allowed vs forbidden | +0.27 SD knowledge, persisting 1 week; delayed essay gains only for "augmentation" users | One topic; off-the-shelf AI |
| [Barcaui 2025, SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5353041) | 120 undergraduates | RCT | ChatGPT as study aid: 57.5% vs 68.5% on a surprise test 45 days later (d=0.68) | Single study |
| [Thoeni & Fryer 2025](https://doi.org/10.31219/osf.io/24tg7_v1) | ~450 undergraduates | Semester RCT, RAG course tutor | No effect on interest, self-efficacy, engagement or achievement | Preprint |
| [Chen et al. 2025 (CMU)](https://arxiv.org/abs/2509.16778) | 148 students, proofs | Controlled study | Homework improved, exams did not; heavy chatbot use by low-self-efficacy students predicted lower midterms | |
| [Wang et al., Tutor CoPilot](https://arxiv.org/abs/2410.03017) | 900 tutors, 1,800 K-12 students | Preregistered RCT | AI guidance to human tutors: +4 pp topic mastery, +9 pp for lower-rated tutors, ~$20 per tutor per year | Human-AI hybrid |
| [Learn Your Way (Google)](https://research.google/blog/learn-your-way-reimagining-textbooks-with-generative-ai/) ([paper](https://www.frontiersin.org/journals/artificial-intelligence/articles/10.3389/frai.2026.1783117/full)) | 60 students aged 15-18 | Lab RCT vs digital textbook | +9% immediate; 78% vs 67% at 3-5 days | Small, lab, vendor |

### R1.2 Meta-analyses: handle with care

The widely cited meta-analysis claiming g=0.867 for ChatGPT on learning performance was **retracted in April 2026** ([retraction note](https://www.nature.com/articles/s41599-026-07310-z)). A re-analysis found no evidence of benefit once publication bias was adjusted for ([Bartoš et al. 2025](https://doi.org/10.31234/osf.io/8vs32_v1)). Other meta-analyses report positive but highly heterogeneous effects and note that ChatGPT reduces mental effort ([Deng et al. 2025, Computers & Education](https://www.sciencedirect.com/science/article/pii/S0360131524002380)). Pooled "large effects" from short, small, unregistered studies should not guide design. The RCTs above should.

### R1.3 What the pattern says

- **Design dominates the model.** The harmful and the neutral arms in Bastani et al. used the same GPT-4. In Contractor & Reyes, explanation-seeking users kept their gains and text-generating users lost theirs.
- **Structure plus expert solutions in context.** The strongest result (Kestin) used a tutor that followed a fixed pedagogical sequence and carried expert worked solutions, which limits hallucination.
- **Engagement is the binding constraint.** Optional help gets ignored (Khanmigo), and only 4.7% of students used Khan Academy at the recommended dosage ([Holt 2024, "The 5 Percent Problem"](https://www.educationnext.org/5-percent-problem-online-mathematics-programs-may-benefit-most-kids-who-need-it-least/)). Integrating the tool into scheduled class time reached 69% compliance in Sierra Leone.
- **Error moments are where AI feedback pays off**, especially for low-knowledge learners (ASSISTments).
- **Human-AI hybrids are strong and cheap** (Tutor CoPilot, supervised LearnLM).
- **Evidence gaps:** few studies measure retention beyond one week; no independent trial of ChatGPT study mode, Claude learning mode or Gemini Guided Learning as standalone consumer tools was found as of September 2026 ([review roundup](https://understandtutor.com/blog/chatgpt-vs-claude-vs-gemini-for-learning)). Reviewers report the modes give answers away after a little pressure ([Meikuio test](https://meikuio.com/best-ai-for-studying/)).

### R1.4 How students actually use AI

- Nearly half of 574,740 student conversations with Claude were "direct" (seeking answers or content with minimal engagement) ([Anthropic Education Report 2025](https://www.anthropic.com/research/anthropic-education-report-how-university-students-use-claude)).
- Across 11,406 students in 200 classes at 10 institutions, 10.4% of GenAI-tutor sessions were "shallow" (copy-paste). Shallow users tended to stay shallow, and shallow use was more common at less selective institutions ([Chen, Gašević et al., L@S 2026](https://doi.org/10.1145/3774398.3811610)).

## R2. Cognitive offloading and overreliance

- MIT EEG study (n=54): LLM-assisted essay writers showed the weakest brain connectivity, the lowest sense of ownership, and trouble quoting their own essays ([Kosmyna et al. 2025, preprint](https://arxiv.org/abs/2506.08872)). Small sample, but consistent with the RCTs above.
- Survey studies associate AI dependence with lower critical thinking, mediated by cognitive fatigue ([Tian & Zhang 2025](https://www.sciencedirect.com/science/article/pii/S0001691825010388)) or cognitive offloading ([Gerlich 2025](https://www.mdpi.com/2075-4698/15/1/6)). These are correlational.
- Practical reading: AI that removes the effort of retrieval, generation and error correction removes the learning. Guardrails must protect effort without making the tool so frustrating that learners switch to an unguarded chatbot ([Pisan 2026](https://arxiv.org/html/2608.12292), citing Bastani).

## R3. Learning-science foundations

| Mechanism | Evidence | Size | Implication |
|---|---|---|---|
| Retrieval practice | [Yang et al. 2021, Psych. Bulletin](https://doi.org/10.1037/bul0000309): 222 classroom studies, 48,478 students | g=0.50; larger with feedback and repetition | Make recall the default practice mode. Recall formats beat recognition ([Rowland 2014](https://pubmed.ncbi.nlm.nih.gov/25150680/)) |
| Prequestions / pretesting | [St. Hilaire et al. 2023](https://doi.org/10.3758/s13423-023-02353-8); [Pan & Sana 2021](https://pubmed.ncbi.nlm.nih.gov/33793291/) (n=1,573) | g=0.54 for tested content, ≈0 for untested; pretests ≥ posttests | Ask before teaching. Failed attempts still help ([Kornell & Vaughn 2016](https://sites.williams.edu/nk2/files/2011/08/Kornell.Vaughn.2016.pdf)) |
| Spacing and interleaving | [Ruitenburg et al. 2021](https://research.ou.nl/en/publications/retrieval-distributed-and-interleaved-practice-in-the-classroom-a/) (classroom review) | Retrieval and interleaving consistent; spacing less consistent in K-12 classrooms | Schedule reviews with a memory model; interleave review |
| Feedback | [Wisniewski, Zierer & Hattie 2020](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2019.03087/full) (435 studies) | d≈0.48-0.55, very heterogeneous; information content matters | Elaborated feedback ranks best in a network meta-analysis ([Mertens et al.](https://psycnet.apa.org/fulltext/2023-06528-001.html)); digital feedback g=0.41 ([Brummer et al. 2024](https://doi.org/10.1007/s10984-024-09501-4)) |
| Comments vs grades | [Koenka et al. 2019](https://doi.org/10.1080/01443410.2019.1659939) | Comments beat grades for motivation and achievement | Show descriptive feedback, not only scores |
| Worked examples | [Barbieri et al. 2023](https://doi.org/10.1007/s10648-023-09745-1) (math meta-analysis) | Positive effect on math performance | Worked examples first, then fade as expertise grows (expertise reversal) |
| Productive failure | [Sinha & Kapur 2021, RER](https://journals.sagepub.com/doi/full/10.3102/00346543211019105): 53 studies | g=0.36 (0.37-0.58 at high fidelity); reversed for grades 2-5 | Problem-first for conceptual topics with older learners |
| Gamification | [Sailer & Homner 2019](https://doi.org/10.1007/s10648-019-09498-w) | g=0.49 cognitive, 0.36 motivational, 0.25 behavioural | Game fiction and competition-with-collaboration help behaviour; not a substitute for learning design |

## R4. Memory models and scheduling

- **Benchmark state (commit of 29 Aug 2026, 9,999 Anki collections, ~350M reviews).** Log loss: FSRS-7 (recency) 0.3370 with 34 parameters, FSRS-6 0.3460 with 21, FSRS v4 0.3726, Duolingo HLR 0.4694. Unpublished rows: trainable Anki SM-2 0.5127, original SM-2 0.7220. FSRS-6 beats SM-2 for 99.7% of collections ([Verbamor analysis](https://verbamor.com/blog/fsrs-benchmark); [srs-benchmark](https://github.com/open-spaced-repetition/srs-benchmark)).
- **Caveats from the same data.** A zero-parameter moving average ties FSRS-7. A 2.7M-parameter neural model (RWKV) is far ahead but uses extra features. **Optimising parameters per user matters more than the version:** FSRS-7 RMSE 0.0910 with defaults vs 0.0593 optimised.
- **Release status (mixed, check before pinning).** In July 2026, FSRS-7 was described as unreleased: fsrs-rs was on v6.6.0 and Anki 26.05 shipped FSRS-6 ([Yazu status](https://yazu.app/blog/fsrs-7-is-coming/); [Anki forum](https://forums.ankiweb.net/t/when-will-anki-integrate-fsrs-7/69997)). fsrs-rs releases up to v6.6.2 (28 Aug 2026) do not mention FSRS-7 ([releases](https://github.com/open-spaced-repetition/fsrs-rs/releases)). The [ts-fsrs README](https://github.com/open-spaced-repetition/ts-fsrs), read on 26 Oct 2026, states that ts-fsrs v6's `DefaultScheduler()` defaults to FSRS-7 and requires Node.js 24 or later; the date of that change was not established. The library version and the algorithm version are independent, so both need pinning.
- **Scope of the evidence.** Every benchmark above scores repeated reviews of the same card. Scheduling a skill that is practised through changing items of varying difficulty is a different problem that these results do not cover.
- **Hierarchical knowledge.** Math Academy's Fractional Implicit Repetition (FIRe): repetitions on advanced topics give discounted, fractional credit to "encompassed" simpler topics, and failures propagate upward. Due reviews are "compressed" into the fewest tasks that cover them ([How our AI works](https://www.mathacademy.com/how-our-ai-works); [Skycak 2023](https://justinmath.com/individualized-spaced-repetition-in-hierarchical-knowledge-structures/); [The Math Academy Way](https://www.justinmath.com/files/the-math-academy-way.pdf)).
- **Content-aware scheduling.** KAR3L uses text embeddings of cards to predict recall on unseen cards and improved learning efficiency in a small online study ([Shu et al., EMNLP 2024](https://arxiv.org/pdf/2402.12291); [Randazzo 2025](https://www.giacomoran.com/blog/content-aware-sr/)). LLM-based schedulers so far show only simulation results ([LECTOR](https://arxiv.org/abs/2508.03275)).
- **Duolingo.** Birdbrain estimates learner ability and exercise difficulty to target the zone of proximal development, validated by A/B tests ([Duolingo blog](https://blog.duolingo.com/learning-how-to-help-you-learn-introducing-birdbrain/); [HLR paper](https://research.duolingo.com/papers/settles.acl16.pdf)).

## R5. Learner modelling and item calibration

- **KT vs LLMs.** Specialised knowledge-tracing models beat GPT-4o-mini, Gemini Flash-Lite, Qwen and Llama at predicting responses, at far lower cost and latency ([Bhattacharyya et al. 2026](https://arxiv.org/abs/2603.02830)).
- **No single KT winner.** A synthesis of 124 KT papers: transformers lead on long logs, graph KT when structure is reliable, spacing-aware models when forgetting matters, LLM/semantic KT for text and cold start, and logistic/factorisation models stay competitive and interpretable with little data ([Agents4Science 2025](https://openreview.net/forum?id=0duEYeqUZw)). Language-model KT helps cold start ([Lee et al. 2024](https://doi.org/10.48550/arxiv.2406.02893)).
- **Estimating item difficulty without field data.** Zero-shot LLM ratings are weak. Better: LLM-extracted features plus tree models (r up to 0.87, [Razavi & Powers 2026](https://doi.org/10.1016/j.ijaied.2026.100015)), simulated LLM "classrooms" fitted with IRT (r up to 0.82 on NAEP items, [Acquaye et al. 2026](https://arxiv.org/html/2601.09953v2)), or fine-tuned models (R²=0.63, [Trautwein et al. 2026](https://doi.org/10.31234/osf.io/mv8sk_v1)). LLMs systematically underestimate hard items ([Wang et al. 2026](https://arxiv.org/abs/2607.28634); [Li et al., ACL 2026](https://aclanthology.org/2026.findings-acl.1270.pdf)).

## R6. Hints and help-seeking

- Unproductive hint use (premature requests, skimming) predicts lower gains across cohorts of 999 K-12 students; the hint button's design invites bypassing ([An et al., LAK 2026](https://dl.acm.org/doi/full/10.1145/3785022.3785040)).
- In an observational study of 322 student teachers, heavier use of step-by-step hints was associated with lower achievement, largely mediated by self-reported help abuse; use of strategic help was not. The authors suggest fading step hints and emphasising strategic help and self-explanation ([Schulz & Voermanek 2025](https://doi.org/10.1016/j.caeo.2025.100247)). This is correlational, not a randomised comparison of hint types.
- Principle-based hints plus bottom-out hints are still worth having; bottom-out hints are a chance to prompt self-explanation ([Aleven et al. 2016](https://doi.org/10.1007/s40593-015-0089-1)). Older data showed 72% of actions were unproductive help-seeking ([Aleven et al.](https://doi.org/10.1184/r1/6470579)).
- Unsolicited partial worked steps placed in the workspace overcame help avoidance and helped low-proficiency students ([Maniktala et al. 2020](https://doi.org/10.1007/s40593-020-00213-3)). This is the "assistance dilemma" ([Koedinger & Aleven 2007](https://www.cs.cmu.edu/~aleven/Papers/2007/Koedinger_Aleven_EPR2007.pdf)).

## R7. AI-generated content, feedback and grading

- **Questions.** An iterative LLM critique-and-revise pipeline produced exam items that IRT analysis rated comparable to expert standardised items (91 classes, ~1,700 students; [Isley et al., AAAI 2026](https://ojs.aaai.org/index.php/AAAI/article/view/41205)). In medicine, GPT-4 items matched human difficulty and discrimination but had lower distractor efficiency than novice-written items, 39% vs 55% ([Wu et al. 2025](https://www.tandfonline.com/doi/full/10.1080/0142159X.2025.2513418)); another RCT found lower discrimination, 0.19 vs 0.25 ([BMC Med Ed 2026](https://link.springer.com/article/10.1186/s12909-026-09671-0)). Expert revisions of AI items focused mostly on distractors ([Gündeğer 2025](https://doi.org/10.21449/ijate.1674995)).
- **Grading.** Across 65 studies, LLM-human agreement on essays mostly ranged 0.30-0.80 (QWK or correlation), highly context-dependent ([Li et al. 2025](https://doi.org/10.48550/arxiv.2512.14561)). LLMs rank better than they assign absolute scores, and detailed hierarchical rubrics bring them close to human consistency ([Wang et al. 2025](https://doi.org/10.1016/j.caeai.2025.100481)). Biases vary by proficiency level ([Lee 2026](https://www.tandfonline.com/doi/full/10.1080/07380569.2026.2712300)).
- **Bias.** LLM feedback shifted with student attributes stated in the prompt: more praise and less substantive critique for students marked by race, language or disability ([Tan, Phalen & Demszky, LAK 2026](https://arxiv.org/abs/2603.12471)). Implicit signals in conversation history had similar effects ([2026 preprint](https://www.emergentmind.com/papers/2609.16993)).
- **Knowledge graphs.** LLMs extracted direct facts from textbooks with 85.5% accuracy but inferred links with only 65% ([Textbook2KG](https://doi.org/10.1109/icaide65466.2025.11189379)). Prerequisite annotation is hard even for trained humans ([PREAP protocol](https://iris.cnr.it/handle/20.500.14243/450158?mode=full)).
- **Multiple representations.** Learn Your Way (R1.1) transformed textbook chapters into immersive text, quizzes, slides, audio lessons and mind maps, adapted to grade level and interests, with learner choice.

## R8. Evaluating and engineering AI tutors

- **Pedagogy taxonomy.** Eight dimensions for responses to student mistakes: mistake identification, mistake location, revealing the answer, guidance, actionability, coherence, tone, human-likeness. GPT-4 revealed the answer about 47% of the time ([MRBench, NAACL 2025](https://aclanthology.org/2025.naacl-long.57/)).
- **Solving ≠ teaching.** Subject expertise and pedagogy trade off; tutoring quality drops in longer dialogues ([MathTutorBench](https://arxiv.org/html/2502.18940v1)). Pedagogically tuned models are preferred by experts ([LearnLM report](https://arxiv.org/abs/2412.16429); [arena for learning](https://arxiv.org/abs/2505.24477)).
- **Supervisor architecture.** A non-LLM policy core reads only trusted learner state (never the student's text) and sets a per-turn ceiling on an 8-rung help ladder. Deterministic detectors outrank LLM judgements; an LLM judge checks risky turns; replies are revised rather than refused, because over-refusal pushes learners to unguarded chatbots; one component writes learner state; everything is logged. Tuned with scripted student personas, re-scored by a stronger model ([Pisan 2026](https://arxiv.org/html/2608.12292)).
- **Answer leakage under pressure.** A tutor-plus-supervisor loop approved 3,028 of 3,235 drafts on the first try and fell back to guidance-only replies otherwise ([WCCCE 2026](https://dl.acm.org/doi/10.1145/3828792.3828794)). A RAG tutor with claim-level verification reached 9.8% leakage and 4.9% hallucination on an adversarial benchmark ([EduGuard 2026](https://arxiv.org/html/2607.15738v1)).
- **LLMs as raters of tutor moves** agreed with humans 73-89% on praise and error-response quality ([Thomas et al., EC-TEL 2025](https://dl.acm.org/doi/10.1007/978-3-032-03873-9_35)).

## R9. Products to learn from

- **Math Academy:** knowledge graph, adaptive diagnostic, mastery gating, FIRe spaced repetition, interleaved review (R4).
- **Duolingo:** Birdbrain difficulty targeting, A/B testing culture, generative AI conversation practice that raised self-reported self-efficacy ([Kittredge et al. 2025](https://doi.org/10.3389/feduc.2025.1499497)).
- **Eedi / ASSISTments:** misconception-focused diagnostics and validated feedback at scale (R1.1).
- **Gemini Guided Learning, ChatGPT study mode, Claude learning mode:** Socratic modes inside general assistants; only Google has trial evidence, and that was teacher-integrated (R1.3).
- **NotebookLM / Learn Your Way:** learning from your own sources, multiple representations.
- **Tutor CoPilot:** AI that coaches human tutors (R1.1).

## R10. Regulation, privacy, accessibility, standards (EU first)

### EU AI Act after the Digital Omnibus (Regulation (EU) 2026/1744, in force 27 July 2026)

- Since **2 Feb 2025**: prohibited practices, including **emotion recognition in workplaces and education institutions** (medical and safety uses excepted), harmful manipulation, and exploiting vulnerabilities such as age. AI literacy duty (Art. 4), reworded by the Omnibus to "measures supporting" literacy ([EPALE summary of Commission guidelines](https://epale.ec.europa.eu/en/content/commission-guidelines-prohibited-ai-practices-education); [Scolaize](https://www.scolaize.com/eu-ai-act-schools/)).
- **2 Aug 2026**: general application, including transparency obligations (Art. 50). **2 Dec 2026**: AI-generated content marking for systems already on the market ([Hunton](https://www.hunton.com/privacy-and-cybersecurity-law-blog/eu-digital-omnibus-on-ai-enters-into-force)).
- **2 Dec 2027**: Annex III high-risk obligations, which in education cover systems that (a) determine access or admission, (b) **evaluate learning outcomes, including when used to steer the learning process**, (c) assess the appropriate level of education, (d) monitor prohibited behaviour during tests, "in educational and vocational training institutions at all levels" ([Commission FAQ](https://digital-strategy.ec.europa.eu/en/faqs/navigating-ai-act); [European Parliament](https://www.europarl.europa.eu/news/en/press-room/20260427IPR42011/ai-act-deal-on-simplification-measures-ban-on-nudifier-apps); [Lumination](https://lumination.ai/eu-ai-act-for-schools/)). Obligations: risk management, data governance, logging, technical documentation, deployer information, human oversight, accuracy, robustness and cybersecurity. Deployers have their own duties ([UNIwise](https://uniwise.eu/resources/blog/the-eu-ai-act-and-assessment-december-2027-is-not-a-snooze-button)).
- **Reading for this project:** a consumer self-study app is arguably outside Annex III; selling to schools or universities brings an adaptive engine into 3(b). Commission classification guidelines are still pending. This needs legal review.

### Privacy, children, accessibility

- **GDPR** ([text](https://eur-lex.europa.eu/eli/reg/2016/679/oj)): DPIA for large-scale profiling (Art. 35); member-state age of digital consent between 13 and 16 (Art. 8); limits on solely automated decisions with significant effects (Art. 22); data portability (Art. 20).
- **US COPPA** (if serving US children under 13): amended rule effective 23 June 2025, compliance by 22 April 2026 ([Federal Register](https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule)).
- **European Accessibility Act**, applicable since 28 June 2025, covers consumer e-commerce services; German guidance treats paid online courses sold to consumers as in scope ([BFSG guide](https://www.bfsg-experte.de/en/blog/accessible-e-learning-platforms-courses/); [FromNine](https://www.fromnine.com/en/insights/european-accessibility-act-digital-services)). EN 301 549 V4.1.1 (Sept 2026) adopts WCAG 2.2 AA but is not yet the cited legal reference ([AccessibleEU](https://accessible-eu-centre.ec.europa.eu/content-corner/news/european-accessibility-standard-en-301-549-has-been-updated-2026-09-07_en)). Microenterprises providing services are exempt.

### Interoperability standards

LTI 1.3 Advantage (earlier versions unsupported since June 2022), OneRoster 1.2, Edu-API (Candidate Final as of Sept 2026), xAPI 2.0 with a learning record store, cmi5, QTI 3.0, CASE, CLR 2.0, Open Badges 3.0 on W3C Verifiable Credentials ([Selleo](https://selleo.com/blog/scorm-vs-xapi-vs-cmi5-vs-lti); [GAP](https://www.growthaccelerationpartners.com/blog/edtech-interoperability-lti-oneroster-edu-api-case-clr); [1EdTech](https://www.1edtech.org/blog/connecting-the-dots-making-sense-of-digital-credential-standards)). France's January 2026 decree requires these 1EdTech standards for secondary schools ([1EdTech](https://www.prnewswire.com/news-releases/france-advances-its-open-learning-vision-with-new-interoperability-decree-302668067.html)).

## R11. Model platform facts used for the cost model

Source: the Claude API reference bundled with Claude Code (cached 6 October 2026). Verify against Anthropic's pricing page before budgeting.

| Model | ID | Input / output per MTok | Notes |
|---|---|---|---|
| Claude Opus 5.5 | `claude-opus-5-5` | $4 / $20 | Cache reads $0.20; thinking always on, effort default `medium` |
| Claude Sonnet 5.5 | `claude-sonnet-5-5` | $2 / $10 | Cache reads $0.10 (corrected 27 October 2026 against the [live pricing page](https://platform.claude.com/docs/en/about-claude/pricing); the bundled reference said $0.20) |
| Claude Haiku 5.5 | `claude-haiku-5-5` | $0.10 / $0.50 | Prompts up to 100K tokens |
| Claude Fable 5.1 | `claude-fable-5-1` | $10 / $50 | Most capable |

- Batch API: 50% discount. Cache writes cost 1.25× base input (5-minute TTL) or 2× (1-hour TTL).
- `temperature`, `top_p` and `top_k` return errors from 21 October 2026, so grading consistency must come from rubrics, structured outputs and repeated judgements.
- Forced `tool_choice` is rejected on Opus 5.5 and Sonnet 5.5: use structured outputs or strict tools. Thinking blocks are bound to their conversation, so the tutor transcript must be append-only.
- Mid-conversation system messages add operator instructions without invalidating the cache, which suits a per-turn help contract.
- `inference_geo` offers `global` or `us`. EU-only processing needs Claude on Vertex AI (`eu` multi-region); Bedrock EU regions are a possible alternative that was not verified here. Check feature parity on either platform.

## R12. Evidence gaps that affect the plan

- Long-term retention (one month or more) and transfer are rarely measured; the plan has to measure them itself.
- Most strong results are in mathematics and physics, with K-12 or first-year students. Results for adult self-learners in other domains are thinner.
- Several key results are vendor-run (Google, Eedi) or preprints.
- Knowledge-graph-wide implicit repetition (FIRe) is documented by its developer, not independently evaluated.
- No public benchmark yet links tutor-pedagogy rubric scores to measured learning gains.
