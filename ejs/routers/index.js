const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const isWithinRange = require('../utils/ip-checker');
const sfmcAPI = require('../utils/sfmc-api');
const logger = require('../utils/logger');

const description = process.env.DESCRIPTION || 'EJS Custom Activity';

router.get('/config.json', (req, res) => {
  const ip = req.header('x-forwarded-for') || req.connection.remoteAddress;

  if (
    (process.env.IP_CHECK_DISABLED &&
      process.env.IP_CHECK_DISABLED.toLowerCase() === 'true' &&
      req.headers['user-agent'] &&
      req.headers['user-agent'] === 'Salesforce-JourneyBuilder') ||
    (isWithinRange(ip) &&
      req.headers['user-agent'] &&
      req.headers['user-agent'] === 'Salesforce-JourneyBuilder')
  ) {
    const domain = req.headers.host || req.headers.origin;
    const timeout = parseInt(process.env.TIMEOUT, 10) || 100000;
    const retryCount = parseInt(process.env.RETRY_COUNT, 10) || 5;
    const retryDelay = parseInt(process.env.RETRY_DELAY, 10) || 10000;
    const concurrentRequests = parseInt(process.env.CONCURRENT_REQUESTS, 10) || 1;

    const file = path.join(__dirname, '..', 'public', 'config-template.json');
    const configTemplate = fs.readFileSync(file, 'utf-8');

    const config = JSON.parse(
      configTemplate
        .replace(/\$DOMAIN/g, domain)
        .replace(/\$DESCRIPTION/g, description)
        .replace(/"\$TIMEOUT"/g, timeout)
        .replace(/"\$RETRY_COUNT"/g, retryCount)
        .replace(/"\$RETRY_DELAY"/g, retryDelay)
        .replace(/"\$CONCURRENT_REQUESTS"/g, concurrentRequests)
    );

    if (process.env.JWT_CUSTOMER_KEY && process.env.JWT_PSWD) {
      const jwtCustomerKey = process.env.JWT_CUSTOMER_KEY;
      config.arguments.execute.customerKey = jwtCustomerKey;
      config.configurationArguments.save.customerKey = jwtCustomerKey;
      config.configurationArguments.validate.customerKey = jwtCustomerKey;
      config.configurationArguments.publish.customerKey = jwtCustomerKey;
      config.configurationArguments.stop.customerKey = jwtCustomerKey;
    }

    res.status(200).json(config);
  } else {
    logger.error(`${req.url} endpoint: wrong IP or headers`);
    res.status(401).render('error');
  }
});

router.get('/login', (req, res) => {
  const domain = req.headers.host || req.headers.origin;
  const redirectUrl = `https://${domain}/authenticated`;
  const state = req.query.state || 'index';
  const loginURL = `https://${process.env.SFMC_SUBDOMAIN}.auth.marketingcloudapis.com/v2/authorize?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${redirectUrl}&state=${state}`;
  res.redirect(loginURL);
});

router.get('/authenticated', (req, res) => {
  switch (req.query.state) {
    case 'index':
      res.redirect(`/index.html?authcode=${req.query.code}`);
      break;
    case 'runningHover':
      res.redirect(`/runningHover.html?authcode=${req.query.code}`);
      break;
    case 'runningModal':
      res.redirect(`/runningModal.html?authcode=${req.query.code}`);
      break;
    default:
      res.redirect(`/index.html?authcode=${req.query.code}`);
  }
});

router.get('/index.html', async (req, res) => {
  if (
    (req.headers.referer &&
      req.headers.referer ===
        `https://jbinteractions.s${process.env.STACK}.marketingcloudapps.com/`) ||
    req.query.authcode
  ) {
    if (req.query.authcode) {
      const domain = req.headers.host || req.headers.origin;
      try {
        const requestToken = await sfmcAPI.getWebAppToken(req.query.authcode, domain);
        const accessToken = requestToken.data.access_token;

        if (accessToken) {
          const uiSettingsDisplay =
            process.env.UI_SETTING_DISPLAY && process.env.UI_SETTING_DISPLAY.toLowerCase() === 'off'
              ? false
              : true;

          res.status(200).render('index', {
            title: description,
            uiSettingsDisplay,
            accessToken: `Bearer ${accessToken}`,
          });
        } else {
          logger.error(`${req.url} endpoint: access token missing`);
          res.status(401).render('error');
        }
      } catch (err) {
        logger.error(`${req.url} endpoint: authorization failed`);
        res.status(401).render('error');
      }
    } else {
      res.redirect('/login?state=index');
    }
  } else {
    logger.error(`${req.url} endpoint: not authorized`);
    res.status(401).render('error');
  }
});

router.get('/runningHover.html', async (req, res) => {
  if (
    (req.headers.referer &&
      req.headers.referer ===
        `https://jbinteractions.s${process.env.STACK}.marketingcloudapps.com/`) ||
    req.query.authcode
  ) {
    if (req.query.authcode) {
      const domain = req.headers.host || req.headers.origin;
      try {
        const requestToken = await sfmcAPI.getWebAppToken(req.query.authcode, domain);
        const accessToken = requestToken.data.access_token;

        if (accessToken) {
          res.status(200).render('runningHover', { accessToken: `Bearer ${accessToken}` });
        } else {
          logger.error(`${req.url} endpoint: access token missing`);
          res.status(401).render('error');
        }
      } catch (err) {
        logger.error(`${req.url} endpoint: authorization failed`);
        res.status(401).render('error');
      }
    } else {
      res.redirect('/login?state=runningHover');
    }
  } else {
    logger.error(`${req.url} endpoint: not authorized`);
    res.status(401).render('error');
  }
});

router.get('/runningModal.html', async (req, res) => {
  if (
    (req.headers.referer &&
      req.headers.referer ===
        `https://jbinteractions.s${process.env.STACK}.marketingcloudapps.com/`) ||
    req.query.authcode
  ) {
    if (req.query.authcode) {
      const domain = req.headers.host || req.headers.origin;
      try {
        const requestToken = await sfmcAPI.getWebAppToken(req.query.authcode, domain);
        const accessToken = requestToken.data.access_token;

        if (accessToken) {
          res.status(200).render('runningModal', { accessToken: `Bearer ${accessToken}` });
        } else {
          logger.error(`${req.url} endpoint: access token missing`);
          res.status(401).render('error');
        }
      } catch (err) {
        logger.error(`${req.url} endpoint: authorization failed`);
        res.status(401).render('error');
      }
    } else {
      res.redirect('/login?state=runningModal');
    }
  } else {
    logger.error(`${req.url} endpoint: not authorized`);
    res.status(401).render('error');
  }
});

module.exports = router;
