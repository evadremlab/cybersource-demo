/**
 * CyberSource Payment Provider.
 */
const path = require('path');
const axios = require('axios');
const jwt = require('jsonwebtoken');
var jwkToPem = require('jwk-to-pem');
const cyberSourceConfig = require(path.resolve('config/cybersource-config.js'));

const {
  ApiClient,
  PaymentsApi,
  MicroformIntegrationApi,
  UnifiedCheckoutCaptureContextApi,
  CreatePaymentRequest,
  GenerateCaptureContextRequest,
  GenerateUnifiedCheckoutCaptureContextRequest
} = require('cybersource-rest-client');

/**
 * Decode JWT into header and payload.
 * We need the header.kid to validate token integrity (below).
 */
function decodeJWT(token) {
  const parts = token.split('.');
  const _decode = (value) => {
    return JSON.parse(Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64', 'ascii'));
  };
  return {
    header: _decode(parts[0]),
    payload: _decode(parts[1])
  }
}

/**
 * Validate integrity of a capture context or transient token using the public key embedded within 
 * the capture context to verify that Cybersource issued the token and that no data tampering occurred 
 * during transit.
 */
async function validateTokenIntegrity(token) {
  return new Promise((resolve, reject) => {
    try {
      const decodedToken = decodeJWT(token);
      axios.get(`https://${cyberSourceConfig.runEnvironment}/flex/v2/public-keys/${decodedToken.header.kid}`).then(response => {
        const pem = jwkToPem(response.data);
        jwt.verify(token, pem, (err, decoded) => {
          if (err) {
            reject(err);
          } else {
            resolve(decoded);
          }
        });
      }).catch(err => { // getting jwk
        reject(err);
      });
    } catch (err) { // decoding token
      reject(err);
    }
  });
}

/**
 * Generate capture context required to render microform UI and tokenize the data.
 */
async function generateCaptureContext() {
  const methodID = 'generateCaptureContext';

  return new Promise((resolve, reject) => {
    const apiClient = new ApiClient();
    const instance = new MicroformIntegrationApi(cyberSourceConfig, apiClient);
  
    const requestData = GenerateCaptureContextRequest.constructFromObject({
      clientVersion: 'v2.0',
      targetOrigins: ['http://localhost:3000'],
      allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER']
    });

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
 * Generate capture context required to render unified checkout UI and tokenize the data (NOT WORKING).
 */
async function generateUnifiedCheckoutCaptureContext() {
  const methodID = 'generateUnifiedCheckoutCaptureContext';

  return new Promise((resolve, reject) => {
    const apiClient = new ApiClient();
    const instance = new UnifiedCheckoutCaptureContextApi(cyberSourceConfig, apiClient);

    // https://developer.cybersource.com/docs/cybs/en-us/digital-accept-flex/developer/all/rest/digital-accept-flex/uc-intro/uc-getting-started-ss-setup.html
    const requestData = GenerateUnifiedCheckoutCaptureContextRequest.constructFromObject({
      "targetOrigins" : [ "http://localhost:3000" ], // must be https
      // when trying https, I get this error:
      // "Profile for merchant not found or profile is still in draft state
      "clientVersion" : "0.19",
      "allowedCardNetworks" : [ "VISA", "MASTERCARD", "AMEX" ],
      "allowedPaymentTypes" : [ "PANENTRY", "SRC" ],
      "country" : "US",
      "locale" : "en_US",
      "captureMandate" : {
        "billingType" : "PARTIAL",
        "requestEmail" : false,
        "requestPhone" : false,
        "requestShipping" : false,
        "shipToCountries" : [ "US" ],
        "showAcceptedNetworkIcons" : true
      },
      "orderInformation" : {
        "amountDetails" : {
          "currency" : "USD",
          "totalAmount": 123.45
        }
      }
    });

    instance.generateUnifiedCheckoutCaptureContext(requestData, (err, data, response) => {
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
 * Create customer and a payment method at the same time.
 */
async function createCustomer(options) {
  const methodID = 'createCustomer';
  let isValidTransientToken = true;

  try {
    await validateTokenIntegrity(options.transientTokenJwt);
  } catch (err) {
    isValidTransientToken = false;
  }

  const requestData = CreatePaymentRequest.constructFromObject({
    tokenInformation: {
      transientTokenJwt: options.transientTokenJwt,
      paymentInstrument: {
        default: false // not used because we can't delete it without adding another default
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
        'TOKEN_CREATE' // create the following token types
      ],
      actionTokenTypes: [
        'customer',
        'paymentInstrument'
      ],
      capture: false, // auth only
      commerceIndicator: 'internet' // Default value for authorizations and E-commerce orders placed from a website
    },
    clientReferenceInformation: {
      code: options.order_id
    }
  });

  console.log(`\n *** ${methodID} Request ***\n`, JSON.stringify(requestData));

  return new Promise((resolve, reject) => {
    if (isValidTransientToken) {
      const apiClient = new ApiClient();
      const instance = new PaymentsApi(cyberSourceConfig, apiClient);
    
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
    } else {
      reject('invalid transient token');
    }
  });
}

/**
 * Add payment method to an existing customer.
 */
async function addPaymentMethod(options) {
  const methodID = 'addPaymentMethod';
  let isValidTransientToken = true;

  try {
    await validateTokenIntegrity(options.transientTokenJwt);
  } catch (err) {
    isValidTransientToken = false;
  }

  const requestData = CreatePaymentRequest.constructFromObject({
    paymentInformation: {
      customer: {
        id: options.customerTokenId
      }
    },
    tokenInformation: {
      transientTokenJwt: options.transientTokenJwt,
      paymentInstrument: {
        default: false // not used because we can't delete it without adding another default
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
      capture: false, // auth only
      commerceIndicator: 'internet' // Default value for authorizations and E-commerce orders placed from a website.
    },
    clientReferenceInformation: {
      code: options.order_id
    }
  });

  console.log(`\n *** ${methodID} Request ***\n`, JSON.stringify(requestData));

  return new Promise((resolve, reject) => {
    if (isValidTransientToken) {
      const apiClient = new ApiClient();
      const instance = new PaymentsApi(cyberSourceConfig, apiClient);
    
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
    } else {
      reject('invalid transient token');
    }
  });
}

module.exports = {
  generateCaptureContext,
  // generateUnifiedCheckoutCaptureContext,
  createCustomer,
  addPaymentMethod,
  // exposed for testing
  decodeJWT,
  validateCaptureContext: validateTokenIntegrity,
  validateTransientToken: validateTokenIntegrity
}
