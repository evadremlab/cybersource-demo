/**
 * CyberSource Payment Provider.
 */
const _ = require('lodash');
const path = require('path');
const axios = require('axios');
const jwt = require('jsonwebtoken');
var jwkToPem = require('jwk-to-pem');
const RestClient = require('cybersource-rest-client');
const cyberSourceConfig = require(path.resolve('config/cybersource-config.js'));

// static parameter values
const CURRENCY = 'USD';
const TIME_ZONE = 'America/Los_Angeles'; // for transaction search
const COMMERCE_INDICATOR = 'internet'; // default value for sale or auth order placed from a website

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
    const instance = new RestClient.MicroformIntegrationApi(cyberSourceConfig, new RestClient.ApiClient());

    instance.generateCaptureContext({
      clientVersion: 'v2.0',
      targetOrigins: ['http://localhost:3000'],
      allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER']
    }, (err, data, response) => {
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
 * Formulate request data for Sale or Auth Transaction.
 */
function getSaleOrAuthTransactionRequestData(options) {
  return {
    paymentInformation: {
      paymentInstrument: {
        id: options.token
      }
    },
    orderInformation: {
      amountDetails: {
        currency: CURRENCY,
        totalAmount: options.amount
      }
    },
    processingInformation: {
      capture: options?.isHoldAuthorization ? false : true,
      commerceIndicator: COMMERCE_INDICATOR
    },
    clientReferenceInformation: {
      code: options.order_id
    }
  };
}

/**
 * Create customer and a payment method at the same time.
 */
async function createCustomer(options) {
  const methodID = 'createCustomer';

  return new Promise(async (resolve, reject) => {
    let isValidTransientToken = true;

    try {
      await validateTokenIntegrity(options.transientTokenJwt);
    } catch (err) {
      isValidTransientToken = false;
    }
  
    if (isValidTransientToken) {
      const instance = new RestClient.PaymentsApi(cyberSourceConfig, new RestClient.ApiClient());
    
      instance.createPayment({
        tokenInformation: {
          transientTokenJwt: options.transientTokenJwt,
          paymentInstrument: {
            default: true // must be true for customers first payment method
          }
        },
        orderInformation: {
          billTo: options.billTo,
          amountDetails: {
            currency: CURRENCY,
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
          commerceIndicator: COMMERCE_INDICATOR
        },
        clientReferenceInformation: {
          code: options.order_id
        }
      }, (err, data, response) => {
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

  return new Promise(async (resolve, reject) => {
    let isValidTransientToken = true;

    try {
      await validateTokenIntegrity(options.transientTokenJwt);
    } catch (err) {
      isValidTransientToken = false;
    }
  
    if (isValidTransientToken) {
      try {
        const instance = new RestClient.PaymentsApi(cyberSourceConfig, new RestClient.ApiClient());
    
        instance.createPayment({
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
            // billTo: options.billTo,
            amountDetails: {
              currency: CURRENCY,
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
            commerceIndicator: COMMERCE_INDICATOR
          },
          clientReferenceInformation: {
            code: options.order_id
          }
        }, (err, data, response) => {
          if (err) {
            console.log(`\n *** ${methodID} Error ***\n`, JSON.stringify(err));
            reject(err);
          } else if (data) {
            console.log(`\n *** ${methodID} Data ***\n`, JSON.stringify(data));
            resolve(data);
          }
        });
      } catch (err) {
        reject(err);
      }     
    } else {
      reject('invalid transient token');
    }
  });
}

/**
 * Get existing payment method details.
 * Used to get card type and expiration date for payment method creation.
 */
async function getPaymentMethodDetails(token) {
  const methodID = 'getPaymentMethodDetails';

  return new Promise((resolve, reject) => {
    try {
      var opts = [];
      const instance = new RestClient.PaymentInstrumentApi(cyberSourceConfig, new RestClient.ApiClient());

      instance.getPaymentInstrument(token, opts, function (err, data, response) {
        if (err) {
          console.log(`\n *** ${methodID} Error ***\n`, JSON.stringify(err));
          reject(err);
        } else if (data) {
          console.log(`\n *** ${methodID} Data ***\n`, JSON.stringify(data));
          resolve(data);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Delete existing payment method.
 * NOTE: cannot delete a customers default payment method.
 */
async function deletePaymentMethod(token) {
  const methodID = 'deletePaymentMethod';

  return new Promise((resolve, reject) => {
    try {
      var opts = [];
      const instance = new RestClient.PaymentsApi(cyberSourceConfig, new RestClient.ApiClient());
  
      instance.deletePaymentInstrument(token, opts, function (err, data, response) {
        if (err) {
          console.log(`\n *** ${methodID} Error ***\n`, JSON.stringify(err));
          reject(err);
        } else if (data) {
          console.log(`\n *** ${methodID} Data ***\n`, JSON.stringify(data));
          resolve(data);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Update existing payment method to make it default,
 * so we can delete the current default payment method.
 */
async function updatePaymentMethod(customerId, token) {
  const methodID = 'updatePaymentMethod';

  return new Promise((resolve, reject) => {
    try {
      var opts = [];
      const instance = new RestClient.PaymentsApi(cyberSourceConfig, new RestClient.ApiClient());
  
      instance.patchPaymentInstrument(token, {
        default: true
      }, opts, function (err, data, response) {
        if (err) {
          console.log(`\n *** ${methodID} Error ***\n`, JSON.stringify(err));
          reject(err);
        } else if (data) {
          console.log(`\n *** ${methodID} Data ***\n`, JSON.stringify(data));
          resolve(data);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Sale transaction.
 */
async function saleTransaction(options) {
  const methodID = 'saleTransaction';

  return new Promise((resolve, reject) => {
    try {
      const instance = new RestClient.PaymentsApi(cyberSourceConfig, new RestClient.ApiClient());
  
      const requestData = getSaleOrAuthTransactionRequestData(Object.assign({
        isHoldAuthorization: false
      }, options));

      instance.createPayment(requestData, (err, data, response) => {
        if (err) {
          console.log(`\n *** ${methodID} Error ***\n`, JSON.stringify(err));
          reject(err);
        } else if (data) {
          console.log(`\n *** ${methodID} Data ***\n`, JSON.stringify(data));
          resolve(data);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Hold authorization.
 */
async function holdAuthorization(options) {
  const methodID = 'holdAuthorization';

  return new Promise((resolve, reject) => {
    try {
      const instance = new RestClient.PaymentsApi(cyberSourceConfig, new RestClient.ApiClient());
  
      const requestData = getSaleOrAuthTransactionRequestData(Object.assign({
        isHoldAuthorization: true
      }, options));

      instance.createPayment(requestData, (err, data, response) => {
        if (err) {
          console.log(`\n *** ${methodID} Error ***\n`, JSON.stringify(err));
          reject(err);
        } else if (data) {
          console.log(`\n *** ${methodID} Data ***\n`, JSON.stringify(data));
          resolve(data);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Refund transaction.
 */
async function refundTransaction(options) {
  const methodID = 'refundTransaction';

  return new Promise((resolve, reject) => {
    try {
      const instance = new RestClient.RefundApi(cyberSourceConfig, new RestClient.ApiClient());

      instance.refundPayment({
        clientReferenceInformation: {
          code: options.order_id
        },
        orderInformation: {
          amountDetails: {
            currency: CURRENCY,
            totalAmount: options.amount
          }
        }
      }, options.transaction_id, (err, data, response) => {
        if (err) {
          console.log(`\n *** ${methodID} Error ***\n`, JSON.stringify(err));
          reject(err);
        } else if (data) {
          console.log(`\n *** ${methodID} Data ***\n`, JSON.stringify(data));
          resolve(data);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Void transaction.
 */
async function voidTransaction(options) {
  const methodID = 'voidTransaction';

  return new Promise((resolve, reject) => {
    try {
      const instance = new RestClient.VoidApi(cyberSourceConfig, new RestClient.ApiClient());

      instance.voidCapture({
        clientReferenceInformation: {
          code: options.order_id
        }
      }, options.transaction_id, function (err, data, response) {
        if (err) {
          console.log(`\n *** ${methodID} Error ***\n`, JSON.stringify(err));
          reject(err);
        } else if (data) {
          console.log(`\n *** ${methodID} Data ***\n`, JSON.stringify(data));
          resolve(data);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Used for settlement process.
 */
async function transactionSearch() {
  const methodID = 'transactionSearch';

  return new Promise((resolve, reject) => {
    try {
      const instance = new RestClient.SearchTransactionsApi(cyberSourceConfig, new RestClient.ApiClient());

      instance.createSearch({
        save: false,
        name: 'test',
        timezone: TIME_ZONE,
        searchType: 'pendingSettlement', // Settlements Pending Batch
        // searchType: 'settle', // Authorizations Ready To Settle
        query: 'submitTimeUtc:[NOW/DAY-1DAYS TO NOW/DAY+1DAY}',
        offset: 0,
        limit: 2000,
        sort: 'submitTimeUtc:asc'
      }, (err, data, response) => {
        if (err) {
          console.log(`\n *** ${methodID} Error ***\n`, JSON.stringify(err));
          reject(err);
        } else if (data) {
          console.log(`\n *** ${methodID} Data ***\n`, JSON.stringify(data));
          let result = {
            count: data.count,
            totalCount: data.totalCount,
            offset: data.offset,
            limit: data.limit,
            transactionIds: []
          };
          _.each(data?._embedded?.transactionSummaries, txn => {
            _.each(txn?.applicationInformation?.applications, x => {
              if (x.name === 'ics_bill' && x.reasonCode === '100') { // settled
                result.transactionIds.push(txn.id);
              }
            });
          });
          resolve(result);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

async function getTransactionDetails(options) {
  const methodID = 'getTransactionDetails';

  return new Promise((resolve, reject) => {
    try {
      const instance = new RestClient.TransactionDetailsApi(cyberSourceConfig, new RestClient.ApiClient());

      instance.getTransaction(options.transaction_id, (err, data, response) => {
        if (err) {
          console.log(`\n *** ${methodID} Error ***\n`, JSON.stringify(err));
          reject(err);
        } else if (data) {
          console.log(`\n *** ${methodID} Data ***\n`, JSON.stringify(data));
          resolve(data);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generateCaptureContext,
  validateCaptureContext: validateTokenIntegrity,
  validateTransientToken: validateTokenIntegrity,
  createCustomer,
  addPaymentMethod,
  getPaymentMethodDetails,
  deletePaymentMethod,
  updatePaymentMethod,
  saleTransaction,
  voidTransaction,
  refundTransaction,
  holdAuthorization,
  transactionSearch,
  getTransactionDetails,
  // exposed for testing
  decodeJWT
}
