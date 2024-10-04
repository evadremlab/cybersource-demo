/**
 * CyberSource Payment Provider.
 */
const path = require('path');
const axios = require('axios');
const jwt = require('jsonwebtoken');
var jwkToPem = require('jwk-to-pem');
const cyberSourceConfig = require(path.resolve('config/CyberSource.js'));

const {
  ApiClient,
  PaymentsApi,
  MicroformIntegrationApi,
  CreatePaymentRequest,
  GenerateCaptureContextRequest
} = require('cybersource-rest-client');

/**
 * Decode JWT into header and payload.
 * We need the header.kid to validate the token integrity (below).
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
        jwt.verify(token, pem, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
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
 * Generate capture context required to render drop-in UI and tokenize the data.
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
 * Create customer and their default payment method.
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
        default: true // this will be their default payment method
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
      actionTokenTypes: [ // create both of these at the same time using transient token
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
  let isValidTransientToken = false;

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
        default: false // assumes that customer already created with default payment method
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
  createCustomer,
  addPaymentMethod,
  // exposed for testing
  decodeJWT,
  validateCaptureContext: validateTokenIntegrity,
  validateTransientToken: validateTokenIntegrity
}
