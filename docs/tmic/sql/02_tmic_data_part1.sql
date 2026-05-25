USE tmic;

-- ============================================================
-- company_master: 20 companies (mix of customer/supplier/both)
-- ============================================================
INSERT INTO company_master (co_cd, co_name, co_short_name, co_type, country_cd, industry_cd) VALUES
('AAPL',   'Apple Inc.',                           'Apple',        'customer',  'US', 'TECH'),
('MSFT',   'Microsoft Corporation',                'Microsoft',    'customer',  'US', 'TECH'),
('GOOGL',  'Alphabet Inc.',                        'Alphabet',     'customer',  'US', 'TECH'),
('AMZN',   'Amazon.com Inc.',                      'Amazon',       'both',      'US', 'RETAIL'),
('SMSNG',  'Samsung Electronics Co., Ltd.',        'Samsung',      'both',      'KR', 'TECH'),
('NVDA',   'NVIDIA Corporation',                   'NVIDIA',       'customer',  'US', 'SEMICON'),
('ASML',   'ASML Holding N.V.',                    'ASML',         'supplier',  'NL', 'SEMICON'),
('SAP',    'SAP SE',                               'SAP',          'both',      'DE', 'TECH'),
('SONY',   'Sony Group Corporation',               'Sony',         'both',      'JP', 'TECH'),
('BABA',   'Alibaba Group Holding Ltd.',           'Alibaba',      'customer',  'CN', 'RETAIL'),
('TM',     'Toyota Motor Corporation',             'Toyota',       'customer',  'JP', 'AUTO'),
('LVMH',   'LVMH Moët Hennessy Louis Vuitton SE',  'LVMH',         'customer',  'FR', 'LUXURY'),
('NESTLE', 'Nestlé S.A.',                          'Nestlé',       'supplier',  'CH', 'FOOD'),
('BP',     'BP p.l.c.',                            'BP',           'supplier',  'GB', 'ENERGY'),
('TOTAL',  'TotalEnergies SE',                     'TotalEnergies','supplier',  'FR', 'ENERGY'),
('INFOSYS','Infosys Limited',                      'Infosys',      'supplier',  'IN', 'IT_SVC'),
('FOXCONN','Hon Hai Precision Industry Co., Ltd.', 'Foxconn',      'supplier',  'TW', 'EMS'),
('QUALCOMM','QUALCOMM Incorporated',               'Qualcomm',     'both',      'US', 'SEMICON'),
('SIEMENS','Siemens AG',                           'Siemens',      'both',      'DE', 'INDUSTRY');

-- ============================================================
-- data_provider: 6 providers
-- ============================================================
INSERT INTO data_provider (provider_cd, provider_name, provider_type, api_base_url, auth_type) VALUES
('BBG',      'Bloomberg L.P.',                   'financial',  'https://api.bloomberg.com/eap',          'CERT'),
('FACTSET',  'FactSet Research Systems Inc.',    'financial',  'https://api.factset.com/content',        'API_KEY'),
('DNB',      'Dun & Bradstreet',                 'credit',     'https://plus.dnb.com/v1',                'OAUTH2'),
('CONTIFY',  'Contify Intelligence Pvt. Ltd.',   'news',       'https://api.contify.com/v2',             'API_KEY'),
('REFINITIV','London Stock Exchange Group (LSEG)','financial', 'https://api.refinitiv.com/data/v1',      'OAUTH2'),
('SP_GLOBAL','S&P Global Market Intelligence',   'credit',     'https://api.spglobal.com/mi/api/v1',     'API_KEY');

-- ============================================================
-- data_subject: 10 subjects (across 6 providers)
-- ============================================================
INSERT INTO data_subject (subject_cd, provider_cd, subject_name, subject_category, description) VALUES
('BBG_FINANCIALS',   'BBG',      'Bloomberg Financial Statements',  'financials', 'Income stmt, balance sheet, cash flow from Bloomberg'),
('BBG_EQ_PRICE',     'BBG',      'Bloomberg Equity Price & Volume', 'price',      'Daily OHLCV, adjusted price, corporate actions'),
('BBG_ESG',          'BBG',      'Bloomberg ESG Scores',            'esg',        'Environmental, Social, Governance scores and raw data'),
('FACTSET_FINS',     'FACTSET',  'FactSet Financial Statements',    'financials', 'Standardized financial data across GAAP & IFRS'),
('FACTSET_ESTIMATES','FACTSET',  'FactSet Consensus Estimates',     'financials', 'Analyst consensus EPS, revenue, EBITDA estimates'),
('DNB_CREDIT',       'DNB',      'D&B Credit Risk & Ratings',       'credit',     'PAYDEX score, D&B rating, failure risk score'),
('CONTIFY_NEWS',     'CONTIFY',  'Contify Company News Feed',       'news',       'Real-time news, press releases, regulatory filings'),
('REFIN_FINANCIALS', 'REFINITIV','Refinitiv Financial Statements',  'financials', 'LSEG Refinitiv financial fundamentals'),
('REFIN_OWNERSHIP',  'REFINITIV','Refinitiv Ownership Data',        'ownership',  'Institutional and insider shareholding data'),
('SP_CREDIT',        'SP_GLOBAL','S&P Global Credit Ratings',       'credit',     'S&P issuer and issue credit ratings, outlook');

-- ============================================================
-- provider_config_def: technical params per provider
-- ============================================================
INSERT INTO provider_config_def (provider_cd, param_key, param_type, is_required, default_value, description, sort_order) VALUES
-- BBG
('BBG', 'api_timeout_sec',     'INTEGER', 1, '30',  'HTTP request timeout in seconds', 1),
('BBG', 'rate_limit_per_min',  'INTEGER', 1, '60',  'Max API calls per minute', 2),
('BBG', 'retry_count',         'INTEGER', 0, '3',   'Number of retries on failure', 3),
('BBG', 'use_pom',             'BOOLEAN', 0, '1',   'Use Bloomberg POM (Programmatic Output Mode)', 4),
-- FACTSET
('FACTSET', 'api_timeout_sec',    'INTEGER', 1, '20',  'HTTP request timeout', 1),
('FACTSET', 'rate_limit_per_min', 'INTEGER', 1, '120', 'Requests per minute limit', 2),
('FACTSET', 'universe_type',      'STRING',  0, 'EQUITY', 'Default universe type', 3),
-- DNB
('DNB', 'api_timeout_sec',    'INTEGER', 1, '25',         'HTTP request timeout', 1),
('DNB', 'oauth_scope',        'STRING',  1, 'data:read',  'OAuth2 scope string', 2),
('DNB', 'product_id',         'STRING',  1, 'cmptcs',     'D&B product bundle ID', 3),
-- CONTIFY
('CONTIFY', 'api_timeout_sec',  'INTEGER', 1, '15',   'HTTP request timeout', 1),
('CONTIFY', 'max_results',      'INTEGER', 0, '100',  'Max results per request', 2),
('CONTIFY', 'language',         'STRING',  0, 'en',   'Default language filter', 3),
-- REFINITIV
('REFINITIV', 'api_timeout_sec',    'INTEGER', 1, '30',   'HTTP request timeout', 1),
('REFINITIV', 'rate_limit_per_min', 'INTEGER', 1, '90',   'Requests per minute limit', 2),
('REFINITIV', 'access_tier',        'STRING',  1, 'PREMIUM', 'Subscription tier', 3),
-- SP_GLOBAL
('SP_GLOBAL', 'api_timeout_sec',  'INTEGER', 1, '20', 'HTTP request timeout', 1),
('SP_GLOBAL', 'rate_limit_per_min','INTEGER', 1, '60', 'Requests per minute limit', 2),
('SP_GLOBAL', 'region_code',      'STRING',  0, 'ALL', 'Geographic scope filter', 3);

-- ============================================================
-- subject_config_def: business params per data subject
-- ============================================================
INSERT INTO subject_config_def (subject_cd, param_key, param_type, is_required, default_value, description, sort_order) VALUES
-- BBG_FINANCIALS
('BBG_FINANCIALS', 'fiscal_year_offset',       'INTEGER', 1, '0',   'FY end month offset from Dec (e.g. -3 = Sep)', 1),
('BBG_FINANCIALS', 'earnings_release_lag_days','INTEGER', 1, '45',  'Days to wait after period end before pulling', 2),
('BBG_FINANCIALS', 'report_currency',          'STRING',  0, '',    'Reporting currency (blank=native)', 3),
('BBG_FINANCIALS', 'period_type',              'STRING',  1, 'A',   'Period: A=Annual, Q=Quarterly, S=Semi-annual', 4),
('BBG_FINANCIALS', 'accounting_standard',      'STRING',  0, '',    'GAAP / IFRS / blank=auto-detect', 5),
-- BBG_EQ_PRICE
('BBG_EQ_PRICE', 'adjust_for_split',    'BOOLEAN', 1, '1',    'Adjust historical prices for stock splits', 1),
('BBG_EQ_PRICE', 'adjust_for_dividend', 'BOOLEAN', 1, '0',    'Adjust for cash dividends', 2),
('BBG_EQ_PRICE', 'price_currency',      'STRING',  0, '',     'Override price currency', 3),
('BBG_EQ_PRICE', 'lookback_years',      'INTEGER', 1, '5',    'Years of historical data to pull', 4),
-- BBG_ESG
('BBG_ESG', 'framework',           'STRING',  1, 'BLOOMBERG', 'ESG framework: BLOOMBERG, GRI, SASB', 1),
('BBG_ESG', 'include_controversies','BOOLEAN', 0, '1',       'Include controversy scores', 2),
-- FACTSET_FINS
('FACTSET_FINS', 'fiscal_year_offset',       'INTEGER', 1, '0',    'FY end month offset from Dec', 1),
('FACTSET_FINS', 'earnings_release_lag_days','INTEGER', 1, '45',   'Days after period end to pull', 2),
('FACTSET_FINS', 'report_currency',          'STRING',  0, '',     'Currency override', 3),
('FACTSET_FINS', 'normalization',            'STRING',  1, 'AS_REPORTED', 'AS_REPORTED or NORMALIZED', 4),
-- FACTSET_ESTIMATES
('FACTSET_ESTIMATES', 'estimate_type',     'STRING',  1, 'CONSENSUS', 'CONSENSUS or DETAIL', 1),
('FACTSET_ESTIMATES', 'lookforward_qtrs',  'INTEGER', 1, '4',        'Quarters forward to include', 2),
('FACTSET_ESTIMATES', 'include_actuals',   'BOOLEAN', 0, '1',        'Include actuals alongside estimates', 3),
-- DNB_CREDIT
('DNB_CREDIT', 'include_subsidiaries',  'BOOLEAN', 0, '0',  'Include subsidiary ratings', 1),
('DNB_CREDIT', 'trade_data_months',     'INTEGER', 0, '12', 'Months of trade payment history', 2),
-- CONTIFY_NEWS
('CONTIFY_NEWS', 'topic_filter',       'JSON',    0, '[]',   'JSON array of topic tags to filter', 1),
('CONTIFY_NEWS', 'sentiment_analysis', 'BOOLEAN', 0, '1',   'Include sentiment scoring', 2),
('CONTIFY_NEWS', 'lookback_days',      'INTEGER', 1, '7',   'Days of news to retrieve per run', 3),
-- REFIN_FINANCIALS
('REFIN_FINANCIALS', 'fiscal_year_offset',       'INTEGER', 1, '0',  'FY offset from Dec', 1),
('REFIN_FINANCIALS', 'earnings_release_lag_days','INTEGER', 1, '45', 'Lag days after period', 2),
('REFIN_FINANCIALS', 'report_currency',          'STRING',  0, '',   'Currency override', 3),
-- REFIN_OWNERSHIP
('REFIN_OWNERSHIP', 'ownership_type',   'STRING',  1, 'INSTITUTIONAL', 'INSTITUTIONAL, INSIDER, or ALL', 1),
('REFIN_OWNERSHIP', 'min_pct_held',     'FLOAT',   0, '0.5',          'Min % holding to include', 2),
-- SP_CREDIT
('SP_CREDIT', 'rating_type',    'STRING',  1, 'ISSUER', 'ISSUER or ISSUE level rating', 1),
('SP_CREDIT', 'include_outlook','BOOLEAN', 1, '1',      'Include rating outlook/watch', 2),
('SP_CREDIT', 'history_years',  'INTEGER', 0, '5',      'Years of rating history', 3);

-- ============================================================
-- entity_identifier: external IDs for all 20 companies
-- ============================================================
INSERT INTO entity_identifier (co_cd, provider_cd, external_id, id_type, is_primary, valid_from) VALUES
-- Apple
('AAPL','BBG','BBG000B9XRY4','BBG_ID',1,'2020-01-01'),
('AAPL','BBG','AAPL US Equity','TICKER',0,'2020-01-01'),
('AAPL','FACTSET','0016YD-E','FACTSET_ID',1,'2020-01-01'),
('AAPL','DNB','60-714-4681','DUNS',1,'2020-01-01'),
('AAPL','CONTIFY','apple-inc-1234','CONTIFY_ID',1,'2021-06-01'),
('AAPL','REFINITIV','4295905573','REFINITIV_ID',1,'2020-01-01'),
-- Microsoft
('MSFT','BBG','BBG000BPH459','BBG_ID',1,'2020-01-01'),
('MSFT','BBG','MSFT US Equity','TICKER',0,'2020-01-01'),
('MSFT','FACTSET','0585768-E','FACTSET_ID',1,'2020-01-01'),
('MSFT','DNB','82-940-5062','DUNS',1,'2020-01-01'),
('MSFT','REFINITIV','4295907168','REFINITIV_ID',1,'2020-01-01'),
('MSFT','SP_GLOBAL','4835483','SP_ENTITY_ID',1,'2020-01-01'),
-- Google/Alphabet
('GOOGL','BBG','BBG009S39JX6','BBG_ID',1,'2020-01-01'),
('GOOGL','BBG','GOOGL US Equity','TICKER',0,'2020-01-01'),
('GOOGL','FACTSET','0FPWZZ-E','FACTSET_ID',1,'2020-01-01'),
('GOOGL','DNB','06-311-7611','DUNS',1,'2020-01-01'),
-- Amazon
('AMZN','BBG','BBG000BVPV84','BBG_ID',1,'2020-01-01'),
('AMZN','BBG','AMZN US Equity','TICKER',0,'2020-01-01'),
('AMZN','FACTSET','0Q4HXX-E','FACTSET_ID',1,'2020-01-01'),
('AMZN','DNB','85-739-4910','DUNS',1,'2020-01-01'),
('AMZN','SP_GLOBAL','4031263','SP_ENTITY_ID',1,'2020-01-01'),
-- Samsung
('SMSNG','BBG','BBG000BCY2S8','BBG_ID',1,'2020-01-01'),
('SMSNG','BBG','005930 KS Equity','TICKER',0,'2020-01-01'),
('SMSNG','FACTSET','0HCVZH-E','FACTSET_ID',1,'2020-01-01'),
('SMSNG','DNB','35-139-2928','DUNS',1,'2020-01-01'),
-- NVIDIA
('NVDA','BBG','BBG000BBJQV0','BBG_ID',1,'2020-01-01'),
('NVDA','BBG','NVDA US Equity','TICKER',0,'2020-01-01'),
('NVDA','FACTSET','0R8R1Z-E','FACTSET_ID',1,'2020-01-01'),
('NVDA','SP_GLOBAL','108316','SP_ENTITY_ID',1,'2020-01-01'),
-- ASML
('ASML','BBG','BBG000C1HT47','BBG_ID',1,'2020-01-01'),
('ASML','BBG','ASML NA Equity','TICKER',0,'2020-01-01'),
('ASML','REFINITIV','4295906712','REFINITIV_ID',1,'2020-01-01'),
-- SAP
('SAP','BBG','BBG000BB5169','BBG_ID',1,'2020-01-01'),
('SAP','BBG','SAP GY Equity','TICKER',0,'2020-01-01'),
('SAP','FACTSET','0DFB0L-E','FACTSET_ID',1,'2020-01-01'),
('SAP','DNB','33-170-5770','DUNS',1,'2020-01-01'),
('SAP','SP_GLOBAL','376076','SP_ENTITY_ID',1,'2020-01-01'),
-- Sony
('SONY','BBG','BBG000BT0Q70','BBG_ID',1,'2020-01-01'),
('SONY','BBG','6758 JP Equity','TICKER',0,'2020-01-01'),
('SONY','FACTSET','0F1PDQ-E','FACTSET_ID',1,'2020-01-01'),
-- Alibaba
('BABA','BBG','BBG006G2JVL2','BBG_ID',1,'2020-01-01'),
('BABA','BBG','BABA US Equity','TICKER',0,'2020-01-01'),
('BABA','CONTIFY','alibaba-group-5678','CONTIFY_ID',1,'2021-06-01'),
-- Toyota
('TM','BBG','BBG000BCM557','BBG_ID',1,'2020-01-01'),
('TM','BBG','7203 JP Equity','TICKER',0,'2020-01-01'),
('TM','FACTSET','0G3D0E-E','FACTSET_ID',1,'2020-01-01'),
('TM','DNB','69-173-7040','DUNS',1,'2020-01-01'),
-- LVMH
('LVMH','BBG','BBG000BCV8R1','BBG_ID',1,'2020-01-01'),
('LVMH','BBG','MC FP Equity','TICKER',0,'2020-01-01'),
('LVMH','SP_GLOBAL','309536','SP_ENTITY_ID',1,'2020-01-01'),
-- Nestlé
('NESTLE','BBG','BBG000CPBD63','BBG_ID',1,'2020-01-01'),
('NESTLE','BBG','NESN SW Equity','TICKER',0,'2020-01-01'),
('NESTLE','DNB','39-218-5060','DUNS',1,'2020-01-01'),
('NESTLE','SP_GLOBAL','6066','SP_ENTITY_ID',1,'2020-01-01'),
-- BP
('BP','BBG','BBG000BT4FC2','BBG_ID',1,'2020-01-01'),
('BP','BBG','BP/ LN Equity','TICKER',0,'2020-01-01'),
('BP','DNB','22-357-4041','DUNS',1,'2020-01-01'),
('BP','REFINITIV','4295858240','REFINITIV_ID',1,'2020-01-01'),
('BP','SP_GLOBAL','101679','SP_ENTITY_ID',1,'2020-01-01'),
-- TotalEnergies
('TOTAL','BBG','BBG000C9HJB8','BBG_ID',1,'2020-01-01'),
('TOTAL','BBG','TTE FP Equity','TICKER',0,'2020-01-01'),
('TOTAL','SP_GLOBAL','104948','SP_ENTITY_ID',1,'2020-01-01'),
-- Infosys
('INFOSYS','BBG','BBG000BBJ892','BBG_ID',1,'2020-01-01'),
('INFOSYS','BBG','INFO IN Equity','TICKER',0,'2020-01-01'),
('INFOSYS','FACTSET','0MQY7L-E','FACTSET_ID',1,'2020-01-01'),
('INFOSYS','CONTIFY','infosys-limited-9012','CONTIFY_ID',1,'2021-06-01'),
-- Foxconn
('FOXCONN','BBG','BBG000BCNXG2','BBG_ID',1,'2020-01-01'),
('FOXCONN','BBG','2317 TT Equity','TICKER',0,'2020-01-01'),
('FOXCONN','DNB','55-932-5311','DUNS',1,'2020-01-01'),
-- Qualcomm
('QUALCOMM','BBG','BBG000CGC1X8','BBG_ID',1,'2020-01-01'),
('QUALCOMM','BBG','QCOM US Equity','TICKER',0,'2020-01-01'),
('QUALCOMM','FACTSET','0L54HH-E','FACTSET_ID',1,'2020-01-01'),
('QUALCOMM','SP_GLOBAL','99671','SP_ENTITY_ID',1,'2020-01-01'),
-- Siemens
('SIEMENS','BBG','BBG000BC4PN2','BBG_ID',1,'2020-01-01'),
('SIEMENS','BBG','SIE GY Equity','TICKER',0,'2020-01-01'),
('SIEMENS','FACTSET','0FD0GH-E','FACTSET_ID',1,'2020-01-01'),
('SIEMENS','DNB','33-040-3560','DUNS',1,'2020-01-01'),
('SIEMENS','SP_GLOBAL','376208','SP_ENTITY_ID',1,'2020-01-01');

-- ============================================================
-- entity_provider_config: which companies use which providers
-- ============================================================
INSERT INTO entity_provider_config (co_cd, provider_cd, is_active, schedule_cron, last_run_at) VALUES
('AAPL',    'BBG',      1, '0 6 * * 1-5', '2026-05-13 06:02:11'),
('AAPL',    'FACTSET',  1, '0 7 * * 1-5', '2026-05-13 07:01:44'),
('AAPL',    'DNB',      1, '0 8 * * 1',   '2026-05-12 08:05:03'),
('AAPL',    'CONTIFY',  1, '*/15 * * * *', '2026-05-14 14:45:00'),
('MSFT',    'BBG',      1, '0 6 * * 1-5', '2026-05-13 06:03:22'),
('MSFT',    'FACTSET',  1, '0 7 * * 1-5', '2026-05-13 07:03:11'),
('MSFT',    'SP_GLOBAL',1, '0 9 * * 1',   '2026-05-12 09:00:55'),
('GOOGL',   'BBG',      1, '0 6 * * 1-5', '2026-05-13 06:04:01'),
('GOOGL',   'FACTSET',  0, NULL,          NULL),
('AMZN',    'BBG',      1, '0 6 * * 1-5', '2026-05-13 06:05:44'),
('AMZN',    'DNB',      1, '0 8 * * 1',   '2026-05-12 08:10:22'),
('AMZN',    'SP_GLOBAL',1, '0 9 * * 1',   '2026-05-12 09:02:31'),
('SMSNG',   'BBG',      1, '0 6 * * 1-5', '2026-05-13 06:07:55'),
('NVDA',    'BBG',      1, '0 6 * * 1-5', '2026-05-13 06:09:01'),
('NVDA',    'FACTSET',  1, '0 7 * * 1-5', '2026-05-13 07:12:44'),
('NVDA',    'SP_GLOBAL',1, '0 9 * * 1',   '2026-05-12 09:04:09'),
('ASML',    'BBG',      1, '0 6 * * 1-5', '2026-05-13 06:10:33'),
('ASML',    'REFINITIV',1, '0 7 * * 1-5', '2026-05-13 07:22:18'),
('SAP',     'BBG',      1, '0 6 * * 1-5', '2026-05-13 06:11:22'),
('SAP',     'SP_GLOBAL',1, '0 9 * * 1',   '2026-05-12 09:06:44'),
('TM',      'BBG',      1, '0 6 * * 1-5', '2026-05-13 06:13:05'),
('TM',      'FACTSET',  1, '0 7 * * 1-5', '2026-05-13 07:18:22'),
('BP',      'BBG',      1, '0 6 * * 1-5', '2026-05-13 06:14:44'),
('BP',      'SP_GLOBAL',1, '0 9 * * 1',   '2026-05-12 09:08:11'),
('NESTLE',  'BBG',      1, '0 6 * * 1-5', '2026-05-13 06:15:33'),
('NESTLE',  'DNB',      1, '0 8 * * 1',   '2026-05-12 08:22:05'),
('QUALCOMM','BBG',      1, '0 6 * * 1-5', '2026-05-13 06:17:01'),
('QUALCOMM','SP_GLOBAL',1, '0 9 * * 1',   '2026-05-12 09:11:33'),
('SIEMENS', 'BBG',      1, '0 6 * * 1-5', '2026-05-13 06:18:22'),
('SIEMENS', 'SP_GLOBAL',1, '0 9 * * 1',   '2026-05-12 09:14:05'),
('INFOSYS', 'BBG',      1, '0 6 * * 1-5', '2026-05-13 06:19:44'),
('INFOSYS', 'CONTIFY',  1, '*/15 * * * *', '2026-05-14 14:30:00');

-- ============================================================
-- entity_provider_config_param: actual provider-level param values
-- Note: using subquery to get config_id and param_def_id
-- ============================================================
INSERT INTO entity_provider_config_param (config_id, param_def_id, param_value, updated_by)
SELECT epc.config_id, pcd.param_def_id, v.param_value, 'system'
FROM entity_provider_config epc
JOIN provider_config_def pcd ON pcd.provider_cd = epc.provider_cd
JOIN (VALUES
  -- AAPL+BBG
  ('AAPL','BBG','api_timeout_sec','30'),
  ('AAPL','BBG','rate_limit_per_min','50'),
  ('AAPL','BBG','retry_count','3'),
  -- AAPL+FACTSET
  ('AAPL','FACTSET','api_timeout_sec','20'),
  ('AAPL','FACTSET','rate_limit_per_min','100'),
  -- AAPL+DNB
  ('AAPL','DNB','api_timeout_sec','25'),
  ('AAPL','DNB','oauth_scope','data:read'),
  ('AAPL','DNB','product_id','cmptcs'),
  -- AAPL+CONTIFY
  ('AAPL','CONTIFY','api_timeout_sec','15'),
  ('AAPL','CONTIFY','max_results','200'),
  -- MSFT+BBG
  ('MSFT','BBG','api_timeout_sec','30'),
  ('MSFT','BBG','rate_limit_per_min','60'),
  -- MSFT+SP_GLOBAL
  ('MSFT','SP_GLOBAL','api_timeout_sec','20'),
  ('MSFT','SP_GLOBAL','rate_limit_per_min','60'),
  -- NVDA+BBG
  ('NVDA','BBG','api_timeout_sec','30'),
  ('NVDA','BBG','rate_limit_per_min','60'),
  -- BP+SP_GLOBAL
  ('BP','SP_GLOBAL','api_timeout_sec','20'),
  ('BP','SP_GLOBAL','rate_limit_per_min','60'),
  ('BP','SP_GLOBAL','region_code','EMEA')
) AS v(co_cd, provider_cd, param_key, param_value)
ON epc.co_cd = v.co_cd AND epc.provider_cd = v.provider_cd
AND pcd.param_key = v.param_key;

-- ============================================================
-- entity_subject_config: company × subject activation
-- ============================================================
INSERT INTO entity_subject_config (co_cd, subject_cd, is_active, schedule_cron, last_run_at) VALUES
-- Apple
('AAPL','BBG_FINANCIALS',   1, NULL,            '2026-05-13 06:02:11'),
('AAPL','BBG_EQ_PRICE',     1, '0 8 * * 1-5',   '2026-05-14 08:00:22'),
('AAPL','BBG_ESG',          1, '0 9 * * 1',     '2026-05-12 09:05:01'),
('AAPL','FACTSET_FINS',     1, NULL,            '2026-05-13 07:01:44'),
('AAPL','FACTSET_ESTIMATES',1, '0 10 * * 1-5',  '2026-05-14 10:00:11'),
('AAPL','DNB_CREDIT',       1, NULL,            '2026-05-12 08:05:03'),
('AAPL','CONTIFY_NEWS',     1, NULL,            '2026-05-14 14:45:00'),
-- Microsoft
('MSFT','BBG_FINANCIALS',   1, NULL,            '2026-05-13 06:03:22'),
('MSFT','BBG_EQ_PRICE',     1, '0 8 * * 1-5',   '2026-05-14 08:01:05'),
('MSFT','FACTSET_FINS',     1, NULL,            '2026-05-13 07:03:11'),
('MSFT','SP_CREDIT',        1, NULL,            '2026-05-12 09:00:55'),
-- Alphabet
('GOOGL','BBG_FINANCIALS',  1, NULL,            '2026-05-13 06:04:01'),
('GOOGL','BBG_EQ_PRICE',    1, '0 8 * * 1-5',   '2026-05-14 08:02:11'),
-- Amazon
('AMZN','BBG_FINANCIALS',   1, NULL,            '2026-05-13 06:05:44'),
('AMZN','BBG_EQ_PRICE',     1, '0 8 * * 1-5',   '2026-05-14 08:03:22'),
('AMZN','DNB_CREDIT',       1, NULL,            '2026-05-12 08:10:22'),
('AMZN','SP_CREDIT',        1, NULL,            '2026-05-12 09:02:31'),
-- Samsung
('SMSNG','BBG_FINANCIALS',  1, NULL,            '2026-05-13 06:07:55'),
('SMSNG','BBG_EQ_PRICE',    1, '0 8 * * 1-5',   '2026-05-14 08:05:44'),
-- NVIDIA
('NVDA','BBG_FINANCIALS',   1, NULL,            '2026-05-13 06:09:01'),
('NVDA','BBG_EQ_PRICE',     1, '0 8 * * 1-5',   '2026-05-14 08:06:55'),
('NVDA','FACTSET_ESTIMATES',1, '0 10 * * 1-5',  '2026-05-14 10:01:22'),
('NVDA','SP_CREDIT',        1, NULL,            '2026-05-12 09:04:09'),
-- ASML
('ASML','BBG_FINANCIALS',   1, NULL,            '2026-05-13 06:10:33'),
('ASML','BBG_ESG',          1, '0 9 * * 1',     '2026-05-12 09:07:44'),
('ASML','REFIN_FINANCIALS', 1, NULL,            '2026-05-13 07:22:18'),
('ASML','REFIN_OWNERSHIP',  1, '0 11 * * 1',    '2026-05-12 11:00:55'),
-- SAP
('SAP','BBG_FINANCIALS',    1, NULL,            '2026-05-13 06:11:22'),
('SAP','SP_CREDIT',         1, NULL,            '2026-05-12 09:06:44'),
-- Toyota
('TM','BBG_FINANCIALS',     1, NULL,            '2026-05-13 06:13:05'),
('TM','BBG_EQ_PRICE',       1, '0 8 * * 1-5',   '2026-05-14 08:10:01'),
('TM','FACTSET_FINS',       1, NULL,            '2026-05-13 07:18:22'),
-- BP
('BP','BBG_FINANCIALS',     1, NULL,            '2026-05-13 06:14:44'),
('BP','BBG_ESG',            1, '0 9 * * 1',     '2026-05-12 09:09:33'),
('BP','SP_CREDIT',          1, NULL,            '2026-05-12 09:08:11'),
-- Nestlé
('NESTLE','BBG_FINANCIALS', 1, NULL,            '2026-05-13 06:15:33'),
('NESTLE','DNB_CREDIT',     1, NULL,            '2026-05-12 08:22:05'),
-- Qualcomm
('QUALCOMM','BBG_FINANCIALS',1, NULL,           '2026-05-13 06:17:01'),
('QUALCOMM','BBG_EQ_PRICE', 1, '0 8 * * 1-5',   '2026-05-14 08:14:22'),
('QUALCOMM','SP_CREDIT',    1, NULL,            '2026-05-12 09:11:33'),
-- Siemens
('SIEMENS','BBG_FINANCIALS',1, NULL,            '2026-05-13 06:18:22'),
('SIEMENS','SP_CREDIT',     1, NULL,            '2026-05-12 09:14:05'),
-- Infosys
('INFOSYS','BBG_FINANCIALS',1, NULL,            '2026-05-13 06:19:44'),
('INFOSYS','CONTIFY_NEWS',  1, NULL,            '2026-05-14 14:30:00');

-- ============================================================
-- entity_subject_config_param: actual business param values
-- ============================================================
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by)
SELECT esc.config_id, scd.param_def_id, v.param_value, 'system'
FROM entity_subject_config esc
JOIN subject_config_def scd ON scd.subject_cd = esc.subject_cd
JOIN (VALUES
  -- AAPL BBG_FINANCIALS (FY ends Sep = offset -3)
  ('AAPL','BBG_FINANCIALS','fiscal_year_offset','-3'),
  ('AAPL','BBG_FINANCIALS','earnings_release_lag_days','45'),
  ('AAPL','BBG_FINANCIALS','report_currency','USD'),
  ('AAPL','BBG_FINANCIALS','period_type','A'),
  ('AAPL','BBG_FINANCIALS','accounting_standard','GAAP'),
  -- AAPL BBG_EQ_PRICE
  ('AAPL','BBG_EQ_PRICE','adjust_for_split','1'),
  ('AAPL','BBG_EQ_PRICE','adjust_for_dividend','0'),
  ('AAPL','BBG_EQ_PRICE','lookback_years','10'),
  -- AAPL BBG_ESG
  ('AAPL','BBG_ESG','framework','BLOOMBERG'),
  ('AAPL','BBG_ESG','include_controversies','1'),
  -- AAPL FACTSET_FINS
  ('AAPL','FACTSET_FINS','fiscal_year_offset','-3'),
  ('AAPL','FACTSET_FINS','earnings_release_lag_days','45'),
  ('AAPL','FACTSET_FINS','report_currency','USD'),
  ('AAPL','FACTSET_FINS','normalization','AS_REPORTED'),
  -- AAPL FACTSET_ESTIMATES
  ('AAPL','FACTSET_ESTIMATES','estimate_type','CONSENSUS'),
  ('AAPL','FACTSET_ESTIMATES','lookforward_qtrs','8'),
  ('AAPL','FACTSET_ESTIMATES','include_actuals','1'),
  -- AAPL DNB_CREDIT
  ('AAPL','DNB_CREDIT','include_subsidiaries','0'),
  ('AAPL','DNB_CREDIT','trade_data_months','12'),
  -- AAPL CONTIFY_NEWS
  ('AAPL','CONTIFY_NEWS','lookback_days','3'),
  ('AAPL','CONTIFY_NEWS','sentiment_analysis','1'),
  -- MSFT BBG_FINANCIALS (FY ends Jun = offset -6)
  ('MSFT','BBG_FINANCIALS','fiscal_year_offset','-6'),
  ('MSFT','BBG_FINANCIALS','earnings_release_lag_days','30'),
  ('MSFT','BBG_FINANCIALS','report_currency','USD'),
  ('MSFT','BBG_FINANCIALS','period_type','Q'),
  ('MSFT','BBG_FINANCIALS','accounting_standard','GAAP'),
  -- MSFT FACTSET_FINS
  ('MSFT','FACTSET_FINS','fiscal_year_offset','-6'),
  ('MSFT','FACTSET_FINS','earnings_release_lag_days','30'),
  ('MSFT','FACTSET_FINS','normalization','AS_REPORTED'),
  -- SMSNG BBG_FINANCIALS (FY ends Dec)
  ('SMSNG','BBG_FINANCIALS','fiscal_year_offset','0'),
  ('SMSNG','BBG_FINANCIALS','earnings_release_lag_days','60'),
  ('SMSNG','BBG_FINANCIALS','report_currency','KRW'),
  ('SMSNG','BBG_FINANCIALS','period_type','Q'),
  ('SMSNG','BBG_FINANCIALS','accounting_standard','IFRS'),
  -- NVDA BBG_FINANCIALS (FY ends Jan = offset +1)
  ('NVDA','BBG_FINANCIALS','fiscal_year_offset','1'),
  ('NVDA','BBG_FINANCIALS','earnings_release_lag_days','30'),
  ('NVDA','BBG_FINANCIALS','report_currency','USD'),
  ('NVDA','BBG_FINANCIALS','period_type','Q'),
  -- NVDA FACTSET_ESTIMATES
  ('NVDA','FACTSET_ESTIMATES','estimate_type','CONSENSUS'),
  ('NVDA','FACTSET_ESTIMATES','lookforward_qtrs','4'),
  -- ASML REFIN_OWNERSHIP
  ('ASML','REFIN_OWNERSHIP','ownership_type','INSTITUTIONAL'),
  ('ASML','REFIN_OWNERSHIP','min_pct_held','0.1'),
  -- TM BBG_FINANCIALS (FY ends Mar = offset +3)
  ('TM','BBG_FINANCIALS','fiscal_year_offset','3'),
  ('TM','BBG_FINANCIALS','earnings_release_lag_days','75'),
  ('TM','BBG_FINANCIALS','report_currency','JPY'),
  ('TM','BBG_FINANCIALS','period_type','A'),
  ('TM','BBG_FINANCIALS','accounting_standard','IFRS'),
  -- BP BBG_ESG
  ('BP','BBG_ESG','framework','GRI'),
  ('BP','BBG_ESG','include_controversies','1'),
  -- BP SP_CREDIT
  ('BP','SP_CREDIT','rating_type','ISSUER'),
  ('BP','SP_CREDIT','include_outlook','1'),
  ('BP','SP_CREDIT','history_years','10'),
  -- CONTIFY_NEWS params
  ('INFOSYS','CONTIFY_NEWS','lookback_days','7'),
  ('INFOSYS','CONTIFY_NEWS','sentiment_analysis','1')
) AS v(co_cd, subject_cd, param_key, param_value)
ON esc.co_cd = v.co_cd AND esc.subject_cd = v.subject_cd
AND scd.param_key = v.param_key;
