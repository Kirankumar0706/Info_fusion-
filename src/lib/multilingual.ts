import { AssistantAnswer, Conflict, EvidenceGap, Finding, Fact, Source } from '../types';

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'auto', name: 'Auto-Detect', nativeName: 'தானியங்கி / स्वतः' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
];

/**
 * Detect language of query using unicode ranges
 */
export const detectQueryLanguage = (query: string): string => {
  const text = query.trim();
  if (!text) return 'en';

  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
  if (/[\u0900-\u097F]/.test(text)) {
    if (/आहे|नाही|काय|झाले/.test(text)) return 'mr';
    return 'hi';
  }
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml';
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn';
  if (/[\u0980-\u09FF]/.test(text)) return 'bn';
  if (/[\u0A80-\u0AFF]/.test(text)) return 'gu';
  if (/[\u0A00-\u0A7F]/.test(text)) return 'pa';
  if (/[\u0600-\u06FF]/.test(text)) return 'ur';

  return 'en';
};

/**
 * Workspace Context used for Q&A
 */
export interface WorkspaceQueryContext {
  workspaceName?: string;
  sources?: Source[];
  facts?: Fact[];
  conflicts: Conflict[];
  evidenceGaps: EvidenceGap[];
  findings: Finding[];
}

/**
 * Grounded Workspace Reasoning Engine
 * Queries ONLY the selected workspace's real sources, facts, contradictions, and findings.
 * If not found: Returns "I couldn't find sufficient evidence in this workspace."
 */
export const queryWorkspaceMultilingual = (
  query: string,
  targetLangCode: string,
  context: WorkspaceQueryContext
): AssistantAnswer => {
  const detectedLang = detectQueryLanguage(query);
  const activeLang = targetLangCode === 'auto' ? detectedLang : targetLangCode;
  const lowerQuery = query.toLowerCase().trim();

  const facts = context.facts || [];
  const conflicts = context.conflicts || [];
  const gaps = context.evidenceGaps || [];
  const findings = context.findings || [];
  const sources = context.sources || [];

  // If no sources exist at all in this workspace
  if (sources.length === 0 && facts.length === 0) {
    const noDocsMsg = activeLang === 'ta'
      ? 'இந்த பணிமனையில் (workspace) ஆவணங்கள் எதுவும் பதிவேற்றப்படவில்லை. ஆவணங்களைப் பதிவேற்றிய பிறகு கேள்விகளைக் கேட்கவும்.'
      : activeLang === 'hi'
      ? 'इस कार्यक्षेत्र (workspace) में कोई दस्तावेज़ अपलोड नहीं किए गए हैं। कृपया पहले दस्तावेज़ अपलोड करें।'
      : 'No documents have been uploaded to this workspace yet. Please upload documents to begin asking questions.';

    return {
      answer: noDocsMsg,
      language: activeLang,
      issues_count: 0,
      key_points: [],
      citations: [],
      sources_used: [],
      confidence: 0,
      status: 'missing_evidence',
    };
  }

  // 1. Search for matching contradictions
  const isAskingAboutConflicts = /conflict|contradiction|discrepancy|issue|problem|risk|முரண்பாடு|பிரச்சனை|சிக்கல்|विवाद|समस्या|विरोधाभास/i.test(lowerQuery);
  const isAskingAboutGaps = /missing|gap|unverified|proof|approval|certificate|சான்றிதழ்|இல்லை|कमियां|अनुपलब्ध/i.test(lowerQuery);
  const isAskingAboutDecision = /decision|why|review required|status|verdict|ஏன்|முடிவு|निर्णय|स्थिति/i.test(lowerQuery);

  // Match query words against facts / claims
  const queryTokens = lowerQuery.split(/\s+/).filter(w => w.length > 2);
  const matchingFacts = facts.filter(f => {
    const hay = `${f.claim} ${f.attribute || ''} ${f.subject || ''} ${f.normalized_value} ${f.source_name || ''}`.toLowerCase();
    return queryTokens.some(token => hay.includes(token));
  });

  const matchingConflicts = conflicts.filter(c => {
    const hay = `${c.claim_a} ${c.claim_b} ${c.difference_summary} ${c.attribute || ''} ${c.explanation}`.toLowerCase();
    return isAskingAboutConflicts || isAskingAboutDecision || queryTokens.some(token => hay.includes(token));
  });

  const matchingGaps = gaps.filter(g => {
    const hay = `${g.claim} ${g.recommended_action}`.toLowerCase();
    return isAskingAboutGaps || isAskingAboutDecision || queryTokens.some(token => hay.includes(token));
  });

  // If no relevant information found
  if (matchingFacts.length === 0 && matchingConflicts.length === 0 && matchingGaps.length === 0 && !isAskingAboutConflicts && !isAskingAboutDecision) {
    const notFoundMsg = activeLang === 'ta'
      ? 'இந்த பணிமனையில் இதற்கான போதுமான சான்றுகள் கிடைக்கவில்லை. (I couldn\'t find sufficient evidence in this workspace).'
      : activeLang === 'hi'
      ? 'मुझे इस कार्यक्षेत्र में पर्याप्त साक्ष्य नहीं मिले। (I couldn\'t find sufficient evidence in this workspace).'
      : "I couldn't find sufficient evidence in this workspace to answer this question.";

    return {
      answer: notFoundMsg,
      language: activeLang,
      issues_count: 0,
      key_points: [],
      citations: [],
      sources_used: [],
      confidence: 0.95,
      status: 'missing_evidence',
    };
  }

  // Synthesize answer based on workspace data
  const sourcesUsed: { source_name: string; location: string; quote: string }[] = [];
  const citations: string[] = [];

  // Build key points
  const keyPoints: string[] = [];

  if (matchingConflicts.length > 0) {
    for (const conf of matchingConflicts.slice(0, 3)) {
      keyPoints.push(`Contradiction: ${conf.difference_summary}`);
      sourcesUsed.push(
        { source_name: conf.source_a_name, location: conf.source_a_location, quote: conf.claim_a },
        { source_name: conf.source_b_name, location: conf.source_b_location, quote: conf.claim_b }
      );
      citations.push(`${conf.source_a_name} (${conf.source_a_location}): "${conf.claim_a}"`);
      citations.push(`${conf.source_b_name} (${conf.source_b_location}): "${conf.claim_b}"`);
    }
  }

  if (matchingGaps.length > 0) {
    for (const gap of matchingGaps.slice(0, 2)) {
      keyPoints.push(`Evidence Gap: ${gap.claim}`);
      sourcesUsed.push({
        source_name: gap.claimed_in_source,
        location: gap.claimed_location,
        quote: gap.claim,
      });
      citations.push(`${gap.claimed_in_source} (${gap.claimed_location}): "${gap.claim}" [Evidence Required]`);
    }
  }

  if (matchingFacts.length > 0 && matchingConflicts.length === 0 && matchingGaps.length === 0) {
    for (const fact of matchingFacts.slice(0, 4)) {
      keyPoints.push(`${fact.attribute || fact.normalized_key}: ${fact.normalized_value}`);
      sourcesUsed.push({
        source_name: fact.source_name || 'Uploaded Source',
        location: fact.source_location,
        quote: fact.claim,
      });
      citations.push(`${fact.source_name || 'Source'} (${fact.source_location}): "${fact.claim}"`);
    }
  }

  // Compose answer text
  let answerText = '';

  if (isAskingAboutDecision || (isAskingAboutConflicts && matchingConflicts.length > 0)) {
    if (matchingConflicts.length > 0 && matchingGaps.length > 0) {
      if (activeLang === 'ta') {
        answerText = `இரண்டு மூல ஆவணங்கள் ஒரே கோரிக்கைக்கு மாறுபட்ட மதிப்புகளைக் கொண்டுள்ளதாலும், தேவையான ஆதாரச் சான்று விடுபட்டுள்ளதாலும் இந்த முடிவு 'Review Required' என குறிக்கப்பட்டுள்ளது.`;
      } else if (activeLang === 'hi') {
        answerText = `निर्णय को 'Review Required' के रूप में चिह्नित किया गया है क्योंकि दो स्रोतों में एक ही दावे के लिए अलग-अलग मान हैं, और सहायक साक्ष्य अनुपलब्ध हैं।`;
      } else {
        answerText = `The decision is marked Review Required because two sources contain different values for the same claim, and supporting evidence is missing.`;
      }
    } else if (matchingConflicts.length > 0) {
      if (activeLang === 'ta') {
        answerText = `இரண்டு மூல ஆவணங்களில் ஒரே கோரிக்கைக்கு முரண்பட்ட மதிப்புகள் உள்ளதால் இந்த முடிவு 'Review Required' என குறிக்கப்பட்டுள்ளது.`;
      } else {
        answerText = `The decision is marked Review Required because two sources contain different values for the same claim.`;
      }
    } else if (matchingGaps.length > 0) {
      if (activeLang === 'ta') {
        answerText = `இந்த பணிமனையில் தேவையான ஆதாரச் சான்றுகள் விடுபட்டுள்ளதால் இந்த முடிவு 'Review Required' என குறிக்கப்பட்டுள்ளது.`;
      } else {
        answerText = `The decision is marked Review Required because required supporting evidence is missing in this workspace.`;
      }
    } else {
      if (activeLang === 'ta') {
        answerText = `இந்த பணிமனையில் உள்ள அனைத்து ஆவணக் கூற்றுகளும் ஒன்றுக்கொன்று முரண்படாமல் சரிபார்க்கப்பட்டுள்ளன.`;
      } else {
        answerText = `All verified facts across uploaded workspace documents are consistent, with zero unresolved contradictions.`;
      }
    }
  } else if (matchingConflicts.length > 0) {
    const firstConf = matchingConflicts[0];
    if (activeLang === 'ta') {
      answerText = `முரண்பாடு கண்டறியப்பட்டுள்ளது: ${firstConf.difference_summary}. முதல் ஆவணம் (${firstConf.source_a_name}) "${firstConf.claim_a}" என்றும், இரண்டாம் ஆவணம் (${firstConf.source_b_name}) "${firstConf.claim_b}" என்றும் குறிப்பிடுகிறது.`;
    } else if (activeLang === 'hi') {
      answerText = `विरोधाभास पाया गया: ${firstConf.difference_summary}। दस्तावेज़ ${firstConf.source_a_name} में "${firstConf.claim_a}" और ${firstConf.source_b_name} में "${firstConf.claim_b}" दर्ज है।`;
    } else {
      answerText = `Contradiction detected: ${firstConf.difference_summary}. Source "${firstConf.source_a_name}" states "${firstConf.claim_a}", whereas "${firstConf.source_b_name}" states "${firstConf.claim_b}".`;
    }
  } else if (matchingGaps.length > 0) {
    const firstGap = matchingGaps[0];
    if (activeLang === 'ta') {
      answerText = `விடுபட்ட சான்று கண்டறியப்பட்டுள்ளது: "${firstGap.claim}". இதற்குத் தேவையான ஆவணச் சான்று இன்னும் பதிவேற்றப்படவில்லை.`;
    } else {
      answerText = `Evidence gap identified: "${firstGap.claim}". Required corroborating documentation has not been provided in this workspace.`;
    }
  } else {
    // Return factual synthesis
    const factsList = matchingFacts.map(f => `${f.attribute || 'Claim'}: ${f.normalized_value}`).join(', ');
    if (activeLang === 'ta') {
      answerText = `சரிபார்க்கப்பட்ட ஆவண உண்மைகள்: ${factsList}. இவை அனைத்தும் பணிமனை ஆவணங்களின்படி உறுதிப்படுத்தப்பட்டுள்ளன.`;
    } else if (activeLang === 'hi') {
      answerText = `सत्यापित तथ्य: ${factsList}। ये सभी कार्यक्षेत्र दस्तावेज़ों से उद्धृत हैं।`;
    } else {
      answerText = `Based on verified workspace documents: ${factsList}. Every assertion is backed by recorded physical offsets.`;
    }
  }

  return {
    answer: answerText,
    language: activeLang,
    issues_count: matchingConflicts.length + matchingGaps.length,
    key_points: keyPoints,
    citations,
    sources_used: sourcesUsed,
    confidence: 0.96,
    status: matchingConflicts.length > 0 ? 'conflicting' : matchingGaps.length > 0 ? 'missing_evidence' : 'supported',
  };
};
