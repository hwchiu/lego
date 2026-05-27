# Confidence Scoring Specification — Earnings Evidence A-team

> Defines dimensions, weights, thresholds, publish gates, and conflict resolution rules  
> for the A-team Gatekeeper/Publisher.

---

## 1. Score Dimensions and Weights

Each dimension contributes to a 0–100 total score.

| # | Dimension | Max Points | Description |
|---|-----------|-----------|-------------|
| 1 | Source Reliability (SR) | 35 | Quality tier of the evidence source |
| 2 | Cross-source Consistency (CS) | 25 | Agreement across multiple independent sources |
| 3 | Extraction Agreement (EA) | 20 | Agreement across Model-A/B/C outputs (or re-runs) |
| 4 | Traceability Completeness (TC) | 10 | Presence of source_id + location_hint + quote |
| 5 | Timezone/Period Integrity (TI) | 10 | Internal consistency of ET/PT/TW and fiscal/calendar mapping |

**Formula:** `total_score = SR + CS + EA + TC + TI`

---

## 2. Source Reliability Tiers (SR)

| Tier | Examples | Points |
|------|----------|--------|
| Official | SEC filing, IR press release, official webcast transcript | 30–35 |
| Semi-official | Earnings call transcript mirror (verified), authorized redistribution | 22–29 |
| Third-party | News article, analyst note, market data mirror | 12–21 |
| Unverified | Social media, unattributed summary | 0–11 |

---

## 3. Cross-source Consistency (CS)

| Scenario | Points |
|----------|--------|
| 3+ sources fully agree | 22–25 |
| 2 sources agree | 15–21 |
| 1 source only (no cross-check possible) | 8–14 |
| Sources conflict (different values) | 0–7 |

---

## 4. Confidence Levels

| Level | Score Range | Meaning |
|-------|------------|---------|
| **High** | ≥ 85 | Ready for formal publish without caveat |
| **Medium** | 70–84 | Publishable with caveat; flag unresolved items |
| **Low** | < 70 | Do NOT publish in formal version; requires review |

---

## 5. Publish Gates

### Internal Snapshot (T+30m)
- **Allowed:** High, Medium, or Low — but Low items must appear in `unresolved_items` list.
- **Required fields:** event_time_tw, at least one financial metric.

### Formal Publish (T+2~4h)
- **Event Time:** Must be **Medium or above** (score ≥ 70).  
  If below Medium, do not publish event time; flag as "Pending confirmation".
- **Revenue / EPS:** If either is **Low**, formal version must label the metric "待確認".
- **Narrative Items:** High-materiality items must have at least **two** corroborating evidence pointers.

### Human Override (Gatekeeper Review Required)
Trigger human review when:
- Official source and third-party source contradict each other on a key metric.
- Model-A/B/C disagree on the same field across runs.
- Any metric CS score < 8 (single source with no cross-check).

---

## 6. Conflict Resolution Rules

1. **Official source wins** over third-party on factual claims (dates, numbers).
2. **Most recent source wins** when same-tier sources provide different values for the same period.
3. **Explicit over inferred**: a directly stated value beats a computed/inferred one.
4. When conflicts cannot be resolved, mark as `confidence_hint: "Low"` and add to `conflicts` list.

---

## 7. Audit Bundle Requirements

Every formal publish must include:

| Item | Required |
|------|---------|
| Source list with URLs and locationHints | ✅ |
| Verbatim quotes for High/Medium claims | ✅ |
| Conflict resolution log | ✅ |
| Score trace (per dimension, per metric) | ✅ |
| Unresolved items list | ✅ |
| Timezone conversion trace (ET→TW) | ✅ |

---

## 8. Integration with Pipeline Stages

```
Evidence Collector
    → Model-A / Model-B / Model-C (each returns raw score hints)
        → Cross-check / Reconciliation Agent (resolves conflicts, adjusts scores)
            → Confidence Scoring Engine (applies this spec)
                → A-team Gatekeeper (applies publish gates)
                    → Internal Snapshot (T+30m) / Formal Publish (T+2~4h)
```
