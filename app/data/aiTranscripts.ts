import NVDA_2026_Q4 from '@/content/ai-transcripts/NVDA_2026_Q4.html';

export interface AiTranscriptHtmlEntry {
  /** Document title, e.g. "AI Summarization (Calendar year: Q1 2026)" */
  doc_title: string;
  /** Company code / ticker symbol, e.g. "AAPL" */
  co_cd: string;
  /** Display name for the company */
  company_name: string;
  /** Fiscal year as string, e.g. "2026" */
  fiscal_year_no: string;
  /** Fiscal quarter as string, e.g. "Q1" */
  fiscal_qtr_no: string;
  /** Raw HTML content of the AI summary */
  doc_html: string;
}

/**
 * All AI Transcript HTML files keyed by (co_cd, fiscal_year_no, fiscal_qtr_no).
 * Sorted newest-first by getAITranscriptByCoCd().
 */
export const AI_TRANSCRIPT_HTML_ENTRIES: AiTranscriptHtmlEntry[] = [
  { doc_title: 'AI Summarization (Calendar year: Q1 2026)', co_cd: 'AAPL', company_name: 'Apple, Inc.', fiscal_year_no: '2026', fiscal_qtr_no: 'Q1', doc_html: `<h3>AI Summarization (Calendar year: Q1 2026)</h3>

<h4>Overall Tone:</h4>
<p>Management tone was confident and forward-looking. Tim Cook emphasized the transformative role of Apple Intelligence across its product lineup, while CFO Luca Maestri delivered reassuring guidance. The call struck an optimistic note despite near-term China headwinds.</p>

<h4>Financial Highlights:</h4>
<ul>
<li><strong>Revenue</strong>: Apple posted record Q1 revenue of $124.3B (+4% YoY).</li>
<li><strong>Gross Margin</strong>: Record gross margin of 46.9%, underscoring Services momentum.</li>
<li><strong>EPS</strong>: $2.40, beat consensus by $0.05.</li>
<li><strong>Services</strong>: All-time high of $26.3B (+14% YoY), reinforcing the platform flywheel thesis.</li>
</ul>

<h4>AI &amp; Product Strategy:</h4>
<p>Apple Intelligence was cited as a key driver of iPhone upgrade cycles, with Cook noting strong early adoption in supported regions. Vision Pro ecosystem development is progressing, with developer interest described as "extremely high." The company hinted at deeper on-device AI integration in upcoming iOS 20.</p>

<h4>Geopolitical &amp; Macro Risks:</h4>
<p>Greater China revenue declined 11% YoY to $18.5B, reflecting intensifying local competition from Huawei and broader macro softness. Management acknowledged the challenge but expressed confidence in brand loyalty and upcoming AI-enabled product refreshes to re-accelerate the region.</p>

<h4>Q2 2026 Outlook:</h4>
<p>Guidance of $88.5B–$91.5B for Q2 2026 was slightly below the high end of Street expectations, suggesting moderated iPhone demand post-holiday season. Gross margin guided at 46.5%–47.5%, implying Services mix tailwind persists.</p>
<hr>

<h4>Key Quotes:</h4>
<ul>
<li>"Apple Intelligence is creating a new era of personal computing." — Tim Cook</li>
<li>"Our Services business is firing on all cylinders — every metric is at a record." — Luca Maestri</li>
<li>"We continue to invest aggressively because we see a multiyear AI supercycle ahead." — Tim Cook</li>
</ul>

<h4>Key Risks:</h4>
<ul>
<li>China revenue under structural pressure from local competition</li>
<li>Regulatory scrutiny on App Store fees in EU and US</li>
<li>Vision Pro ramp slower than original internal targets</li>
</ul>
` },
  { doc_title: 'AI Summarization (Calendar year: Q4 2025)', co_cd: 'AAPL', company_name: 'Apple, Inc.', fiscal_year_no: '2025', fiscal_qtr_no: 'Q4', doc_html: `<h3>AI Summarization (Calendar year: Q4 2025)</h3>

<h4>Overall Tone:</h4>
<p>Management struck an upbeat tone with iPhone 17 launch demand exceeding expectations. Tim Cook expressed confidence in the recovery trajectory for Greater China and highlighted the growing Services ecosystem as a durable revenue engine.</p>

<h4>Financial Highlights:</h4>
<ul>
<li><strong>Revenue</strong>: Q4 FY2025 revenue reached $94.9B (+6% YoY), beating consensus of $94.5B.</li>
<li><strong>EPS</strong>: Diluted EPS of $1.64 grew 12% YoY.</li>
<li><strong>Gross Margin</strong>: 46.2%, the highest ever for a September quarter, driven by favorable Services mix.</li>
</ul>

<h4>AI &amp; Product Strategy:</h4>
<p>iPhone 17 demand outpaced supply in multiple regions, with Pro models driving the strongest upgrade pull. Apple Intelligence rollout gained momentum with new language support. Services crossed 1B+ paid subscriptions, reinforcing ecosystem stickiness.</p>

<h4>Geopolitical &amp; Macro Risks:</h4>
<p>Greater China revenue showed early recovery at $15.0B (+2% YoY), though the base remains fragile amid ongoing competition from domestic handset makers. Management guided cautiously on macro uncertainty heading into calendar 2026.</p>

<h4>Q1 FY2026 Outlook:</h4>
<p>Revenue guidance of $119B–$123B implies low single-digit YoY growth, conservative relative to Street models. Gross margin guidance of 46.5%–47.0% signals continued Services tailwind. Operating expenses guided at $15.3B–$15.5B.</p>
<hr>

<h4>Key Quotes:</h4>
<ul>
<li>"iPhone 17 demand has been exceptional — Pro models are in short supply globally." — Tim Cook</li>
<li>"Services is now a $100B annual run-rate business and still growing double digits." — CFO</li>
<li>"Apple Intelligence is the most significant software feature in our history." — Tim Cook</li>
</ul>

<h4>Key Risks:</h4>
<ul>
<li>iPhone 17 supply constraints limiting near-term revenue capture</li>
<li>China recovery fragile — geopolitical risk remains elevated</li>
<li>Wearables segment showing signs of saturation</li>
</ul>
` },
  { doc_title: 'AI Summarization (Calendar year: Q3 2025)', co_cd: 'AAPL', company_name: 'Apple, Inc.', fiscal_year_no: '2025', fiscal_qtr_no: 'Q3', doc_html: `<h3>AI Summarization (Calendar year: Q3 2025)</h3>

<h4>Overall Tone:</h4>
<p>The tone was measured and steady, with management focused on the Services growth story and the mid-cycle iPhone performance. Cook was notably enthusiastic about the new M4 iPad Pro and its contribution to the overall ecosystem.</p>

<h4>Financial Highlights:</h4>
<ul>
<li><strong>Revenue</strong>: Q3 FY2025 revenue of $85.8B (+5% YoY) aligned with expectations.</li>
<li><strong>EPS</strong>: Diluted EPS of $1.45 grew 11% YoY.</li>
<li><strong>Gross Margin</strong>: 46.3%, expanded 100 bps YoY on the back of rising Services contribution.</li>
</ul>

<h4>AI &amp; Product Strategy:</h4>
<p>Apple Intelligence expanded language support to 12 languages, accelerating global rollout. The M4 iPad Pro drove a 24% iPad revenue surge, demonstrating Apple Silicon's halo effect. The App Store ecosystem generated $1.1T in developer billings in 2024.</p>

<h4>Geopolitical &amp; Macro Risks:</h4>
<p>No significant China commentary this quarter — management sidestepped direct questions on Greater China trajectory. Macro headwinds in Europe cited as a modest demand dampener for iPhone.</p>

<h4>Q4 FY2025 Outlook:</h4>
<p>Revenue guidance of $89B–$93B incorporates iPhone 17 launch seasonality. Gross margin guided at 45.5%–46.5%, with a potential dip on iPhone launch costs. iPhone 17 launch is the key Q4 catalyst to watch.</p>
<hr>

<h4>Key Quotes:</h4>
<ul>
<li>"The M4 iPad Pro is the most capable device we have ever made." — Tim Cook</li>
<li>"Apple Intelligence is rolling out globally — we are just getting started." — Tim Cook</li>
<li>"Services approaching a $100B annual run-rate is a testament to our ecosystem." — CFO</li>
</ul>

<h4>Key Risks:</h4>
<ul>
<li>iPhone revenue flat YoY — upgrade cycle maturation risk</li>
<li>Vision Pro adoption slower than initial projections</li>
<li>Regulatory pressure on App Store business model intensifying in EU</li>
</ul>
` },
  { doc_title: 'AI Summarization (Calendar year: Q2 2025)', co_cd: 'AAPL', company_name: 'Apple, Inc.', fiscal_year_no: '2025', fiscal_qtr_no: 'Q2', doc_html: `<h3>AI Summarization (Calendar year: Q2 2025)</h3>

<h4>Overall Tone:</h4>
<p>Management projected resilience amid tariff concerns, with Cook emphasizing supply chain diversification into India and Vietnam as a structural hedge. The Services record provided a positive anchor to an otherwise mixed macro narrative.</p>

<h4>Financial Highlights:</h4>
<ul>
<li><strong>Revenue</strong>: Q2 FY2025 revenue of $95.4B (+5% YoY) beat Street estimate of $94.1B.</li>
<li><strong>EPS</strong>: Diluted EPS of $1.65 grew 8% YoY.</li>
<li><strong>Gross Margin</strong>: 47.1%, set a record for a March quarter, as Services mix diluted hardware cost pressure.</li>
<li><strong>Services</strong>: All-time record of $26.6B (+12% YoY), with paid subscriptions exceeding 1.1B globally.</li>
</ul>

<h4>AI &amp; Product Strategy:</h4>
<p>Services reached an all-time record of $26.6B (+12% YoY), with paid subscriptions now exceeding 1.1B globally. The M4 iPad launch drove a 15% iPad revenue surge. AI features are being integrated across all major product lines in upcoming OS updates.</p>

<h4>Geopolitical &amp; Macro Risks:</h4>
<p>Greater China revenue declined 2% YoY to $16.0B, showing sequential improvement. Tariff exposure was a key topic — management guided that supply chain diversification to India and Vietnam will reduce exposure by 2026.</p>

<h4>Q3 FY2025 Outlook:</h4>
<p>Revenue guidance of $84B–$88B implies low-to-mid single-digit growth, conservative relative to buyside models. Gross margin guided at 45.5%–46.5%. Supply chain costs from diversification will be a near-term margin headwind.</p>
<hr>

<h4>Key Quotes:</h4>
<ul>
<li>"We are actively diversifying our supply chain — India and Vietnam are key pillars." — Tim Cook</li>
<li>"Services crossed 1.1 billion paid subscriptions — a new milestone for Apple." — Tim Cook</li>
<li>"Tariffs are a real dynamic, but we are managing them aggressively." — CFO</li>
</ul>

<h4>Key Risks:</h4>
<ul>
<li>Tariff exposure if US-China trade tensions escalate further</li>
<li>China revenue recovery pace uncertain amid competition</li>
<li>Supply chain diversification costs compressing near-term margins</li>
</ul>
` },
  { doc_title: 'AI Summarization (Calendar year: Q1 2025)', co_cd: 'AAPL', company_name: 'Apple, Inc.', fiscal_year_no: '2025', fiscal_qtr_no: 'Q1', doc_html: `<h3>AI Summarization (Calendar year: Q1 2025)</h3>

<h4>Overall Tone:</h4>
<p>Management projected confidence on the back of record-breaking financials and the initial launch of Apple Intelligence. Tim Cook's enthusiasm around the AI-driven upgrade cycle was palpable, even as China headwinds remained a recurring concern.</p>

<h4>Financial Highlights:</h4>
<ul>
<li><strong>Revenue</strong>: Q1 FY2025 revenue of $124.3B (+4% YoY) matched consensus.</li>
<li><strong>EPS</strong>: Diluted EPS of $2.40 grew 10% YoY.</li>
<li><strong>Gross Margin</strong>: 46.9%, an all-time record for any Apple quarter, driven by Services mix and iPhone 16 Pro ASP uplift.</li>
</ul>

<h4>AI &amp; Product Strategy:</h4>
<p>Apple Intelligence launched in US English, with 11 additional languages planned for April 2025. Customer reception of iPhone 16 AI features was described as "extremely positive." Installed base across all devices hit all-time highs, broadening the addressable upgrade pool.</p>

<h4>Geopolitical &amp; Macro Risks:</h4>
<p>Greater China revenue declined 11% YoY — the most significant regional drag. Local competition from Huawei and broader macro softness were cited. Management remains confident in brand loyalty and upcoming AI refreshes to stabilize the region.</p>

<h4>Q2 FY2025 Outlook:</h4>
<p>Q2 FY2025 guidance implied low single-digit YoY revenue growth with stable gross margins. Capital return remained robust: $30.0B returned in Q1, with a $26.0B buyback component reflecting strong free cash flow generation.</p>
<hr>

<h4>Key Quotes:</h4>
<ul>
<li>"Apple Intelligence is the beginning of a new chapter for iPhone." — Tim Cook</li>
<li>"Our installed base is at all-time highs — the upgrade opportunity ahead is enormous." — Tim Cook</li>
<li>"We returned $30 billion to shareholders this quarter alone." — CFO</li>
</ul>

<h4>Key Risks:</h4>
<ul>
<li>China revenue decline 11% YoY — structural competitive pressure</li>
<li>Apple Intelligence limited to US English at launch — global rollout pace uncertain</li>
<li>Regulatory overhang on App Store and financial services in multiple jurisdictions</li>
</ul>
` },
  { doc_title: 'AI Summarization (Calendar year: Q4 2019)', co_cd: 'AAPL', company_name: 'Apple, Inc.', fiscal_year_no: '2019', fiscal_qtr_no: 'Q4', doc_html: `<h3>AI Summarization (Calendar year: Q4 2019)</h3>

<h4>Financial Highlights:</h4>

<ul>
<li><strong>Revenue</strong>: $443.6M, QoQ 47.1%, YoY 52.6%, supported by significant share of wallet gains in advanced nodes within the logic/foundry segment and strong double-digit growth in the epitaxy product line.</li>
<li><strong>Gross Margin</strong>: 51.5%, QoQ 9.1 ppts, YoY 9.8 ppts, supported by operational efficiency improvements, including the reduction of inefficiencies and the anticipated benefits from the new manufacturing facility in Singapore.</li>
<li><strong>DOI</strong>: 97.6 days.</li>
<li><strong>Guidance</strong>:
<ul>
<li><strong>Revenue Guidance</strong>: ASMI projects Q1 2020 sales and Q2 2020 sales, considering limited impacts from the coronavirus. The company anticipates a high single-digit percentage increase in WFE spending for 2020, with potential for double-digit growth depending on memory spending recovery.</li>
<li><strong>Gross Margin Guidance</strong>: While specific gross margin figures were not provided, ASMI's strategic focus on expanding its served available markets, particularly in ALD and epitaxy, suggests an emphasis on maintaining or improving margins through technological expertise and customer engagement.</li>
<li><strong>Overall Company Performance and Outlook</strong>: ASMI is strategically positioned for growth, with significant gains in advanced nodes within the logic/foundry segment and opportunities in China. The company remains vigilant regarding coronavirus impacts, ready to adjust its outlook as needed, and continues to leverage its technological strengths and customer relationships to sustain its growth trajectory.</li>
</ul></li>
</ul>

<h4>Briefing of Key Message:</h4>
<p>Notice: Since the Bloomberg segment revenue data is not yet available, the key message will be skipped for now. Once the Bloomberg data is released, the AI summary will be regenerated.</p>

<h4>Key Message:</h4>
<p>Notice: Since the Bloomberg segment revenue data is not yet available, the key message will be skipped for now. Once the Bloomberg data is released, the AI summary will be regenerated.</p>
<hr>

<h4>Key insights from Q&amp;A session</h4>

<ul>
<li><p><strong>Summary of Key Themes</strong>: </p><ol>
<li><strong>Market Dynamics and Business Outlook</strong>: The company is optimistic about the logic/foundry business, expecting a healthy climate throughout the year without a significant drop in the second half. They are actively engaged in advanced nodes, indicating ongoing activity and demand in this segment. In the memory market, the company has maintained stable performance despite market downturns, with DRAM being the larger contributor. They anticipate strong performance in DRAM for 2020, driven by non-patterning ALD applications, and expect gradual increases in 3D NAND applications.</li>
<li><strong>Operational Impact and Risk Management</strong>: The company has assessed the impact of the coronavirus on their operations and guidance, concluding that there is limited risk in their current guidance. They have factored in potential impacts for Q1 and Q2, indicating a proactive approach to risk management.</li>
<li><strong>Growth Strategy and Financial Performance</strong>: The company is focused on expanding their served available market in ALD, with growth opportunities in both logic/foundry and memory. They believe the ALD market will continue to grow beyond the $1.5 billion forecast for 2021. Efforts to improve gross margins are underway, with a focus on reducing inefficiencies and optimizing costs. The company expects to gradually move towards the higher end of their gross margin range as new products contribute positively and operational efficiencies improve.</li>
</ol></li>
<li><p><strong>Theme 1: Impact of Coronavirus on Operations and Guidance</strong></p>

<ul>
<li><strong>Analyst Questions:</strong>
&ldquo;&ldquo;I'm just curious, you said, you've not seen any impact from the virus either in terms of your shipments or even demand. Is that still the situation is your guidance for Q1 and Q2 sufficiently de-risked, or do you think there could be further downside if the situation gets worse in Korea or elsewhere?&rdquo;&rdquo;</li>
<li><strong>Company Response:</strong>
The company has reviewed the situation and concluded that there is very limited risk in their current guidance. They have taken the potential impact of the coronavirus into account in their guidance for Q1 and Q2.</li>
</ul></li>
<li><p><strong>Theme 2: Logic/Foundry Business Outlook</strong></p>

<ul>
<li><strong>Analyst Questions:</strong>
&ldquo;&ldquo;You have, of course, mentioned that you expect continued strength in logic/foundry in 2020. But do you have some visibility beyond the first half, also because I think one of your peers, Lam indicated that they think that the logic/foundry business in 2020 may be a bit - well, might be a bit first half loaded.&rdquo;&rdquo;</li>
<li><strong>Company Response:</strong>
The company sees a very healthy climate for logic/foundry for the full year and does not expect a significant drop in the second half compared to the first half. They are engaged with both segments and see ongoing activity in advanced nodes.</li>
</ul></li>
<li><p><strong>Theme 3: Memory Market Dynamics</strong></p>
<ul>
<li><strong>Analyst Questions:</strong>
&ldquo;&ldquo;Just trying to understand the size of the memory business now, in terms of - like obviously, you're talking about memory being flat last year, clearly versus market being down 25%, 30%. So, just trying to understand like how is that memory revenue split between NAND and DRAM, is it more like 50/50 or NAND is much higher in the mix?&rdquo;&rdquo;</li>
<li><strong>Company Response:</strong>
The company maintained stable performance in memory despite market downturns, with DRAM being the larger contributor. They expect DRAM to perform strongly in 2020, driven by non-patterning ALD applications, and see gradual increases in 3D NAND applications.</li>
</ul></li>
</ul>
` },
  { doc_title: 'AI Summarization (Calendar year: Q4 2026)', co_cd: 'NVDA', company_name: 'NVIDIA Corp.', fiscal_year_no: '2026', fiscal_qtr_no: 'Q4', doc_html: NVDA_2026_Q4 },
];
