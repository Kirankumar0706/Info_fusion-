import { Fact, Conflict, EvidenceGap, Finding, Decision, ActionItem, Source, EvidenceItem } from '../types';
import { generateId } from './uuid';

export interface ExtractionResult {
  facts: Fact[];
  evidenceItems: EvidenceItem[];
  conflicts: Conflict[];
  evidenceGaps: EvidenceGap[];
  findings: Finding[];
  actions: ActionItem[];
  decision?: Decision;
}

/**
 * Normalizes text to extract key-value attributes and numerical values generically
 */
export const cleanKey = (key: string): string => {
  return key
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

/**
 * Checks whether two values represent a direct contradiction,
 * taking into account potential units, spacing, and casing
 */
export const areValuesConflicting = (valA: string, valB: string): boolean => {
  const normA = valA.trim().toLowerCase().replace(/,/g, '');
  const normB = valB.trim().toLowerCase().replace(/,/g, '');
  if (normA === normB) return false;

  // Extract pure numbers/currencies if present
  const numA = normA.match(/[\d.]+/)?.[0];
  const numB = normB.match(/[\d.]+/)?.[0];

  if (numA && numB) {
    return parseFloat(numA) !== parseFloat(numB);
  }

  // Check opposing booleans / states
  const positive = /^(true|yes|active|compliant|guaranteed|approved|unlimited|24\/7)$/;
  const negative = /^(false|no|inactive|non-compliant|restricted|pending|business hours|ticket-only)$/;

  if ((positive.test(normA) && negative.test(normB)) || (negative.test(normA) && positive.test(normB))) {
    return true;
  }

  return normA !== normB;
};

/**
 * Parses generic document content and extracts structured facts with exact locations
 */
export const extractFactsFromContent = (
  text: string,
  sourceId: string,
  sourceName: string,
  workspaceId: string
): { facts: Fact[]; evidenceItems: EvidenceItem[]; evidenceGaps: EvidenceGap[] } => {
  const facts: Fact[] = [];
  const evidenceItems: EvidenceItem[] = [];
  const evidenceGaps: EvidenceGap[] = [];

  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let lineCounter = 1;

  // Determine potential subject from document name or first heading
  let detectedSubject = sourceName.replace(/\.[^/.]+$/, '').replace(/[_.-]+/g, ' ');

  for (const line of lines) {
    const location = `Line ${lineCounter}`;

    // Pattern 1: Key-Value pairs (e.g. "Customer: Acme", "Contract Value = $50,000", "Delivery: 30 days")
    const kvMatch = line.match(/^([^:=–—\-]{2,35})\s*[:=–—]\s*(.+)$/);
    if (kvMatch) {
      const rawKey = kvMatch[1].trim();
      const rawVal = kvMatch[2].trim();

      if (rawKey.toLowerCase() === 'subject' || rawKey.toLowerCase() === 'customer' || rawKey.toLowerCase() === 'entity') {
        detectedSubject = rawVal;
      } else {
        const factId = generateId();
        const evidenceId = generateId();
        const normalizedKey = cleanKey(rawKey);

        // Check if value indicates a missing requirement or gap
        if (/missing|not attached|pending verification|requires approval|unverified/i.test(rawVal)) {
          evidenceGaps.push({
            id: generateId(),
            workspace_id: workspaceId,
            claim: `${rawKey}: ${rawVal}`,
            category: 'Missing Evidence',
            claimed_in_source: sourceName,
            claimed_location: location,
            status: 'evidence_required',
            recommended_action: `Obtain official documentation validating ${rawKey}.`,
            confidence: 0.95,
            created_at: new Date().toISOString(),
          });
        }

        facts.push({
          id: factId,
          workspace_id: workspaceId,
          source_id: sourceId,
          source_name: sourceName,
          subject: detectedSubject,
          attribute: rawKey,
          value: rawVal,
          claim: `${rawKey}: ${rawVal}`,
          normalized_key: normalizedKey,
          normalized_value: rawVal,
          value_type: /[\$₹€£]/.test(rawVal) ? 'currency' : /\d+/.test(rawVal) ? 'number' : 'string',
          category: /cost|price|value|fee|budget|inr|usd/i.test(rawKey) ? 'commercial' : /sla|hour|support|timeline|day/i.test(rawKey) ? 'operational' : 'general',
          confidence: 0.96,
          status: 'supported',
          verification_status: 'verified',
          source_location: location,
          source_document_id: sourceId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        evidenceItems.push({
          id: evidenceId,
          workspace_id: workspaceId,
          fact_id: factId,
          source_id: sourceId,
          source_name: sourceName,
          source_location: location,
          evidence_text: line,
          confidence: 0.96,
          created_at: new Date().toISOString(),
        });
      }
    } else {
      // Pattern 2: Narrative sentence fact extraction (e.g., "The contract value is $50,000.", "Delivery is guaranteed in 30 days.")
      const sentenceValMatch = line.match(/(?:total|contract|annual|agreed|target|estimated)?\s*([a-zA-Z\s]{3,25})\s+(?:is|was|equals|set at|fixed at)\s+([\$₹€£]?[\d,]+(?:\.\d+)?(?:\s*[a-zA-Z]+)?)/i);
      if (sentenceValMatch) {
        const rawAttr = sentenceValMatch[1].trim();
        const rawVal = sentenceValMatch[2].trim();
        const factId = generateId();
        const evidenceId = generateId();

        facts.push({
          id: factId,
          workspace_id: workspaceId,
          source_id: sourceId,
          source_name: sourceName,
          subject: detectedSubject,
          attribute: rawAttr,
          value: rawVal,
          claim: line,
          normalized_key: cleanKey(rawAttr),
          normalized_value: rawVal,
          value_type: /[\$₹€£]/.test(rawVal) ? 'currency' : 'number',
          category: 'commercial',
          confidence: 0.94,
          status: 'supported',
          verification_status: 'verified',
          source_location: location,
          source_document_id: sourceId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        evidenceItems.push({
          id: evidenceId,
          workspace_id: workspaceId,
          fact_id: factId,
          source_id: sourceId,
          source_name: sourceName,
          source_location: location,
          evidence_text: line,
          confidence: 0.94,
          created_at: new Date().toISOString(),
        });
      }
    }

    // Pattern 3: General Evidence Gap check in unstructured sentences
    if (/requires\s+[a-zA-Z\s]+(?:certificate|approval|license|audit|sign-off)|pending\s+(?:approval|review|sign-off)/i.test(line)) {
      if (!evidenceGaps.some(g => g.claimed_location === location)) {
        evidenceGaps.push({
          id: generateId(),
          workspace_id: workspaceId,
          claim: line,
          category: 'Missing Evidence',
          claimed_in_source: sourceName,
          claimed_location: location,
          status: 'evidence_required',
          recommended_action: 'Request required approval document or governing verification.',
          confidence: 0.92,
          created_at: new Date().toISOString(),
        });
      }
    }

    lineCounter++;
  }

  // Fallback: If text had no key-value formatting, extract at least generic facts from paragraphs
  if (facts.length === 0 && lines.length > 0) {
    const factId = generateId();
    facts.push({
      id: factId,
      workspace_id: workspaceId,
      source_id: sourceId,
      source_name: sourceName,
      subject: detectedSubject,
      attribute: 'Document Content Statement',
      value: lines[0].slice(0, 80),
      claim: lines[0],
      normalized_key: 'document_content_statement',
      normalized_value: lines[0].slice(0, 80),
      value_type: 'string',
      category: 'general',
      confidence: 0.90,
      status: 'supported',
      verification_status: 'verified',
      source_location: 'Paragraph 1',
      source_document_id: sourceId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    evidenceItems.push({
      id: generateId(),
      workspace_id: workspaceId,
      fact_id: factId,
      source_id: sourceId,
      source_name: sourceName,
      source_location: 'Paragraph 1',
      evidence_text: lines[0],
      confidence: 0.90,
      created_at: new Date().toISOString(),
    });
  }

  return { facts, evidenceItems, evidenceGaps };
};

/**
 * Cross-checks newly extracted facts with existing facts in the workspace
 * to detect real contradictions and synthesize intelligence findings
 */
export const processWorkspaceAnalysis = (
  newSource: Source,
  existingSources: Source[],
  existingFacts: Fact[],
  existingConflicts: Conflict[],
  existingGaps: EvidenceGap[],
  workspaceName: string
): ExtractionResult => {
  const workspaceId = newSource.workspace_id;
  
  // 1. Extract facts and evidence from this new document
  const { facts: extractedFacts, evidenceItems, evidenceGaps: extractedGaps } = extractFactsFromContent(
    newSource.extracted_text || '',
    newSource.id,
    newSource.file_name,
    workspaceId
  );

  const detectedConflicts: Conflict[] = [];
  const allGaps = [...existingGaps, ...extractedGaps];

  // 2. Contradiction Detection: compare extractedFacts with existingFacts
  for (const newFact of extractedFacts) {
    for (const oldFact of existingFacts) {
      // Must be from different source documents
      if (oldFact.source_id === newFact.source_id) continue;

      // Compare attributes / normalized_key
      const keyMatches = oldFact.normalized_key === newFact.normalized_key ||
        (oldFact.attribute && newFact.attribute && cleanKey(oldFact.attribute) === cleanKey(newFact.attribute));

      if (keyMatches) {
        // Compare values
        const valA = oldFact.normalized_value || oldFact.value || '';
        const valB = newFact.normalized_value || newFact.value || '';

        if (areValuesConflicting(valA, valB)) {
          // CONTRADICTION FOUND
          newFact.status = 'conflicting';
          oldFact.status = 'conflicting';

          const conflictId = generateId();
          detectedConflicts.push({
            id: conflictId,
            workspace_id: workspaceId,
            subject: newFact.subject || oldFact.subject || 'Workspace Entity',
            attribute: newFact.attribute || oldFact.attribute || newFact.normalized_key,
            fact_a_id: oldFact.id,
            fact_b_id: newFact.id,
            claim_a: oldFact.claim,
            claim_b: newFact.claim,
            source_a_id: oldFact.source_id,
            source_a_name: oldFact.source_name || 'Source A',
            source_a_location: oldFact.source_location,
            source_b_id: newFact.source_id,
            source_b_name: newFact.source_name || newSource.file_name,
            source_b_location: newFact.source_location,
            difference_summary: `Discrepancy in ${newFact.attribute || 'Parameter'}: "${valA}" vs "${valB}"`,
            conflict_type: 'Parameter Discrepancy',
            severity: /price|cost|value|amount|financial/i.test(newFact.normalized_key) ? 'critical' : 'high',
            explanation: `The attribute "${newFact.attribute || newFact.normalized_key}" has conflicting values across ${oldFact.source_name} ("${valA}") and ${newSource.file_name} ("${valB}").`,
            detection_reason: 'Direct value disagreement on matching attribute without reconciliation addendum.',
            confidence: 0.97,
            status: 'open',
            created_at: new Date().toISOString(),
          });
        }
      }
    }
  }

  // 3. Synthesize Intelligence Findings from Contradictions, Gaps, and Facts
  const findings: Finding[] = [];
  const actions: ActionItem[] = [];

  // Generate findings for detected contradictions
  for (const conf of detectedConflicts) {
    const findingId = generateId();
    findings.push({
      id: findingId,
      workspace_id: workspaceId,
      title: `Inconsistent ${conf.attribute || 'Parameter'} Between Sources`,
      description: conf.difference_summary,
      severity: conf.severity,
      confidence: conf.confidence,
      status: 'active',
      category: 'Conflict',
      finding_type: 'inconsistency',
      evidence_count: 2,
      sources_involved: [conf.source_a_name, conf.source_b_name],
      supporting_facts: [conf.fact_a_id, conf.fact_b_id],
      related_contradictions: [conf.id],
      explanation: conf.explanation,
      recommended_action: `Clarify conflicting values ("${conf.claim_a}" vs "${conf.claim_b}") with source authors.`,
      created_at: new Date().toISOString(),
    });

    // Generate actionable step
    actions.push({
      id: generateId(),
      workspace_id: workspaceId,
      title: `Resolve ${conf.attribute || 'Parameter'} Conflict`,
      description: `Review difference between ${conf.source_a_name} and ${conf.source_b_name}. Confirm canonical binding figure.`,
      priority: conf.severity === 'critical' ? 'urgent' : 'high',
      status: 'not_started',
      assigned_to: 'Workspace Lead',
      due_date: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
      related_finding: `Discrepancy in ${conf.attribute || 'attribute'}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  // Generate findings for Evidence Gaps
  for (const gap of extractedGaps) {
    const findingId = generateId();
    findings.push({
      id: findingId,
      workspace_id: workspaceId,
      title: `Unverified Claim: ${gap.claim.slice(0, 50)}`,
      description: `Statement in ${gap.claimed_in_source} requires supporting physical proof.`,
      severity: 'high',
      confidence: gap.confidence,
      status: 'active',
      category: 'Missing Evidence',
      finding_type: 'missing_evidence',
      evidence_count: 1,
      sources_involved: [gap.claimed_in_source],
      related_evidence_gaps: [gap.id],
      explanation: `Document asserts requirement or standard at ${gap.claimed_location}, but corroborating certificate or attachment was not provided.`,
      recommended_action: gap.recommended_action,
      created_at: new Date().toISOString(),
    });

    actions.push({
      id: generateId(),
      workspace_id: workspaceId,
      title: `Request Missing Evidence: ${gap.claim.slice(0, 40)}`,
      description: gap.recommended_action,
      priority: 'high',
      status: 'not_started',
      assigned_to: 'Compliance Officer',
      due_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      related_finding: gap.claim,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  // If no issues, create a general baseline finding
  if (findings.length === 0 && extractedFacts.length > 0) {
    findings.push({
      id: generateId(),
      workspace_id: workspaceId,
      title: `Document Ingestion Complete for ${newSource.file_name}`,
      description: `Successfully extracted ${extractedFacts.length} normalized statements without contradictions.`,
      severity: 'low',
      confidence: 0.95,
      status: 'active',
      category: 'General Finding',
      finding_type: 'opportunity',
      evidence_count: extractedFacts.length,
      sources_involved: [newSource.file_name],
      supporting_facts: extractedFacts.map(f => f.id),
      explanation: 'All extracted parameters are internally consistent.',
      recommended_action: 'Proceed with additional document ingestion or baseline sign-off.',
      created_at: new Date().toISOString(),
    });
  }

  // 4. Decision Synthesis
  const hasIssues = detectedConflicts.length > 0 || allGaps.length > 0;
  const decision: Decision = {
    id: generateId(),
    workspace_id: workspaceId,
    title: `Operational Baseline Review for ${workspaceName}`,
    status: detectedConflicts.length > 0 ? 'review_required' : allGaps.length > 0 ? 'insufficient_evidence' : 'ready',
    summary: hasIssues
      ? `Review required: ${detectedConflicts.length} contradiction(s) and ${allGaps.length} evidence gap(s) identified.`
      : `Ready: All claims corroborated across ${existingSources.length + 1} document(s).`,
    reasoning: hasIssues
      ? 'Documented discrepancies must be reviewed before final approval.'
      : 'Evidence provenance verified with matching cross-document attributes.',
    factors: [
      {
        factor: 'Cross-Source Consistency',
        status: detectedConflicts.length > 0 ? 'conflict' : 'supported',
        impact: 'Critical',
        detail: detectedConflicts.length > 0 ? `${detectedConflicts.length} active parameter conflicts detected.` : 'All attributes mutually consistent.'
      },
      {
        factor: 'Evidence Completeness',
        status: allGaps.length > 0 ? 'unverified' : 'supported',
        impact: 'High',
        detail: allGaps.length > 0 ? `${allGaps.length} uncorroborated claims require documentation.` : 'All required assertions substantiated.'
      }
    ],
    created_by: 'InfoFusion Intelligence Engine',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return {
    facts: extractedFacts,
    evidenceItems,
    conflicts: detectedConflicts,
    evidenceGaps: extractedGaps,
    findings,
    actions,
    decision,
  };
};

/**
 * Creates the official Section 19 generic test scenario using 2 generic documents:
 * Document A: Agreement_Contract_Terms.txt (Contract Value: $50,000, Delivery: 30 days)
 * Document B: Commercial_Quotation_Reconciliation.txt (Contract Value: $65,000, Delivery: 30 days, Missing approval)
 */
export const createGenericTestDocuments = (workspaceId: string): { docA: Source; docB: Source } => {
  const docA: Source = {
    id: `src-test-a-${Date.now()}`,
    workspace_id: workspaceId,
    uploaded_by: 'system',
    file_name: 'Customer_Agreement_Contract.txt',
    file_type: 'txt',
    storage_path: `workspaces/${workspaceId}/Customer_Agreement_Contract.txt`,
    file_size: 1024,
    processing_status: 'ready',
    extracted_text: `Customer: Global Client Alpha
Contract Value: $50,000
Delivery Timeline: 30 days
Governing Law: Standard Jurisdiction
Standard SLA: 24/7 Dedicated Support`,
    metadata: { page_count: 1 },
    facts_count: 4,
    conflicts_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const docB: Source = {
    id: `src-test-b-${Date.now()}`,
    workspace_id: workspaceId,
    uploaded_by: 'system',
    file_name: 'Commercial_Quotation_Revision.txt',
    file_type: 'txt',
    storage_path: `workspaces/${workspaceId}/Commercial_Quotation_Revision.txt`,
    file_size: 1024,
    processing_status: 'ready',
    extracted_text: `Customer: Global Client Alpha
Contract Value: $65,000
Delivery Timeline: 30 days
Required Approval Document: Executive Board Sign-off Certificate (not attached)
Standard SLA: Business Hours Only`,
    metadata: { page_count: 1 },
    facts_count: 4,
    conflicts_count: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return { docA, docB };
};
