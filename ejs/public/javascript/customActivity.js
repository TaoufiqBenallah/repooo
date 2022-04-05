const connection = new Postmonger.Session();

let payload;
let $form;
let journeyName;
let journeyVersionNumber;
let schemaMap = [];

// data coming from DE
var campaignOffersTypes;
var campaignProductsTypes;

var businessUnit;
var businessUnitId;

// options for others fields
var campaignCommunicationsTypes = {
  data: [
    {
      values: { value: "Outbound" } 
    }, 
    {
      values: { value: "Inbound" } 
    }
  ]
};

var groupCampaign = { data: [
  {
    values: { value: "False" } 
  }, 
  {
    values: { value: "True" } 
  }
]};

var groupControl = { data: [
  {
    values: { value: "False" } 
  }, 
  {
    values: { value: "True" } 
  }
]};

const buttonSettings = {
  button: 'next',
  text: 'done',
  visible: true,
  enabled: false,
};


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

/*
// Validator function
const validateForm = function (cb) {
  $form = $('.js-settings-form');

  $form.validate({
    submitHandler: function (form) {},
    errorPlacement: function () {},
  });

  cb($form);
};
*/

// This logic runs while UI is open
$(window).ready(() => {
  connection.trigger('ready');
});

// This logic runs when user opens the UI
connection.on('initActivity', async (data) => {
  // The requestInteraction event provides useful information about the Journey
  manageBody("HIDE");
  manageDropDownSearchBox();

  //let test = await makeRequest("test");
  // console.log(test);

  campaignOffersTypes = await makeRequest("campaign-offer-data");
  campaignProductsTypes = await makeRequest("campaign-product-type");

  businessUnit = await makeRequest("business-unit");
  businessUnitId = businessUnit.buId;

  var campaignOffersTypesDropdown = document.getElementById("types-of-offers")
  var campaignProductsTypesDropdown = document.getElementById("types-of-products")

  if(campaignOffersTypesDropdown) mapDropdownValues(campaignOffersTypesDropdown, campaignOffersTypes)
  if(campaignProductsTypesDropdown) mapDropdownValues(campaignProductsTypesDropdown, campaignProductsTypes)
  mapDropdownValues(document.getElementById("group-campaign"), groupCampaign);
  mapDropdownValues(document.getElementById("communication-type"), campaignCommunicationsTypes);
  mapDropdownValues(document.getElementById("control-group"), groupControl);

  manageBody("SHOW");

  connection.trigger('requestInteraction');
  connection.on('requestedInteraction', (settings) => {
    if (settings) {
      journeyName = settings.name;
      journeyVersionNumber = settings.version;
    }
  });

  // The requestSchema event provides useful information about the Entry Source fields
  connection.trigger('requestSchema');
  connection.on('requestedSchema', (reqSchema) => {
    // Retrieve the Entry Source fields and display them on the UI in form of AMPscript-like personalization strings
    let persAttrs = '';

    reqSchema.schema.forEach((d) => {
      if (d && d.name && d.key) {
        persAttrs += `%%${d.name}%%<br>`;
        schemaMap.push({ key: d.key, name: d.name });
      }
    });

  });

  payload = data ? data : {};

  // Iterate over the inArguments and display them on UI
  const hasInArguments = Boolean(
    payload.arguments &&
      payload.arguments.execute &&
      payload.arguments.execute.inArguments &&
      payload.arguments.execute.inArguments.length > 0
  );

  const inArguments = hasInArguments ? payload.arguments.execute.inArguments : {};
  
  // iterate over inArguments & display already selected values in the UI
  if(hasInArguments) mapValuesinUI(inArguments[0]);

 // Iterate over activity settings and display them on UI
  const args = payload.arguments.execute;

  // Iterate over outArguments and display them on UI
  const hasOutArguments = Boolean(
    payload.arguments &&
      payload.arguments.execute &&
      payload.arguments.execute.outArguments &&
      payload.arguments.execute.outArguments.length > 0
  );

  const outArguments = hasOutArguments ? payload.arguments.execute.outArguments : {};

  let outArgsStr = '';

  outArguments.forEach((outArgument) => {
    Object.keys(outArgument).forEach((o) => {
      outArgsStr += `{{Interaction.${payload.key}.${o}}}<br>`;
    });
  });

  // document.querySelector('#outArgsSpan').innerHTML = outArgsStr;

  /*validateForm(function ($form) {
    buttonSettings.enabled = $form.valid();
    connection.trigger('updateButton', buttonSettings);
  });*/
});

// This logic runs when user clicks the Done button
connection.on('clickedNext', () => {
  
  if (getFormValues().isValid) {

    payload.metaData.isConfigured = true;

    payload.arguments.execute.inArguments = [
      {
        journeyName,
        journeyVersionNumber,
        campaignId: getFormValues().payload.cmpId,
        campaignName: getFormValues().payload.cmpName,
        campaignControlGroup: getFormValues().payload.cmpControlGroup,
        campaignOffersType: getFormValues().payload.cmpTypeOffer,
        campaignProductsType: getFormValues().payload.cmpProductType,
        campaignCommunicationsType: getFormValues().payload.cmpCommunictionType,
        campaignGroup: getFormValues().payload.cmpGroupCmp,
        activityId: "{{Activity.Id}}",
        contactKey: "{{Contact.Key}}",
        buId: businessUnitId
      },
    ];

    connection.trigger('updateActivity', payload);
  }

});
