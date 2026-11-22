// ==============================================================================
// KAABIL (काबिल) — Multilingual Translation Dictionary
// English, Hindi (हिन्दी), and Hinglish (Conversational Indian phrasing)
// ==============================================================================

export type Language = "en" | "hi" | "hinglish";

export interface TranslationDictionary {
  // Navigation & Branding
  brandTagline: string;
  findMyCareer: string;
  checkMySkills: string;
  whatShouldILearn: string;
  myAchievements: string;
  discoverStrengths: string;
  myRoadmap: string;
  aiMentor: string;
  opportunities: string;
  coursesColleges: string;
  entranceExams: string;
  scholarships: string;

  // Hero Section
  heroHeadline: string;
  heroSubheadline: string;
  heroSupportingText: string;
  primaryCta: string;
  secondaryCta: string;
  askAiPlaceholder: string;
  askAiButton: string;
  popularSearches: string;

  // Student Journey Steps
  journeyTitle: string;
  journeySubtitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;
  step5Title: string;
  step5Desc: string;

  // Dashboard & Modes
  guidedMode: string;
  exploreMode: string;
  yourNextStep: string;
  continueJourney: string;
  greetingMorning: string;
  greetingAfternoon: string;
  greetingEvening: string;
  whatWillYouAchieve: string;
  quickSearchPlaceholder: string;

  // Onboarding
  onboardingTitle: string;
  onboardingStep: string;
  q1Title: string;
  q1Subtitle: string;
  q2Title: string;
  q2Subtitle: string;
  q3Title: string;
  q3Subtitle: string;
  nextButton: string;
  backButton: string;
  skipButton: string;
  finishOnboarding: string;

  // Auth
  signInTitle: string;
  signInSubtitle: string;
  emailLabel: string;
  passwordLabel: string;
  continueAsGuest: string;
  orContinueWith: string;
  noAccountYet: string;
  createAccount: string;
  alreadyHaveAccount: string;
  studentLoginTab: string;
  otherPortalsTab: string;
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: {
    // Navigation & Branding
    brandTagline: "Discover Your Career. Learn the Right Skills. Build Your Future.",
    findMyCareer: "Find My Career",
    checkMySkills: "Check My Skills",
    whatShouldILearn: "What Should I Learn?",
    myAchievements: "My Achievements",
    discoverStrengths: "Discover Your Strengths",
    myRoadmap: "My Career Roadmap",
    aiMentor: "AI Career Mentor",
    opportunities: "Internships & Opportunities",
    coursesColleges: "Courses & Colleges",
    entranceExams: "Entrance Exams",
    scholarships: "Scholarships & Olympiads",

    // Hero Section
    heroHeadline: "Confused About Your Future?",
    heroSubheadline: "Discover your career. Learn the right skills. Build your future.",
    heroSupportingText: "Over 100+ verified career pathways across every stream. Stop guessing, start your personalized guided journey today.",
    primaryCta: "Find My Career",
    secondaryCta: "Explore KAABIL",
    askAiPlaceholder: "Ask KAABIL about your career, skills, or next step...",
    askAiButton: "Ask AI",
    popularSearches: "Popular:",

    // Student Journey Steps
    journeyTitle: "Your Simple 5-Step Journey",
    journeySubtitle: "From confusion to career confidence. Here is how KAABIL guides you.",
    step1Title: "1. Discover Your Strengths",
    step1Desc: "Quick 5-minute interactive diagnostic to uncover your true strengths without exam stress.",
    step2Title: "2. Choose Your Career",
    step2Desc: "Explore 100+ career pathways across Science, Commerce, Arts, Law, Design, and more.",
    step3Title: "3. Follow Your Roadmap",
    step3Desc: "A step-by-step personalized guide tailored to your current grade and career target.",
    step4Title: "4. Build Real Skills",
    step4Desc: "Bite-sized daily learning, fun mini-missions, and verified practice projects.",
    step5Title: "5. Unlock Your Future",
    step5Desc: "Step into top colleges, verified internships, and career opportunities with proof.",

    // Dashboard & Modes
    guidedMode: "Guided Mode",
    exploreMode: "Explore Mode",
    yourNextStep: "Your Next Step",
    continueJourney: "Continue Journey",
    greetingMorning: "Good morning",
    greetingAfternoon: "Good afternoon",
    greetingEvening: "Good evening",
    whatWillYouAchieve: "What will you achieve today?",
    quickSearchPlaceholder: "Quick search: careers, skills, colleges, or courses...",

    // Onboarding
    onboardingTitle: "Let's Personalize Your Experience",
    onboardingStep: "Step",
    q1Title: "What are you currently studying?",
    q1Subtitle: "We adapt all recommendations to your current education level.",
    q2Title: "Is your career goal clear?",
    q2Subtitle: "It's totally okay to be confused! We help you discover the best fit.",
    q3Title: "What do you need help with?",
    q3Subtitle: "Pick your primary focus so we can give you the right first step.",
    nextButton: "Continue",
    backButton: "Back",
    skipButton: "Skip to Dashboard",
    finishOnboarding: "Finish & Open My Dashboard",

    // Auth
    signInTitle: "Welcome Back to KAABIL",
    signInSubtitle: "Sign in to continue your personalized career journey.",
    emailLabel: "Email Address",
    passwordLabel: "Password",
    continueAsGuest: "Explore Careers as Guest",
    orContinueWith: "or",
    noAccountYet: "Don't have an account yet?",
    createAccount: "Create a Free Account",
    alreadyHaveAccount: "Already have an account?",
    studentLoginTab: "Student Sign In",
    otherPortalsTab: "Institution, Employer & Admin",
  },

  hi: {
    // Navigation & Branding
    brandTagline: "अपना करियर चुनें। सही हुनर सीखें। अपना भविष्य बनाएं।",
    findMyCareer: "मेरा करियर खोजें",
    checkMySkills: "मेरी स्किल्स जांचें",
    whatShouldILearn: "मुझे क्या सीखना चाहिए?",
    myAchievements: "मेरी उपलब्धियां",
    discoverStrengths: "अपनी ताकत पहचानें",
    myRoadmap: "मेरा करियर रोडमैप",
    aiMentor: "एआई करियर मेंटर",
    opportunities: "इंटर्नशिप और अवसर",
    coursesColleges: "कोर्स और कॉलेज",
    entranceExams: "प्रवेश परीक्षाएं",
    scholarships: "छात्रवृत्ति और ओलंपियाड",

    // Hero Section
    heroHeadline: "अपने भविष्य को लेकर असमंजस में हैं?",
    heroSubheadline: "अपना करियर चुनें। सही हुनर सीखें। अपना भविष्य बनाएं।",
    heroSupportingText: "सभी स्ट्रीम्स में 100+ सत्यापित करियर विकल्प। असमंजस छोड़ें, आज ही अपनी व्यक्तिगत यात्रा शुरू करें।",
    primaryCta: "मेरा करियर खोजें",
    secondaryCta: "काबिल को जानें",
    askAiPlaceholder: "अपने करियर या स्किल्स के बारे में काबिल से पूछें...",
    askAiButton: "एआई से पूछें",
    popularSearches: "लोकप्रिय सवाल:",

    // Student Journey Steps
    journeyTitle: "आपकी 5-चरणीय आसान यात्रा",
    journeySubtitle: "असमंजस से करियर में आत्मविश्वास तक। काबिल आपका मार्गदर्शन कैसे करता है:",
    step1Title: "1. अपनी ताकत पहचानें",
    step1Desc: "बिना किसी परीक्षा के तनाव के, केवल 5 मिनट में अपनी असली रुचियों को समझें।",
    step2Title: "2. अपना करियर चुनें",
    step2Desc: "साइंस, कॉमर्स, आर्ट्स, लॉ, डिज़ाइन आदि में 100+ से अधिक करियर विकल्प देखें।",
    step3Title: "3. रोडमैप का पालन करें",
    step3Desc: "अपनी कक्षा और लक्ष्य के अनुसार चरण-दर-चरण व्यक्तिगत मार्गदर्शन प्राप्त करें।",
    step4Title: "4. असली स्किल्स सीखें",
    step4Desc: "रोजाना छोटे-छोटे सीखने के लक्ष्य, मजेदार अभ्यास और प्रामाणिक प्रोजेक्ट्स।",
    step5Title: "5. अपना भविष्य संवारें",
    step5Desc: "शीर्ष कॉलेजों, सत्यापित इंटर्नशिप और नए अवसरों की दिशा में मजबूत कदम बढ़ाएं।",

    // Dashboard & Modes
    guidedMode: "गाइडेड मोड",
    exploreMode: "एक्सप्लोर मोड",
    yourNextStep: "आपका अगला कदम",
    continueJourney: "यात्रा जारी रखें",
    greetingMorning: "शुभ प्रभात",
    greetingAfternoon: "नमस्ते",
    greetingEvening: "शुभ संध्या",
    whatWillYouAchieve: "आज आप क्या नया हासिल करेंगे?",
    quickSearchPlaceholder: "करियर, स्किल्स, कॉलेज या कोर्स खोजें...",

    // Onboarding
    onboardingTitle: "आइए आपके अनुभव को व्यक्तिगत बनाएं",
    onboardingStep: "कदम",
    q1Title: "वर्तमान में आप क्या पढ़ रहे हैं?",
    q1Subtitle: "हम आपके अनुसार ही सभी सुझाव अनुकूलित करते हैं।",
    q2Title: "क्या आपका करियर लक्ष्य स्पष्ट है?",
    q2Subtitle: "असमंजस में होना बिल्कुल सामान्य है! हम सही राह खोजने में मदद करेंगे।",
    q3Title: "आपको मुख्य रूप से किस चीज़ में मदद चाहिए?",
    q3Subtitle: "अपनी प्राथमिकता चुनें ताकि हम सही पहला कदम सुझा सकें।",
    nextButton: "आगे बढ़ें",
    backButton: "पीछे जाएं",
    skipButton: "डैशबोर्ड पर जाएं",
    finishOnboarding: "पूर्ण करें और डैशबोर्ड खोलें",

    // Auth
    signInTitle: "काबिल में पुनः स्वागत है",
    signInSubtitle: "अपनी करियर यात्रा जारी रखने के लिए साइन इन करें।",
    emailLabel: "ईमेल पता",
    passwordLabel: "पासवर्ड",
    continueAsGuest: "गेस्ट के रूप में करियर देखें",
    orContinueWith: "या",
    noAccountYet: "क्या आपका अभी तक खाता नहीं है?",
    createAccount: "निशुल्क खाता बनाएं",
    alreadyHaveAccount: "क्या आपके पास पहले से खाता है?",
    studentLoginTab: "विद्यार्थी साइन इन",
    otherPortalsTab: "कॉलेज, नियोक्ता और एडमिन",
  },

  hinglish: {
    // Navigation & Branding
    brandTagline: "Discover Your Career. Learn the Right Skills. Build Your Future.",
    findMyCareer: "Find My Career",
    checkMySkills: "Check My Skills",
    whatShouldILearn: "What Should I Learn?",
    myAchievements: "My Achievements",
    discoverStrengths: "Apni Strengths Pehchano",
    myRoadmap: "Mera Career Roadmap",
    aiMentor: "AI Career Mentor",
    opportunities: "Internships & Opportunities",
    coursesColleges: "Courses & Colleges",
    entranceExams: "Entrance Exams",
    scholarships: "Scholarships & Olympiads",

    // Hero Section
    heroHeadline: "Confused About Your Future?",
    heroSubheadline: "Discover your career. Learn the right skills. Build your future.",
    heroSupportingText: "Science, Commerce, Arts ya Vocational—100+ verified career options. Confusion chhodo, apni guided journey start karo.",
    primaryCta: "Find My Career",
    secondaryCta: "Explore KAABIL",
    askAiPlaceholder: "Apne career, stream ya skills ke baare mein pucho...",
    askAiButton: "Ask AI",
    popularSearches: "Popular Prompts:",

    // Student Journey Steps
    journeyTitle: "Aapki Simple 5-Step Journey",
    journeySubtitle: "Career confusion se clarity tak ka practical roadmap:",
    step1Title: "1. Discover Your Strengths",
    step1Desc: "Bina exam stress ke, 5-minute interactive quiz se apni real strengths discover karo.",
    step2Title: "2. Choose Your Career",
    step2Desc: "Medicine, Engineering, Law, Commerce, Design—har stream mein options explore karo.",
    step3Title: "3. Follow Your Roadmap",
    step3Desc: "Aapki current class aur target ke mutabiq step-by-step personalized roadmaps.",
    step4Title: "4. Build Real Skills",
    step4Desc: "Daily micro-missions, interactive practice aur verified hands-on projects.",
    step5Title: "5. Unlock Opportunities",
    step5Desc: "Top colleges, verified internships aur placement drives ke liye fully ready bano.",

    // Dashboard & Modes
    guidedMode: "Guided Mode",
    exploreMode: "Explore Mode",
    yourNextStep: "Aapka Agla Step",
    continueJourney: "Continue Journey",
    greetingMorning: "Good morning",
    greetingAfternoon: "Good afternoon",
    greetingEvening: "Good evening",
    whatWillYouAchieve: "Aaj kya naya achieve karoge?",
    quickSearchPlaceholder: "Careers, skills, colleges ya courses search karo...",

    // Onboarding
    onboardingTitle: "Aapki Journey Personalize Karte Hain",
    onboardingStep: "Step",
    q1Title: "Aap abhi kya padh rahe ho?",
    q1Subtitle: "Aapki class ke mutabiq hi saari recommendations tailor hongi.",
    q2Title: "Kya aapka career goal clear hai?",
    q2Subtitle: "Confused hona totally normal hai! Hum best options find karenge.",
    q3Title: "Aapko sabse zyada kis cheez mein help chahiye?",
    q3Subtitle: "Apna main focus select karo taaki hum first step plan kar sakein.",
    nextButton: "Next Step",
    backButton: "Back",
    skipButton: "Skip to Dashboard",
    finishOnboarding: "Finish & Open Dashboard",

    // Auth
    signInTitle: "Welcome Back to KAABIL",
    signInSubtitle: "Sign in karke apni personalized career journey continue karein.",
    emailLabel: "Email Address",
    passwordLabel: "Password",
    continueAsGuest: "Continue as Guest",
    orContinueWith: "ya",
    noAccountYet: "Account nahi hai abhi?",
    createAccount: "Free Account Banayein",
    alreadyHaveAccount: "Pehle se account hai?",
    studentLoginTab: "Student Sign In",
    otherPortalsTab: "College, Employer & Admin",
  },
};
