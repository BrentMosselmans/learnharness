# Research brief 2: comprehension and mastery

Second research pass, 26 October 2026. The goal it serves: real comprehension and transferable skill, not memorised facts. Four research agents (Codex gpt-6.1-sol, high reasoning) searched in parallel with Exa, about 90 searches in total, on cognitive science, programming, networking and security, and language learning. Their reports were synthesised here. Three central claims were verified directly against the sources: the Anthropic coding-skills trial, the 2026 reflection trial and the 2026 Socratic-hints trial.

Effect sizes below come from different comparisons and outcomes, so they should not be ranked against each other. This brief complements [RESEARCH.md](RESEARCH.md); sections are referenced as M1 to M11.

## Top findings

1. **Mastery is several kinds of knowledge, each learned differently.** The Knowledge-Learning-Instruction (KLI) framework links knowledge types to three learning processes (memory and fluency, induction and refinement, understanding and sense-making) and to the instruction that fits each ([Koedinger, Corbett & Perfetti 2012](https://onlinelibrary.wiley.com/doi/10.1111/j.1551-6709.2012.01245.x)). Spaced flashcards suit facts, vocabulary and syntax. Concepts, procedures and causal models need comparison, worked examples, explanation and varied problems.
2. **Retrieval practice builds understanding only if the questions demand it.** Higher-order quizzes improved higher-order performance; fact-only quizzes did not ([Agarwal 2019](https://pdf.poojaagarwal.com/Agarwal_2019_JEdPsych.pdf)). Testing transfers to new questions (d=0.40), more so with successful retrieval and elaborated feedback ([Pan & Rickard 2018](https://pubmed.ncbi.nlm.nih.gov/29733621/)).
3. **Several techniques reliably build understanding:** self-explanation (g=0.55), comparing cases (d=0.50), worked examples (g=0.48) faded by concept, constructing concept maps (g=0.72), preparing to teach (g=0.48) and mastery learning (≈0.52 SD) (M2).
4. **More support is not automatically better.** Adding structured reflection to already detailed AI feedback doubled time on feedback, cut practice volume by 40% and never improved results ([Asher, Gold & Carvalho 2026](https://doi.org/10.1145/3774398.3811598)). Socratic AI hints made CS1 students slower, with more repeated errors and no long-term gain ([Liding et al. 2026](https://dl.acm.org/doi/10.1145/3770761.3777327)).
5. **AI help while learning a new library cost understanding.** In Anthropic's randomised trial, 52 developers learned an unfamiliar Python library. The AI group scored 17 percentage points lower on an immediate quiz, with no significant time saving. Developers who used AI for conceptual and follow-up questions kept more of their understanding ([Anthropic 2026](https://www.anthropic.com/research/AI-assistance-coding-skills); [paper](https://arxiv.org/html/2601.20245)).
6. **Explanations work best after your own attempt.** Correct LLM explanations beat bare answers, especially after an independent attempt (two preregistered RCTs, N=1,818; [Kumar et al. 2025](https://dlnext.acm.org/doi/10.1007/978-3-031-98459-4_5)).
7. **Practice in realistic environments builds complex skills.** Simulation-based learning: g=0.85 across 145 studies. Worked examples helped novices more; reflection helped learners with more prior knowledge more ([Chernikova et al. 2020](https://journals.sagepub.com/doi/full/10.3102/0034654320933544)).
8. **Troubleshooting is a reasoning skill:** causal models of the system plus a cycle of hypothesis generation, testing and interpretation ([Jonassen & Hung 2006](https://doi.org/10.1007/s10648-006-9001-8)).
9. **Language proficiency needs input, output, focused study and fluency practice together** ([Nation 2007](https://www.wgtn.ac.nz/lals/resources/paul-nations-resources/paul-nations-publications/publications/documents/2007-Four-strands.pdf)). Flashcards establish word knowledge efficiently, but much of it decays, and it is not the same as communicative ability ([Webb, Yanagisawa & Uchihara 2020](https://onlinelibrary.wiley.com/doi/10.1111/modl.12671)).
10. **Your own sense of mastery is unreliable.** Fluent performance during practice misleads ([Soderstrom & Bjork 2015](https://doi.org/10.1177/1745691615569000)); delayed self-judgements are far more accurate ([Rhodes & Tauber 2011](https://pubmed.ncbi.nlm.nih.gov/21219059/)).

---

## M1. Knowledge types and the activities that fit them

| Knowledge type | Examples | Activities that fit |
|---|---|---|
| Facts and associations | Port numbers, syntax, protocol header fields, vocabulary | Spaced retrieval, then use in real tasks |
| Concepts and distinctions | Authentication vs authorisation; TCP vs UDP; verb aspect | Examples and non-examples, case comparison, classification with justification, interleaving similar categories |
| Procedures and skills | Writing a recursive function; configuring OSPF; conjugating verbs | Worked example, then faded completion, then independent execution and debugging |
| Causal principles and mental models | How an event loop schedules work; why TCP backs off; how DNS caching behaves | Prediction, tracing, self-explanation, counterfactual questions, labelled concept maps |
| Integrated competence | Building a service; troubleshooting a network; holding a conversation | Varied problems and projects with fading support, then unaided transfer tasks |

- **Expertise** consists of organised schemas, chunks and knowing when a principle applies. Novices sort problems by surface features, experts by underlying principles ([Chi, Feltovich & Glaser 1981](https://doi.org/10.1207/s15516709cog0502_2); [How People Learn, ch. 2](https://nap.nationalacademies.org/resource/hpl/Chapter2.pdf)).
- **ICAP** (passive < active < constructive < interactive engagement) is a useful heuristic for designing activities ([Chi & Wylie 2014](https://www.tandfonline.com/doi/full/10.1080/00461520.2014.965823)), but its ordering is not universal ([Thurn et al.](https://pmc.ncbi.nlm.nih.gov/articles/PMC10652002/); [Wekerle et al. 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11250844/)). KLI is the better organising framework for choosing activities.

## M2. Activities that build understanding

| Activity | Evidence | Size | Conditions and caveats |
|---|---|---|---|
| Self-explanation prompts | [Bisra et al. 2018](https://gwern.net/doc/psychology/spaced-repetition/2018-bisra.pdf), 64 reports | g=0.55; ≈0.35 vs supplied explanations | Ask for causes and principles, not paraphrase. Can waste time when feedback is already rich (M3) |
| Elaborative interrogation ("why is this true?") | [Donoghue & Hattie 2021](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2021.581216/full) | d=0.56 | Mostly factual material; depends on prior knowledge |
| Comparing cases | [Alfieri, Nokes-Malach & Schunn 2013](https://www.tandfonline.com/doi/abs/10.1080/00461520.2013.775712) | d=0.50 | Better when learners look for similarities first and then receive the principle |
| Interleaving | [Brunmair & Richter 2019](https://pubmed.ncbi.nlm.nih.gov/31556629/) | g=0.42 overall; 0.34 math; -0.39 word lists | For telling similar categories apart, not for vocabulary lists |
| Worked examples | [Barbieri et al. 2023](https://link.springer.com/article/10.1007/s10648-023-09745-1), 55 studies | g=0.48 (math) | For unfamiliar procedures. Fading by concept beat fading by position for near and far transfer in a 10-week programming RCT ([Shin et al. 2023](https://link.springer.com/article/10.1007/s11409-023-09362-x)) |
| Higher-order retrieval | [Agarwal 2019](https://pdf.poojaagarwal.com/Agarwal_2019_JEdPsych.pdf); [Pan & Rickard 2018](https://pubmed.ncbi.nlm.nih.gov/29733621/) | Transfer d=0.40 | Needs successful retrieval and elaborated feedback |
| Concept mapping | [Schroeder et al. 2018](https://link.springer.com/article/10.1007/s10648-017-9403-9) | g=0.58 overall; constructing 0.72; studying 0.43 | Maps drawn from memory work as well as written recall ([Blunt & Karpicke 2014](https://doi.org/10.1037/a0035934)). These results do not automatically apply to radial "mind maps" |
| Preparing to teach | [Kobayashi 2024](https://link.springer.com/article/10.1007/s10648-024-09871-4) | g=0.48 with the expectation of teaching; -0.02 when teaching comes unexpectedly | Learners teaching an AI agent: feasible, not yet shown superior ([Rogers et al. 2025](https://dl.acm.org/doi/full/10.1145/3706598.3713644)) |
| Mastery learning | [Kulik et al. 1990](https://www.uky.edu/~gmswan3/575/kulik_kulik_Bangert-Drowns_1990.pdf), 108 evaluations | ≈0.52 SD | Costs more study time; self-paced versions sometimes lowered completion |
| Guided vs unguided discovery | [Alfieri et al. 2011](https://app.nova.edu/toolbox/instructionalproducts/edd8124/articles/2011-Alfieri_et_al.pdf) | Unassisted -0.38; assisted +0.30 | Do not leave the learner to discover alone |
| Summarising and imagining | [Lawson & Mayer 2024](https://doi.org/10.3389/fpsyg.2024.1452385) (RCTs); [imagination meta-analysis](https://journal.psych.ac.cn/xlkxjz/EN/10.3724/SP.J.1042.2023.02263) | Summarising d=0.48-0.54; imagination g=0.27-0.43 | Drawing did not help in the same RCTs |
| Project-based learning | [Zhang & Ma 2023](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2023.1202728/full) | SMD 0.65 overall; 0.12 at university level | Projects integrate skills; they do not replace instruction |

**Deliberate practice** as a label is oversold: in correlational data it explained about 4% of variance in educational performance ([Macnamara et al. 2014](https://www.psychologie.uzh.ch/dam/jcr:658d39fe-2f4b-467f-9ae2-ffeb25caf2b6/McNamara.PsychSci.25.2014.pdf)). The mechanism still holds: focused practice at the edge of ability, with feedback.

## M3. When more support backfires

- **Reflection on top of rich feedback.** Structured self-explanation prompts added to detailed AI feedback in Python practice doubled time on feedback, cut practice volume by 40% and never improved any measure. Both practice conditions beat a high-quality video by d=0.66-0.93 ([Asher et al. 2026](https://doi.org/10.1145/3774398.3811598)).
- **Socratic hints for novices.** Over two semesters (RCT, 178 CS1 students), Socratic hints led to more time, more attempts and more repeated errors than targeted hints, with no evidence of better long-term outcomes ([Liding et al. 2026](https://dl.acm.org/doi/10.1145/3770761.3777327)).
- **No overall effect of LLM access** in two preregistered experiments; the "complement vs substitute" pattern was exploratory ([Lehmann et al. 2025](https://arxiv.org/abs/2409.09047)).
- **Expertise reversal.** Support that helps novices becomes redundant or harmful as competence grows ([Kalyuga et al. 2003](https://doi.org/10.1207/s15326985ep3801_4)).
- **Prompting in simulations** was associated with smaller effects; examples help novices, reflection helps the more advanced ([Chernikova et al. 2020](https://journals.sagepub.com/doi/full/10.3102/0034654320933544)).

**Design rule:** adapt support to demonstrated competence. Prefer more practice-and-feedback cycles over mandatory reflection. Use explanation prompts at chosen moments (a conceptual error, the end of a unit), not after every step.

## M4. Programming

**How expertise develops**
- Experts have a model of how programs execute (the "notional machine") plus reusable programming plans ([Sorva 2013](https://doi.org/10.1145/2483710.2483713); [Soloway & Ehrlich 1984](https://doi.org/10.1109/tse.1984.5010283)).
- Tracing, explaining and writing code are separable abilities. Successful writers can generally trace and explain, but this does not prove a required order ([Lister 2011](http://hdl.handle.net/10453/17580); [Lister et al. 2009](https://dl.acm.org/doi/10.1145/1562877.1562930)). The sequence trace -> syntax -> templates -> writing with templates is a useful hypothesis from a nine-person study ([Xie et al. 2019](https://faculty.washington.edu/ajko/papers/Xie2019IntroCSTheoryOfInstruction.pdf)).
- **Experienced developers in a new language** import familiar plans that block the new language's idioms ([Scholtz & Wiedenbeck 1990](https://www.tandfonline.com/doi/abs/10.1080/10447319009525970)). For Rust ownership, an explicit permissions model with visualisations raised inventory scores from 48% to 57% (d=0.56, n=342, before/after) ([Crichton et al. 2023](https://doi.org/10.1145/3622841)).

**Techniques**
- Explicit tracing strategy (line-by-line with a memory table): about 15% higher tracing scores in a small RCT (n=24) ([Xie et al. 2018](https://doi.org/10.1145/3159450.3159527)).
- PRIMM (Predict, Run, Investigate, Modify, Make): small positive effect, r=0.13, in a school quasi-experiment with 673 pupils ([Sentance et al. 2019](https://doi.org/10.1080/08993408.2019.1608781)).
- Parsons problems: faster practice than writing code with no detected loss in learning ([Ericson et al. 2018](https://doi.org/10.1145/3230977.3231000)); plausible distractors added 11 points on immediate scores ([Smith et al. 2024](https://doi.org/10.1145/3632620.3671114)).
- Subgoal labels: better weekly quizzes and persistence; final exams 75% vs 72%, not significant ([Margulieux et al. 2020](https://link.springer.com/article/10.1186/s40594-020-00222-7)).
- Debugging instruction: promising, but strategy use often fades once scaffolds go ([review of 43 papers, 2024](http://www.eleanorourke.com/papers/decoding_debugging_instruction.pdf)).
- Null results: concrete vs abstract notional-machine diagrams made no difference ([Chiarelli et al. 2023](https://doi.org/10.1145/3568813.3600119)); syntax drills were no better than extra programming problems ([Isenegger et al. 2025](https://dl.acm.org/doi/abs/10.1145/3702652.3744230)); mastery learning in CS shows mixed results ([review](https://doi.org/10.1145/3286960.3286965)).

**AI coding assistants and learning**
- Anthropic's trial (finding 5 above). The interaction patterns within it were observational, sometimes only 2 to 7 people per pattern.
- Novices using AI to write code, followed by mandatory manual modification, showed no loss on unaided tests a week later ([Kazemitabaar et al. 2023](https://dl.acm.org/doi/abs/10.1145/3544548.3580919)).
- In a 275-student concurrency course, both ChatGPT and a scaffolded AI tutor raised exercise performance without raising knowledge gains ([Bassner et al. 2025](https://doi.org/10.1016/j.caeai.2025.100537)).
- Struggling students accepted misleading suggestions and developed an illusion of competence ([Prather et al. 2024](https://dl.acm.org/doi/fullHtml/10.1145/3632620.3671116)).
- A 2026 meta-analysis (35 studies) reports small-to-medium positive effects with unresolved moderators ([Wu & Ouyang 2026](https://link.springer.com/article/10.1007/s10648-026-10211-x)).

## M5. Networking

- **Virtual is fine for concepts.** Physical vs virtual investigation showed no significant difference for conceptual learning (g=-0.14, 35 studies), and adults did better with virtual labs ([Muilwijk & Lazonder 2023](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2023.1163024/full)). Engineering virtual labs: g=0.69 across mixed outcomes ([Li & Liang 2024](https://doi.org/10.1371/journal.pone.0316269)).
- **Tools.** The Packet Tracer literature is mostly about usability and adoption ([Asadi et al. 2024](https://doi.org/10.1007/s10639-024-12476-7)). No convincing controlled learning evidence was found for GNS3, Mininet or containerlab, so choose tools by learning objective ([Mininet](https://mininet.org/), [containerlab](https://containerlab.dev/)).
- **Troubleshooting.** For networks, the PHyTeR model has four phases: understand the problem space, generate hypotheses, test them, interpret results ([design-based research](https://www.cse.iitb.ac.in/~sri/students/kavya-thesis.pdf)). Anchored instruction improved near transfer only ([Hochholdinger & Schaper](https://kops.uni-konstanz.de/server/api/core/bitstreams/9875c9ef-c95b-4712-ab83-b53b48877617/content)). Displays that supported diagnostic strategy improved accuracy and six-week retention ([Linou & Kontogiannis](https://doi.org/10.1207/s15327590ijhc1801_4)).
- **Mental models.** Students' networking knowledge was organised around equipment; instructors' knowledge around layering ([DiCerbo 2007](http://www.jite.org/documents/Vol6/JITEv6p263-277DiCerbo252.pdf)). Understandings of protocols varied widely ([Berglund & Lister](https://opus.lib.uts.edu.au/bitstream/10453/7448/1/2006009586.pdf)). No validated networking concept inventory was found.
- **Practical material.** Kurose and Ross's Wireshark labs cover the main protocols ([labs](https://gaia.cs.umass.edu/kurose_ross/wireshark.php)).

## M6. Cybersecurity

- **Concept assessment exists.** The CATS project validated the Cybersecurity Concept Inventory (354 students, 29 institutions) and the Curriculum Assessment, 25 scenario questions each ([CCI](https://par.nsf.gov/servlets/purl/10290864); [CCA](https://cisa.umbc.edu/validation-of-the-cybersecurity-curriculum-assessment/)). Misconceptions found in interviews ([study](https://doi.org/10.62915/2472-2707.1030); [examples](https://arxiv.org/html/1706.05092)):
  - encryption assumed to guarantee integrity
  - authentication confused with authorisation, and hashing with encryption
  - biometrics assumed always stronger
  - client-side defences assumed sufficient
- **CTFs** engage people, but the evidence that they build lasting competence is very weak. An October 2026 systematic review rated engagement evidence "low" and competence, retention and transfer evidence "very low" ([review](https://doi.org/10.20897/ejsteme/19494)).
- **Cyber ranges.** A better-scaffolded range interface shortened training and improved the experience, with the same knowledge outcomes (RCT, N=144) ([T1GER, CHI 2026](https://doi.org/10.1145/3772318.3791226)).
- **Adversarial thinking.** Two hours of game theory improved strategic anticipation (pre/post study); transfer to operational security is unproven ([Hamman et al.](https://doi.org/10.1109/te.2016.2636125)).
- **LLMs.** Across 142,526 student queries on 396 challenges, short, proactive conversations correlated with completion more than reactive debugging loops did (observational) ([2026 preprint](https://arxiv.org/html/2602.17448)). AI-generated attack scenarios matched historical attack stages only 10 to 24% of the time ([ASCERT 2025](https://link.springer.com/article/10.1007/s10207-025-01179-w)).
- **Structure.** Three frameworks can structure the knowledge graph; none is a validated learning sequence:
  - [CyBOK 1.2.0](https://www.cybok.org/wp-content/uploads/CyBOK_v1.2.0.pdf) (September 2026) for knowledge areas
  - [NICE Framework](https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center/nice-framework-current-versions) for tasks, knowledge and skills
  - [MITRE ATT&CK](https://attack.mitre.org/) for adversary techniques
- **Boundaries.** Practise offensive techniques only in isolated, resettable labs or on platforms that authorise it:
  - [OWASP WebGoat](https://owasp.org/www-project-webgoat/) (bound to localhost)
  - [PortSwigger Web Security Academy](https://portswigger.net/web-security)
  - [pwn.college](https://pwn.college/)

  Testing systems you do not own is governed by local law; Belgium's rules, for example, are conditional ([CCB](https://ccb.belgium.be/cert/vulnerability-reporting-ccb)).

## M7. Language learning

- **Four strands** ([Nation 2007](https://www.wgtn.ac.nz/lals/resources/paul-nations-resources/paul-nations-publications/publications/documents/2007-Four-strands.pdf)):
  - meaning-focused input (material with 95-98% familiar words)
  - meaning-focused output
  - language-focused learning
  - fluency development

  Equal time across the four is a planning baseline, not a proven optimum.
- **Theory.** Input, interaction and output are complementary ([Loewen & Sato 2018](https://www.cambridge.org/core/journals/language-teaching/article/interaction-and-instructed-second-language-acquisition/78A156EE200F744F5978F99BFB073DBE)). Knowing a rule and using it automatically are different stages that need meaningful practice ([DeKeyser & Suzuki 2025](https://yuichisuzuki.net/wp-content/uploads/2025/07/PreprintDeKeyser-R.-M.-Suzuki-Y.-2025.-Skill-acquisition-theory.-In-B.-VanPatten-G.-D.-Keating-S.-Wulff-Eds.-Theories-in-second-language-acquisition-An-introduction-4th-ed.-pp.-157-182-.pdf)).

| Practice | Evidence | Size |
|---|---|---|
| Task-based programmes | [Bryfonski & McKay 2019](https://doi.org/10.1177/1362168817744389) | d=0.93 |
| Explicit vs implicit instruction | [Spada & Tomita 2010](https://imblingo.weebly.com/uploads/4/6/5/1/46518669/spada_et_al-2010-language_learning.pdf) | Explicit 0.73 / 0.88, implicit 0.33 / 0.39 (simple / complex forms) |
| Corrective feedback | [Lyster & Saito 2010](http://kazuyasaito.net/SSLA2010.pdf); [Li 2010](https://onlinelibrary.wiley.com/doi/full/10.1111/j.1467-9922.2010.00561.x) | d=0.74 overall; prompts 0.83, explicit 0.84, recasts 0.53 |
| Extensive reading | [Jeon & Day 2016](https://files.eric.ed.gov/fulltext/EJ1117026.pdf) | d=0.57 |
| Flashcards and other intentional vocabulary study | [Webb et al. 2020](https://onlinelibrary.wiley.com/doi/10.1111/modl.12671) | Meaning recall 60% immediately, 39% delayed; form recall 59% to 25% |
| Incidental vocabulary from input | [Webb et al. 2023](https://doi.org/10.1017/s0261444822000507) | 9-18% immediate, 6-17% delayed |
| 4/3/2 fluency practice | [de Jong & Perfetti 2011](https://sites.pitt.edu/~perfetti/PDF/de%20Jong%20Language%20Learning.pdf) | Gains kept only when the topic was repeated |
| Pronunciation instruction / ASR feedback | [Saito & Plonsky 2019](https://onlinelibrary.wiley.com/doi/full/10.1111/lang.12345); [Ngo et al. 2023](https://doi.org/10.1017/s0958344023000113) | d=0.68 / g=0.69 |
| Spacing for grammar | [Kim & Webb 2022](https://doi.org/10.1111/lang.12479) | Medium to large; equal and expanding schedules equivalent |
| Chatbot conversation practice | [Lyu et al. 2025](https://onlinelibrary.wiley.com/doi/full/10.1111/ijal.12668); [Hou & Min 2025](https://doi.org/10.1017/s0958344025100268) | g≈0.61 |
| Duolingo video call | [Vendor RCT 2025](https://duolingo-papers.s3.amazonaws.com/reports/Duolingo_whitepaper_language_video_call_improves_speaking_2025.pdf) | +2 points on a speaking test; the treatment group studied about 4 hours more |

**Caveats.**
- Retrieval practice of grammar examples did not transfer to judging novel sentences ([Pélissier 2026](https://maudpelissier.com/talk/learning-from-examples-testing-the-benefits-of-retrieval-practice-for-l2-grammar-acquisition/2026_BMS.pdf)).
- AI conversation improved oral proficiency without reducing anxiety ([Huang & Kakham 2026](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2026.1799269/full)).
- ChatGPT writing feedback did not improve grammatical accuracy ([Kang 2025](https://doi.org/10.18649/jkees.2025.24.3.1)) and sometimes invented mistakes ([Pérez Hernández 2025](https://doi.org/10.5565/rev/jtl3.1338)).
- Evidence for shadowing is limited ([Whitworth & Rose 2025](https://www.tandfonline.com/doi/full/10.1080/29984475.2025.2546827)).

**Measuring proficiency**
- CEFR can-do descriptors, kept as separate profiles for reception, production, interaction and mediation ([CEFR Companion Volume](https://rm.coe.int/cefr-companion-volume-with-new-descriptors-2020/16809ea0d4)).
- Monthly recordings of unfamiliar speaking tasks.
- Listening tests with unfamiliar speakers, without a transcript.
- Elicited imitation tests, which correlate r=.66 with other proficiency measures ([Kostromitina & Plonsky](https://doi.org/10.1017/s0272263121000395)).
- Occasional conversations with a human.

## M8. Metacognition for a solo learner

- **Learning is not the same as performance.** Smooth performance during practice is a poor guide to what you will remember ([Soderstrom & Bjork 2015](https://doi.org/10.1177/1745691615569000)).
- **Delay your self-judgements.** Judging your learning after a delay greatly improves the accuracy of telling known from unknown items (g=0.93), though it does not improve memory itself ([Rhodes & Tauber 2011](https://pubmed.ncbi.nlm.nih.gov/21219059/)).
- **Self-regulation can be trained.** Training in planning and monitoring improved university performance (g=0.37), more so with feedback and learning logs ([Theobald 2021](https://doi.org/10.1016/j.cedpsych.2021.101976)).
- **What the system should do:**
  - set observable targets
  - ask for a prediction and a confidence rating before checking an answer
  - schedule delayed self-tests
  - keep an error log
  - show how well your confidence matches your results

## M9. Using AI for understanding: what helped and what hurt

| Helped | Hurt or no gain |
|---|---|
| Explanations after an independent attempt (Kumar et al. 2025) | Delegating code writing and debugging to AI (Anthropic 2026, observational patterns) |
| Asking conceptual and follow-up questions while coding yourself (Anthropic 2026) | Reactive "paste error, get fix" loops ([2026 CTF study](https://arxiv.org/html/2602.17448)) |
| AI-written code followed by mandatory manual modification (Kazemitabaar et al. 2023) | AI that raised exercise scores but not knowledge (Bassner et al. 2025) |
| Active practice with AI feedback rather than watching video (Asher et al. 2026) | Socratic hints for novices (Liding et al. 2026); reflection layered on rich feedback (Asher et al. 2026) |
| AI used to explain rather than to write ([Contractor & Reyes 2026](https://docs.iza.org/dp18792.pdf), RESEARCH.md R1) | Invented grammar errors in AI feedback (Pérez Hernández 2025) |

## M10. Assessing comprehension

Mastery needs delayed, unaided performance on changed tasks. Assistance is recorded separately from correctness. Transfer distance is stated explicitly (domain, time, context, modality) instead of calling every new question "far transfer" ([Barnett & Ceci 2002](https://pdf.retrievalpractice.org/transfer/Barnett_Ceci_2002.pdf)).

| Domain | Unaided checks of understanding |
|---|---|
| Programming | Trace intermediate states and justify output; explain purpose, invariants and edge cases in plain English; Parsons, then modify, then write an unfamiliar variant; diagnose a seeded bug and add a regression test; review a diff for behaviour changes; [SCS1](https://www.sci.sdsu.edu/crmse/msed/papers/parker2-parker-guzdial-engleman_SCS1.pdf) as a baseline only |
| Networking | Predict packet flows before capturing; explain encapsulation across hops; troubleshoot an unseen fault on a changed topology, with hypotheses and tests recorded |
| Security | CCI/CCA-style scenario questions; threat-model a system (assets, trust boundaries, adversary, mitigations); exploit, then detect, fix and retest |
| Language | CEFR can-do tasks; recorded unfamiliar speaking tasks; listening to unfamiliar speakers without a transcript; elicited imitation |

## M11. Implications for the design

These are proposals for plan version 0.3, not a validated package.

1. **Track several mastery dimensions per KC**: recall, procedural independence, conceptual explanation and transfer, plus how much help was used. A single "mastered" flag is not enough, and spaced flashcards only apply to fact-type KCs.
2. **Pick activities by knowledge type** (M1). Each KC has a type, and the planner chooses from activity templates suited to it.
3. **Default cycle for a new concept**:
   - diagnose
   - predict or attempt
   - explanation or worked example (after the attempt)
   - compare contrasting cases
   - faded completion
   - independent problem
   - "explain why"

   Later come a transfer task on a changed problem and interleaved review of similar concepts.
4. **Tutor behaviour.**
   - Give targeted explanations after an attempt and ask conceptual follow-up questions.
   - No default Socratic questioning for novices, and no default full solutions.
   - Generated code serves as a worked example that you must modify and rebuild yourself.
   - Reflection prompts only at chosen moments.
   - Support fades as competence grows.
5. **Labs for networking and security.**
   - Emulated or containerised labs with deterministic checks.
   - Fault injection for troubleshooting practice.
   - Packet analysis.
   - Build, break, then defend and retest.
   - Offensive work only in isolated labs.
6. **A four-strand weekly plan for language learning**:
   - AI conversation tasks
   - corrective feedback after fluency periods, not during them
   - validated graded input
   - ASR pronunciation work
   - monthly recorded speaking benchmarks
7. **Metacognition.** Predictions and confidence before checking, delayed unaided checkpoints, an error log, and calibration feedback.
8. **Evaluation with one learner.** Measure learning per hour and delayed transfer. Compare methods within your own learning, for example by alternating techniques across comparable topics.

## Gaps

- The best activity mix for one adult studying independently over months is unknown.
- Delayed transfer in security is barely studied.
- No study tests Claude specifically as a tutor in these domains.
- Language-learning evidence outside English as the target language is thinner.
- How much explanation or reflection is worth its time cost is still open.

These are things the system will have to measure for you.
