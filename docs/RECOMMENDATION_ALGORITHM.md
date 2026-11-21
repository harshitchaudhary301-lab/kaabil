# KAABIL — Recommendation Algorithm & Mathematical Specification (Docs)

## 1. Algorithmic Overview

The KAABIL Career Compatibility Algorithm evaluates the degree of alignment between a student's self-reported profile, academic background, demonstrated skills, and the requirements of career pathways across all 13 educational streams.

It is explicitly defined as a **Provisional Heuristic Matching Model**, not a psychometric aptitude guarantee.

---

## 2. Multi-Factor Scoring Formula

The total compatibility score $C \in [0, 100]$ is computed as the weighted sum of 5 independent factor alignments:

$$C = W_I \cdot S_I + W_E \cdot S_E + W_S \cdot S_S + W_G \cdot S_G + W_P \cdot S_P$$

Where the factor weights are fixed and transparent:

| Factor | Notation | Weight ($W$) | Maximum Points | Factor Focus |
| :--- | :---: | :---: | :---: | :--- |
| **Interests & Passion** | $S_I$ | 30% | 30 | Keyword and semantic overlap between student curiosity and career domain |
| **Stream & Subjects** | $S_E$ | 20% | 20 | Direct prerequisite match, NEP 2020 multi-disciplinary compatibility, or bridge requirements |
| **Skill Genome Alignment**| $S_S$ | 20% | 20 | Match between student skills and career benchmark skills (penalizes unverified self-reports) |
| **Career Ambitions** | $S_G$ | 20% | 20 | Alignment with target roles, work environment, and economic ceiling |
| **Learning Preferences** | $S_P$ | 10% | 10 | Alignment with duration appetite, preferred study pace, and language |

---

## 3. Mathematical Factor Computations

### Factor 1: Interest Alignment ($S_I$, Max 30 pts)
Let $I_{student}$ be the set of interests indicated by the student, and $I_{career}$ be the domain keywords associated with the career path.
$$S_I = 30 \times \min\left(1.0, \frac{|I_{student} \cap I_{career}|}{\max(1, \min(3, |I_{career}|))}\right)$$

### Factor 2: Stream & Educational Alignment ($S_E$, Max 20 pts)
- **Direct Stream Match**: If $Stream_{career} = PrimaryStream_{student}$, $S_E = 20$.
- **Secondary Stream Match**: If $Stream_{career} \in SelectedStreams_{student}$, $S_E = 16$.
- **Interdisciplinary / Universal Stream**: If $Stream_{career} \in \{LAW, MANAGEMENT, INTERDISCIPLINARY\}$, $S_E = 15$.
- **Bridge Required**: If switching streams (e.g. Commerce to PCM), $S_E = 8$.

### Factor 3: Skill Genome Alignment ($S_S$, Max 20 pts)
Let $K_{benchmark}$ be the benchmark skills required for the career.
For each matching skill $k$:
- Novice / Beginner: 1.0 point
- Intermediate: 2.0 points
- Proficient / Expert: 3.0 points
- **Self-Reported vs Verified Distinction**: Unverified self-reported skills are weighted at $0.6\times$ value. Verified assessment credentials receive full $1.0\times$ value.
$$S_S = 20 \times \min\left(1.0, \frac{\sum_{k \in Matched} Weight(k)}{\sum_{b \in K_{benchmark}} MaxWeight(b)}\right)$$

### Factor 4: Career Ambitions ($S_G$, Max 20 pts)
Evaluates target industry role, work environment preference (clinical, corporate, field, lab, studio), and compensation ceiling expectations.

### Factor 5: Learning Preferences ($S_P$, Max 10 pts)
Evaluates alignment between the student's study duration appetite (e.g., 1-2 year vocational vs 5.5-year MBBS) and the career's statutory training duration.

---

## 4. Score Categorization & Boundaries

Raw scores are clamped to a healthy realistic bound $[25, 98]$ to prevent false perfection:

- **$\ge 80\%$ — Strong Fit (`STRONG_FIT`)**: High direct alignment with current subjects and natural curiosities.
- **$65\% - 79\%$ — Good Fit (`GOOD_FIT`)**: Solid alignment; minor skill acquisition required.
- **$50\% - 64\%$ — Exploratory Fit (`EXPLORATORY_FIT`)**: Interdisciplinary potential under NEP 2020.
- **$< 50\%$ or Cross-Stream — Bridge Required (`BRIDGE_REQUIRED`)**: Demands additional bridge coursework (e.g., NIOS biology, foundation math).

---

## 5. Continuous Calibration & Feedback Loop

Student feedback is collected via `POST /api/student/recommendations/feedback` (`POSITIVE`, `NEUTRAL`, `NEGATIVE`). These data points are stored in `RecommendationFeedback` to calibrate feature weights in future model releases.
