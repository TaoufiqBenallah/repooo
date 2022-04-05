const axios = require('axios');
const logger = require('./logger');

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
charactersLength));
 }
 return result;
}

const getWebAppToken = async (authcode, domain) =>
  axios({
    method: 'post',
    url: `https://${process.env.SFMC_SUBDOMAIN}.auth.marketingcloudapis.com/v2/token`,
    data: {
      grant_type: 'authorization_code',
      code: authcode,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: `https://${domain}/authenticated`,
      scope: "data_extensions_read data_extensions_write",
    },
  });

const getBusinessUnitId = async (accessToken) =>
  axios({
    method: 'get',
    url: `https://${process.env.SFMC_SUBDOMAIN}.rest.marketingcloudapis.com/platform/v1/tokenContext`,
    headers: { Authorization: accessToken },
  });

const sendLog = async (data, accessToken) => {

  const { journeyId, journeyVersionNumber, buId, campaignId, campaignName, campaignControlGroup, campaignOffersType, campaignProductsType, campaignCommunicationsType, campaignGroup, activityId, contactKey } = data;

  return axios({
    method: 'post',
    url: `https://${process.env.SFMC_SUBDOMAIN}.rest.marketingcloudapis.com/data/v1/async/dataextensions/key:4D4C06DA-C0EB-467C-AC13-65BFFF4CD442/rows`,
    data: {
        items: [{
          "CAMP_CAMPAIGN_ID": campaignId,
          "CAMP_CONTROL_GR": campaignControlGroup,
          "CAMP_OFFER_TYPE": campaignOffersType,
          "CAMP_CAMPAIGN_NAME": campaignName,
          "CAMP_PRODUCT_TYPE": campaignProductsType,
          "CAMP_GROUP_CAMP_FL": campaignGroup,
          "ContactKey": contactKey,
          "UUID": makeid(10),
          "OYBAccountID": buId,
          "VersionID": journeyVersionNumber,
          "ActivityID": activityId,
          "RecordCreated": new Date(),
          "CAMP_COMMUNICATION_TYPE": campaignCommunicationsType,
          "JourneyID": journeyId
        }]
    },
    headers: { Authorization: accessToken },
  });
}

const getUserInfo = async (accessToken) =>
  axios({
    method: 'get',
    url: `https://${process.env.SFMC_SUBDOMAIN}.auth.marketingcloudapis.com/v2/userinfo`,
    headers: { Authorization: accessToken },
  });

const getSTSAppToken = async () =>
  axios.post(`https://${process.env.SFMC_SUBDOMAIN}.auth.marketingcloudapis.com/v2/token`, {
      grant_type: "client_credentials",
      client_id: "06fi09kvmru22lrfgwgkehek",
      client_secret: "hwItfvcRJbyFGtW7Dy6mFtJE",
      scope: "data_extensions_write",
      account_id: "510000545"
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )

const getCampaignOfferTypes = async (accessToken) =>
  axios({
    method: 'get',
    url: `https://${process.env.SFMC_SUBDOMAIN}.rest.marketingcloudapis.com/data/v1/customobjectdata/key/3122D19A-435E-451C-9CCE-3C1EE28F2869/rowset`,
    headers: { Authorization: accessToken },
  });

const getCampaignProductTypes  = async (accessToken) =>
  axios({
    method: 'get',
    url: `https://${process.env.SFMC_SUBDOMAIN}.rest.marketingcloudapis.com/data/v1/customobjectdata/key/5CCEC2D1-D240-4729-B979-62573647E3D3/rowset`,
    headers: { Authorization: accessToken },
  });

module.exports = { getWebAppToken, getUserInfo, getCampaignOfferTypes, getCampaignProductTypes, getSTSAppToken, sendLog, getBusinessUnitId };