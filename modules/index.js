const path = require('path');
const cyberSourceConfig = require(path.resolve('config/CyberSource.js'));
const { 
  ApiClient, 
  MicroformIntegrationApi, 
  GenerateCaptureContextRequest, 
  PaymentsApi, 
  CreatePaymentRequest 
} = require('cybersource-rest-client');

/**
 * Generate capture context required to render drop-in UI and tokenize the data.
 */
async function generateCaptureContext() {
  const methodID = 'generateCaptureContext';
  const apiClient = new ApiClient();
  const instance = new MicroformIntegrationApi(cyberSourceConfig, apiClient);
  
  const requestData = GenerateCaptureContextRequest.constructFromObject({
    clientVersion: 'v2.0',
    targetOrigins: ['http://localhost:3000'],
    allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER']
  });

  return new Promise((resolve, reject) => {
    instance.generateCaptureContext(requestData, (err, data, response) => {
      if (response) {
        console.log(`\n *** ${methodID} Response ***\n`, JSON.stringify(response));
      }
      if (err) {
        console.log(`\n *** ${methodID} Error ***\n`, JSON.stringify(err));
        reject(err);
      } else if (data) {
        console.log(`\n *** ${methodID} Response Data returned ***\n`, JSON.stringify(data));
        resolve(data);
      }
    });
  });
}

/**
 * Validate transient token before using it to create a payment method.
 */
function validateTransientToken() {
  // TBD
}

/**
 * Add payment method to an existing customer.
 */
async function addPaymentMethod(options) {
  const methodID = 'addPaymentMethod';
  const apiClient = new ApiClient();
  const instance = new PaymentsApi(cyberSourceConfig, apiClient);

  const requestData = CreatePaymentRequest.constructFromObject({
    paymentInformation: {
      customer: {
        id: options.customerTokenId
      }
    },
    tokenInformation: {
      transientTokenJwt: options.transientTokenJwt,
      paymentInstrument: {
        default: false
      }
    },
    orderInformation: {
      billTo: options.billTo,
      amountDetails: {
        currency: 'USD',
        totalAmount: '0' // zero dollar auth
      }
    },
    processingInformation: {
      actionList: [
        'TOKEN_CREATE' // create the following token type
      ],
      actionTokenTypes: [
        'paymentInstrument'
      ],
      capture: false // auth only
    },
    clientReferenceInformation: {
      code: options.order_id
    }
  });

  console.log(`\n *** ${methodID} Request ***\n`, JSON.stringify(requestData));

  return new Promise((resolve, reject) => {
    instance.createPayment(requestData, (err, data, response) => {
      if (response) {
        console.log(`\n *** ${methodID} Response ***\n`, JSON.stringify(response));
      }
      if (err) {
        console.log(`\n *** ${methodID} Error ***\n`, JSON.stringify(err));
        reject(err);
      } else if (data) {
        console.log(`\n *** ${methodID} Response Data returned ***\n`, JSON.stringify(data));
        resolve(data);
      }
    });
  });
}

module.exports = {
  generateCaptureContext,
  validateTransientToken,
  addPaymentMethod
}
