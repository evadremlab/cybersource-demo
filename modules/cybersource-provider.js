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
  CaptureApi,
  VoidApi,
  PaymentInstrumentApi,
  MicroformIntegrationApi,
  SearchTransactionsApi,
  UnifiedCheckoutCaptureContextApi,
  CreatePaymentRequest,
  CreateSearchRequest,
  PatchPaymentInstrumentRequest,
  CapturePaymentRequest,
  VoidCaptureRequest,
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
  return new Promise((resolve, reject) => {
    const methodID = 'generateCaptureContext';
  
    const apiClient = new ApiClient();
    const instance = new MicroformIntegrationApi(cyberSourceConfig, apiClient);
  
    const requestData = GenerateCaptureContextRequest.constructFromObject({
      clientVersion: 'v2.0',
      targetOrigins: ['http://localhost:3000'],
      allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER']
    });

    instance.generateCaptureContext(requestData, (err, data, response) => {
      if (err) {
        console.log(`\n *** ${methodID} Error ***\n`, JSON.stringify(err));
        reject(err);
      } else if (data) {
        console.log(`\n *** ${methodID} Data ***\n`, JSON.stringify(data));
        resolve(data);
      }
    });
  });
}

/**
 * Generate capture context required to render unified checkout UI and tokenize the data (NOT WORKING).
 */
async function generateUnifiedCheckoutCaptureContext() {
  return new Promise((resolve, reject) => {
    const methodID = 'generateUnifiedCheckoutCaptureContext';

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
      if (err) {
        console.log(`\n *** ${methodID} Error ***\n`, JSON.stringify(err));
        reject(err);
      } else if (data) {
        console.log(`\n *** ${methodID} Data ***\n`, JSON.stringify(data));
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
        default: true // must be true for customers first payment method
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
        if (err) {
          console.log(`\n *** ${methodID} Error ***\n`, JSON.stringify(err));
          reject(err);
        } else if (data) {
          console.log(`\n *** ${methodID} Data ***\n`, JSON.stringify(data));
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
        if (err) {
          console.log(`\n *** ${methodID} Error ***\n`, JSON.stringify(err));
          reject(err);
        } else if (data) {
          console.log(`\n *** ${methodID} Data ***\n`, JSON.stringify(data));
          resolve(data);
        }
      });
    } else {
      reject('invalid transient token');
    }
  });
}

/**
 * Get existing payment method details.
 */
async function getPaymentMethodDetails(token) {
  const methodID = 'getPaymentMethodDetails';

  console.log(`\n *** ${methodID} Request ***\n`, token);

  return new Promise((resolve, reject) => {
    var opts = [];
    const apiClient = new ApiClient();
    const instance = new PaymentInstrumentApi(cyberSourceConfig, apiClient);

    instance.getPaymentInstrument(token, opts, function (err, data, response) {
      if (err) {
        console.log(`\n *** ${methodID} Error ***\n`, JSON.stringify(err));
        reject(err);
      } else if (data) {
        console.log(`\n *** ${methodID} Data ***\n`, JSON.stringify(data));
        resolve(data);
      }
    });
  });
}

/**
 * Delete existing payment method.
 */
async function deletePaymentMethod(token) {
  const methodID = 'deletePaymentMethod';

  console.log(`\n *** ${methodID} Request ***\n`, token);

  return new Promise((resolve, reject) => {
    var opts = [];
    const apiClient = new ApiClient();
    const instance = new PaymentsApi(cyberSourceConfig, apiClient);

    instance.deletePaymentInstrument(token, opts, function (err, data, response) {
      if (err) {
        console.log(`\n *** ${methodID} Error ***\n`, JSON.stringify(err));
        reject(err);
      } else if (data) {
        console.log(`\n *** ${methodID} Data ***\n`, JSON.stringify(data));
        resolve(data);
      }
    });
  });
}

/**
 * Update existing payment method to make it default,
 * so we can delete the current default payment method.
 */
async function updatePaymentMethod(customerId, token) {
  const methodID = 'updatePaymentMethod';

  console.log(`\n *** ${methodID} Request ***\n`, token);

  return new Promise((resolve, reject) => {
    var opts = [];
    const apiClient = new ApiClient();
    const instance = new PaymentsApi(cyberSourceConfig, apiClient);
    var requestData = PatchPaymentInstrumentRequest.constructFromObject({
      default: true
    });

    instance.patchPaymentInstrument(token, requestData, opts, function (err, data, response) {
      if (err) {
        console.log(`\n *** ${methodID} Error ***\n`, JSON.stringify(err));
        reject(err);
      } else if (data) {
        console.log(`\n *** ${methodID} Data ***\n`, JSON.stringify(data));
        resolve(data);
      }
    });
  });
}

/**
 * Sale transaction.
 */
async function saleTransaction(options) {
  const methodID = 'saleTransaction';

  const requestData = CreatePaymentRequest.constructFromObject({
    paymentInformation: {
      paymentInstrument: {
        id: options.token
      }
    },
    orderInformation: {
      amountDetails: {
        currency: 'USD',
        totalAmount: options.amount
      }
    },
    processingInformation: {
      capture: true, // auth and submit for settlement
      commerceIndicator: 'internet' // Default value for authorizations and E-commerce orders placed from a website.
    },
    clientReferenceInformation: {
      code: options.order_id
    }
  });

  console.log(`\n *** ${methodID} Request ***\n`, JSON.stringify(requestData));

  return new Promise((resolve, reject) => {
    const apiClient = new ApiClient();
    const instance = new PaymentsApi(cyberSourceConfig, apiClient);
  
    instance.createPayment(requestData, (err, data, response) => {
      if (err) {
        console.log(`\n *** ${methodID} Error ***\n`, JSON.stringify(err));
        reject(err);
      } else if (data) {
        console.log(`\n *** ${methodID} Data ***\n`, JSON.stringify(data));
        resolve(data);
      }
    });
  });
}

/**
 * Void transaction.
 */
async function voidTransaction(options) {
  const methodID = 'voidTransaction';

  const requestData = VoidCaptureRequest.constructFromObject({
    clientReferenceInformation: {
      code: options.order_id
    }
  });

  console.log(`\n *** ${methodID} Request ***\n`, JSON.stringify(requestData));

  return new Promise((resolve, reject) => {
    const apiClient = new ApiClient();
    const instance = new VoidApi(cyberSourceConfig, apiClient);
  
    instance.voidCapture(requestData, options.transaction_id, function (err, data, response) {
      if (err) {
        console.log(`\n *** ${methodID} Error ***\n`, JSON.stringify(err));
        reject(err);
      } else if (data) {
        console.log(`\n *** ${methodID} Data ***\n`, JSON.stringify(data));
        resolve(data);
      }
    });
  });
}

/**
 * Hold authorization.
 */
async function holdAuthorization(options) {
  const methodID = 'holdAuthorization';

  const requestData = CreatePaymentRequest.constructFromObject({
    paymentInformation: {
      paymentInstrument: {
        id: options.token
      }
    },
    orderInformation: {
      amountDetails: {
        currency: 'USD',
        totalAmount: options.amount
      }
    },
    processingInformation: {
      capture: false, // auth only
      commerceIndicator: 'internet' // Default value for authorizations and E-commerce orders placed from a website.
    },
    clientReferenceInformation: {
      code: options.order_id
    }
  });

  console.log(`\n *** ${methodID} Request ***\n`, JSON.stringify(requestData));

  return new Promise((resolve, reject) => {
    const apiClient = new ApiClient();
    const instance = new PaymentsApi(cyberSourceConfig, apiClient);
  
    instance.createPayment(requestData, (err, data, response) => {
      if (err) {
        console.log(`\n *** ${methodID} Error ***\n`, JSON.stringify(err));
        reject(err);
      } else if (data) {
        console.log(`\n *** ${methodID} Data ***\n`, JSON.stringify(data));
        resolve(data);
      }
    });
  });
}

/**
 * Used for settlement process.
 */
async function transactionSearch() {
  const methodID = 'transactionSearch';
  
  // Authorizations Ready To Settle
  // https://ebc2test.cybersource.com/payment/v1/payments/search?q=authsReadyToSettle%3DY%26transactionDate%3E%3D1727897596210%26transactionDate%3C%3D1728502396211&searchType=settle&orgId=transsightdev_1718140723

  // Settlements Pending Batch
  // https://ebc2test.cybersource.com/payment/v1/payments/search?q=pendingSettlement%3DY%26transactionDate%3E%3D1728329671994%26transactionDate%3C%3D1728502471994&searchType=pendingSettlement&orgId=transsightdev_1718140723
  
  const requestData = CreateSearchRequest.constructFromObject({
    save: false,
    name: 'test',
    timezone: 'America/Los_Angeles',
    searchType: 'pendingSettlement', // Settlements Pending Batch
    // searchType: 'settle', // Authorizations Ready To Settle
    query: 'submitTimeUtc:[NOW/DAY-1DAYS TO NOW/DAY+1DAY}',
    offset: 0,
    limit: 2600,
    sort: 'submitTimeUtc:asc'
  });

  console.log(`\n *** ${methodID} Request ***\n`, JSON.stringify(requestData));

  return new Promise((resolve, reject) => {
    const apiClient = new ApiClient();
    const instance = new SearchTransactionsApi(cyberSourceConfig, apiClient);
  
    instance.createSearch(requestData, (err, data, response) => {
      if (err) {
        console.log(`\n *** ${methodID} Error ***\n`, JSON.stringify(err));
        reject(err);
      } else if (data) {
        console.log(`\n *** ${methodID} Data ***\n`, JSON.stringify(data));
        resolve(data);
      }
    });
  });
}

module.exports = {
  generateCaptureContext,
  // generateUnifiedCheckoutCaptureContext,
  createCustomer,
  addPaymentMethod,
  saleTransaction,
  voidTransaction,
  holdAuthorization,
  transactionSearch,
  getPaymentMethodDetails,
  deletePaymentMethod,
  updatePaymentMethod,
  // exposed for testing
  decodeJWT,
  validateCaptureContext: validateTokenIntegrity,
  validateTransientToken: validateTokenIntegrity
}
