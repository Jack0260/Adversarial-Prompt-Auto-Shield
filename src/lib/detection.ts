import type {
  TechniqueScore,
  DriftVector,
  Severity,
  InjectionPattern,
} from '@/types';

const INJECTION_PATTERNS: InjectionPattern[] = [
  {
    technique: 'Instruction Override',
    description: 'Attempts to directly override system instructions or bypass safety constraints',
    severity: 'critical',
    baseScore: 85,
    patterns: [
      /ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions|prompts|rules)/gi,
      /disregard\s+(the\s+)?(system|previous|prior)\s+(prompt|instructions|rules)/gi,
      /forget\s+(everything|all\s+(previous|prior)\s+(instructions|prompts))/gi,
      /override\s+(system|safety|security)\s+(instructions|protocols|rules)/gi,
      /new\s+instructions?\s*:/gi,
      /you\s+are\s+now\s+(in\s+)?(developer|root|admin|jailbreak)\s+mode/gi,
      /stop\s+following\s+(your|the)\s+(rules|instructions|guidelines)/gi,
      /your\s+(new\s+)?(objective|goal|task)\s+is/gi,
    ],
  },
  {
    technique: 'Role Hijacking',
    description: 'Attempts to redefine the AI assistant identity or role',
    severity: 'high',
    baseScore: 75,
    patterns: [
      /you\s+are\s+now\s+(a|an)\s+/gi,
      /act\s+as\s+(a|an)\s+/gi,
      /pretend\s+(you\s+are|to\s+be)\s+/gi,
      /role-?play\s+as\s+/gi,
      /simulate\s+(being|you\s+are)\s+/gi,
      /from\s+now\s+on[,\s]+you\s+/gi,
      /your\s+new\s+(identity|name|persona)\s+is/gi,
      /i\s+am\s+your\s+(creator|developer|admin|owner)/gi,
      /switch\s+to\s+(developer|root|admin| DAN)\s+mode/gi,
    ],
  },
  {
    technique: 'Data Extraction',
    description: 'Attempts to extract system prompts, internal data, or configuration',
    severity: 'high',
    baseScore: 70,
    patterns: [
      /reveal\s+(your|the)\s+(system\s+)?(prompt|instructions|rules|guidelines)/gi,
      /show\s+me\s+(your|the)\s+(system\s+)?(prompt|instructions|initial\s+message)/gi,
      /what\s+(are|is)\s+your\s+(system\s+)?(prompt|instructions|hidden|secret)/gi,
      /print\s+(your|the)\s+(system\s+)?(prompt|instructions)/gi,
      /repeat\s+(your|the)\s+(system\s+)?(prompt|instructions|rules)/gi,
      /output\s+(your|the)\s+(initial|system)\s+(prompt|message|instructions)/gi,
      /tell\s+me\s+(your|the)\s+(system\s+)?(prompt|secret|hidden\s+instructions)/gi,
      /leak\s+(the|your)\s+/gi,
      / disclose\s+(the|your|all)\s+/gi,
    ],
  },
  {
    technique: 'Encoding Evasion',
    description: 'Uses encoding, obfuscation, or special characters to bypass filters',
    severity: 'medium',
    baseScore: 55,
    patterns: [
      /\\x[0-9a-f]{2}/gi,
      /\\u[0-9a-f]{4}/gi,
      /base64\s*[:=]/gi,
      /atob\s*\(/gi,
      /decode\s*uri/gi,
      /[\u200b-\u200f\u202a-\u202e\ufeff]/gi,
      /\b(?:1337|h4x0r|l33t)\b/gi,
      /(?:0x[0-9a-f]+|[01]{8,})\s*(?:encoded|decoded|interpreted)\s+as/gi,
    ],
  },
  {
    technique: 'Multi-Turn Manipulation',
    description: 'Builds up context across turns to gradually steer the model off-baseline',
    severity: 'medium',
    baseScore: 50,
    patterns: [
      /remember\s+(that|this)\s+/gi,
      /as\s+(we|i)\s+(discussed|agreed|mentioned)\s+(earlier|before)/gi,
      /like\s+(we|i)\s+said\s+(before|earlier)/gi,
      /just\s+(to\s+)?confirm\s*[,:]\s*you\s+(can|will|are\s+allowed\s+to)/gi,
      /you\s+(already\s+)?(agreed|said|confirmed)\s+(that|to)/gi,
      /previously\s+you\s+(said|agreed|told\s+me)/gi,
      /building\s+on\s+(our|the\s+)?previous/gi,
    ],
  },
  {
    technique: 'Payload Smuggling',
    description: 'Embeds hidden or secondary instructions within seemingly benign content',
    severity: 'high',
    baseScore: 65,
    patterns: [
      /(?:in\s+)?(?:a\s+)?(?:code|markdown|html|json|xml)\s+block[,:]?\s*.*(?:ignore|override|disregard)/gi,
      /\[system\].*?(?:ignore|override|disregard|reveal)/gi,
      /<\/?system>.*?(?:ignore|override|disregard|reveal)/gi,
      /TRANSLATE\s*[:=]?\s*.*?(?:ignore|override|disregard|reveal)/gi,
      /(?:summarize|translate|format)\s+(?:this|the\s+following)[,:]\s*.*?(?:ignore|override|disregard|reveal)/gi,
    ],
  },
  {
    technique: 'Jailbreak Framework',
    description: 'Known jailbreak patterns, acronyms, or structured attack templates',
    severity: 'critical',
    baseScore: 90,
    patterns: [
      /\bDAN\b\s*(?:prompt|mode|jailbreak)/gi,
      /\bdo\s+anything\s+now\b/gi,
      /\bstan\b\s*(?:prompt|mode)/gi,
      /\bjailbreak\b/gi,
      /\bAIM\b\s*(?:prompt|mode)\b/gi,
      /\bsimulate\s+an\s+AI\s+that\s+has\s+no\s+restrictions\b/gi,
      /\bDEV\s+MODE\b/gi,
      /\bunrestricted\s+mode\b/gi,
      /\bcharacter\s+(AI|assistant)\s+with\s+no\s+(rules|restrictions|limits)\b/gi,
    ],
  },
  {
    technique: 'Context Boundary Violation',
    description: 'Attempts to blur the boundary between user input and system context',
    severity: 'high',
    baseScore: 60,
    patterns: [
      /\[\/?system\]/gi,
      /\[\/?assistant\]/gi,
      /\[\/?user\]/gi,
      /<\s*\/?(?:system|assistant|im_end|im_start)\s*>/gi,
      /system\s*:\s*.*?(?:ignore|override|disregard|new)/gi,
      /\bend\s+of\s+(system\s+)?prompt\b/gi,
    ],
  },
];

const BASELINE_TERMS = [
  'help', 'explain', 'what', 'how', 'why', 'when', 'where', 'who',
  'please', 'thank', 'could', 'would', 'can', 'is', 'are', 'do',
  'write', 'create', 'generate', 'summarize', 'analyze', 'compare',
  'example', 'tutorial', 'guide', 'learn', 'understand', 'question',
  'answer', 'information', 'topic', 'subject', 'about', 'regarding',
];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function termFrequency(tokens: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const token of tokens) {
    freq.set(token, (freq.get(token) || 0) + 1);
  }
  const max = Math.max(...freq.values(), 1);
  for (const [key, val] of freq) {
    freq.set(key, val / max);
  }
  return freq;
}

function cosineSimilarity(vecA: Map<string, number>, vecB: Map<string, number>): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  const allKeys = new Set([...vecA.keys(), ...vecB.keys()]);
  for (const key of allKeys) {
    const a = vecA.get(key) || 0;
    const b = vecB.get(key) || 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export function analyzeTechniques(text: string): TechniqueScore[] {
  return INJECTION_PATTERNS.map((pat) => {
    const matchedPatterns: string[] = [];
    let maxMatchScore = 0;
    for (const regex of pat.patterns) {
      const matches = text.match(regex);
      if (matches && matches.length > 0) {
        matchedPatterns.push(...matches.map((m) => m.trim().substring(0, 80)));
        const matchRatio = Math.min(matches.length / 2, 1);
        const score = pat.baseScore * (0.6 + 0.4 * matchRatio);
        maxMatchScore = Math.max(maxMatchScore, score);
      }
    }
    return {
      technique: pat.technique,
      score: Math.round(maxMatchScore),
      matched: matchedPatterns.length > 0,
      patterns: matchedPatterns,
    };
  });
}

export function computeDriftVector(text: string): DriftVector {
  const techniques = analyzeTechniques(text);
  const instructionOverride =
    techniques.find((t) => t.technique === 'Instruction Override')?.score || 0;
  const roleHijack =
    techniques.find((t) => t.technique === 'Role Hijacking')?.score || 0;
  const dataExtraction =
    techniques.find((t) => t.technique === 'Data Extraction')?.score || 0;
  const encodingEvasion =
    techniques.find((t) => t.technique === 'Encoding Evasion')?.score || 0;

  const tokens = tokenize(text);
  const inputFreq = termFrequency(tokens);
  const baselineFreq = termFrequency(BASELINE_TERMS);
  const baselineSim = cosineSimilarity(inputFreq, baselineFreq);
  const intentDrift = Math.round((1 - baselineSim) * 100);

  const overrideWeight = 0.25;
  const roleWeight = 0.2;
  const extractWeight = 0.2;
  const encodingWeight = 0.15;
  const intentWeight = 0.2;

  const overall = Math.min(
    100,
    Math.round(
      intentDrift * intentWeight +
        instructionOverride * overrideWeight +
        roleHijack * roleWeight +
        dataExtraction * extractWeight +
        encodingEvasion * encodingWeight
    )
  );

  return {
    intent: Math.min(100, intentDrift),
    instructionOverride,
    dataExtraction,
    roleHijack,
    encodingEvasion,
    overall,
  };
}

export function computeThreatScore(
  techniques: TechniqueScore[],
  drift: DriftVector
): number {
  const matchedTechniques = techniques.filter((t) => t.matched);
  if (matchedTechniques.length === 0) {
    return Math.min(100, Math.round(drift.overall * 0.5));
  }

  const avgScore =
    matchedTechniques.reduce((sum, t) => sum + t.score, 0) /
    matchedTechniques.length;

  const multiTechniqueBoost = Math.min(matchedTechniques.length * 8, 24);
  const driftContribution = drift.overall * 0.15;

  return Math.min(
    100,
    Math.round(avgScore * 0.7 + driftContribution + multiTechniqueBoost * 0.3)
  );
}

export function getVerdict(score: number): 'block' | 'quarantine' | 'allow' {
  if (score >= 70) return 'block';
  if (score >= 35) return 'quarantine';
  return 'allow';
}

export function getSeverity(score: number): Severity {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 35) return 'medium';
  if (score >= 15) return 'low';
  return 'info';
}

export function analyzeInput(text: string) {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      techniques: analyzeTechniques(''),
      drift: {
        intent: 0,
        instructionOverride: 0,
        dataExtraction: 0,
        roleHijack: 0,
        encodingEvasion: 0,
        overall: 0,
      },
      threatScore: 0,
      verdict: 'allow' as const,
      flaggedPhrases: [] as string[],
    };
  }
  const techniques = analyzeTechniques(trimmed);
  const drift = computeDriftVector(trimmed);
  const threatScore = computeThreatScore(techniques, drift);
  const verdict = getVerdict(threatScore);
  const flaggedPhrases = techniques
    .filter((t) => t.matched)
    .flatMap((t) => t.patterns);
  return { techniques, drift, threatScore, verdict, flaggedPhrases };
}

export function highlightFlaggedPhrases(
  text: string,
  phrases: string[]
): { text: string; flagged: boolean }[] {
  if (phrases.length === 0) return [{ text, flagged: false }];
  const escaped = phrases
    .filter((p) => p.length > 2)
    .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (escaped.length === 0) return [{ text, flagged: false }];
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(regex);
  return parts
    .filter((p) => p.length > 0)
    .map((p) => {
      const isFlagged = phrases.some(
        (phrase) => phrase.toLowerCase() === p.toLowerCase()
      );
      return { text: p, flagged: isFlagged };
    });
}

export const TECHNIQUE_DESCRIPTIONS: Record<string, string> =
  Object.fromEntries(
    INJECTION_PATTERNS.map((p) => [p.technique, p.description])
  );

export const TECHNIQUE_NAMES = INJECTION_PATTERNS.map((p) => p.technique);
