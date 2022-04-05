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

connection.on('initActivityRunningModal', (data) => {
  document.querySelector('#done').addEventListener('click', close);

  document.querySelector('#timeout').value = data.arguments.execute.timeout;
  document.querySelector('#retryCount').value = data.arguments.execute.retryCount;
  document.querySelector('#retryDelay').value = data.arguments.execute.retryDelay;
  document.querySelector('#concurrentRequests').value = data.arguments.execute.concurrentRequests;

  if (Object.keys(data.arguments.execute.inArguments[0]).length > 0) {
    const inArguments = data.arguments.execute.inArguments[0];
    for (const inArgument in inArguments) {
      const label = document.createElement('Label');
      label.setAttribute('for', inArgument);
      label.setAttribute('class', 'slds-form-element__label slds-p-top_medium');
      label.innerText = inArgument;

      const input = document.createElement('INPUT');
      input.setAttribute('type', 'text');
      input.setAttribute('class', 'slds-input');
      input.setAttribute('disabled', 'true');
      input.setAttribute('value', inArguments[inArgument]);

      document.getElementById('inArguments').appendChild(label);
      document.getElementById('inArguments').appendChild(input);
    }
  }

  const hasOutArguments = Boolean(
    data.arguments.execute.outArguments && data.arguments.execute.outArguments.length > 0
  );

  const outArguments = hasOutArguments ? data.arguments.execute.outArguments : [];

  let outArgsStr = '';

  outArguments.forEach((outArgument) => {
    Object.keys(outArgument).forEach((o) => {
      outArgsStr += `{{Interaction.${data.key}.${o}}}<br>`;
    });
  });

  document.querySelector('#outArgsSpan').innerHTML = outArgsStr;
});

function close() {
  connection.trigger('destroy');
}
