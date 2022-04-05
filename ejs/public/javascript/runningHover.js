const connection = new Postmonger.Session();

// Function for fetch requests
const makeRequest = async (endpoint, pyld = {}, qrprms = '') => {
  let body;

  try {
    const access_token = document.querySelector('#access_token').value;

    const response = await fetch(`/client-requests/${endpoint}${qrprms}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ access_token, ...pyld }),
    });

    body = await response.json();
  } catch (err) {
    console.error(err);
  }

  return body;
};

$(window).ready(() => connection.trigger('ready'));

connection.on('initActivityRunningHover', (data) => {
  document.querySelector('#activityId').innerText = data.id;
  document.querySelector('#activityKey').innerText = data.key;
  document.querySelector('#outArguments').innerText = `{{Interaction.${data.key}.ARGNAME}}`;
});
