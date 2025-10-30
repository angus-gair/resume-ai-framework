/************************************************************************************************************/
/*                                          CHRISTMAS ANALYSIS                                              */
/************************************************************************************************************/

/*----------------------------------------------------------------------------------------------------------*/
/*                  `gcp-wow-rwds-ai-data-prod.rtl_data_model.offer_campaign_master`                        */
/*----------------------------------------------------------------------------------------------------------*/

-- view
-- SELECT * FROM  `gcp-wow-rwds-ai-data-prod.loyalty_car_analytics.fact_campaign_split_view`    LIMIT 100



/*
WITH CAMPAIGN_DETS AS (
    SELECT DISTINCT
        ocm.offer_nbr,
        ocm.offer_nbr AS OFFER_ID,
        ocm.offer_name,
        ocm.campaign_code,
        ocm.campaign_type,
        CAST(oh.offer_start_date AS DATE) AS offer_start_date,
        CAST(oh.offer_end_date AS DATE) AS offer_end_date,
        CAST(oh.offer_start_date AS DATE) AS campaign_start_date,
        CAST(oh.offer_end_date AS DATE) AS campaign_end_date,
        oh.audience_type_desc,
        COALESCE(oh.Reward_value, oh.multiplier_value) AS reward_value,
        oh.multiplier_value,
        oh.OfferLevelEE,
        oh.minimum_basket_spend
    FROM 
        `gcp-wow-rwds-ai-data-prod.rtl_data_model.offer_campaign_master` AS ocm
    JOIN 
        `gcp-wow-rwds-ai-data-prod.rtl_data_model.offer_header` AS oh 
    ON 
        ocm.offer_nbr = oh.offer_nbr
    WHERE 
        ocm.campaign_type = 'BIGW'
        AND ocm.campaign_code IN ('WCV-6479', 'WCV-6541')
)

SELECT 
    fcs.*,
    cd.offer_name,
    cd.campaign_type,
    cd.audience_type_desc,
    cd.reward_value,
    cd.multiplier_value,
    cd.OfferLevelEE,
    cd.minimum_basket_spend,
    (coalesce(cd.reward_value,0)*2000)/10 as point_value
FROM  
    `gcp-wow-rwds-ai-data-prod.loyalty_car_analytics.fact_campaign_split_view` fcs
JOIN 
    CAMPAIGN_DETS cd 
ON 
    fcs.campaign_code = cd.campaign_code
    AND fcs.campaign_start_date between  cd.offer_start_date AND cd.offer_end_date
    --event_fw_end_date bi.campaign_start_date = cd.campaign_start_date --AND cd.campaign_end_date
LIMIT 100;
*/



/************************************************************************************************************/
/*                                         NOT OLD                                              */
/************************************************************************************************************/


select * from `gcp-wow-ent-im-wowx-cust-prod.adp_wowx_dm_loyalty_au_view.campaign_customer_offer_allocation_v` ccoa  limit 1000

select * from `gcp-wow-ent-im-wowx-cust-prod.adp_wowx_dm_loyalty_au_view.campaign_customer_offer_allocation_v`  ocm
--WHERE ocm.campaign_code IN ('WCV-6479', 'WCV-6541')


-- JOIN USING (campaign_code, campaign_start_date)

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
        oh.minimum_basket_spend
    FROM `gcp-wow-rwds-ai-data-prod.rtl_data_model.offer_campaign_master` AS ocm
    JOIN `gcp-wow-rwds-ai-data-prod.rtl_data_model.offer_header` AS oh ON ocm.offer_nbr = oh.offer_nbr
    WHERE ocm.campaign_code IN ('WCV-6479', 'WCV-6541')
) 


, audience_base AS (

SELECT DISTINCT ced.CampaignCode AS campaign_code
               ,CAST(ced.CampaignStartDate AS DATE) AS campaign_start_date
               ,CAST(ced.CampaignEndDate AS DATE) AS campaign_end_date
               ,ccoa.OfferNumber AS offer_nbr
               ,cm.minimum_basket_spend
               , OfferLevelEE
               ,cm.total_wow_rewards AS cm_points_reward_on_offer
               ,cm.total_dollar_rewards AS cm_dollar_reward_on_offer
               ,ccoa.CustomerRegistrationNumber AS crn
               , cm.offer_name,
            ,    COALESCE(oh.Reward_value, oh.multiplier_value) AS reward_value
                , oh.multiplier_value
                , cm.campaign_type 
                , cm.audience_type_desc
FROM `gcp-wow-ent-im-wowx-cust-prod.adp_wowx_dm_loyalty_au_view.campaign_exec_details_v` ced

INNER JOIN `gcp-wow-ent-im-wowx-cust-prod.adp_wowx_dm_loyalty_au_view.campaign_customer_offer_allocation_v` ccoa 
ON ced.CampaignExecID = ccoa.CampaignExecID
AND ccoa.OfferStatus <> 'CANCELLED'

INNER JOIN `gcp-wow-rwds-ai-data-prod.loyalty_car_analytics.fact_campaign_split_view` f 
ON ced.CampaignCode = f.campaign_code 
AND DATE(ced.CampaignStartDate) = f.campaign_start_date 
AND ccoa.CustomerRegistrationNumber = f.crn

LEFT JOIN CAMPAIGN_DETS cm -- Manual table with relevant offer details created during business case.
ON ccoa.OfferNumber = OfferNumber
AND ced.CampaignCode = cm.campaign_code

WHERE 1=1
      AND ced.CampaignCode = ('WCV-6479', 'WCV-6541')
    --   AND DATE(ced.CampaignStartDate) = '2024-02-12'

)



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
        oh.minimum_basket_spend
    FROM `gcp-wow-rwds-ai-data-prod.rtl_data_model.offer_campaign_master` AS ocm
    JOIN `gcp-wow-rwds-ai-data-prod.rtl_data_model.offer_header` AS oh ON ocm.offer_nbr = oh.offer_nbr
    WHERE ocm.campaign_code IN ('WCV-6479', 'WCV-6541')
)

SELECT 
    bi.*,
    cd.offer_name,
    cd.campaign_type,
    cd.audience_type_desc,
    cd.reward_value,
    cd.multiplier_value,
    cd.OfferLevelEE,
    cd.minimum_basket_spend
FROM  
    `gcp-wow-ent-im-wowx-cust-prod.adp_wowx_dm_loyalty_au_view.campaign_customer_offer_allocation_v` bi
JOIN 
    CAMPAIGN_DETS cd 
ON 
    bi.OfferNumber = cd.OfferNumber
    AND CAST(bi.OfferAllocationStartDate AS DATE) = cd.OfferAllocationStartDate
LIMIT 100;




/*
--result per campaign execution -- full result
select distinct campaign_code, campaign_name
, campaign_start_date, campaign_end_date
, count(distinct targeted) crn_targeted
, count(distinct allocate) crn_allocated_offer
, count(distinct deliver) crn_received_emal
, count(distinct open) crn_opened_emal
, count(distinct open)/NULLIF(count(distinct deliver),0) open_rate
, count(distinct click) crn_clicked_emal
, count(distinct click)/NULLIF(count(distinct deliver),0) click_rate
, count(distinct unsub) crn_unsub_emal
, count(distinct activated) crn_activated
, count(distinct redeemed) crn_redeemed
, count(distinct redeemed)/NULLIF(count(distinct targeted),0) redemption_rate
, sum(cost_value_incldgst) as total_cost
, sum(cost_value_incldgst)/NULLIF(count(distinct redeemed),0) as cost_per_redeemer
, sum(attribution_sales_value) as total_attribution_inc_sale
, sum(attribution_sales_value)/NULLIF(count(distinct redeemed),0) as return_per_redeemer
from gcp-wow-rwds-ai-data-prod.loyalty_bi_analytics.vw_bi_campaign 
JOIN camp_dets cd 
where campaign_code = 'WCV-5156'
--and fw_end_date >= current_Date('Australia/Sydney')  - 7*26
group by 1,2,3,4
order by 1,2,3,4
;

*/


/*----------------------------------------------------------------------------------------------------------*/
/*                    `gcp-wow-rwds-ai-data-prod.loyalty_bi_analytics.vw_bi_campaign`                       */
/*----------------------------------------------------------------------------------------------------------*/

/*
WITH CAMPAIGN_DETS AS (
    SELECT DISTINCT
        ocm.offer_nbr,
        ocm.offer_nbr AS OFFER_ID,
        ocm.offer_name,
        ocm.campaign_code,
        ocm.campaign_type,
        CAST(oh.offer_start_date AS DATE) AS offer_start_date,
        CAST(oh.offer_end_date AS DATE) AS offer_end_date,
        CAST(oh.offer_start_date AS DATE) AS campaign_start_date,
        CAST(oh.offer_end_date AS DATE) AS campaign_end_date,
        oh.audience_type_desc,
        COALESCE(oh.Reward_value, oh.multiplier_value) AS reward_value,
        oh.multiplier_value,
        oh.OfferLevelEE,
        oh.minimum_basket_spend
    FROM 
        `gcp-wow-rwds-ai-data-prod.rtl_data_model.offer_campaign_master` AS ocm
    JOIN 
        `gcp-wow-rwds-ai-data-prod.rtl_data_model.offer_header` AS oh 
    ON 
        ocm.offer_nbr = oh.offer_nbr
    WHERE 
        ocm.campaign_type = 'BIGW'
        AND LEFT(ocm.campaign_code, 3) IN ('WCT', 'WCV', 'WSP')
        and ocm.campaign_code = 'WCV-6143'
)

SELECT 
    bi.*,
    cd.offer_name,
    cd.campaign_type,
    cd.audience_type_desc,
    cd.reward_value,
    cd.multiplier_value,
    cd.OfferLevelEE,
    cd.minimum_basket_spend
FROM  
    `gcp-wow-rwds-ai-data-prod.loyalty_bi_analytics.vw_bi_campaign` bi
JOIN 
    CAMPAIGN_DETS cd 
ON 
    bi.campaign_code = cd.campaign_code
    AND bi.event_fw_end_date between  cd.campaign_start_date AND cd.campaign_end_date
    --event_fw_end_date bi.campaign_start_date = cd.campaign_start_date --AND cd.campaign_end_date
LIMIT 100;
*/