const axios = require('axios');

const execute = async (code) =>
  axios({
    method: 'post',
    url: process.env.AMPSCRIPT_PROCESSOR_URL,
    headers: { 'Content-Type': 'application/json' },
    auth: {
      username: process.env.AMPSCRIPT_PROCESSOR_USERNAME,
      password: process.env.AMPSCRIPT_PROCESSOR_PASSWORD,
    },
    data: { code },
  });

const replaceAMPscript = async (str) => {
  let errMsg = '';

  if (
    process.env.AMPSCRIPT_PROCESSOR_URL &&
    process.env.AMPSCRIPT_PROCESSOR_USERNAME &&
    process.env.AMPSCRIPT_PROCESSOR_PASSWORD
  ) {
    const scriptsArr = [...str.matchAll(/\[[^\]]+]/g)];

    if (scriptsArr.length > 0) {
      try {
        for (scripts of scriptsArr) {
          for (script of scripts) {
            const code = script.substring(script.indexOf('[') + 1, script.indexOf(']'));
            const result = await execute(code);
            if (result.data.status == 'success') {
              str = str.replace(script, result.data.message);
            } else {
              errMsg = `${JSON.stringify(result.data.message)} [Script: ${code}]`;
            }
          }
        }
      } catch (scriptErr) {
        errMsg = `AMPscript processing failed for ${JSON.stringify(scriptsArr)}`;
      }
    }
  } else {
    errMsg = 'Environment variables not set up for AMPscript processing';
  }

  return { resMsg: str, errMsg };
};

module.exports = { replaceAMPscript };
