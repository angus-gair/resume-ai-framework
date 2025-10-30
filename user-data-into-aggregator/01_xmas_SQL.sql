/************************************************************************************************************/
/*                                          CHRISTMAS ANALYSIS                                              */
/************************************************************************************************************/


-- see below for test and temp tables

/*WCV-6541 and WCV-6479*/

CREATE OR REPLACE TABLE `gcp-wow-rwds-ai-pobe-dev.angus.bigw_xmas_analysis_STG` AS (

/*----------        campaign audience     ----*/

with dim_date AS (
  SELECT 
    dd.CalendarDay, -- join key
    dd.BigWFiscalYear,
    dd.BigWFiscalWeekStartDate, 
    dd.BigWFiscalWeekStartDate as fw_week_start_date, -- for different naming convention in tables
    dd.BigWFiscalWeekEndDate,
    dd.BigWFiscalWeekEndDate as fw_week_end_date -- for different naming convention in tables
  FROM `gcp-wow-ent-im-wowx-cust-prod.adp_wowx_dm_masterdata_view.dim_date_v` dd 
)

-- , audience as (
-- select 
--   f.campaign_code,
--   LEFT (`group08`, 8) as offer_nbr,
--   f.campaign_start_date, -- date key
--   f.crn,
--   f.group03 as CustomerSegment,
--   CONCAT(campaign_code, campaign_start_date) as campaign_key,
--   GENERATE_UUID() as unique_id,
--   dd.fw_week_end_date -- add fw_end_date from dim_date
-- from `gcp-wow-rwds-ai-data-prod.loyalty_car_analytics.fact_campaign_split_view` f 
-- join dim_date dd
--   on f.campaign_start_date = dd.CalendarDay
-- where f.campaign_code = 'WCV-6479'
-- )

--where f.campaign_code in ('WCV-6541', 'WCV-6479')

, CAMPAIGN_DETS AS (
    SELECT DISTINCT 
        ocm.offer_nbr,
        ocm.offer_nbr AS OfferNumber,
        ocm.offer_name,
        ocm.campaign_code,
        ocm.campaign_type, -- add
        CAST(oh.offer_start_date AS DATE) AS OfferAllocationStartDate,
        CAST(oh.offer_end_date AS DATE) AS OfferAllocationEndDate,
        CAST(oh.offer_start_date AS DATE) AS campaign_start_date,
        CAST(oh.offer_end_date AS DATE) AS campaign_end_date,
        oh.OfferLevelEE, -- add
        oh.minimum_basket_spend, -- add
        offer_level, -- add
        ((COALESCE(oh.Reward_value, oh.multiplier_value) * 2000) / 10) as points_value, -- add
        dd.fw_week_end_date -- add fw_end_date from dim_date
    FROM `gcp-wow-rwds-ai-data-prod.rtl_data_model.offer_campaign_master` AS ocm
    JOIN `gcp-wow-rwds-ai-data-prod.rtl_data_model.offer_header` AS oh ON ocm.offer_nbr = oh.offer_nbr
    join dim_date dd
    on date(oh.offer_start_date) = dd.CalendarDay

    WHERE ocm.campaign_type IN ( 'BIGW' , 'BIG W')
    -- and  CAST(oh.offer_start_date AS DATE) between  DATE("2024-08-28") AND  ('2024-09-17')
    order by 1
    )

-- select * from `gcp-wow-rwds-ai-data-prod.rtl_data_model.offer_campaign_master`
-- where campaign_code IN ( 'WCV-6541' , 'WCV-6479')
-- limit 100

    , audience_campaign_dets AS (
      SELECT 
        a.*,
        c.campaign_type,
        c.OfferLevelEE,
        c.minimum_basket_spend,
        c.offer_level,
        c.points_value,
        dd.fw_week_end_date
      FROM `gcp-wow-rwds-ai-pobe-dev.angus.bigw_xmas_temp`  a
      LEFT JOIN CAMPAIGN_DETS c
      ON a.offer_nbr = c.offer_nbr
      AND a.campaign_code = c.campaign_code
          join dim_date dd
    on date(a.campaign_start_date) = dd.CalendarDay
    )
-- select * from audience_campaign_dets
-- where unique_id = '2a21a40b-60eb-495d-87c0-f103c8cc5b6b'


/* BIGW CODE */

, bc as (    SELECT DISTINCT 
        ocm.campaign_code
        FROM `gcp-wow-rwds-ai-data-prod.rtl_data_model.offer_campaign_master` AS ocm
    JOIN `gcp-wow-rwds-ai-data-prod.rtl_data_model.offer_header` AS oh ON ocm.offer_nbr = oh.offer_nbr


    WHERE ocm.campaign_type IN ( 'BIGW' , 'BIG W')
    and left (ocm.campaign_code, 3) in ('WCV', 'WCT')
    
    order by 1
    
    )
/*----------        metrics     ----*/
, metrics as (
SELECT 
    f.crn,
    f.campaign_code,
    f.campaign_start_date, -- date join key
    f.campaign_end_date,
    f.offer_nbr,
             dd.fw_week_end_date,
    CONCAT(f.campaign_code, ' - ', f.campaign_start_date) as campaign_key,
     MAX(f.crest_groupname ) as crest_groupname, 
     MAX(f.crest_segname   ) as crest_segname, 

    MAX(f.allocate ) as allocate, 
    MAX(f.activated) as activated, 
    MAX(f.redeemed ) as redeemed


FROM `gcp-wow-rwds-ai-data-prod.loyalty_bi_analytics.vw_bi_campaign_offer` f

join dim_date dd
  on f.campaign_start_date = dd.CalendarDay
JOIN bc
  ON f.campaign_code = bc.campaign_code
-- and campaign_code in ( 'WCV-6541' , 'WCV-6479')
-- and crn = '3300000000007527166'
group by 1,2,3,4,5,6,7
-- where campaign_type = 'BIGW'
--WHERE campaign_code in ( 'WCV-6541' , 'WCV-6479')

)


-- , audience_offer_nbrs as (
--   SELECT DISTINCT offer_nbr
--   FROM audience
-- )

-- SELECT *
-- FROM metrics
-- WHERE offer_nbr IN (SELECT offer_nbr FROM audience_offer_nbrs)
-- limit 100

/*----------        joined data     ----*/

, joined_data as (
SELECT 
    a.*,
    m.campaign_start_date as campaign_start_date_vwbi,
    m.campaign_end_date as campaign_end_date_vwbi,
    m.crest_groupname,
    m.crest_segname,
    m.allocate,
    m.activated,
    m.redeemed
FROM audience_campaign_dets a
 JOIN metrics m
ON a.crn = m.crn
AND a.offer_nbr = m.offer_nbr
and a.fw_week_end_date = m.fw_week_end_date

 --AND a.campaign_start_date = m.campaign_start_date
)


-- select * from joined_data
-- where unique_id = '4c76f18d-81f3-4dc1-b741-b2f73f6d190b'


, srd_crn as (
  SELECT 
    crn,    
    campaign_code,
    offer_nbr, 
    date(start_txn_date) as start_txn_date,
    -- DATE(offer_start_date) as offer_start_date, 
    -- DATE(offer_end_date) as offer_end_date, 
    sum(points_cost_excl_gst_sales) as cost -- add
  FROM `gcp-wow-rwds-ai-data-prod.loyalty_bi_analytics.vw_bi_sales_reward_details` csrd
    WHERE offer_nbr in (select distinct offer_nbr from metrics)
    AND LENGTH(crn) > 3
    GROUP BY 1,2,3, 4
    -- order by 1,2,3, 4,5
)

-- select * from srd_crn
-- where crn = '3300000000003021347'


, final_data as (
/*----------        final data     ----*/
select 
    jd.*,
    -- sc.start_txn_date as offer_start_date_srd,
   cost -- add
from joined_data jd

LEFT JOIN srd_crn sc
ON jd.crn = sc.crn
AND jd.campaign_code = sc.campaign_code
AND jd.offer_nbr = sc.offer_nbr
AND sc.start_txn_date between jd.campaign_start_date_vwbi and jd.campaign_end_date_vwbi
-- GROUP BY jd.crn, jd.campaign_code, jd.campaign_start_date, jd.offer_nbr, jd.fw_week_end_date, jd.campaign_key, jd.campaign_start_date_vwbi, jd.campaign_end_date_vwbi, jd.crest_groupname, jd.crest_segname, jd.allocate, jd.activated, jd.redeemed, jd.campaign_type, jd.OfferLevelEE, jd.minimum_basket_spend, jd.offer_level, jd.points_value, jd.unique_id, jd.CustomerSegment, jd.campaign_key
)

select 
  f.* 
  -- dc.count as duplicate_count
from final_data f 
-- JOIN duplicate_check dc 
-- ON f.unique_id = dc.unique_id
-- limit 100
);

select * from `gcp-wow-rwds-ai-pobe-dev.angus.bigw_xmas_analysis_STG`
-- where unique_id = '4c76f18d-81f3-4dc1-b741-b2f73f6d190b'


-- select * 
--   FROM `gcp-wow-rwds-ai-data-prod.loyalty_bi_analytics.vw_bi_sales_reward_details` csrd
-- where offer_nbr =  '90030907'
-- and crn = '1100000000083270000'

-- select * 
--   FROM `gcp-wow-rwds-ai-pobe-dev.angus.bigw_xmas_analysis_STG` csrd
--   where redeemed is not null
--   limit 100
-- where crn ='1100000000083277132'
-- limit 100


/*----------------------------------------------------------------------------------------------------------*/
/*                                Section 2: Model Data
/*----------------------------------------------------------------------------------------------------------*/

SELECT * FROM `gcp-wow-rwds-ai-pobe-dev.angus.bigw_xmas_analysis_STG` A
where OfferLevelEE = 'VARIABLE_POINTS_PRODUCTS'
limit 100

'campaign_key', 'minimum_basket_spend', 'points_value', 'crest_groupname', 'CustomerSegment', 'cost', 'Audience', 'Activations', 'Redeemer_flag', 'ActivationRate', 'RedemptionRate'
create or replace table `gcp-wow-rwds-ai-pobe-dev.angus.bigw_xmas_modelData2`  as (
-- with summary as (
select 
   CONCAT(campaign_code , ' - ' , offer_nbr, ' - ', campaign_start_date) as campaign_key,
  --   CONCAT(campaign_code , campaign_start_date) as campaign_key,
   minimum_basket_spend, -- add
   points_value, 
   crest_groupname,     
    OfferLevelEE, 
    -- campaign_start_date, 
    -- campaign_end_date,
    CustomerSegment,
    -- offer_nbr,
    SUM(cost) as cost, -- add
    count(distinct crn) as Audience,
    COUNT(distinct activated) as Activations,
    COUNT(distinct redeemed) as Redeemer_flag,        
    COUNT(distinct activated) / count(distinct crn) as ActivationRate,
    COUNT(distinct redeemed) / count(distinct crn) as RedemptionRate 
from `gcp-wow-rwds-ai-pobe-dev.angus.bigw_xmas_analysis_STG`
-- where CustomerSegment in ('Group 3 BIG W Lapsed',
-- 'Group 5 BIG W Deep Inactive', 
-- 'Group 6 BIG W New', 
-- 'Group 4 BIG W Inactive' )
where OfferLevelEE = 'FIXED_POINTS_BASKET'
and customersegment is not null
GROUP BY 1, 2 , 3 , 4, 5, 6
order by 1, 2
) 
;
-- Select 
--   --   minimum_basket_spend
--   -- , points_value
--   campaign_key_2
--   -- , CustomerSegment
--   , SUM(cost) as cost
--   , SUM(Audience) as Audience
--   , SUM(Redeemer_flag) as Redeemptions
--   ,  SUM(Redeemer_flag) / SUM(Audience) as RedemptionRate 
-- FROM summary
-- GROUP BY 1 --, 2 --, 3, 4

-- )






select distinct crest_groupname from `gcp-wow-rwds-ai-pobe-dev.angus.bigw_xmas_modelData2`
GROUP BY
  1

SELECT 
    column_name, 
    data_type,
    is_nullable,
    is_partitioning_column
  FROM 
    `gcp-wow-rwds-ai-data-prod.loyalty_bi_analytics.INFORMATION_SCHEMA.COLUMNS`
  WHERE 
    table_name = 'vw_bi_sales_reward_details'


select * from `gcp-wow-rwds-ai-pobe-dev.angus.bigw_xmas_analysis_STG` 
where unique_id = '4c76f18d-81f3-4dc1-b741-b2f73f6d190b'
order by 3
limit 1000


-- campaign data for WCV-6541 and WCV-6479
select *  
    FROM `gcp-wow-rwds-ai-data-prod.rtl_data_model.offer_campaign_master` AS ocm
    JOIN `gcp-wow-rwds-ai-data-prod.rtl_data_model.offer_header` AS oh ON ocm.offer_nbr = oh.offer_nbr
where campaign_code in ('WCV-6541', 'WCV-6479')
limit 100
;

-- Check for duplicates using unique_id
SELECT 
    unique_id,
    COUNT(*) as count
FROM `gcp-wow-rwds-ai-pobe-dev.angus.bigw_xmas_analysis_STG`
GROUP BY unique_id
HAVING count > 1
limit 100
;

select * from `gcp-wow-rwds-ai-data-prod.loyalty_bi_analytics.edr_crn_offers_v`
limit 1000

--- TEMP TABLES

CREATE OR REPLACE TABLE `gcp-wow-rwds-ai-pobe-dev.angus.bigw_xmas_temp` AS (
  with dim_date AS (
  SELECT 
    dd.CalendarDay, -- join key
    dd.BigWFiscalYear,
    dd.BigWFiscalWeekStartDate, 
    dd.BigWFiscalWeekStartDate as fw_week_start_date, -- for different naming convention in tables
    dd.BigWFiscalWeekEndDate,
    dd.BigWFiscalWeekEndDate as fw_week_end_date -- for different naming convention in tables
  FROM `gcp-wow-ent-im-wowx-cust-prod.adp_wowx_dm_masterdata_view.dim_date_v` dd 
)

, t1 as (
select 
  f.*,
    dd.fw_week_end_date -- add fw_end_date from dim_date
from `gcp-wow-rwds-ai-data-prod.loyalty_car_analytics.fact_campaign_split_view` f 
join dim_date dd
  on f.campaign_start_date = dd.CalendarDay
where f.campaign_code IN (    SELECT DISTINCT 
        ocm.campaign_code
        FROM `gcp-wow-rwds-ai-data-prod.rtl_data_model.offer_campaign_master` AS ocm
    JOIN `gcp-wow-rwds-ai-data-prod.rtl_data_model.offer_header` AS oh ON ocm.offer_nbr = oh.offer_nbr


    WHERE ocm.campaign_type IN ( 'BIGW' , 'BIG W')
    and left (ocm.campaign_code, 3) in ('WCV', 'WCT')
    
    order by 1
    
    )
)
, t2 as (
  select f.*
    , c.string_field_1 as CustomerSegment
  from t1 f
LEFT join gcp-wow-rwds-ai-pobe-dev.angus.cust_grp c 
  on f.group02 = c.string_field_0 
  OR f.group03 = c.string_field_0
  OR f.group04 = c.string_field_0
  OR f.group05 = c.string_field_0
  OR f.group06 = c.string_field_0
)
select 
    f.campaign_code,
    LEFT (`group08`, 8) as offer_nbr,
    f.campaign_start_date, -- date key
    f.crn,
    -- f.group03 as CustomerSegment,
    CONCAT(campaign_code, campaign_start_date) as campaign_key,
    GENERATE_UUID() as unique_id,
    CustomerSegment
from t2 f
);




select * from `gcp-wow-rwds-ai-data-prod.loyalty_car_analytics.fact_campaign_split_view` limit 100
);
select 
    f.campaign_code,
    LEFT (`group08`, 8) as offer_nbr,
    f.campaign_start_date, -- date key
    f.crn,
    f.group03 as CustomerSegment,
    CONCAT(campaign_code, campaign_start_date) as campaign_key,
    GENERATE_UUID() as unique_id,


select * from `gcp-wow-rwds-ai-pobe-dev.angus.bigw_xmas_temp`
where customersegment is not null
limit 100

-- /*  testing   */
-- select * 
-- from `gcp-wow-rwds-ai-data-prod.loyalty_car_analytics.fact_campaign_split_view` f 
-- where f.campaign_code = 'WCV-6479'
-- limit 100
-- ;

-- SELECT 
-- column_name, 
-- data_type 
-- Ordinal_position,
-- FROM 
-- `gcp-wow-ent-im-wowx-cust-prod.adp_wowx_dm_masterdata_view.INFORMATION_SCHEMA.COLUMNS` 
-- WHERE 
-- table_name = 'dim_date_v';


-- create or replace table `gcp-wow-rwds-ai-pobe-dev.angus.bigw_xmas_modelData2`  as (
-- -- summary
-- select 
--     CONCAT(campaign_code, ' - ', campaign_start_date) as campaign_key,
--     minimum_basket_spend, -- add
--     reward_points, -- add
--     -- campaign_start_date, 
--     -- campaign_end_date,
--     CustomerSegment,
--     -- offer_nbr,
--     count(distinct crn) as Audience,
--     COUNT(distinct activated) as Activations,
--     COUNT(distinct redeemed) as Redeemer_flag,        
--     COUNT(distinct activated) / count(distinct crn) as ActivationRate,
--     COUNT(distinct redeemed) / count(distinct crn) as RedemptionRate 
-- from `gcp-wow-rwds-ai-pobe-dev.angus.bigw_xmas_analysis_STG`
-- -- where CustomerSegment in ('Group 3 BIG W Lapsed',
-- -- 'Group 5 BIG W Deep Inactive', 
-- -- 'Group 6 BIG W New', 
-- -- 'Group 4 BIG W Inactive' )
-- where OfferLevelEE = 'FIXED_POINTS_BASKET'
-- GROUP BY 1, 2, 3, 4
-- order by 1, 2
-- )


















/**************************************************************
OLD CODE
*/

/*----------        sales reward details    ----*/

, srd_offer as (
  SELECT 
    campaign_code,
    offer_nbr	, 
    DATE(offer_start_date) as offer_start_date	, 
    DATE(offer_end_date) as offer_end_date , 
    sum(points_cost_excl_gst_sales) cost
  FROM `gcp-wow-rwds-ai-data-prod.loyalty_bi_analytics.vw_bi_sales_reward_details` csrd
    WHERE offer_nbr in (select distinct offer_nbr from `gcp-wow-rwds-ai-pobe-dev.angus.bigw_xmas_analysis`)
    GROUP BY 1,2,3, 4
    order by 1,2,3, 4
)


, srd_crn as (
  SELECT 
    crn,    
    campaign_code,
    offer_nbr	, 
    DATE(offer_start_date) as offer_start_date	, 
    DATE(offer_end_date) as offer_end_date , 
    sum(points_cost_excl_gst_sales) cost
  FROM `gcp-wow-rwds-ai-data-prod.loyalty_bi_analytics.vw_bi_sales_reward_details` csrd
    WHERE offer_nbr in (select distinct offer_nbr from `gcp-wow-rwds-ai-pobe-dev.angus.bigw_xmas_analysis`)
    AND LENGTH(crn) >3
    GROUP BY 1,2,3, 4,5
    order by 1,2,3, 4,5
    limit 100
)

SELECT event_fw_end_date, 
       COUNT(DISTINCT offer_nbr || allocate) AS total_offer_allocations,
       COUNT(DISTINCT offer_nbr || activated) AS total_offer_activation,
       COUNT(DISTINCT offer_nbr || redeemed) AS total_offer_redemption
FROM `gcp-wow-rwds-ai-data-prod.loyalty_bi_analytics.vw_bi_campaign_offer`
WHERE campaign_code in ( 'WCV-6541' , 'WCV-6479')
GROUP BY event_fw_end_date
ORDER BY event_fw_end_date;

SELECT *
FROM `gcp-wow-rwds-ai-data-prod.loyalty_bi_analytics.vw_bi_campaign_offer`
WHERE campaign_code in ( 'WCV-6541' , 'WCV-6479')
limit 100


select *, LEFT (`group08`, 8) from `gcp-wow-rwds-ai-data-prod.loyalty_car_analytics.fact_campaign_split_view` f 
where campaign_code in ('WCV-6541', 'WCV-6479')

limit 100


with audience_base AS (
    SELECT DISTINCT 
        ced.CampaignCode AS campaign_code,
        CAST(ced.CampaignStartDate AS DATE) AS campaign_start_date,
        CAST(ced.CampaignEndDate AS DATE) AS campaign_end_date,
        ccoa.OfferNumber AS offer_nbr,
        -- cm.OfferAllocationStartDate,
        -- cm.minimum_basket_spend,
        OfferLevelEE,
        ccoa.CustomerRegistrationNumber AS crn,
        -- cm.offer_name,
        -- cm.reward_value,
        -- cm.multiplier_value,
        -- cm.campaign_type,
        -- cm.audience_type_desc,
        group01,
        group02,
        group03,
        group04,
        group05,
        group06,
        group07,
        group08,
        group09,
        ccoa.ActivationDate as ActivationDate,
        IF(ccoa.ActivationDate IS NULL, NULL, ccoa.CustomerRegistrationNumber) as ActivationFlag
        -- cm.offer_level, 
        -- cm.offer_name as offer_name2
    FROM `gcp-wow-ent-im-wowx-cust-prod.adp_wowx_dm_loyalty_au_view.campaign_exec_details_v` ced
    INNER JOIN `gcp-wow-ent-im-wowx-cust-prod.adp_wowx_dm_loyalty_au_view.campaign_customer_offer_allocation_v` ccoa 
        ON ced.CampaignExecID = ccoa.CampaignExecID
        AND ccoa.OfferStatus <> 'CANCELLED'
    INNER JOIN `gcp-wow-rwds-ai-data-prod.loyalty_car_analytics.fact_campaign_split_view` f 
        ON ced.CampaignCode = f.campaign_code 
        AND DATE(ced.CampaignStartDate) = f.campaign_start_date 
        AND ccoa.CustomerRegistrationNumber = f.crn
    -- LEFT JOIN CAMPAIGN_DETS cm 
    --     ON ccoa.OfferNumber = cm.OfferNumber
    --     AND ced.CampaignCode = cm.campaign_code
    WHERE 1=1
        -- AND ced.CampaignCode IN ('WCV-8059')
        and ced.CampaignCode IN ('WCV-8059', 'RPM-7855')
)
select * from `gcp-wow-ent-im-wowx-cust-prod.adp_wowx_dm_loyalty_au_view.campaign_customer_offer_allocation_v`  limit 1000
-- , base as (
SELECT x.*, 
    p.crn as Redeemer_flag,
    p.Redemptions
FROM Audience_Base x
LEFT JOIN (
  SELECT  
    srd.crn,
    srd.offer_start_date,
    srd.offer_end_date,
    srd.offer_nbr, 
    
    SUM(cost_50) as cost_50,
    SUM(sales_amt_incld_gst) as sales,
    ARRAY_AGG(DISTINCT srd.sales_channel_desc) as sales_channel_desc,
    ARRAY_AGG(DISTINCT srd.basket_key) as Redemptions
from `gcp-wow-rwds-ai-data-prod.loyalty_bi_analytics.vw_bi_sales_reward_details` srd 
GROUP BY srd.crn, srd.offer_start_date, srd.offer_end_date, srd.offer_nbr
) p
ON x.crn = p.crn
AND x.offer_nbr = p.offer_nbr
AND x.OfferAllocationStartDate = DATE(p.offer_start_date)



);

/*----------------------------------------------------------------------------------------------------------*/
/*                  `gcp-wow-rwds-ai-data-prod.rtl_data_model.offer_campaign_master`                        */
/*----------------------------------------------------------------------------------------------------------*/


-- select * from `gcp-wow-rwds-ai-pobe-dev.angus.bigw_jupiter` limit 100

CREATE OR REPLACE TABLE `gcp-wow-rwds-ai-pobe-dev.angus.bigw_jupiter_STG` AS (

WITH CAMPAIGN_DETS AS (
    SELECT DISTINCT 
        ocm.offer_nbr,
        ocm.offer_nbr AS OfferNumber,
        ocm.offer_name,
        ocm.campaign_code,
        ocm.campaign_type,
        CAST(oh.offer_start_date AS DATE) AS OfferAllocationStartDate,
        CAST(oh.offer_end_date AS DATE) AS OfferAllocationEndDate,
        CAST(oh.offer_start_date AS DATE) AS campaign_start_date,
        CAST(oh.offer_end_date AS DATE) AS campaign_end_date,
        oh.audience_type_desc,
        COALESCE(oh.Reward_value, oh.multiplier_value) AS reward_value,
        oh.multiplier_value,
        oh.OfferLevelEE,
        oh.minimum_basket_spend,
        offer_level
    FROM `gcp-wow-rwds-ai-data-prod.rtl_data_model.offer_campaign_master` AS ocm
    JOIN `gcp-wow-rwds-ai-data-prod.rtl_data_model.offer_header` AS oh ON ocm.offer_nbr = oh.offer_nbr
    WHERE ocm.campaign_code IN ('WCV-8059', 'RPM-7855')
    and  CAST(oh.offer_start_date AS DATE) between  DATE("2024-08-28") AND 	('2024-09-17')
    order by 1
    )

, audience_base AS (
    SELECT DISTINCT 
        ced.CampaignCode AS campaign_code,
        CAST(ced.CampaignStartDate AS DATE) AS campaign_start_date,
        CAST(ced.CampaignEndDate AS DATE) AS campaign_end_date,
        ccoa.OfferNumber AS offer_nbr,
        cm.OfferAllocationStartDate,
        cm.minimum_basket_spend,
        OfferLevelEE,
        ccoa.CustomerRegistrationNumber AS crn,
        cm.offer_name,
        cm.reward_value,
        cm.multiplier_value,
        cm.campaign_type,
        cm.audience_type_desc,
        group01 AS `01_Marketable`,
        group02 AS `02_Model_Random`,
        group03 AS `03_Segment`,
        group04 AS `04_Segment2`,
        group05 AS `05_Attract_Grow_Retain`,
        group06 AS `06_Life_Stage`,
        group07 AS `07_Hurdle`,
        group08 AS `08_Offer_nbr_Desc`,
        group09 AS `09_Value_Segment`,
        ccoa.ActivationDate as ActivationDate,
        IF(ccoa.ActivationDate IS NULL, NULL, ccoa.CustomerRegistrationNumber) as ActivationFlag,
        cm.offer_level, 
        cm.offer_name as offer_name2
    FROM `gcp-wow-ent-im-wowx-cust-prod.adp_wowx_dm_loyalty_au_view.campaign_exec_details_v` ced
    INNER JOIN `gcp-wow-ent-im-wowx-cust-prod.adp_wowx_dm_loyalty_au_view.campaign_customer_offer_allocation_v` ccoa 
        ON ced.CampaignExecID = ccoa.CampaignExecID
        AND ccoa.OfferStatus <> 'CANCELLED'
    INNER JOIN `gcp-wow-rwds-ai-data-prod.loyalty_car_analytics.fact_campaign_split_view` f 
        ON ced.CampaignCode = f.campaign_code 
        AND DATE(ced.CampaignStartDate) = f.campaign_start_date 
        AND ccoa.CustomerRegistrationNumber = f.crn
    LEFT JOIN CAMPAIGN_DETS cm 
        ON ccoa.OfferNumber = cm.OfferNumber
        AND ced.CampaignCode = cm.campaign_code
    WHERE 1=1
        -- AND ced.CampaignCode IN ('WCV-8059')
        and oced.CampaignCode IN ('WCV-8059', 'RPM-7855')
)
-
, base as (
SELECT x.*, 
    p.crn as Redeemer_flag,
    p.Redemptions
FROM Audience_Base x
LEFT JOIN (
  SELECT  
    srd.crn,
    srd.offer_start_date,
    srd.offer_end_date,
    srd.offer_nbr, 
    
    SUM(cost_50) as cost_50,
    SUM(tot_amt_incld_gst) as sales,
    ARRAY_AGG(DISTINCT srd.sales_channel_desc) as sales_channel_desc
    ARRAY_AGG(DISTINCT srd.basket_key) as Redemptions
from `gcp-wow-rwds-ai-data-prod.loyalty_bi_analytics.vw_bi_sales_reward_details` srd 
GROUP BY srd.crn, srd.offer_start_date, srd.offer_end_date, srd.offer_nbr
) p
ON x.crn = p.crn
AND x.offer_nbr = p.offer_nbr
AND x.OfferAllocationStartDate = DATE(p.offer_start_date)

)

select * ,
    CASE WHEN `03_Segment` = 'Group 3 BIG W Lapsed' THEN 'REACTIVATION' 
         WHEN `04_Segment2` = 'INACTIVE' THEN 'REACTIVATION' 
         WHEN `03_Segment` = 'Group 5 BIG W Deep Inactive' THEN 'REACTIVATION' 
         WHEN `03_Segment` = 'Group 6 BIG W New' THEN 'PRIORITY_COHORTS' 
         ELSE 'Other' END as segment

from base

);


Push Notifications
To extract push notifications, the following SQL code can be used:

-- EDRApp
WITH push_sent AS 
(SELECT DISTINCT parameters_id 
  ,USER
  ,DATE(client_time,"Australia/Sydney") AS sent_date
  FROM `gcp-wow-rwds-ai-mlt-evs-prod.event_store.swrve_events` swrve
  WHERE TYPE ='generic_campaign_event'
    AND parameters_action_type  = 'sent'
    AND game IN (31752) --Production for EDR
  )

, crn_map AS 
(SELECT *
FROM gcp-wow-rwds-ai-bi-prod.view_push_notification.vw_push_edr_swrve_crn_mapping
WHERE app = 'EDRApp'
  )

SELECT DISTINCT ps.user
  , cm.crn
  FROM push_sent ps
  INNER JOIN gcp-wow-rwds-ai-bi-prod.view_push_notification.vw_push_edr_campaign_events AS ce 
    ON ps.parameters_id=ce.tracking_id
  INNER JOIN crn_map AS cm
    ON ps.user = cm.user
  WHERE ce.campaign_code='CVM-0108' --example EDR campaign code
LIMIT 100

/************************************************************************************************************/
/*                                          CHRISTMAS ANALYSIS                                              */
/************************************************************************************************************/



SELECT
  date(t.post_time) AS event_date,
  COUNT(1) AS event_count,
  COUNT(DISTINCT udo_user_profile_crn_hash) AS member_count
FROM `gcp-wow-rwds-ai-mlt-evs-prod.event_store.tealium_events` t
WHERE date(post_time) BETWEEN '2021-04-01' AND '2021-04-30'
  AND udo_tealium_datasource IN ('cjyl5p', 'gnckwo')
  AND udo_tealium_event = 'offer_activation_success'
GROUP BY event_date
ORDER BY event_date ASC;



/*----------------------------------------------------------------------------------------------------------*/
/*                  `gcp-wow-rwds-ai-data-prod.rtl_data_model.offer_campaign_master`                        */
/*----------------------------------------------------------------------------------------------------------*/

select * from  `gcp-wow-ent-im-wowx-cust-prod.adp_wowx_dm_loyalty_au_view.campaign_customer_offer_allocation_v` ccoa  limit 100


select * from `gcp-wow-rwds-ai-pobe-dev.angus.bigw_jupiter`

CREATE OR REPLACE TABLE `gcp-wow-rwds-ai-pobe-dev.angus.bigw_jupiter_STG` AS (

WITH CAMPAIGN_DETS AS (
    SELECT DISTINCT
        ocm.offer_nbr,
        ocm.offer_nbr AS OfferNumber,
        ocm.offer_name,
        ocm.campaign_code,
        ocm.campaign_type,
        CAST(oh.offer_start_date AS DATE) AS OfferAllocationStartDate,
        CAST(oh.offer_end_date AS DATE) AS OfferAllocationEndDate,
        CAST(oh.offer_start_date AS DATE) AS campaign_start_date,
        CAST(oh.offer_end_date AS DATE) AS campaign_end_date,
        oh.audience_type_desc,
        COALESCE(oh.Reward_value, oh.multiplier_value) AS reward_value,
        oh.multiplier_value,
        oh.OfferLevelEE,
        oh.minimum_basket_spend,
        offer_level
    FROM `gcp-wow-rwds-ai-data-prod.rtl_data_model.offer_campaign_master` AS ocm
    JOIN `gcp-wow-rwds-ai-data-prod.rtl_data_model.offer_header` AS oh ON ocm.offer_nbr = oh.offer_nbr
    WHERE ocm.campaign_code IN ('WCV-8059', 'RPM-7855')
    and  CAST(oh.offer_start_date AS DATE) > '2024-07-01'

audience_base AS (
    SELECT DISTINCT 
        ced.CampaignCode AS campaign_code,
        CAST(ced.CampaignStartDate AS DATE) AS campaign_start_date,
        CAST(ced.CampaignEndDate AS DATE) AS campaign_end_date,
        ccoa.OfferNumber AS offer_nbr,
        cm.OfferAllocationStartDate,
        cm.minimum_basket_spend,
        OfferLevelEE,
        ccoa.CustomerRegistrationNumber AS crn,
        cm.offer_name,
        cm.reward_value,
        cm.multiplier_value,
        cm.campaign_type,
        cm.audience_type_desc,
        group01 AS `01_Marketable`,
        group02 AS `02_Model_Random`,
        group03 AS `03_Segment`,
        group04 AS `04_Segment2`,
        group05 AS `05_Attract_Grow_Retain`,
        group06 AS `06_Life_Stage`,
        group07 AS `07_Hurdle`,
        group08 AS `08_Offer_nbr_Desc`,
        group09 AS `09_Value_Segment`,
        ccoa.ActivationDate as ActivationDate,
        IF(ccoa.ActivationDate IS NULL, NULL, ccoa.CustomerRegistrationNumber) as ActivationFlag,
        cm.offer_level, 
        cm.offer_name as offer_name2
    FROM `gcp-wow-ent-im-wowx-cust-prod.adp_wowx_dm_loyalty_au_view.campaign_exec_details_v` ced
    INNER JOIN `gcp-wow-ent-im-wowx-cust-prod.adp_wowx_dm_loyalty_au_view.campaign_customer_offer_allocation_v` ccoa 
        ON ced.CampaignExecID = ccoa.CampaignExecID
        AND ccoa.OfferStatus <> 'CANCELLED'
    INNER JOIN `gcp-wow-rwds-ai-data-prod.loyalty_car_analytics.fact_campaign_split_view` f 
        ON ced.CampaignCode = f.campaign_code 
        AND DATE(ced.CampaignStartDate) = f.campaign_start_date 
        AND ccoa.CustomerRegistrationNumber = f.crn
    LEFT JOIN CAMPAIGN_DETS cm 
        ON ccoa.OfferNumber = cm.OfferNumber
        AND ced.CampaignCode = cm.campaign_code
    WHERE 1=1
        AND ced.CampaignCode IN ('WCV-8059')
)
, base as (
SELECT x.* 
    , p.crn as Redeemer_flag
FROM Audience_Base x
LEFT JOIN (
  SELECT DISTINCT  
    srd.crn,
    srd.offer_start_date,
    srd.offer_end_date,
    srd.offer_nbr
from   `gcp-wow-rwds-ai-data-prod.loyalty_bi_analytics.vw_bi_sales_reward_details` srd 
) p
ON x.crn = p.crn
AND x.offer_nbr = p.offer_nbr
AND x.OfferAllocationStartDate = DATE(p.offer_start_date) --AND DATE(p.offer_end_date)

)

select * ,
    CASE WHEN `03_Segment` = 'Group 3 BIG W Lapsed' THEN 'REACTIVATION' 
         WHEN `04_Segment2` = 'INACTIVE' THEN 'REACTIVATION' 
         WHEN `03_Segment` = 'Group 5 BIG W Deep Inactive' THEN 'REACTIVATION' 
         WHEN `03_Segment` = 'Group 6 BIG W New' THEN 'PRIORITY_COHORTS' 
         ELSE 'Other' END as segment

from base

);

CREATE OR REPLACE TABLE `gcp-wow-rwds-ai-pobe-dev.angus.bigw_xmas_analysis` AS (

Select * from  `gcp-wow-rwds-ai-pobe-dev.angus.bigw_xmas_analysis_STG` 
);


/*----------------------------------------------------------------------------------------------------------*/
/*                                              `MODEL DATASET`                                             */   
/*----------------------------------------------------------------------------------------------------------*/

select * from from `gcp-wow-rwds-ai-pobe-dev.angus.bigw_xmas_analysis` limit 1000

-- create or replace table `gcp-wow-rwds-ai-pobe-dev.angus.bigw_xmas_modelData` as 

select 
    CONCAT(`08_Offer_nbr_Desc`, ' - ', campaign_start_date) as campaignkey,
    minimum_basket_spend,
    reward_value as cost,
    segment
from `gcp-wow-rwds-ai-pobe-dev.angus.bigw_xmas_analysis` 
limit 1000

);

tabpy



