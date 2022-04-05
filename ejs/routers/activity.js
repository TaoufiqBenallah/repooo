const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const JWT = require('../utils/jwt-decoder');
const sfmcAPI = require('../utils/sfmc-api');
const isWithinRange = require('../utils/ip-checker');
const logger = require('../utils/logger');

const ipCheckDisabled =
  process.env.IP_CHECK_DISABLED && process.env.IP_CHECK_DISABLED.toLowerCase() === 'true'
    ? true
    : false;

/**
 * Triggered when contact passes through the custom activity inside the journey
 * {
 *   inArguments: [
 *    {
 *      "journeyName": "EJS Custom Activity",
 *      "journeyVersionNumber": 22,
 *      ...
 *    },
 *   ],
 *   "outArguments": [
 *    {
 *      "status": ""
 *    },
 *    {
 *      "errMsg": ""
 *    }
 *   ],
 *   activityObjectID: 'fcec044f-f213-42cb-a501-56e364f2bd76',
 *   journeyId: '63642046-7b9d-4789-8138-b59a52923f3e', // Is a Journey Version ID
 *   activityId: 'fcec044f-f213-42cb-a501-56e364f2bd76',
 *   definitionInstanceId: 'e14a2d2c-fac1-4b9f-9ab7-97d9941d2e00',
 *   activityInstanceId: '3eddca74-4841-435d-8c68-784acaeeb8da',
 *   keyValue: '4963F886-E638-43AF-A383-53AC7D3FCD28', // Is a ContactKey
 *   mode: 0
 * }
 */
router.post('/execute', async (req, res) => {
  let errMsg = '';

  const ip = req.header('x-forwarded-for') || req.connection.remoteAddress;

  if (ipCheckDisabled || isWithinRange(ip)) {
    try {
      const data = JWT(req.body);

      const uniqueTransactionId = uuidv4(); // useful for debugging

      const tokenData = await sfmcAPI.getSTSAppToken();
      const accessToken = tokenData.data.access_token;

      logger.info(data.inArguments[0]);

      const sendLog = await sfmcAPI.sendLog(data.inArguments[0], `Bearer ${accessToken}`)

      logger.info(
        `${req.url} endpoint received: ${JSON.stringify(
          data
        )} [UniqueTransactionID: ${uniqueTransactionId}]`
      );

      res.status(200).json({ status: 'ok', errMsg });
    } catch (jwtErr) {
      errMsg = `${req.url} endpoint: jwt malformed`;
      logger.error(errMsg);
      res.status(500).json({ status: 'error', errMsg });
    }
  } else {
    errMsg = `${req.url} endpoint: IP not allowed`;
    logger.error(errMsg);
    res.status(401).json({ status: 'error', errMsg });
  }
});

/**
 * Triggered when user validates or publishes the journey
 * {
 *   activityObjectID: 'fcec044f-f213-42cb-a501-56e364f2bd76',
 *   interactionId: '63642046-7b9d-4789-8138-b59a52923f3e',
 *   originalDefinitionId: '2f811d21-9fa0-4364-a591-a78aa060f215', // Is a Journey ID
 *   interactionKey: 'f7dc69a1-94a7-0d33-5ffb-7106fd11068c',
 *   interactionVersion: '4' // Is a Journey Version Number
 * }
 */
router.post('/save', (req, res) => {
  const ip = req.header('x-forwarded-for') || req.connection.remoteAddress;

  if (ipCheckDisabled || isWithinRange(ip)) {
    try {
      const data = JWT(req.body);

      logger.info(`${req.url} endpoint received: ${JSON.stringify(data)}`);

      res.status(200).json({ status: 'ok' });
    } catch (jwtErr) {
      logger.error(`${req.url} endpoint: jwt malformed`);
      res.status(500).json({ status: 'error' });
    }
  } else {
    logger.error(`${req.url} endpoint: IP not allowed`);
    res.status(401).json({ status: 'error' });
  }
});

/**
 * Triggered when user validates or publishes the journey
 * {
 *   activityObjectID: 'fcec044f-f213-42cb-a501-56e364f2bd76',
 *   interactionId: '63642046-7b9d-4789-8138-b59a52923f3e',
 *   originalDefinitionId: '2f811d21-9fa0-4364-a591-a78aa060f215', // Is a Journey ID
 *   interactionKey: 'f7dc69a1-94a7-0d33-5ffb-7106fd11068c',
 *   interactionVersion: '4' // Is a Journey Version Number
 * }
 */
router.post('/validate', (req, res) => {
  const ip = req.header('x-forwarded-for') || req.connection.remoteAddress;

  if (ipCheckDisabled || isWithinRange(ip)) {
    try {
      const data = JWT(req.body);

      logger.info(`${req.url} endpoint received: ${JSON.stringify(data)}`);

      res.status(200).json({ status: 'ok' });
    } catch (jwtErr) {
      logger.error(`${req.url} endpoint: jwt malformed`);
      res.status(500).json({ status: 'error' });
    }
  } else {
    logger.error(`${req.url} endpoint: IP not allowed`);
    res.status(401).json({ status: 'error' });
  }
});

/**
 * Triggered when user publishes the journey
 * {
 *   activityObjectID: '73256fbe-7cb2-484f-b11c-465e5c98c375',
 *   interactionId: '98b5d25a-9fbf-4039-b7c8-a08b9d2a172c',
 *   originalDefinitionId: '2f811d21-9fa0-4364-a591-a78aa060f215', // Is a Journey ID
 *   interactionKey: 'f7dc69a1-94a7-0d33-5ffb-7106fd11068c',
 *   interactionVersion: '4', // Is a Journey Version Number
 *   isPublished: true
 * }
 */
router.post('/publish', (req, res) => {
  const ip = req.header('x-forwarded-for') || req.connection.remoteAddress;

  if (ipCheckDisabled || isWithinRange(ip)) {
    try {
      const data = JWT(req.body);

      logger.info(`${req.url} endpoint received: ${JSON.stringify(data)}`);

      res.status(200).json({ status: 'ok' });
    } catch (jwtErr) {
      logger.error(`${req.url} endpoint: jwt malformed`);
      res.status(500).json({ status: 'error' });
    }
  } else {
    logger.error(`${req.url} endpoint: IP not allowed`);
    res.status(401).json({ status: 'error' });
  }
});

/**
 * Triggered when user stops the journey
 * {
 *   activityObjectID: '73256fbe-7cb2-484f-b11c-465e5c98c375',
 *   interactionId: '98b5d25a-9fbf-4039-b7c8-a08b9d2a172c',
 *   originalDefinitionId: '2f811d21-9fa0-4364-a591-a78aa060f215', // Is a Journey ID
 *   interactionKey: 'f7dc69a1-94a7-0d33-5ffb-7106fd11068c',
 *   interactionVersion: '4', // Is a Journey Version Number
 *   isPublished: false
 * }
 */
router.post('/unpublish', (req, res) => {
  const ip = req.header('x-forwarded-for') || req.connection.remoteAddress;

  if (ipCheckDisabled || isWithinRange(ip)) {
    try {
      const data = JWT(req.body);

      logger.info(`${req.url} endpoint received: ${JSON.stringify(data)}`);

      res.status(200).json({ status: 'ok' });
    } catch (jwtErr) {
      logger.error(`${req.url} endpoint: jwt malformed`);
      res.status(500).json({ status: 'error' });
    }
  } else {
    logger.error(`${req.url} endpoint: IP not allowed`);
    res.status(401).json({ status: 'error' });
  }
});

/**
 * Triggered when user stops the journey
 * {
 *   activityObjectID: '73256fbe-7cb2-484f-b11c-465e5c98c375',
 *   interactionId: '98b5d25a-9fbf-4039-b7c8-a08b9d2a172c',
 *   originalDefinitionId: '2f811d21-9fa0-4364-a591-a78aa060f215', // Is a Journey ID
 *   interactionKey: 'f7dc69a1-94a7-0d33-5ffb-7106fd11068c',
 *   interactionVersion: '4' // Is a Journey Version Number
 * }
 */
router.post('/stop', (req, res) => {
  const ip = req.header('x-forwarded-for') || req.connection.remoteAddress;

  if (ipCheckDisabled || isWithinRange(ip)) {
    try {
      const data = JWT(req.body);

      logger.info(`${req.url} endpoint received: ${JSON.stringify(data)}`);

      res.status(200).json({ status: 'ok' });
    } catch (jwtErr) {
      logger.error(`${req.url} endpoint: jwt malformed`);
      res.status(500).json({ status: 'error' });
    }
  } else {
    logger.error(`${req.url} endpoint: IP not allowed`);
    res.status(401).json({ status: 'error' });
  }
});

/**
 * Doesn't seem to work but might be fixed in the future
 */
router.post('/testsave', (req, res) => {
  const ip = req.header('x-forwarded-for') || req.connection.remoteAddress;

  if (ipCheckDisabled || isWithinRange(ip)) {
    try {
      const data = JWT(req.body);

      logger.info(`${req.url} endpoint received: ${JSON.stringify(data)}`);

      res.status(200).json({ status: 'ok' });
    } catch (jwtErr) {
      logger.error(`${req.url} endpoint: jwt malformed`);
      res.status(500).json({ status: 'error' });
    }
  } else {
    logger.error(`${req.url} endpoint: IP not allowed`);
    res.status(401).json({ status: 'error' });
  }
});

module.exports = router;
