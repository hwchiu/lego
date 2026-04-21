import NVDA_2026_Q4 from '@/content/ir-transcripts/NVDA_2026_Q4.html';

export interface IrTranscriptHtmlEntry {
  /** Document title, e.g. "Apple, Inc.(AAPL-US), Q1 2026 Earnings Call Transcript" */
  doc_title: string;
  /** Company code / ticker symbol, e.g. "AAPL" */
  co_cd: string;
  /** Display name for the company */
  company_name: string;
  /** Fiscal year as string, e.g. "2026" */
  fiscal_year_no: string;
  /** Fiscal quarter as string, e.g. "Q1" */
  fiscal_qtr_no: string;
  /** Event date string, e.g. "29-January-2026 5:00 PM ET" */
  event_date?: string;
  /** Original source URL */
  file_url: string;
  /** Raw HTML content of the transcript */
  doc_html: string;
}

/**
 * All IR Transcript HTML files keyed by (co_cd, fiscal_year_no, fiscal_qtr_no).
 * Sorted newest-first by getIRTranscriptByCoCd().
 */
export const IR_TRANSCRIPT_HTML_ENTRIES: IrTranscriptHtmlEntry[] = [
  {
    doc_title: 'Apple, Inc.(AAPL-US), Q1 2026 Earnings Call Transcript',
    co_cd: 'AAPL',
    company_name: 'Apple, Inc.',
    fiscal_year_no: '2026',
    fiscal_qtr_no: 'Q1',
    event_date: '29-January-2026 5:00 PM ET',
    file_url: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2026/q1/aapl-20260128.htm',
    doc_html: `<div class="irt-participants-block">
<p class="irt-p-mgmt"><strong>Suhasini Chandramouli</strong> — Director, Investor Relations, Apple, Inc.</p>
<p class="irt-p-mgmt"><strong>Timothy D. Cook</strong> — Chief Executive Officer &amp; Director, Apple, Inc.</p>
<p class="irt-p-mgmt"><strong>Kevan Parekh</strong> — Chief Financial Officer, Apple, Inc.</p>
<p class="irt-p-analyst"><strong>Amit Daryanani</strong> — Evercore ISI</p>
<p class="irt-p-analyst"><strong>Erik Woodring</strong> — Morgan Stanley</p>
<p class="irt-p-analyst"><strong>Ben Reitzes</strong> — Melius Research</p>
<p class="irt-p-analyst"><strong>Wamsi Mohan</strong> — Bank of America</p>
<p class="irt-p-analyst"><strong>Samik Chatterjee</strong> — JPMorgan</p>
<p class="irt-p-analyst"><strong>Aaron Rakers</strong> — Wells Fargo</p>
</div>

<div class="irt-section-label">MANAGEMENT DISCUSSION SECTION</div>

<p class="p p8"><strong>Suhasini Chandramouli — Director, Investor Relations</strong></p>
<p class="p p8">Good afternoon, and welcome to the Apple Q1 Fiscal Year 2026 earnings conference call. My name is Suhasini Chandramouli, Director of Investor Relations. Today's call is being recorded.</p>
<p class="p p8">Speaking first today is Apple CEO Tim Cook, and he'll be followed by CFO Kevan Parekh. After that, we'll open the call to questions from analysts.</p>
<p class="p p8">Please note that some of the information you'll hear during our discussion today will consist of forward-looking statements, including, without limitation, those regarding revenue, gross margin, operating expenses, other income and expense, taxes, capital allocation, and future business outlook. These statements involve risks and uncertainties that may cause actual results or trends to differ materially from our forecast, including risks related to the potential impact to the company's business and results of operations from macroeconomic conditions, tariffs and other measures, and legal and regulatory proceedings.</p>
<p class="p p8">For more information, please refer to the risk factors discussed in Apple's most recently filed reports on Form 10-Q and Form 10-K, and the Form 8-K filed with the SEC today, along with the associated press release. Apple assumes no obligation to update any forward-looking statements, which speak only as of the date they are made.</p>
<p class="p p8">I'd now like to turn the call over to Tim for introductory remarks.</p>

<p class="p p8"><strong>Timothy D. Cook — Chief Executive Officer &amp; Director</strong></p>
<p class="p p8">Thank you, Suhasini. Good afternoon, everyone. I am proud to say that we just had a quarter for the record books.</p>
<p class="p p8">Q1 fiscal year 2026 revenue was $143.8 billion, up 16% year over year — an all-time quarterly record for Apple. We set all-time records across a remarkably wide range of metrics: revenue, iPhone, Services, EPS, and operating cash flow all reached new historic highs in the same quarter.</p>
<p class="p p8">iPhone revenue was $85.3 billion, up 23% year over year, with broad-based strength across all geographies. iPhone 17 Pro has been the most popular Pro model we have ever made. Customer satisfaction with the new lineup has been extraordinary, and Apple Intelligence is driving meaningful upgrade decisions among our installed base.</p>
<p class="p p8">Services delivered another record quarter, with revenue of $30.0 billion, up 14% year over year. Our installed base of active devices reached an all-time high of over 2.5 billion. This provides an ever-growing foundation for Services growth for years to come.</p>
<p class="p p8">Mac revenue was $9.7 billion, up 18% year over year. iPad was $8.1 billion, up 15%. Wearables, Home &amp; Accessories came in at $11.7 billion. We also saw outstanding performance in India and across emerging markets, where we continue to gain meaningful share.</p>
<p class="p p8">Greater China revenue was $23.8 billion, up 11% year over year — a return to growth in that market, driven by iPhone 17 demand and expanding Services adoption.</p>
<p class="p p8">We have never been more confident in the innovative pipeline ahead of us. Apple Intelligence is still in its early innings. We are expanding language support globally throughout the year, and we have many more exciting features to share. The integration of AI across every product line has only just begun.</p>
<p class="p p8">I will now hand things over to Kevan to walk you through the financials in more detail.</p>

<p class="p p8"><strong>Kevan Parekh — Chief Financial Officer</strong></p>
<p class="p p8">Thank you, Tim. Good afternoon, everyone. I am very pleased to report another record-breaking quarter for Apple.</p>
<p class="p p8">Revenue for Q1 fiscal year 2026 was $143.8 billion, up 16% year over year. Diluted EPS was $2.84, up 19% year over year — an all-time record. Gross margin was 48.2%, up from 46.9% in the prior-year quarter, driven by our improved product mix and the growing contribution of our high-margin Services segment.</p>
<p class="p p8">Operating cash flow for the quarter was $53.9 billion — also an all-time record. This reflects the extraordinary profitability and capital efficiency of our business model.</p>
<p class="p p8">On segment performance: iPhone revenue of $85.3 billion reflects the strength of the iPhone 17 launch cycle and continued momentum in emerging markets. Services revenue of $30.0 billion reflects the scale and breadth of our ecosystem. Our paid subscriber count continues to grow strongly across every Services category.</p>
<p class="p p8">Regarding operating expenses: R&amp;D expense was $8.3 billion and SG&amp;A was $6.6 billion, for a total of $14.9 billion, within our guidance range.</p>
<p class="p p8">Our cash and investments balance is $141.5 billion. Net of debt, we carry a net cash position of $37.5 billion. During Q1, we returned over $30 billion to shareholders, including $26 billion in share repurchases and $4 billion in dividends. Since the beginning of our capital return program, we have returned over $900 billion to shareholders.</p>
<p class="p p8">Looking ahead to Q2 of fiscal year 2026: we expect revenue to grow 13% to 16% year over year. We expect gross margin to be between 48.0% and 49.0%. We expect operating expenses to be between $15.2 billion and $15.4 billion.</p>
<p class="p p8">With that, I would like to open the call to questions.</p>

<div class="irt-section-label">Q&amp;A</div>

<p class="p p8"><strong>Operator</strong></p>
<p class="p p8">Certainly. We will go ahead and take our first question from Amit Daryanani of Evercore. Please go ahead.</p>

<p class="p p8"><strong>Amit Daryanani — Evercore ISI</strong></p>
<p class="p p8">Good afternoon, and congrats on a tremendous quarter. My question is on gross margins. Coming in at 48.2%, well above the high end of your guidance, this continues a trend of margin expansion. Could you help us understand what is driving this? And as we look at Q2 guidance of 48% to 49%, should we think about this level as the new baseline?</p>

<p class="p p8"><strong>Kevan Parekh — Chief Financial Officer</strong></p>
<p class="p p8">Thanks, Amit. The strong gross margin performance reflects two primary drivers. First, Services continues to grow faster than the overall business, and Services carry meaningfully higher margins. Second, we have seen favorable cost dynamics in the supply chain, which the operations team has worked very hard to achieve. The guidance range of 48% to 49% for Q2 reflects our visibility into the near term. We feel very good about where we are on margins.</p>

<p class="p p8"><strong>Operator</strong></p>
<p class="p p8">Our next question comes from Erik Woodring of Morgan Stanley. Please go ahead.</p>

<p class="p p8"><strong>Erik Woodring — Morgan Stanley</strong></p>
<p class="p p8">Hi, good evening, and congratulations. Tim, I wanted to ask about iPhone demand. The 23% year-over-year growth is obviously very strong. How much of that would you attribute to the Apple Intelligence upgrade cycle versus broader macro tailwinds, and are you seeing any signs of pull-forward that might affect the Q2 iPhone trajectory?</p>

<p class="p p8"><strong>Timothy D. Cook — Chief Executive Officer &amp; Director</strong></p>
<p class="p p8">Thanks, Erik. The upgrade cycle is very healthy and broad-based. Apple Intelligence is clearly resonating with customers — we see strong adoption of the features and very positive sentiment in customer surveys. But I would also point to the natural refresh cycle, particularly among older iPhone users who are now eligible and motivated to upgrade. We are not seeing patterns that suggest significant pull-forward. Demand has been strong and consistent throughout the quarter, and we are optimistic about Q2 as well.</p>

<p class="p p8"><strong>Operator</strong></p>
<p class="p p8">Our next question comes from Ben Reitzes of Melius Research. Please go ahead.</p>

<p class="p p8"><strong>Ben Reitzes — Melius Research</strong></p>
<p class="p p8">Great, thanks. Kevan, Services at $30 billion was really impressive. Can you give us more color on which specific Services are growing the fastest, and how we should think about the margin profile of Services as the mix continues to shift?</p>

<p class="p p8"><strong>Kevan Parekh — Chief Financial Officer</strong></p>
<p class="p p8">Thank you, Ben. Across our Services portfolio we are seeing strength broadly. The App Store continues to perform very well, with strong developer activity and consumer engagement globally. Apple TV+ original content is driving growth in both subscriptions and average revenue per user. iCloud and Apple One bundles are growing as our device installed base expands. Regarding margin, the Services segment overall carries high margins relative to our product segments, and as Services grows its share of revenue it contributes meaningfully to our overall gross margin expansion. We are very excited about the opportunity ahead in Services.</p>

<p class="p p8"><strong>Operator</strong></p>
<p class="p p8">Our next question comes from Wamsi Mohan of Bank of America. Please go ahead.</p>

<p class="p p8"><strong>Wamsi Mohan — Bank of America</strong></p>
<p class="p p8">Hi, good afternoon. Tim, Greater China was up 11% — a very strong recovery. Can you give us a sense of what drove that recovery, and how sustainable it is given ongoing competitive pressure from local manufacturers?</p>

<p class="p p8"><strong>Timothy D. Cook — Chief Executive Officer &amp; Director</strong></p>
<p class="p p8">Sure, Wamsi. The Greater China recovery is driven by several factors. iPhone 17 Pro demand was particularly strong in China, and we saw healthy upgrade activity from our existing customer base. Apple Intelligence, while still rolling out in local languages, has generated significant anticipation among Chinese consumers. We are also seeing growth in Services in China. I would note that competition is real and we never take our position for granted, but we are very pleased with this quarter's results and cautiously optimistic about the trajectory.</p>

<p class="p p8"><strong>Operator</strong></p>
<p class="p p8">Our next question comes from Samik Chatterjee of JPMorgan. Please go ahead.</p>

<p class="p p8"><strong>Samik Chatterjee — JPMorgan</strong></p>
<p class="p p8">Hi, thanks for taking my question. I wanted to ask about supply constraints. Which product areas are you seeing the most constraints, and how should we think about that impacting the Q2 outlook?</p>

<p class="p p8"><strong>Timothy D. Cook — Chief Executive Officer &amp; Director</strong></p>
<p class="p p8">Samik, supply constraints are most acute in iPhone 17 Pro and Pro Max, particularly for advanced display technologies and some semiconductor components tied to our custom silicon. We are working very closely with our supply partners to ramp capacity. We were largely supply-constrained on the Pro models for much of Q1, and we expect to exit those constraints progressively through Q2. The teams are doing excellent work managing through these challenges.</p>

<p class="p p8"><strong>Operator</strong></p>
<p class="p p8">That concludes today's question-and-answer session. I would now like to turn the call back to Suhasini for closing remarks.</p>

<p class="p p8"><strong>Suhasini Chandramouli — Director, Investor Relations</strong></p>
<p class="p p8">Thank you, and thank you all for joining us today. A replay of today's call will be available for two weeks on Apple's Investor Relations website at investor.apple.com. We look forward to speaking with you again at our next earnings call. Good afternoon, everyone.</p>
`,
  },
  {
    doc_title: 'Apple, Inc.(AAPL-US), Q4 2025 Earnings Call Transcript',
    co_cd: 'AAPL',
    company_name: 'Apple, Inc.',
    fiscal_year_no: '2025',
    fiscal_qtr_no: 'Q4',
    file_url: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2025/q4/aapl-20251003.htm',
    doc_html: `<p class="p p8"><strong>Operator</strong></p>
<p class="p p8">Welcome to Apple's Fourth Quarter Fiscal Year 2025 Earnings Conference Call. All participants are in a listen-only mode. After the speakers' remarks, there will be a question-and-answer session.</p>
<p class="p p8">I'd now like to turn the call over to Tim Cook, Chief Executive Officer.</p>

<p class="p p8"><strong>Tim Cook — CEO</strong></p>
<p class="p p8">Good afternoon, everyone. We are very pleased to report strong results for our fiscal fourth quarter, which ended September 2025.</p>
<p class="p p8">Q4 FY2025 revenue came in at $94.9 billion, up 6% year over year, above analyst consensus of $94.5 billion. iPhone 17 launch demand has been exceptional, and we couldn't be more proud of the product lineup this year.</p>
<p class="p p8">Apple Intelligence was a key driver of our upgrade cycle. We're seeing customers actively seeking out the AI-powered features, particularly in writing tools, image creation, and Siri's new capabilities. The enthusiasm has been remarkable.</p>
<p class="p p8">iPhone 17 Pro demand is outpacing supply in multiple regions — we are working hard to close that gap as quickly as possible. Our teams have been doing an incredible job ramping production.</p>
<p class="p p8">Services crossed a tremendous milestone: over 1 billion paid subscriptions globally. That is a reflection of the incredible value customers find across our Services portfolio.</p>

<p class="p p8"><strong>Kevan Parekh — CFO</strong></p>
<p class="p p8">Thank you, Tim. Let me add more color on the financials.</p>
<p class="p p8">Q4 FY2025 revenue was $94.9 billion, up 6% year over year. EPS was $1.64 diluted, up 12% year over year. Gross margin was 46.2% — the highest ever for any September quarter in Apple's history.</p>
<p class="p p8">iPhone revenue was $46.2 billion, up 5.5% year over year, driven by iPhone 17 launch demand. Services reached $25.0 billion, up 13% year over year — a new record for Q4. Mac came in at $7.7 billion, up 2%; iPad at $7.0 billion, up 8%; Wearables, Home &amp; Accessories at $8.5 billion, down 1%.</p>
<p class="p p8">Greater China revenue was $15.0 billion, up 2%, showing early signs of recovery in the region.</p>
<p class="p p8">Looking ahead to Q1 FY2026, we are guiding revenue in the range of $119 billion to $123 billion, implying low single-digit growth year over year. Gross margin is expected between 46.5% and 47.0%, and operating expenses between $15.3 billion and $15.5 billion.</p>
`,
  },
  {
    doc_title: 'Apple, Inc.(AAPL-US), Q3 2025 Earnings Call Transcript',
    co_cd: 'AAPL',
    company_name: 'Apple, Inc.',
    fiscal_year_no: '2025',
    fiscal_qtr_no: 'Q3',
    file_url: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2025/q3/aapl-20250628.htm',
    doc_html: `<p class="p p8"><strong>Operator</strong></p>
<p class="p p8">Welcome to Apple's Third Quarter Fiscal Year 2025 Earnings Conference Call. All participants are in a listen-only mode.</p>
<p class="p p8">I would now like to hand the conference over to Tim Cook, Chief Executive Officer.</p>

<p class="p p8"><strong>Tim Cook — CEO</strong></p>
<p class="p p8">Good afternoon, everyone. We are very happy to report another strong quarter for Apple.</p>
<p class="p p8">Q3 FY2025 revenue was $85.8 billion, up 5% year over year, in line with our expectations. We saw balanced performance across geographies and product categories.</p>
<p class="p p8">Apple Intelligence rollout continued to progress. We added new language support in 12 additional languages this quarter, significantly expanding the global reach of these features. Customer engagement with the new capabilities remains very strong.</p>
<p class="p p8">The App Store ecosystem generated $1.1 trillion in developer billings and sales in 2024, representing extraordinary value for developers and customers alike. Vision Pro's software ecosystem continues to grow, with over 2,500 spatial computing apps now available.</p>
<p class="p p8">Looking at our product lineup — the new M4 iPad Pro has been extremely well received, driving strong double-digit growth in the iPad category. We're very excited about the fall lineup coming up.</p>

<p class="p p8"><strong>Kevan Parekh — CFO</strong></p>
<p class="p p8">Thank you, Tim. Let me provide more detail on our Q3 FY2025 results.</p>
<p class="p p8">Revenue was $85.8 billion, up 5% year over year. Diluted EPS was $1.45, up 11% year over year. Gross margin came in at 46.3%, up 100 basis points year over year.</p>
<p class="p p8">iPhone revenue was $39.0 billion, essentially flat year over year — typical mid-cycle performance before the fall iPhone launch. Services revenue reached $24.2 billion, up 14% year over year, approaching a $100 billion annual run rate. Mac came in at $7.0 billion, up 3%; iPad was $7.2 billion, up 24% driven by the new M4 iPad Pro launch; Wearables, Home &amp; Accessories were $7.4 billion.</p>
<p class="p p8">For Q4 FY2025 guidance, we expect revenue in the range of $89 billion to $93 billion. Gross margin is guided at 45.5% to 46.5%. We anticipate the iPhone 17 launch in September to be a significant contributor to Q4 performance.</p>
`,
  },
  {
    doc_title: 'Apple, Inc.(AAPL-US), Q2 2025 Earnings Call Transcript',
    co_cd: 'AAPL',
    company_name: 'Apple, Inc.',
    fiscal_year_no: '2025',
    fiscal_qtr_no: 'Q2',
    file_url: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2025/q2/aapl-20250329.htm',
    doc_html: `<p class="p p8"><strong>Operator</strong></p>
<p class="p p8">Welcome to Apple's Second Quarter Fiscal Year 2025 Earnings Conference Call. All participants are in a listen-only mode. After the speakers' remarks, there will be a question-and-answer session.</p>
<p class="p p8">I'd now like to introduce Tim Cook, Apple's Chief Executive Officer.</p>

<p class="p p8"><strong>Tim Cook — CEO</strong></p>
<p class="p p8">Good afternoon, everyone. We're pleased to report strong results for the March quarter, with record-breaking gross margin performance.</p>
<p class="p p8">Q2 FY2025 revenue was $95.4 billion, up 5% year over year, above the Street estimate of $94.1 billion. This is a great testament to the strength of our business and product lineup.</p>
<p class="p p8">I'd like to address the macro environment. We've been actively diversifying our supply chain to India and Vietnam, and this work is progressing well. We believe this diversification will meaningfully reduce our tariff exposure as we move into fiscal year 2026.</p>
<p class="p p8">Our paid subscription base surpassed 1.1 billion globally — an incredible milestone that underscores the growing depth and breadth of our Services ecosystem.</p>
<p class="p p8">AI features are being integrated across all major product lines in upcoming updates. We have a lot of exciting things to share later this year.</p>

<p class="p p8"><strong>Kevan Parekh — CFO</strong></p>
<p class="p p8">Thanks, Tim. Let me walk through the details of our second quarter fiscal 2025 results.</p>
<p class="p p8">Revenue for the quarter was $95.4 billion, up 5% year over year. Diluted EPS was $1.65, up 8% year over year. Gross margin was 47.1% — a record for any March quarter in Apple's history, driven by our Services mix.</p>
<p class="p p8">iPhone revenue was $46.8 billion, up 2% year over year despite macro headwinds in China. Services revenue reached $26.6 billion, up 12% year over year — an all-time record for any quarter. Mac delivered $7.9 billion, up 7%; iPad $6.4 billion, up 15% with the M4 launch; Greater China was $16.0 billion, down 2% year over year.</p>
<p class="p p8">For Q3 FY2025, we're guiding revenue in the range of $84 billion to $88 billion, representing low-to-mid single-digit growth year over year. Gross margin is expected at 45.5% to 46.5%. Supply chain diversification is expected to reduce tariff exposure by 2026.</p>
`,
  },
  {
    doc_title: 'Apple, Inc.(AAPL-US), Q1 2025 Earnings Call Transcript',
    co_cd: 'AAPL',
    company_name: 'Apple, Inc.',
    fiscal_year_no: '2025',
    fiscal_qtr_no: 'Q1',
    file_url: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2025/q1/aapl-20241228.htm',
    doc_html: `<p class="p p8"><strong>Operator</strong></p>
<p class="p p8">Welcome to Apple's First Quarter Fiscal Year 2025 Earnings Conference Call. All participants are in a listen-only mode.</p>
<p class="p p8">I'd now like to introduce Tim Cook, Apple's Chief Executive Officer.</p>

<p class="p p8"><strong>Tim Cook — CEO</strong></p>
<p class="p p8">Good afternoon. We're very happy to report record results for the December quarter, with strong performance across our entire product lineup.</p>
<p class="p p8">Q1 FY2025 revenue was $124.3 billion, up 4% year over year, in line with consensus. This was the all-time highest revenue quarter in Apple's history at the time.</p>
<p class="p p8">Apple Intelligence launched in US English this quarter. Customer reception has been extremely positive — Tim Cook noted the features are driving engagement and upgrade interest. We plan to launch in 11 additional languages in April 2025.</p>
<p class="p p8">Our installed base across all devices continues to reach all-time highs. This gives us a strong foundation for continuing to grow our Services business and deepen customer engagement with the entire Apple ecosystem.</p>
<p class="p p8">iPhone 16 Pro demand has been particularly strong, driven by the AI features exclusive to the Pro lineup.</p>

<p class="p p8"><strong>Luca Maestri — CFO</strong></p>
<p class="p p8">Thank you, Tim. Let me walk you through the financial details of our fiscal first quarter of 2025.</p>
<p class="p p8">Revenue was $124.3 billion, up 4% year over year. Diluted EPS was $2.40, up 10% year over year. Gross margin was 46.9% — a record gross margin for any Apple quarter in history.</p>
<p class="p p8">iPhone revenue was $69.1 billion, up 1% year over year, driven by iPhone 16 Pro demand. Services revenue was $26.3 billion, up 14% year over year — an all-time record. Mac came in at $9.0 billion; iPad at $8.1 billion; Wearables, Home &amp; Accessories at $11.7 billion. Greater China revenue declined 11% year over year due to intensified local competition.</p>
<p class="p p8">On capital returns: we returned a total of $30.0 billion to shareholders in Q1. Share repurchases totaled $26.0 billion, and dividends $4.0 billion. Our net cash position declined to $58 billion as we maintained our accelerated buyback pace.</p>
`,
  },
  {
    doc_title: 'Apple, Inc.(AAPL-US), Q4 2019 Earnings Call Transcript',
    co_cd: 'AAPL',
    company_name: 'Apple, Inc.',
    fiscal_year_no: '2019',
    fiscal_qtr_no: 'Q4',
    file_url: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2019/q4/aapl-20191030.htm',
    doc_html: `<p class="p p8"><strong>Operator</strong></p>
<p class="p p8">Welcome to Apple's Fourth Quarter Fiscal Year 2019 Earnings Conference Call. At this time, all participants are in a listen-only mode. After the speakers' remarks, there will be a question-and-answer session.</p>
<p class="p p8">I would now like to turn the call over to Tim Cook, Apple's CEO.</p>

<p class="p p8"><strong>Tim Cook — CEO</strong></p>
<p class="p p8">Good afternoon, everyone. We're very pleased with our Q4 fiscal 2019 performance, which closed out a strong fiscal year for Apple.</p>
<p class="p p8">Q4 FY2019 revenue was $64.0 billion, up 2% year over year, a return to growth after a challenging first half of fiscal 2019. The iPhone product portfolio showed stabilization, and Services continued its impressive growth trajectory.</p>
<p class="p p8">iPhone revenue was $33.4 billion, approximately flat year over year. The iPhone 11 family launched in September and saw very strong customer response. We set records for upgraders in the quarter, and the new camera systems have been a major selling point.</p>
<p class="p p8">Services revenue reached a new all-time record of $12.5 billion, up 18% year over year. This includes the App Store, Apple Music, iCloud, and our newer services including Apple TV+, Apple Arcade, Apple Card, and Apple News+. We're excited about what we've built and where this business is heading.</p>
<p class="p p8">Wearables, Home &amp; Accessories was the fastest-growing category, reaching $6.5 billion — up 54% year over year. Apple Watch and AirPods continue to resonate strongly with customers.</p>

<p class="p p8"><strong>Luca Maestri — CFO</strong></p>
<p class="p p8">Thank you, Tim. I'll now provide more detail on our financial results for the fourth fiscal quarter of 2019.</p>
<p class="p p8">Revenue was $64.0 billion, up 2% year over year. Diluted EPS was $3.03, up 4% year over year, reflecting continued share repurchases and operational discipline. Gross margin was 38.0%, at the high end of our guidance range.</p>
<p class="p p8">As Tim mentioned, Services delivered a record $12.5 billion, and our paid subscriber base across all Services reached over 450 million — an increase of more than 120 million in the prior 12 months. We are on track to double our fiscal 2016 Services revenue by fiscal year 2020.</p>
<p class="p p8">Mac revenue was $6.9 billion, up 4% year over year. iPad revenue was $4.7 billion, up 17% year over year driven by the new iPad and iPad Pro models.</p>
<p class="p p8">We returned over $18 billion to shareholders in the quarter, including $17 billion in share repurchases and $3.5 billion in dividends. Since the start of our capital return program, we've returned over $330 billion to shareholders.</p>
<p class="p p8">For Q1 FY2020, we're guiding revenue in the range of $85.5 billion to $89.5 billion. Gross margin is expected between 37.5% and 38.5%. We are monitoring the situation in China closely, including any potential impacts from the coronavirus on our business and supply chain.</p>
`,
  },
  {
    doc_title: 'NVIDIA Corp.(NVDA-US), Q4 2026 Earnings Call Transcript',
    co_cd: 'NVDA',
    company_name: 'NVIDIA Corp.',
    fiscal_year_no: '2026',
    fiscal_qtr_no: 'Q4',
    file_url: 'https://eipbe-central.digwork.tw.ent.tsmc.com/mtl-trx/pdf/1772229761407183',
    doc_html: NVDA_2026_Q4,
  },
];
