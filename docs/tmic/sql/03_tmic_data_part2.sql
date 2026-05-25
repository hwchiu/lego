USE tmic;

-- entity_subject_config
INSERT INTO entity_subject_config (co_cd, subject_cd, is_active, schedule_cron, last_run_at) VALUES
('AAPL','BBG_FINANCIALS',   1, NULL,            '2026-05-13 06:02:11'),
('AAPL','BBG_EQ_PRICE',     1, '0 8 * * 1-5',   '2026-05-14 08:00:22'),
('AAPL','BBG_ESG',          1, '0 9 * * 1',     '2026-05-12 09:05:01'),
('AAPL','FACTSET_FINS',     1, NULL,            '2026-05-13 07:01:44'),
('AAPL','FACTSET_ESTIMATES',1, '0 10 * * 1-5',  '2026-05-14 10:00:11'),
('AAPL','DNB_CREDIT',       1, NULL,            '2026-05-12 08:05:03'),
('AAPL','CONTIFY_NEWS',     1, NULL,            '2026-05-14 14:45:00'),
('MSFT','BBG_FINANCIALS',   1, NULL,            '2026-05-13 06:03:22'),
('MSFT','BBG_EQ_PRICE',     1, '0 8 * * 1-5',   '2026-05-14 08:01:05'),
('MSFT','FACTSET_FINS',     1, NULL,            '2026-05-13 07:03:11'),
('MSFT','SP_CREDIT',        1, NULL,            '2026-05-12 09:00:55'),
('GOOGL','BBG_FINANCIALS',  1, NULL,            '2026-05-13 06:04:01'),
('GOOGL','BBG_EQ_PRICE',    1, '0 8 * * 1-5',   '2026-05-14 08:02:11'),
('AMZN','BBG_FINANCIALS',   1, NULL,            '2026-05-13 06:05:44'),
('AMZN','BBG_EQ_PRICE',     1, '0 8 * * 1-5',   '2026-05-14 08:03:22'),
('AMZN','DNB_CREDIT',       1, NULL,            '2026-05-12 08:10:22'),
('AMZN','SP_CREDIT',        1, NULL,            '2026-05-12 09:02:31'),
('SMSNG','BBG_FINANCIALS',  1, NULL,            '2026-05-13 06:07:55'),
('SMSNG','BBG_EQ_PRICE',    1, '0 8 * * 1-5',   '2026-05-14 08:05:44'),
('NVDA','BBG_FINANCIALS',   1, NULL,            '2026-05-13 06:09:01'),
('NVDA','BBG_EQ_PRICE',     1, '0 8 * * 1-5',   '2026-05-14 08:06:55'),
('NVDA','FACTSET_ESTIMATES',1, '0 10 * * 1-5',  '2026-05-14 10:01:22'),
('NVDA','SP_CREDIT',        1, NULL,            '2026-05-12 09:04:09'),
('ASML','BBG_FINANCIALS',   1, NULL,            '2026-05-13 06:10:33'),
('ASML','BBG_ESG',          1, '0 9 * * 1',     '2026-05-12 09:07:44'),
('ASML','REFIN_FINANCIALS', 1, NULL,            '2026-05-13 07:22:18'),
('ASML','REFIN_OWNERSHIP',  1, '0 11 * * 1',    '2026-05-12 11:00:55'),
('SAP','BBG_FINANCIALS',    1, NULL,            '2026-05-13 06:11:22'),
('SAP','SP_CREDIT',         1, NULL,            '2026-05-12 09:06:44'),
('TM','BBG_FINANCIALS',     1, NULL,            '2026-05-13 06:13:05'),
('TM','BBG_EQ_PRICE',       1, '0 8 * * 1-5',   '2026-05-14 08:10:01'),
('TM','FACTSET_FINS',       1, NULL,            '2026-05-13 07:18:22'),
('BP','BBG_FINANCIALS',     1, NULL,            '2026-05-13 06:14:44'),
('BP','BBG_ESG',            1, '0 9 * * 1',     '2026-05-12 09:09:33'),
('BP','SP_CREDIT',          1, NULL,            '2026-05-12 09:08:11'),
('NESTLE','BBG_FINANCIALS', 1, NULL,            '2026-05-13 06:15:33'),
('NESTLE','DNB_CREDIT',     1, NULL,            '2026-05-12 08:22:05'),
('QUALCOMM','BBG_FINANCIALS',1, NULL,           '2026-05-13 06:17:01'),
('QUALCOMM','BBG_EQ_PRICE', 1, '0 8 * * 1-5',   '2026-05-14 08:14:22'),
('QUALCOMM','SP_CREDIT',    1, NULL,            '2026-05-12 09:11:33'),
('SIEMENS','BBG_FINANCIALS',1, NULL,            '2026-05-13 06:18:22'),
('SIEMENS','SP_CREDIT',     1, NULL,            '2026-05-12 09:14:05'),
('INFOSYS','BBG_FINANCIALS',1, NULL,            '2026-05-13 06:19:44'),
('INFOSYS','CONTIFY_NEWS',  1, NULL,            '2026-05-14 14:30:00');

-- ============================================================
-- entity_provider_config_param (individual INSERTs via subquery)
-- ============================================================
INSERT INTO entity_provider_config_param (config_id, param_def_id, param_value, updated_by)
VALUES (
  (SELECT config_id FROM entity_provider_config WHERE co_cd='AAPL' AND provider_cd='BBG'),
  (SELECT param_def_id FROM provider_config_def WHERE provider_cd='BBG' AND param_key='api_timeout_sec'),
  '30', 'system');
INSERT INTO entity_provider_config_param (config_id, param_def_id, param_value, updated_by)
VALUES (
  (SELECT config_id FROM entity_provider_config WHERE co_cd='AAPL' AND provider_cd='BBG'),
  (SELECT param_def_id FROM provider_config_def WHERE provider_cd='BBG' AND param_key='rate_limit_per_min'),
  '50', 'system');
INSERT INTO entity_provider_config_param (config_id, param_def_id, param_value, updated_by)
VALUES (
  (SELECT config_id FROM entity_provider_config WHERE co_cd='AAPL' AND provider_cd='BBG'),
  (SELECT param_def_id FROM provider_config_def WHERE provider_cd='BBG' AND param_key='retry_count'),
  '3', 'system');
INSERT INTO entity_provider_config_param (config_id, param_def_id, param_value, updated_by)
VALUES (
  (SELECT config_id FROM entity_provider_config WHERE co_cd='AAPL' AND provider_cd='FACTSET'),
  (SELECT param_def_id FROM provider_config_def WHERE provider_cd='FACTSET' AND param_key='api_timeout_sec'),
  '20', 'system');
INSERT INTO entity_provider_config_param (config_id, param_def_id, param_value, updated_by)
VALUES (
  (SELECT config_id FROM entity_provider_config WHERE co_cd='AAPL' AND provider_cd='FACTSET'),
  (SELECT param_def_id FROM provider_config_def WHERE provider_cd='FACTSET' AND param_key='rate_limit_per_min'),
  '100', 'system');
INSERT INTO entity_provider_config_param (config_id, param_def_id, param_value, updated_by)
VALUES (
  (SELECT config_id FROM entity_provider_config WHERE co_cd='AAPL' AND provider_cd='DNB'),
  (SELECT param_def_id FROM provider_config_def WHERE provider_cd='DNB' AND param_key='api_timeout_sec'),
  '25', 'system');
INSERT INTO entity_provider_config_param (config_id, param_def_id, param_value, updated_by)
VALUES (
  (SELECT config_id FROM entity_provider_config WHERE co_cd='AAPL' AND provider_cd='DNB'),
  (SELECT param_def_id FROM provider_config_def WHERE provider_cd='DNB' AND param_key='oauth_scope'),
  'data:read', 'system');
INSERT INTO entity_provider_config_param (config_id, param_def_id, param_value, updated_by)
VALUES (
  (SELECT config_id FROM entity_provider_config WHERE co_cd='AAPL' AND provider_cd='DNB'),
  (SELECT param_def_id FROM provider_config_def WHERE provider_cd='DNB' AND param_key='product_id'),
  'cmptcs', 'system');
INSERT INTO entity_provider_config_param (config_id, param_def_id, param_value, updated_by)
VALUES (
  (SELECT config_id FROM entity_provider_config WHERE co_cd='MSFT' AND provider_cd='BBG'),
  (SELECT param_def_id FROM provider_config_def WHERE provider_cd='BBG' AND param_key='api_timeout_sec'),
  '30', 'system');
INSERT INTO entity_provider_config_param (config_id, param_def_id, param_value, updated_by)
VALUES (
  (SELECT config_id FROM entity_provider_config WHERE co_cd='MSFT' AND provider_cd='BBG'),
  (SELECT param_def_id FROM provider_config_def WHERE provider_cd='BBG' AND param_key='rate_limit_per_min'),
  '60', 'system');
INSERT INTO entity_provider_config_param (config_id, param_def_id, param_value, updated_by)
VALUES (
  (SELECT param_def_id FROM provider_config_def WHERE provider_cd='REFINITIV' AND param_key='api_timeout_sec'),
  '30', 'system');
INSERT INTO entity_provider_config_param (config_id, param_def_id, param_value, updated_by)
VALUES (
  (SELECT param_def_id FROM provider_config_def WHERE provider_cd='REFINITIV' AND param_key='rate_limit_per_min'),
  '90', 'system');
INSERT INTO entity_provider_config_param (config_id, param_def_id, param_value, updated_by)
VALUES (
  (SELECT param_def_id FROM provider_config_def WHERE provider_cd='REFINITIV' AND param_key='access_tier'),
  'STANDARD', 'system');
INSERT INTO entity_provider_config_param (config_id, param_def_id, param_value, updated_by)
VALUES (
  (SELECT config_id FROM entity_provider_config WHERE co_cd='BP' AND provider_cd='SP_GLOBAL'),
  (SELECT param_def_id FROM provider_config_def WHERE provider_cd='SP_GLOBAL' AND param_key='api_timeout_sec'),
  '20', 'system');
INSERT INTO entity_provider_config_param (config_id, param_def_id, param_value, updated_by)
VALUES (
  (SELECT config_id FROM entity_provider_config WHERE co_cd='BP' AND provider_cd='SP_GLOBAL'),
  (SELECT param_def_id FROM provider_config_def WHERE provider_cd='SP_GLOBAL' AND param_key='region_code'),
  'EMEA', 'system');

-- ============================================================
-- entity_subject_config_param
-- ============================================================
-- AAPL BBG_FINANCIALS
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='AAPL' AND subject_cd='BBG_FINANCIALS'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='BBG_FINANCIALS' AND param_key='fiscal_year_offset'), '-3','system');
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='AAPL' AND subject_cd='BBG_FINANCIALS'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='BBG_FINANCIALS' AND param_key='earnings_release_lag_days'),'45','system');
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='AAPL' AND subject_cd='BBG_FINANCIALS'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='BBG_FINANCIALS' AND param_key='report_currency'),'USD','system');
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='AAPL' AND subject_cd='BBG_FINANCIALS'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='BBG_FINANCIALS' AND param_key='period_type'),'A','system');
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='AAPL' AND subject_cd='BBG_FINANCIALS'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='BBG_FINANCIALS' AND param_key='accounting_standard'),'GAAP','system');
-- AAPL BBG_EQ_PRICE
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='AAPL' AND subject_cd='BBG_EQ_PRICE'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='BBG_EQ_PRICE' AND param_key='adjust_for_split'),'1','system');
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='AAPL' AND subject_cd='BBG_EQ_PRICE'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='BBG_EQ_PRICE' AND param_key='adjust_for_dividend'),'0','system');
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='AAPL' AND subject_cd='BBG_EQ_PRICE'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='BBG_EQ_PRICE' AND param_key='lookback_years'),'10','system');
-- AAPL BBG_ESG
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='AAPL' AND subject_cd='BBG_ESG'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='BBG_ESG' AND param_key='framework'),'BLOOMBERG','system');
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='AAPL' AND subject_cd='BBG_ESG'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='BBG_ESG' AND param_key='include_controversies'),'1','system');
-- AAPL FACTSET_FINS
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='AAPL' AND subject_cd='FACTSET_FINS'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='FACTSET_FINS' AND param_key='fiscal_year_offset'),'-3','system');
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='AAPL' AND subject_cd='FACTSET_FINS'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='FACTSET_FINS' AND param_key='earnings_release_lag_days'),'45','system');
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='AAPL' AND subject_cd='FACTSET_FINS'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='FACTSET_FINS' AND param_key='normalization'),'AS_REPORTED','system');
-- AAPL DNB_CREDIT
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='AAPL' AND subject_cd='DNB_CREDIT'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='DNB_CREDIT' AND param_key='include_subsidiaries'),'0','system');
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='AAPL' AND subject_cd='DNB_CREDIT'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='DNB_CREDIT' AND param_key='trade_data_months'),'12','system');
-- AAPL CONTIFY_NEWS
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='AAPL' AND subject_cd='CONTIFY_NEWS'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='CONTIFY_NEWS' AND param_key='lookback_days'),'3','system');
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='AAPL' AND subject_cd='CONTIFY_NEWS'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='CONTIFY_NEWS' AND param_key='sentiment_analysis'),'1','system');
-- MSFT BBG_FINANCIALS (FY ends Jun = -6)
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='MSFT' AND subject_cd='BBG_FINANCIALS'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='BBG_FINANCIALS' AND param_key='fiscal_year_offset'),'-6','system');
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='MSFT' AND subject_cd='BBG_FINANCIALS'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='BBG_FINANCIALS' AND param_key='earnings_release_lag_days'),'30','system');
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='MSFT' AND subject_cd='BBG_FINANCIALS'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='BBG_FINANCIALS' AND param_key='period_type'),'Q','system');
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='MSFT' AND subject_cd='BBG_FINANCIALS'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='BBG_FINANCIALS' AND param_key='accounting_standard'),'GAAP','system');
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='BBG_FINANCIALS' AND param_key='fiscal_year_offset'),'0','system');
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='BBG_FINANCIALS' AND param_key='earnings_release_lag_days'),'60','system');
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='BBG_FINANCIALS' AND param_key='report_currency'),'TWD','system');
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='BBG_FINANCIALS' AND param_key='accounting_standard'),'IFRS','system');
-- NVDA BBG_FINANCIALS (FY ends Jan = +1)
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='NVDA' AND subject_cd='BBG_FINANCIALS'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='BBG_FINANCIALS' AND param_key='fiscal_year_offset'),'1','system');
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='NVDA' AND subject_cd='BBG_FINANCIALS'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='BBG_FINANCIALS' AND param_key='earnings_release_lag_days'),'30','system');
-- TM BBG_FINANCIALS (FY ends Mar = +3)
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='TM' AND subject_cd='BBG_FINANCIALS'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='BBG_FINANCIALS' AND param_key='fiscal_year_offset'),'3','system');
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='TM' AND subject_cd='BBG_FINANCIALS'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='BBG_FINANCIALS' AND param_key='earnings_release_lag_days'),'75','system');
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='TM' AND subject_cd='BBG_FINANCIALS'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='BBG_FINANCIALS' AND param_key='report_currency'),'JPY','system');
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='TM' AND subject_cd='BBG_FINANCIALS'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='BBG_FINANCIALS' AND param_key='accounting_standard'),'IFRS','system');
-- ASML REFIN_OWNERSHIP
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='ASML' AND subject_cd='REFIN_OWNERSHIP'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='REFIN_OWNERSHIP' AND param_key='ownership_type'),'INSTITUTIONAL','system');
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='ASML' AND subject_cd='REFIN_OWNERSHIP'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='REFIN_OWNERSHIP' AND param_key='min_pct_held'),'0.1','system');
-- BP BBG_ESG
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='BP' AND subject_cd='BBG_ESG'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='BBG_ESG' AND param_key='framework'),'GRI','system');
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='BP' AND subject_cd='BBG_ESG'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='BBG_ESG' AND param_key='include_controversies'),'1','system');
-- BP SP_CREDIT
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='BP' AND subject_cd='SP_CREDIT'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='SP_CREDIT' AND param_key='rating_type'),'ISSUER','system');
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='BP' AND subject_cd='SP_CREDIT'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='SP_CREDIT' AND param_key='include_outlook'),'1','system');
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='BP' AND subject_cd='SP_CREDIT'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='SP_CREDIT' AND param_key='history_years'),'10','system');
-- INFOSYS CONTIFY_NEWS
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='INFOSYS' AND subject_cd='CONTIFY_NEWS'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='CONTIFY_NEWS' AND param_key='lookback_days'),'7','system');
INSERT INTO entity_subject_config_param (config_id, param_def_id, param_value, updated_by) VALUES
  ((SELECT config_id FROM entity_subject_config WHERE co_cd='INFOSYS' AND subject_cd='CONTIFY_NEWS'),
   (SELECT param_def_id FROM subject_config_def WHERE subject_cd='CONTIFY_NEWS' AND param_key='sentiment_analysis'),'1','system');
