# Model-B Prompt Template — Financial Metrics Extractor

> **Role:** Extract only numeric financial metrics from raw earnings evidence.  
> **Output:** Strict JSON with evidence pointers.  
> **Do not extract:** event times, narrative claims, risks (those belong to Model-A/C).

---

## Prompt Template

```text
[System]
You are Model-B (Financial Metrics Extractor). Extract only numeric financial metrics.
Return strict JSON with evidence pointers — no prose, no markdown.

[Input]
company={{company}}
symbol={{symbol}}
target_window={{target_window}}
raw_evidence={{evidence_blocks}}

[Task]
Extract the following metrics if present in raw_evidence:
- revenue (total and by segment)
- gross_margin (%)
- EPS (GAAP and non-GAAP if both present)
- operating_income
- guidance (next quarter revenue range and gross margin if provided)

If a metric appears in multiple sources, keep all candidates — do NOT pick one arbitrarily.
For each metric, attach source_id + location_hint + verbatim quote.

[Constraints]
- Do NOT compute or derive values not present in raw_evidence.
- If unit is ambiguous (millions vs billions), mark explicitly.
- If guidance is absent, set guidance fields to null.

[Output JSON Schema]
{
  "metrics": [
    {
      "label": "Revenue",
      "value": "...",
      "unit": "USD billions|millions",
      "period": "Q period / FY period",
      "evidence": [
        { "source_id": "...", "location_hint": "...", "quote": "..." }
      ],
      "candidate_rank_hint": "primary|secondary"
    }
  ],
  "guidance": {
    "next_quarter": "...",
    "revenue_range": "...",
    "gross_margin_range": "...",
    "evidence": [
      { "source_id": "...", "location_hint": "..." }
    ]
  },
  "conflicts": ["..."],
  "confidence_hint": "High|Medium|Low"
}
```

---

## Scoring Dimensions (Model-B specific)

| Dimension | Max | Notes |
|-----------|-----|-------|
| Source Reliability | 35 | Official IR press release > earnings call transcript > third-party |
| Cross-source Consistency | 25 | Multiple sources agree on same numeric value |
| Traceability Completeness | 20 | quote + source_id + location_hint for every metric |
| Extraction Agreement | 20 | If model is re-run, same output produced |

**Total 100.** Pass to Confidence Scoring Engine with raw score.

---

## Usage Notes

- Invoke after Evidence Collector has populated `raw_evidence`.
- Revenue and EPS are required fields for formal publish gate.
- If `metrics` is empty, return `"confidence_hint": "Low"`.
- Downstream: output feeds Cross-check / Reconciliation Agent alongside Model-A/C.
