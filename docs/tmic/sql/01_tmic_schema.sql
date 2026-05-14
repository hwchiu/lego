-- ============================================================
-- TMIC (Marketing Intelligence Center) Database Schema
-- MariaDB 10.6+
-- ============================================================

CREATE DATABASE IF NOT EXISTS tmic CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tmic;

-- ① Core: Internal Company Master
CREATE TABLE IF NOT EXISTS company_master (
    co_cd           VARCHAR(20)     NOT NULL,
    co_name         VARCHAR(200)    NOT NULL,
    co_short_name   VARCHAR(50),
    co_type         ENUM('customer','supplier','both','other') NOT NULL DEFAULT 'other',
    country_cd      CHAR(2)         NOT NULL,
    industry_cd     VARCHAR(20),
    status          ENUM('active','inactive') NOT NULL DEFAULT 'active',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (co_cd)
) ENGINE=InnoDB;

-- ② Provider Catalog
CREATE TABLE IF NOT EXISTS data_provider (
    provider_cd     VARCHAR(20)     NOT NULL,
    provider_name   VARCHAR(100)    NOT NULL,
    provider_type   VARCHAR(30)     NOT NULL COMMENT 'financial, credit, news, esg, macro',
    api_base_url    VARCHAR(500),
    auth_type       VARCHAR(20)     NOT NULL COMMENT 'API_KEY, OAUTH2, BASIC, CERT',
    status          ENUM('active','inactive') NOT NULL DEFAULT 'active',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (provider_cd)
) ENGINE=InnoDB;

-- ③ Data Subject (bound to provider)
CREATE TABLE IF NOT EXISTS data_subject (
    subject_cd      VARCHAR(40)     NOT NULL,
    provider_cd     VARCHAR(20)     NOT NULL,
    subject_name    VARCHAR(100)    NOT NULL,
    subject_category VARCHAR(30)   NOT NULL COMMENT 'financials, price, credit, news, esg, macro',
    description     TEXT,
    status          ENUM('active','inactive') NOT NULL DEFAULT 'active',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (subject_cd),
    CONSTRAINT fk_ds_provider FOREIGN KEY (provider_cd) REFERENCES data_provider(provider_cd)
) ENGINE=InnoDB;

-- ④ External ID Mapping (company_master ↔ data_provider)
CREATE TABLE IF NOT EXISTS entity_identifier (
    id              INT             NOT NULL AUTO_INCREMENT,
    co_cd           VARCHAR(20)     NOT NULL,
    provider_cd     VARCHAR(20)     NOT NULL,
    external_id     VARCHAR(100)    NOT NULL,
    id_type         VARCHAR(30)     NOT NULL COMMENT 'TICKER, ISIN, BBG_ID, DUNS, FACTSET_ID, CIQ_ID, SEDOL, LEI',
    is_primary      TINYINT(1)      NOT NULL DEFAULT 0,
    valid_from      DATE            NOT NULL DEFAULT (CURRENT_DATE),
    valid_to        DATE            NULL COMMENT 'NULL = still active',
    status          ENUM('active','inactive') NOT NULL DEFAULT 'active',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_entity_id (co_cd, provider_cd, external_id, id_type),
    CONSTRAINT fk_ei_company  FOREIGN KEY (co_cd)       REFERENCES company_master(co_cd),
    CONSTRAINT fk_ei_provider FOREIGN KEY (provider_cd) REFERENCES data_provider(provider_cd)
) ENGINE=InnoDB;

-- ⑤ Provider-level Param Definition Registry
CREATE TABLE IF NOT EXISTS provider_config_def (
    param_def_id    INT             NOT NULL AUTO_INCREMENT,
    provider_cd     VARCHAR(20)     NOT NULL,
    param_key       VARCHAR(60)     NOT NULL,
    param_type      ENUM('STRING','INTEGER','FLOAT','DATE','BOOLEAN','JSON') NOT NULL DEFAULT 'STRING',
    is_required     TINYINT(1)      NOT NULL DEFAULT 0,
    default_value   VARCHAR(500),
    description     TEXT,
    sort_order      INT             NOT NULL DEFAULT 0,
    PRIMARY KEY (param_def_id),
    UNIQUE KEY uq_pcd (provider_cd, param_key),
    CONSTRAINT fk_pcd_provider FOREIGN KEY (provider_cd) REFERENCES data_provider(provider_cd)
) ENGINE=InnoDB;

-- ⑥ Subject-level Param Definition Registry
CREATE TABLE IF NOT EXISTS subject_config_def (
    param_def_id    INT             NOT NULL AUTO_INCREMENT,
    subject_cd      VARCHAR(40)     NOT NULL,
    param_key       VARCHAR(60)     NOT NULL,
    param_type      ENUM('STRING','INTEGER','FLOAT','DATE','BOOLEAN','JSON') NOT NULL DEFAULT 'STRING',
    is_required     TINYINT(1)      NOT NULL DEFAULT 0,
    default_value   VARCHAR(500),
    description     TEXT,
    sort_order      INT             NOT NULL DEFAULT 0,
    PRIMARY KEY (param_def_id),
    UNIQUE KEY uq_scd (subject_cd, param_key),
    CONSTRAINT fk_scd_subject FOREIGN KEY (subject_cd) REFERENCES data_subject(subject_cd)
) ENGINE=InnoDB;

-- ⑦ Entity × Provider Config Header
CREATE TABLE IF NOT EXISTS entity_provider_config (
    config_id       INT             NOT NULL AUTO_INCREMENT,
    co_cd           VARCHAR(20)     NOT NULL,
    provider_cd     VARCHAR(20)     NOT NULL,
    is_active       TINYINT(1)      NOT NULL DEFAULT 1,
    schedule_cron   VARCHAR(50)     COMMENT 'cron expression for data pull',
    last_run_at     DATETIME,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (config_id),
    UNIQUE KEY uq_epc (co_cd, provider_cd),
    CONSTRAINT fk_epc_company  FOREIGN KEY (co_cd)       REFERENCES company_master(co_cd),
    CONSTRAINT fk_epc_provider FOREIGN KEY (provider_cd) REFERENCES data_provider(provider_cd)
) ENGINE=InnoDB;

-- ⑧ Entity Provider Config EAV Params
CREATE TABLE IF NOT EXISTS entity_provider_config_param (
    id              INT             NOT NULL AUTO_INCREMENT,
    config_id       INT             NOT NULL,
    param_def_id    INT             NOT NULL,
    param_value     VARCHAR(1000)   NOT NULL,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by      VARCHAR(50),
    PRIMARY KEY (id),
    UNIQUE KEY uq_epcp (config_id, param_def_id),
    CONSTRAINT fk_epcp_config FOREIGN KEY (config_id)    REFERENCES entity_provider_config(config_id),
    CONSTRAINT fk_epcp_def    FOREIGN KEY (param_def_id) REFERENCES provider_config_def(param_def_id)
) ENGINE=InnoDB;

-- ⑨ Entity × Subject Config Header
CREATE TABLE IF NOT EXISTS entity_subject_config (
    config_id       INT             NOT NULL AUTO_INCREMENT,
    co_cd           VARCHAR(20)     NOT NULL,
    subject_cd      VARCHAR(40)     NOT NULL,
    is_active       TINYINT(1)      NOT NULL DEFAULT 1,
    schedule_cron   VARCHAR(50)     COMMENT 'overrides provider-level cron if set',
    last_run_at     DATETIME,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (config_id),
    UNIQUE KEY uq_esc (co_cd, subject_cd),
    CONSTRAINT fk_esc_company FOREIGN KEY (co_cd)       REFERENCES company_master(co_cd),
    CONSTRAINT fk_esc_subject FOREIGN KEY (subject_cd)  REFERENCES data_subject(subject_cd)
) ENGINE=InnoDB;

-- ⑩ Entity Subject Config EAV Params
CREATE TABLE IF NOT EXISTS entity_subject_config_param (
    id              INT             NOT NULL AUTO_INCREMENT,
    config_id       INT             NOT NULL,
    param_def_id    INT             NOT NULL,
    param_value     VARCHAR(1000)   NOT NULL,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by      VARCHAR(50),
    PRIMARY KEY (id),
    UNIQUE KEY uq_escp (config_id, param_def_id),
    CONSTRAINT fk_escp_config FOREIGN KEY (config_id)    REFERENCES entity_subject_config(config_id),
    CONSTRAINT fk_escp_def    FOREIGN KEY (param_def_id) REFERENCES subject_config_def(param_def_id)
) ENGINE=InnoDB;
