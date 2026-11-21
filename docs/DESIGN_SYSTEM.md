# DESIGN_SYSTEM.md — Visual Tokens & Component Guidelines

## Project: KAABIL (काबिल)
**Design Philosophy:** Bright, Premium, Trustworthy, Modern SaaS  
**Visual Style:** Clean White & Soft Slate with Elegant Royal Blue and Purple Accents  
**Target Compliance:** WCAG 2.1 Level AA Accessibility  

---

## 1. Visual Philosophy & Aesthetic Directives

KAABIL is built to inspire trust, clarity, and ambition across students, parents, educators, and corporate hiring managers.

### Core Visual Directives:
- **Bright & Professional**: Pristine slate backgrounds (`#F8FAFC`) with elevated white cards (`#FFFFFF`).
- **Generous White Space**: Relaxed padding (24px–32px on cards) and uncluttered visual hierarchy.
- **Subtle Glassmorphism**: Translucent headers and floating pills with gentle backdrop blur (`backdrop-blur-md bg-white/80`).
- **Refined Gradients**: Distinct blue-to-purple gradients representing aspiration and future growth.
- **Strictly Prohibited Styles**:
  - ❌ Dark cyberpunk or terminal-style aesthetics.
  - ❌ Heavy, neon gamer glows.
  - ❌ Generic, amateur "college hackathon" templates.
  - ❌ Jarring, motion-sickness-inducing parallax or continuous bouncing elements.

---

## 2. Color Palette & Semantic Tokens

### 2.1 Core Brand Palette
| Token Name | Hex Code | Tailwind Class | Semantic Purpose |
| :--- | :--- | :--- | :--- |
| **Background** | `#F8FAFC` | `bg-slate-50` / `bg-background` | Universal page canvas, gentle on eyes |
| **Surface / Card** | `#FFFFFF` | `bg-white` / `bg-card` | Container for modules, widgets, cards |
| **Primary** | `#4169E1` | `bg-primary` (Royal Blue) | Main CTA buttons, active tabs, brand focus |
| **Secondary** | `#7952D9` | `bg-secondary` (Deep Iris Purple) | Secondary actions, badges, gradients |
| **Accent** | `#38BDF8` | `bg-accent` (Sky Blue) | Highlights, metric rings, glowing accents |
| **Primary Text** | `#172033` | `text-slate-900` / `text-foreground` | High-contrast body text and titles |
| **Secondary Text** | `#64748B` | `text-slate-500` / `text-muted` | Supporting copy, captions, timestamps |
| **Border** | `#E8ECF4` | `border-slate-200` / `border-border` | Subtle structural division |

### 2.2 Semantic State Tokens
- **Success**: Emerald (`#10B981`) — Verified skills, passed benchmarks, completed milestones.
- **Warning**: Amber (`#F59E0B`) — Remediation recommended, upcoming deadlines, skill gaps.
- **Error / Danger**: Rose (`#EF4444`) — Verification failed, missing prerequisites, critical errors.
- **Information**: Sky (`#0284C7`) — Helpful tips, exam schedules, guide notes.

### 2.3 Educational Stream Badge Tokens
To allow instant visual differentiation across streams without breaking the unified palette:
| Stream | Badge Background | Badge Text & Border |
| :--- | :--- | :--- |
| **Medical & Healthcare (PCB)** | `#ECFDF5` (Emerald-50) | `#047857` (Emerald-700) |
| **Non-Medical / STEM (PCM)** | `#EFF6FF` (Blue-50) | `#1D4ED8` (Blue-700) |
| **Commerce & Finance** | `#EEF2FF` (Indigo-50) | `#4338CA` (Indigo-700) |
| **Arts & Humanities** | `#FFFBEB` (Amber-50) | `#B45309` (Amber-700) |
| **Law & Legal Studies** | `#FAF5FF` (Purple-50) | `#7E22CE` (Purple-700) |
| **Management & Business** | `#F0FDF4` (Green-50) | `#15803D` (Green-700) |
| **Creative Arts & Design** | `#FDF2F8` (Pink-50) | `#BE185D` (Pink-700) |
| **Agriculture & Food Tech** | `#F7FEE7` (Lime-50) | `#4D7C0F` (Lime-700) |
| **Vocational & ITI Trades** | `#FFF7ED` (Orange-50) | `#C2410C` (Orange-700) |
| **Sports & Physical Ed** | `#ECFEFF` (Cyan-50) | `#0E7490` (Cyan-700) |
| **Hospitality & Culinary** | `#FEF2F2` (Rose-50) | `#B91C1C` (Rose-700) |
| **Undecided / Discovery** | `#F8FAFC` (Slate-50) | `#475569` (Slate-600) |

---

## 3. Typography Scale & Font Configuration

- **Heading Font**: `Plus Jakarta Sans`, sans-serif (Weights: 600 SemiBold, 700 Bold, 800 ExtraBold).
- **Body Font**: `Inter`, sans-serif (Weights: 400 Regular, 500 Medium, 600 SemiBold).
- **Code / Metrics Font**: `JetBrains Mono`, monospace (Weights: 500 Medium).

```css
/* Typography Scale Hierarchy */
--font-display-2xl: 4.5rem;   /* 72px / Line Height: 1.1 - Hero Headlines */
--font-display-xl:  3.75rem;  /* 60px / Line Height: 1.15 */
--font-display-lg:  3.0rem;   /* 48px / Line Height: 1.2  - Section Headers */
--font-title-lg:    2.0rem;   /* 32px / Line Height: 1.25 - Portal Dashboard Headers */
--font-title-md:    1.5rem;   /* 24px / Line Height: 1.3  - Card Headers */
--font-title-sm:    1.25rem;  /* 20px / Line Height: 1.4  - Sub-headers */
--font-body-lg:     1.125rem; /* 18px / Line Height: 1.6  - Intro Paragraphs */
--font-body-md:     1.0rem;   /* 16px / Line Height: 1.5  - Standard Body */
--font-body-sm:     0.875rem; /* 14px / Line Height: 1.4  - Metadata & Captions */
--font-caption:     0.75rem;  /* 12px / Line Height: 1.3  - Badges & Timestamps */
```

---

## 4. Elevation, Shadows, Borders & Radii

### 4.1 Border Radii
- **Cards & Modals**: `rounded-2xl` (`16px` to `20px`)
- **Pills & Buttons**: `rounded-xl` (`12px`) or `rounded-full` (`9999px`)
- **Inputs & Dropdowns**: `rounded-xl` (`12px`)

### 4.2 Layered Soft Shadows
```css
/* Tailwind custom shadow values */
shadow-soft-xs: 0 1px 2px 0 rgba(16, 24, 40, 0.04);
shadow-soft-sm: 0 2px 4px -1px rgba(16, 24, 40, 0.06), 0 1px 2px -1px rgba(16, 24, 40, 0.04);
shadow-soft-md: 0 4px 8px -2px rgba(16, 24, 40, 0.06), 0 2px 4px -2px rgba(16, 24, 40, 0.04);
shadow-soft-lg: 0 12px 16px -4px rgba(16, 24, 40, 0.08), 0 4px 6px -2px rgba(16, 24, 40, 0.03);
shadow-soft-xl: 0 20px 24px -4px rgba(16, 24, 40, 0.08), 0 8px 8px -4px rgba(16, 24, 40, 0.03);
```

### 4.3 Borders
- Card Border: `border border-[#E8ECF4]` (subtle, clean separation against `#F8FAFC`).
- Focus Ring: `ring-2 ring-[#4169E1] ring-offset-2 ring-offset-white`.

---

## 5. UI Component Specifications

### 5.1 Buttons
- **Primary CTA**: Royal Blue background (`#4169E1`), white text, subtle hover lift (`translate-y-[-1px] shadow-soft-md`), active press (`translate-y-[0]`).
- **Gradient Accent CTA**: Blue-to-purple gradient (`bg-gradient-to-r from-[#4169E1] to-[#7952D9]`), white text.
- **Secondary**: Clean white background, `#172033` text, `border border-[#E8ECF4]`, hover background `#F8FAFC`.
- **Ghost**: Transparent background, text `#64748B`, hover text `#172033`, hover background `#F1F5F9`.

### 5.2 Cards & Containers
- White background (`#FFFFFF`), `rounded-2xl`, `border border-[#E8ECF4]`, `shadow-soft-sm`.
- Padding: `p-6` (desktop: 24px) or `p-8` (major containers: 32px).
- Hoverable Card: Smooth transition `transition-all duration-200 hover:shadow-soft-md hover:border-slate-300`.

### 5.3 Metric & KPI Display
- Big value: `text-3xl font-extrabold tracking-tight text-[#172033]`.
- Label: `text-sm font-medium text-[#64748B]`.
- Delta badge: Green (`+12% vs benchmark`) or Amber icon.

### 5.4 Form Inputs
- Height: 44px (accessible touch target).
- Border: `border border-[#E8ECF4]`, background `#FFFFFF`.
- Focus: `border-[#4169E1] ring-2 ring-[#4169E1]/20 outline-none`.
- Validation errors: High-contrast red message with alert icon below field.

---

## 6. Interaction & Motion System (Framer Motion Guidelines)

### 6.1 Transition Timing & Curves
- **Standard UI Transitions**: `200ms ease-out` (dropdowns, tabs, hover states).
- **Modal & Drawer Entries**: `300ms cubic-bezier(0.16, 1, 0.3, 1)` (smooth deceleration spring).
- **Page Transitions**: Subtle fade and vertical drift (`opacity: 0, y: 8` to `opacity: 1, y: 0` in 250ms).

### 6.2 Strict Accessibility & Reduced Motion
Every Framer Motion animation component must wrap its animation variants with respect to user preferences:
```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const animationVariants = prefersReducedMotion 
  ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
  : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };
```

---

## 7. State Displays: Skeletons, Empty States & Errors

### 7.1 Skeleton Loaders
- Soft pulsing gray blocks (`bg-slate-200/70 animate-pulse rounded-lg`).
- Match exact geometry of the cards, avatars, and text lines they replace to eliminate layout shift (CLS = 0).

### 7.2 Empty States
- Custom illustrated SVG or clean Lucide icon inside a circular soft-slate container (`w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400`).
- Clear heading: "No verified skills recorded yet".
- Actionable prompt: "Take your first 5-minute checkpoint quiz to generate your Digital Skill Passport".
- Prominent action button.

### 7.3 Error States
- Friendly, non-cryptic error messaging explaining what happened.
- Direct recovery action button ("Retry Assessment", "Check Connection", "Contact Support").
