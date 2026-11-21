# KAABIL Gemini AI Integration Guide
**Document ID:** DOC-D1-02  
**Product:** KAABIL (काबिल) — AI-Powered Universal Career Ecosystem  
**Model:** Google Gemini 2.0 Flash (`gemini-2.0-flash`)  
**Status:** Implemented & Verified  

---

## 1. Overview & Architecture

KAABIL incorporates Google DeepMind's **Gemini 2.0 Flash** model as its Layer 3 Generative AI tier. Gemini is utilized across two core student experiences:
1. **AI Career Discovery & Explanations (`/student/discover`)**: Synthesizing multi-dimensional career rationale.
2. **Universal AI Career Mentor (`/student/mentor`)**: Trilingual conversational guidance, career planning, and actionable proposal generation.

---

## 2. Environment Configuration

The Gemini integration is managed via standard, secure private environment variables in `.env`:

```env
# Google Gemini Generative AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
AI_FEATURE_ENABLED=true
```

### Safety & Graceful Fallback Contract
If `GEMINI_API_KEY` is not present, or if the environment variable `AI_FEATURE_ENABLED=false`, the platform **never throws unhandled exceptions or crashes**. Instead, both `GeminiCareerService` and `AiMentorService` gracefully activate the deterministic rule engine, logging transparently:

```json
{
  "feature": "AI_CAREER_MENTOR",
  "source": "kaabil_deterministic_mentor",
  "status": "FALLBACK",
  "reason": "GEMINI_API_KEY unconfigured or request timeout exceeded"
}
```

---

## 3. SLA, Timeouts & Retry Policy

1. **Strict 8-Second SLA:**
   - Every Gemini API invocation is wrapped in a `Promise.race` with an 8,000 ms timeout.
   - If network latency or API congestion exceeds 8 seconds, the request aborts instantly and returns deterministic guidance without blocking the student UI.
2. **Deterministic Fallback Engine:**
   - High-quality, stream-specific, and language-specific fallback templates cover all 13 educational streams in English, Hindi, and Hinglish.
3. **Token Management & Rate Limits:**
   - System prompts are tightly constrained (< 400 tokens).
   - Maximum output tokens capped at 600 tokens per consultation message to ensure crisp, digestible responses for high-school and college students.
   - Client-side rate-limiting prevents spam or quota exhaustion.

---

## 4. Verification & Testing

Unit tests in `src/__tests__/mentor.test.ts` verify:
- Deterministic fallback under unconfigured environment keys.
- Live context generation and injection into prompt templates.
- Trilingual output structure (English, Hindi, Hinglish).
- Structured actionable proposal detection.
