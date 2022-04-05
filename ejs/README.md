# EJS Custom Activity

1. [Installation](#installation)
2. [Environment variables](#env-vars)
3. [Using CA as Decision Split](#using-ca-as-decision-split)
4. [AMPscript Processing](#ampscript-processing)
5. [Documentation](#documentation)

## Installation

First, install all dependencies by running the npm `npm i` command

Then, create the `.env` file in the root folder and add the env vars to it (copy vars from `.env-example` file)

Finally, run in development mode using `npm run dev` command

## Env Vars

### Required

- JWT - Must be filled if a system generated JWT is used. Use the key defined inside the installed package. !**NOTE**! It's not recommended to use system generated JWT as it cannot be rotated. Switch from system JWT to custom JWT on the go will break the already configured instances of the custom activity. Use the custom JWT instead.
- JWT_CUSTOMER_KEY - Must be filled if a [custom key](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/encode-custom-activities-using-jwt-customer-key.html) is used. Use an external key defined in Key Management.
- JWT_PSWD - Must be filled if a custom key is used.
- STACK - The number of the SFMC stack (e.g. 1, 10, 50, etc.).
- SFMC_SUBDOMAIN - Subdomain of any Base URI (Authentication, REST, SOAP) defined in the Web App API Integration component.
- CLIENT_ID - Client Id defined in the Web App API Integration component.
- CLIENT_SECRET - Client Secret defined in the Web App API Integration component.

### Optional

- DESCRIPTION - Title of your custom activity. Default is "EJS Custom Activity".
- CONCURRENT_REQUESTS - How many rest activities to run in parallel. Must be from 1 to 10. Default is 1, which means no concurrent requests.
- RETRY_COUNT - How many times to retry each rest activity in the journey after the rest activity times out. Must be from 0 to 5. Default is 5.
- RETRY_DELAY - How long, in milliseconds, to wait before each rest activity in the journey is retried. Must be from 0 milliseconds to 10,000 milliseconds. Default is 10,000 milliseconds.
- TIMEOUT - How long, in milliseconds, before each rest activity in the journey times out. Must be from 1,000 milliseconds to 100,000 milliseconds. Default is 100,000 milliseconds.
- UI_SETTING_DISPLAY - Set to OFF if you want to disable the above-mentioned settings on the UI level. Defaults to ON.
- IP_CHECK_DISABLED - Set to TRUE if you want to disable the IP check for application endpoints. Defaults to FALSE.
- AMPSCRIPT_PROCESSOR_URL - URL of the service responsible for AMPscript processing. Must be defined if AMPscript processing functionality is in use.
- AMPSCRIPT_PROCESSOR_USERNAME - Username to use for Basic Auth. Must be defined if AMPscript processing functionality is in use.
- AMPSCRIPT_PROCESSOR_PASSWORD - Password to use for Basic Auth. Must be defined if AMPscript processing functionality is in use.

## Using CA as Decision Split

You can provide multiple possible outcomes for your custom split activities in Journey Builder. First, define default outcomes in the activity's config.json. The activity's custom javascript then overrides these default outcomes programmatically, or based on user-supplied values.

---

**NOTE**

Use the **RestDecision** activity type when configuring multiple outcomes.

---

To define default outcomes, include an **outcomes** object in the activity's config.json.

- Each default outcome must contain an arguments object that contains a branchResult field. Journey Builder expects the custom activity's Execute REST call response to contain the { branchResult: value } object. The value matches the branchResult of one of the activity's outcomes.

- Give the custom activity a label in the UI. Include a label field in the outcome's metaData object. Journey Builder displays the text in this field when users hover over the branch entry point.

---

**NOTE**

If you don't define a label, it is loaded using the internationalization (i18n) strings from the config.json. For more information refer to [Official Documentation](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/internationalize-branch-labels.html).

---

### Sample

#### config-template.json

```json
"type": "RestDecision",
"outcomes": [
    {
        "arguments": {
            "branchResult": "buy_item",
            "some argument": "passed from config.json for buy_item"
        },
        "metaData": {
            "label": "Buy Item"
        }
    },
    {
        "arguments": {
            "branchResult": "sell_item",
            "some argument": "passed from config.json for sell_item"
        },
        "metaData": {
            "label": "Sell Item"
        }
    },
    {
        "arguments": {
            "branchResult": "hold_item",
            "some argument": "passed from config.json for hold_item"
        },
        "metaData": {
            "label": "Hold Item"
        }
    }
]
```

#### activity.js

```javascript
router.post('/execute', (req, res) => {
  /* Your Code Here */

  res.status(200).json({
    status: 'ok',
    branchResult: 'buy_item',
  });
});
```

---

## AMPscript Processing

In order to utilize the AMPscript processing functionalities you would need to perform the following steps:

1. Create the [JSON code resource](#json-code-resource) inside the Web Studio of your SFMC instance
2. Define the [AMPSCRIPT_PROCESSOR_URL, AMPSCRIPT_PROCESSOR_USERNAME and AMPSCRIPT_PROCESSOR_PASSWORD](#env-vars) env vars
3. Write [code in your application](#example-for-execute-route-in-activityjs) to process AMPscript and handle error messages

#### JSON code resource

```javascript
<script runat=server>
    Platform.Load("Core","1.1.1");

    function ampScript(code) {
        var ampBlock = '\%\%[' + code + ']\%\%';
        Platform.Function.TreatAsContent(ampBlock);
        return Variable.GetValue('@response');
    };

    var resObj;

    if (Request.Method == "POST") {
        var payloadStr = Platform.Request.GetPostData();
        var payloadObj = Platform.Function.ParseJSON(payloadStr);
        var authHeader = Platform.Request.GetRequestHeader("Authorization");

        var base64EncodedCreds = authHeader.split(" ")[1];
        var base64DecodedCreds = Base64Decode(base64EncodedCreds).split(":");
        var username = base64DecodedCreds[0];
        var password = base64DecodedCreds[1];

        if (username == "username" && password == "password") {
            try {
                var result = ampScript("set @response = " + payloadObj.code);

                resObj = {
                    status: "success",
                    message: result
                };
            } catch (err) {
                resObj = {
                    status: "error",
                    message: err
                };
            }
        } else {
            resObj = {
                status: "error",
                message: "wrong credentials"
            };
        }
    } else {
        resObj = {
            status: "error",
            message: "method not allowed"
        };
    }

    Write(Platform.Function.Stringify(resObj));
</script>
```

#### Example for execute route in activity.js

```javascript
const AMPscript = require('../utils/ampscript-processor');

router.post('/execute', async (req, res) => {
  /* Your Code Here */

  const messageProcessed = await AMPscript.replaceAMPscript(message);
  message = messageProcessed.resMsg;
  errMsg = messageProcessed.errMsg;

  if (errMsg) {
    errMsg += ` [UniqueTransactionID: ${uniqueTransactionId}]`;
    logger.error(errMsg);
    res.status(200).json({ status: 'error', errMsg });
    return;
  }

  /* Your Code Here */
});
```

---

## Documentation

- [Extend Journey Builder](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/getting-started.html)
- [Custom Activity Configuration](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/custom-activity-config.html)
- [Postmonger events](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/using-postmonger.html)
