
/*----------------------------------------------------------------------------------------------------------*/
/*                                Section 2: USING CAMPAIGN VIEW                                            */
/*----------------------------------------------------------------------------------------------------------*/

--  WCV-8059:  campaign_start_date = offer_start_date = '2024-09-10'
-- WCV-8059:  offer_end_date = '2024-09-15'

 
 CREATE OR REPLACE TABLE `gcp-wow-rwds-ai-pobe-dev.angus.jupiter_campaign_offer_numbers`
 OPTIONS(expiration_timestamp = TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)) AS
 (
 Select DISTINCT ced.campaign_code, ced.campaign_start_date,  offer_nbr from  `gcp-wow-rwds-ai-data-prod.rtl_data_model.campaign_offer_allocation` coa 
INNER JOIN `gcp-wow-rwds-ai-data-prod.rtl_data_model.campaign_exec_details` ced   
                on ced.campaign_exec_id = coa.campaign_exec_id
where ced.campaign_code in ('RPM-7855', 'MOB-7620','MOB-7295','WCV-8059', 'WCT-7844')-- and ced.campaign_start_date = CAST('2022-10-06' as date)
                --and coa.source_system='EE' and coa.Loaded_by='RTL' 
				);

-- select * from `gcp-wow-rwds-ai-pobe-dev.angus.jupiter_campaign_offer_numbers`

 CREATE OR REPLACE TABLE `gcp-wow-rwds-ai-pobe-dev.angus.jupiter_camp_dets`
 OPTIONS(expiration_timestamp = TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)) AS
 (

  with dim_date AS (
  SELECT distinct
    dd.CalendarDay,
    dd.FiscalWeekStartDate, 
    dd.FiscalWeekEndDate,
	dd.BigWFiscalWeekStartDate
  FROM `gcp-wow-ent-im-wowx-cust-prod.adp_wowx_dm_masterdata_view.dim_date_v` dd
)
-- select * from   `gcp-wow-rwds-ai-data-prod.rtl_data_model.offer_campaign_master`  where campaign_code in ('RPM-7855', 'MOB-7620','MOB-7295','WCV-8059', 'WCT-7844') 


, camp_dets AS (
    SELECT distinct
        ocm.offer_nbr,
        ocm.campaign_code,
        ocm.campaign_type,
        oh.offer_type_desc AS offer_type,
        oh.offer_desc,
        CAST(oh.offer_start_date AS DATE) AS offer_start_date,
        CAST(oh.offer_start_date AS DATE) AS campaign_start_date,
        CAST(oh.offer_end_date AS DATE) AS offer_end_date,
        oh.audience_type_desc,
        COALESCE(oh.Reward_value, oh.multiplier_value) AS reward_value,
        oh.offer_alternative_desc,
        oh.offer_level,
        oh.multiplier_value,
        oh.OfferLevelEE,
        DATE_DIFF(CAST(oh.offer_end_date AS DATE), CAST(oh.offer_start_date AS DATE), DAY) AS offer_Duration,
        dd.BigWFiscalWeekStartDate as fw_offer_start_date
    FROM `gcp-wow-rwds-ai-data-prod.rtl_data_model.offer_campaign_master` AS ocm
    JOIN `gcp-wow-rwds-ai-data-prod.rtl_data_model.offer_header` AS oh ON ocm.offer_nbr = oh.offer_nbr
    -- JOIN stream AS s ON s.campaign_code = ocm.Campaign_Code AND s.offer_nbr = ocm.offer_nbr
    JOIN dim_date dd ON CAST(oh.offer_start_date AS DATE) = dd.CalendarDay
    -- JOIN offer_numbers x on ocm.offer_nbr = x.offer_nbr
where campaign_code in ('RPM-7855', 'MOB-7620','MOB-7295','WCV-8059', 'WCT-7844') 
-- where campaign_code in ('WCT-7844') 
-- order by offer_start_date desc
and oh.offer_start_date  between '2024-08-28' and '2024-09-17'
)

select * from camp_dets 

 );



select * from  `gcp-wow-rwds-ai-pobe-dev.angus.jupiter_camp_dets`


/*----------------------------------------------------------------------------------------------------------*/
/*                                Section 2: USING CAMPAIGN VIEW                                            */
/*----------------------------------------------------------------------------------------------------------*/

select * from `gcp-wow-rwds-ai-pobe-dev.angus.bws_campaign` limit 1000

  CREATE OR REPLACE TABLE `gcp-wow-rwds-ai-pobe-dev.angus.jupiter_campaign_STG`
  OPTIONS(expiration_timestamp = TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)) AS
  (
    with dim_date AS (
    SELECT distinct
      dd.CalendarDay,
      dd.FiscalWeekStartDate, 
      dd.FiscalWeekEndDate
    FROM `gcp-wow-ent-im-wowx-cust-prod.adp_wowx_dm_masterdata_view.dim_date_v` dd
  )

    SELECT dd.FiscalWeekStartDate, dd.FiscalWeekEndDate, dd.CalendarDay,
        bc.*	, case when campaign_code = 'RPM-7855' 
      AND offer_nbr in ('90059050',
            '90059051',
            '90059465',
            '90059466',
            '90054705')
      THEN 'RPM_7855 with BIGW Offer'

      else 'Supers_Wonders' end as campaign_type

    FROM `gcp-wow-rwds-ai-data-prod.loyalty_bi_analytics.vw_bi_campaign_offer` bc
    LEFT JOIN dim_date dd ON date(bc.campaign_start_date) = dd.CalendarDay
  WHERE campaign_code in ('RPM-7855', 'MOB-7620','MOB-7295','WCV-8059', 'WCT-7844') 
  and offer_nbr != '90058612'
  --   and dd.CalendarDay between '2024-08-28' and '2024-09-17'
  );


CREATE OR REPLACE TABLE `gcp-wow-rwds-ai-pobe-dev.angus.jupiter_campaign` as (
	select a.* 
			, downloaded
	from `gcp-wow-rwds-ai-pobe-dev.angus.jupiter_campaign_STG` a
	left join (SELECT CRN , MIN(app_1st_login) as downloaded from  `gcp-wow-rwds-ai-pobe-dev.patrick.cocoon_mtm_app_1st_login_v` group by 1) b
	on a.crn = b.crn and downloaded between FiscalWeekStartDate and FiscalWeekEndDate
)


select * from `gcp-wow-rwds-ai-pobe-dev.angus.jupiter_campaign`
where offer_nbr = '90058612'
 limit 1000

-- 1st App Login --
-- The 1st login within onboarding period with association end time after end of onboarding --
,app_1st_login as
(
select   onb_start_week
        ,count(distinct crn) as app_first_login
        ,round(avg(date_diff(app_1st_login, onboarding, day)), 2) as avg_app_days
from    `gcp-wow-rwds-ai-pobe-dev.patrick.cocoon_mtm_app_1st_login_v`
where   onb_start_week_diff <= 16
group by 1
)




--get activation rate redemption rate at offer level
select campaign_start_date, offer_name
, count(distinct allocate) as allocated_CRN, count(distinct activated) as activated_CRN, count(distinct redeemed) as redeemed_CRN
, count(distinct activated) / count(distinct allocate) as activation_rate , count(distinct redeemed) / count(distinct allocate) as redemption_rate
from  `gcp-wow-rwds-ai-data-prod.loyalty_bi_analytics.vw_bi_campaign_offer`
where campaign_start_date >= '2024-09-02'
and campaign_code = 'CVM-0007'
group by 1,2
order by redemption_rate desc




CREATE OR REPLACE TABLE `gcp-wow-rwds-ai-pobe-dev.angus.jupiter_campaign_STG` AS (
with t1 as (
SELECT *,
  SPLIT(sids)[OFFSET(0)] AS CRN_sends,
  SPLIT(sids)[OFFSET(1)] AS OFFER
FROM `gcp-wow-rwds-ai-pobe-dev.angus.jupiter_campaign` , UNNEST(send_ids) as sids
) 

SELECT *
	, case when campaign_code = 'RPM-7855' 
		AND OFFER in ('90059050',
					'90059051',
					'90059465',
					'90059466',
					'90054705')
		THEN 'RPM_7855 with BIGW Offer'

		else 'Supers_Wonders' end as campaign_type
FROM t1

)

SELECT 
  SPLIT('1000000000000000528|9676541', '|')[OFFSET(0)] AS CRN,
  SPLIT('1000000000000000528|9676541', '|')[OFFSET(1)] AS OFFER


1000000000000000528|9676541
('90059050',
'90059051',
'90059465',
'90059466',
'90054705')

















  SELECT dd.FiscalWeekStartDate, dd.FiscalWeekEndDate, dd.CalendarDay,
       bc.*,
       c.campaign_type
  FROM dim_date dd 
  Left JOIN `gcp-wow-rwds-ai-data-prod.loyalty_bi_analytics.vw_bi_campaign` bc on date(bc.campaign_start_date) = dd.CalendarDay
--   JOIN `gcp-wow-rwds-ai-pobe-dev.angus.dim_mmm` c ON bc.campaign_code = c.campaign_code
  where dd.CalendarDay between '2023-02-06' and '2024-10-30'
);


, camp_dets AS (
    SELECT distinct
        ocm.offer_nbr,
        ocm.campaign_code,
        ocm.campaign_type,
        oh.offer_type_desc AS offer_type,
        oh.offer_desc,
        CAST(oh.offer_start_date AS DATE) AS offer_start_date,
        CAST(oh.offer_start_date AS DATE) AS campaign_start_date,
        CAST(oh.offer_end_date AS DATE) AS offer_end_date,
        oh.audience_type_desc,
        COALESCE(oh.Reward_value, oh.multiplier_value) AS reward_value,
        oh.offer_alternative_desc,
        oh.offer_level,
        oh.multiplier_value,
        oh.OfferLevelEE,
        DATE_DIFF(CAST(oh.offer_end_date AS DATE), CAST(oh.offer_start_date AS DATE), DAY) AS offer_Duration,
        dd.BigWFiscalWeekStartDate as fw_offer_start_date
    FROM `gcp-wow-rwds-ai-data-prod.rtl_data_model.offer_campaign_master` AS ocm
    JOIN `gcp-wow-rwds-ai-data-prod.rtl_data_model.offer_header` AS oh ON ocm.offer_nbr = oh.offer_nbr
    -- JOIN stream AS s ON s.campaign_code = ocm.Campaign_Code AND s.offer_nbr = ocm.offer_nbr
    JOIN dim_date dd ON CAST(oh.offer_start_date AS DATE) = dd.CalendarDay
    JOIN offer_numbers x on ocm.offer_nbr = x.offer_nbr
    -- WHERE  date(oh.offer_start_date) between DATE('2024-09-16') and DATE('2024-09-30') --REMOVE IN FINAL SCRIPT
    -- where ocm.campaign_code in ('WCT-6802')  -- REMOVE IN FINAL SCRIPT
    -- ORDER BY 1
)








-- {'project_id': 'gcp-wow-rwds-ai-data-prod', 'dataset_id': 'loyalty_bi_analytics', 'table_id': 'mstr_trythis_execution_master'}",
-- gcp-wow-rwds-ai-data-prod,jchew1@woolworths.com.au,SELECT,"

-- Get distinct count of send_ids and send_ids_click without cross-joining
WITH send_ids_cte AS (
  SELECT DISTINCT campaign_start_date, s_ids
  FROM gcp-wow-rwds-ai-data-prod.loyalty_bi_analytics.vw_bi_campaign a,
       UNNEST(a.send_ids) AS s_ids
--   WHERE event_fw_end_date = '2024-09-29'
  WHERE campaign_code = 'RPM-7855'
),
click_ids_cte AS (
  SELECT DISTINCT campaign_start_date, c_ids
  FROM gcp-wow-rwds-ai-data-prod.loyalty_bi_analytics.vw_bi_campaign a,
       UNNEST(a.send_ids_click) AS c_ids
--   WHERE event_fw_end_date = '2024-09-29'
   WHERE campaign_code = 'RPM-7855'
)


-- Now, count distinct values from both CTEs
SELECT
  send_ids_cte.campaign_start_date,
  COUNT(DISTINCT send_ids_cte.s_ids) AS send_count,
  COUNT(DISTINCT click_ids_cte.c_ids) AS click_count
FROM send_ids_cte
LEFT JOIN click_ids_cte
ON send_ids_cte.campaign_start_date = click_ids_cte.campaign_start_date
GROUP BY send_ids_cte.campaign_start_date
ORDER BY send_ids_cte.campaign_start_date

  
  ;



SELECT 
column_name, 
data_type 
Ordinal_position,
FROM 
`gcp-wow-rwds-ai-data-prod.loyalty_bi_analytics.INFORMATION_SCHEMA.COLUMNS` 
WHERE 
table_name = 'vw_bi_campaign';









































select * FROM `gcp-wow-rwds-ai-car-prod.loyalty_car_analytics.vW_fact_campaign_split` 
WHERE campaign_code = 'RPM-7855' AND campaign_start_date='2024-08-16'
Limit 100

SELECT * FROM  `gcp-wow-rwds-ai-data-prod.loyalty_bi_analytics.vw_bi_campaign_offer`  LIMIT 100
/************************************************************************************************************/
/*                                          CHRISTMAS ANALYSIS                                              */
/************************************************************************************************************/
/* Count total offer allocation, activation, and redemption */
SELECT event_fw_end_date, 
       COUNT(DISTINCT offer_nbr || allocate) AS total_offer_allocations,
       COUNT(DISTINCT offer_nbr || activated) AS total_offer_activation,
       COUNT(DISTINCT offer_nbr || redeemed) AS total_offer_redemption
FROM `gcp-wow-rwds-ai-data-prod.loyalty_bi_analytics.vw_bi_campaign_offer`
WHERE campaign_code in ( 'WCV-6541' , 'WCV-6479')
GROUP BY event_fw_end_date
ORDER BY event_fw_end_date;


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

Select distinct segment_code, channel_type, campaign_or_control_start_date, target_control, target_control_tables, count(distinct crn) 
from `gcp-wow-rwds-ai-car-prod.loyalty_car_analytics.ca_campaigns_audience_list` d where campaign_code = 'RPM-7855' group by 1,2,3,4,5;

Select crn, count( crn) 
from `gcp-wow-rwds-ai-car-prod.loyalty_car_analytics.ca_campaigns_audience_list` d 
where campaign_code = 'RPM-7855' 
group by 1
having count( crn) >1;

UPDATE `gcp-wow-rwds-ai-car-prod.loyalty_car_analytics.dim_campaign`
SET offer_exec_start_date='2024-08-07'
WHERE campaign_code = 'RPM-7855'

SELECT * FROM `gcp-wow-rwds-ai-car-prod.loyalty_car_analytics.dim_campaign` WHERE campaign_code  ='RPM-7855';
SELECT * FROM `gcp-wow-rwds-ai-car-prod.loyalty_car_analytics.dim_campaign_offer` WHERE campaign_code ='RPM-7855';
SELECT * FROM `gcp-wow-rwds-ai-car-prod.loyalty_car_analytics.dim_campaign_split_group` WHERE campaign_code ='RPM-7855';
SELECT * FROM `gcp-wow-rwds-ai-car-prod.loyalty_car_analytics.fact_campaign_split` WHERE campaign_code ='RPM-7855' LIMIT 100;

DELETE FROM `gcp-wow-rwds-ai-car-prod.loyalty_car_analytics.dim_campaign_offer` WHERE campaign_code ='RPM-7855';

Insert into `gcp-wow-rwds-ai-car-prod.loyalty_car_analytics.dim_campaign_offer` (
    campaign_code, campaign_start_date, offer_desc, lms_offer_id, offer_id, lms_offer_id_multi, campaign_week_nbr,  spend_hurdle, reward, division_name, reward_type, funded_by, multiplier
)
 Select 
 	'RPM-7855',
	 CAST('2024-08-16' AS DATE),
	a.offer_desc,
	a.offer_id,
	a.offer_id,
	a.offer_id,
	wk.weeknr,
	cast(a.spend_hurdle as numeric),
	a.reward,
	a.division,
	'Points',
	'Loyalty',
  a.multiplier
	From (
        SELECT 'Boost now & get Double Disney packs for every $30 spent at Big W' AS offer_desc,'90058612' AS offer_id, 30 AS spend_hurdle, NULL AS reward, null as multiplier, 'BIGW' as division UNION ALL
        SELECT 'Double Disney packs for every $30 spent at Woolworths' AS offer_desc,'90061786' AS offer_id, 30 AS spend_hurdle, null AS reward, NULL as multiplier, 'SUPERS' as division 
	) a
	CROSS JOIN
		( SELECT 1 as weeknr 
		) wk
	ORDER BY wk.weeknr	
	;	

----------------------------------------------------------------------------------------------------------------------------------------------------------	
DELETE FROM `gcp-wow-rwds-ai-car-prod.loyalty_car_analytics.fact_campaign_split` WHERE campaign_code = 'RPM-7855' AND campaign_start_date='2024-08-16';

SELECT *
	FROM gcp-wow-rwds-ai-car-prod.loyalty_car_analytics.ca_master_customer_profilingv3 limit 100

Insert into `gcp-wow-rwds-ai-car-prod.loyalty_car_analytics.fact_campaign_split`
    (campaign_code,campaign_start_date,crn,tc01,group01,tc02,group02,tc03,group03,tc04,group04,tc05,group05)
With crest as 
(SELECT CRN, crest_grp_SUP, macro_segment_curr_sup, lifestage_sup
	FROM gcp-wow-rwds-ai-car-prod.loyalty_car_analytics.ca_master_customer_profilingv3
),
eng_score as (
    select crn, weighted_score_band
    from `gcp-wow-rwds-ai-beh-seg-prod.member_engagement.member_scores_hist` 
    where fw_end_date='2023-09-03'
),
Audience as(
    SELECT DISTINCT	
            --M TARGET
        'RPM-7855' as campaign_code
        , CAST('2024-08-16' AS DATE) as campaign_start_date
        , cal.crn
        , '01-Total' as group01
        ,  cal.target_control AS TC01
				,	'02-Total ' || CASE WHEN cal.channel_type ='EMAIL' THEN 'Marketable' ELSE 'NonMarketable' END AS group02
        ,  cal.target_control AS TC02				 
        , '03-CREST '||  IFNULL(crest.crest_grp_SUP,'NA') as  group03
        ,  cal.target_control AS TC03
        , '04-CVM '||  IFNULL(crest.macro_segment_curr_sup,'NA') as  group04
        ,  cal.target_control AS TC04
        , '05-Lifestage '||  CASE WHEN crest.lifestage_sup ='' THEN 'NA' ELSE IFNULL(crest.lifestage_sup,'NA') END  as  group05
        ,  cal.target_control AS TC05							                        
    FROM  `gcp-wow-rwds-ai-car-prod.loyalty_car_analytics.ca_campaigns_audience_list` cal  
        left join crest on  cal.crn = crest.crn
        --left join eng_score ON cal.crn = eng_score.crn
        --left join final on cal.crn = final.crn
    WHERE cal.campaign_code ='RPM-7855'
        AND cal.campaign_or_control_start_date ='2024-08-16'
)
/*
SELECT * FROM (
Select group01, 1 as groupid, count(distinct crn) from Audience group by 1 UNION ALL
Select group02, 2 as groupid, count(distinct crn) from Audience group by 1 UNION ALL
Select group03, 3 as groupid, count(distinct crn) from Audience group by 1 UNION ALL
Select group04, 4 as groupid, count(distinct crn) from Audience group by 1 UNION ALL 
Select group05, 5 as groupid, count(distinct crn) from Audience group by 1 --UNION ALL
--Select group06, 6 as groupid, count(distinct crn) from Audience group by 1 
)ccc
 order by ccc.groupid  ;
*/

Select Distinct
	a.campaign_code as campaign_code, 
	a.campaign_start_date as campaign_start_date, 
	a.crn as crn, 	
	a.TC01 as tc01, 
	a.group01 as group01, 
	a.TC02 as tc02, 
	a.group02 as group02,
	a.TC03 as tc03, 
	a.group03 as group03,
	a.TC04 as tc04, 
	a.group04 as group04,
	a.TC05 as tc05, 
	a.group05 as group05
 from Audience a
;  

*/

DELETE FROM `gcp-wow-rwds-ai-car-prod.loyalty_car_analytics.dim_campaign_split_group` WHERE campaign_code = 'RPM-7855' AND campaign_start_date='2024-08-16';


Insert into `gcp-wow-rwds-ai-car-prod.loyalty_car_analytics.dim_campaign_split_group` (
    campaign_code, campaign_start_date,	group_name,	partition_type,	partition_value, group_nbr,	group_desc
)
Select
	'RPM-7855' as campaign_code
  ,CAST('2024-08-16' AS DATE)  as campaign_start_date
	,A.group_name as group_name
	,A.partition_type as partition_type
	,A.group_name as partition_value
	,A.group_nbr  as group_nbr
	,A.group_name as group_desc
FROM (
		SELECT '01-Total' AS group_name , 'Total' AS partition_type, 1 AS group_nbr UNION ALL
		SELECT '02-Total NonMarketable' AS group_name , 'Segment' AS partition_type, 2 AS group_nbr UNION ALL
		SELECT '02-Total Marketable' AS group_name , 'Segment' AS partition_type, 2 AS group_nbr UNION ALL
		SELECT '03-CREST Essential' AS group_name , 'Segment' AS partition_type, 3 AS group_nbr UNION ALL
		SELECT '03-CREST Conscious' AS group_name , 'Segment' AS partition_type, 3 AS group_nbr UNION ALL
		SELECT '03-CREST Savers' AS group_name , 'Segment' AS partition_type, 3 AS group_nbr UNION ALL
		SELECT '03-CREST Refined' AS group_name , 'Segment' AS partition_type, 3 AS group_nbr UNION ALL
		SELECT '03-CREST Traditional' AS group_name , 'Segment' AS partition_type, 3 AS group_nbr UNION ALL
		SELECT '03-CREST NA' AS group_name , 'Segment' AS partition_type, 3 AS group_nbr UNION ALL
		SELECT '04-CVM MVMEDA' AS group_name , 'Segment' AS partition_type, 4 AS group_nbr UNION ALL
		SELECT '04-CVM HVHIGH' AS group_name , 'Segment' AS partition_type, 4 AS group_nbr UNION ALL
		SELECT '04-CVM LOW' AS group_name , 'Segment' AS partition_type, 4 AS group_nbr UNION ALL
		SELECT '04-CVM LVHFA' AS group_name , 'Segment' AS partition_type, 4 AS group_nbr UNION ALL
		SELECT '04-CVM LVLF' AS group_name , 'Segment' AS partition_type, 4 AS group_nbr UNION ALL
		SELECT '04-CVM NA' AS group_name , 'Segment' AS partition_type, 4 AS group_nbr UNION ALL
		SELECT '04-CVM LVHFB' AS group_name , 'Segment' AS partition_type, 4 AS group_nbr UNION ALL
		SELECT '04-CVM MVHIGH' AS group_name , 'Segment' AS partition_type, 4 AS group_nbr UNION ALL
		SELECT '04-CVM HVMED' AS group_name , 'Segment' AS partition_type, 4 AS group_nbr UNION ALL
		SELECT '04-CVM MVMEDB' AS group_name , 'Segment' AS partition_type, 4 AS group_nbr UNION ALL
		SELECT '04-CVM LAPSED' AS group_name , 'Segment' AS partition_type, 4 AS group_nbr UNION ALL
		SELECT '04-CVM INACTIVE' AS group_name , 'Segment' AS partition_type, 4 AS group_nbr UNION ALL
		SELECT '04-CVM LVLFB' AS group_name , 'Segment' AS partition_type, 4 AS group_nbr UNION ALL
		SELECT '05-Lifestage MIDAGE SINGLES/COUPLES' AS group_name , 'Segment' AS partition_type, 5 AS group_nbr UNION ALL
		SELECT '05-Lifestage NEW FAMILIES' AS group_name , 'Segment' AS partition_type, 5 AS group_nbr UNION ALL
		SELECT '05-Lifestage NA' AS group_name , 'Segment' AS partition_type, 5 AS group_nbr UNION ALL
		SELECT '05-Lifestage RETIREES' AS group_name , 'Segment' AS partition_type, 5 AS group_nbr UNION ALL
		SELECT '05-Lifestage YOUNG FAMILIES' AS group_name , 'Segment' AS partition_type, 5 AS group_nbr UNION ALL
		SELECT '05-Lifestage YOUNG SINGLES/COUPLES' AS group_name , 'Segment' AS partition_type, 5 AS group_nbr UNION ALL
		SELECT '05-Lifestage OLDER FAMILIES' AS group_name , 'Segment' AS partition_type, 5 AS group_nbr UNION ALL
		SELECT '05-Lifestage OLDER SINGLES/COUPLES' AS group_name , 'Segment' AS partition_type, 5 AS group_nbr 
) A 
;
*/



