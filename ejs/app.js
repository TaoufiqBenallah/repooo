require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const path = require('path');
const indexRouter = require('./routers/index');
const clientReqRouter = require('./routers/client-requests');
const activityRouter = require('./routers/activity');
const logger = require('./utils/logger');

const app = express();
const port = process.env.PORT || 3000;

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],
        'frame-ancestors': [
          "'self'",
          `https://mc.s${process.env.STACK}.exacttarget.com`,
          `https://jbinteractions.s${process.env.STACK}.marketingcloudapps.com`,
        ],
      },
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  bodyParser.raw({
    type: 'application/jwt',
  })
);

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/client-requests', clientReqRouter);
app.use('/activity', activityRouter);

app.listen(port, () => {
  logger.info(`Server listening port ${port}`);
});
