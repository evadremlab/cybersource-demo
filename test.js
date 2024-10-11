async function testGenerateCaptureContext() {
  try {
    const { generateCaptureContext } = require('./modules/cybersource-provider');
    const result = await generateCaptureContext();
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}

async function testCreateCustomer(transientTokenJwt) {
  try {
    const { createCustomer } = require('./modules/cybersource-provider');
    const result = await createCustomer({
      transientTokenJwt,
      order_id: 'new-customer-order_id',
      billTo: { // all are required
        email: 'cybersource_test_003@yopmail.com',
        firstName: 'David', // This name must be the same as the name on the card
        lastName: 'Balmer', // This name must be the same as the name on the card
        address1: '3355 Geary Blvd.', // billing street address as it appears on the credit card issuer’s records
        locality: 'San Francisco', // city
        country: 'US', // two character ISO code
        administrativeArea: 'CA', // state code
        postalCode: '94118' // zipcode
      }
    });
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}

async function testAddPaymentMethod(transientTokenJwt) {
  try {
    const { addPaymentMethod } = require('./modules/cybersource-provider');
    const result = await addPaymentMethod({
      customerTokenId: '23FE2439AD65BBCFE063AF598E0A66A9',
      transientTokenJwt,
      order_id: 'new-payment-method-order-id',
      billTo: { // all are required
        email: 'cybersource_test_003@yopmail.com',
        firstName: 'David', // This name must be the same as the name on the card
        lastName: 'Balmer', // This name must be the same as the name on the card
        address1: '3355 Geary Blvd.', // billing street address as it appears on the credit card issuer’s records
        locality: 'San Francisco', // city
        country: 'US', // two character ISO code
        administrativeArea: 'CA', // state code
        postalCode: '94118' // zipcode
      }
    });
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}

function testDecodeJWT(token) {
  try {
    const { decodeJWT } = require('./modules/cybersource-provider');
    console.log(decodeJWT(token));
  } catch (err) {
    console.error(err);
  }
}

async function testValidateCaptureContext(token) {
  try {
    const { validateCaptureContext } = require('./modules/cybersource-provider');
    const result = await validateCaptureContext(token);
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}

async function testValidateTransientToken(token) {
  try {
    const { validateTransientToken } = require('./modules/cybersource-provider');
    const result = await validateTransientToken(token);
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}

async function testGetPaymentMethodDetails(token) {
  try {
    const { getPaymentMethodDetails } = require('./modules/cybersource-provider');
    const result = await getPaymentMethodDetails(token);
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}

async function testSaleTransaction() {
  try {
    const { saleTransaction } = require('./modules/cybersource-provider');
    const result = await saleTransaction({
      token: '23FE0306218C3D37E063AF598E0A7E90',
      amount: '12.34',
      order_id: 'fake-order-id'
    });
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}


async function testHoldAuthorization() {
  try {
    const { holdAuthorization } = require('./modules/cybersource-provider');
    const result = await holdAuthorization({
      token: '23FE0306218C3D37E063AF598E0A7E90',
      amount: '123.45',
      order_id: 'fake-order-id'
    });
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}

async function testTransactionSearch() {
  try {
    const { transactionSearch } = require('./modules/cybersource-provider');
    const result = await transactionSearch();
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}

async function testVoidTransaction() {
  try {
    const { voidTransaction } = require('./modules/cybersource-provider');
    const result = await voidTransaction({
      // transaction_id: '7285185282636879803954',
      transaction_id: '72850307481369217039555',
      order_id: 'fake-order-id'
    });
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}

async function testRefundTransaction() {
  try {
    const { refundTransaction } = require('./modules/cybersource-provider');
    const result = await refundTransaction({
      transaction_id: '7284319487056266203955',
      order_id: 'fake-refund-order-id',
      amount: '123.45'
    });
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}

async function getTransactionDetails(transactionId) {
  try {
    const { getTransactionDetails } = require('./modules/cybersource-provider');
    const result = await getTransactionDetails({
      transaction_id: '7286681477456003604953'
    });
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}

// let captureContext = 'eyJraWQiOiJ6dSIsImFsZyI6IlJTMjU2In0.eyJmbHgiOnsicGF0aCI6Ii9mbGV4L3YyL3Rva2VucyIsImRhdGEiOiJzME1JbzJLRFpObFV4YXlhek1FN3d4QUFFRk1SaHV5V2t6MkQ2a2xNdlVoUjhUTVNqTEZqbFdVMG1YVkkvRUZtMVNTc1QvZXBwbHN6aU9EYjNFYkdHTXZhdm1xdXl1SzFiZTFGMkErbFhNNjlUaGIyNnZyZVJZaGJuK01HODBGQnpMSTBrUjFraFI2NVAvUCthd09pWXFmWDZBXHUwMDNkXHUwMDNkIiwib3JpZ2luIjoiaHR0cHM6Ly90ZXN0ZmxleC5jeWJlcnNvdXJjZS5jb20iLCJqd2siOnsia3R5IjoiUlNBIiwiZSI6IkFRQUIiLCJ1c2UiOiJlbmMiLCJuIjoib2NCYnpOZ2k3dUMtTTdDZWJvSDNJUVZGOWtRWUFPQ21MQ25kbmdqa3VMS1FqdkF5THczb1UyXzBka2puREgxMHpQWjc2NWRMbzI0bU5XRWpnTDNnUVAybUhOMTlxalFqTHYxU3lSaHNGRFptUEFnRWtaNDZEZnI1cEZPNGwyR1dpSFNIWDIzMW5KZ3JrR1lsTHdOaVNidXNfbXlsMmZxQ0hqYV91VF9wMURXUmk4eE5YNUpVX3p1TzJ4NHZMdFcxck40aHZRSDhJcWJCanFPWnYtX1pmc0lMT1c1R0NxaDExRGNtczNuT0dhbzhVQ0FvRHhsbXh3SzlLV1daTzRWMU4tbWhIeERHUW1XcnRkUFVWSXluVXJwcjhzUWdwTmJLOWNqNEMweVI4cVNObnlmMi16dUprZ1JvMzV3ZGFHOFAyeEpFaU5tRDltdTZUZ0J4bWtvVTRRIiwia2lkIjoiMDhVUjNYZ2NrQkg2dFNvTmdTQllIeWNXY3RBN2JPOVQifX0sImN0eCI6W3siZGF0YSI6eyJjbGllbnRMaWJyYXJ5IjoiaHR0cHM6Ly90ZXN0ZmxleC5jeWJlcnNvdXJjZS5jb20vbWljcm9mb3JtL2J1bmRsZS92Mi4wL2ZsZXgtbWljcm9mb3JtLm1pbi5qcyIsImFsbG93ZWRDYXJkTmV0d29ya3MiOlsiVklTQSIsIk1BU1RFUkNBUkQiLCJBTUVYIiwiRElTQ09WRVIiXSwidGFyZ2V0T3JpZ2lucyI6WyJodHRwOi8vbG9jYWxob3N0OjMwMDAiXSwibWZPcmlnaW4iOiJodHRwczovL3Rlc3RmbGV4LmN5YmVyc291cmNlLmNvbSJ9LCJ0eXBlIjoibWYtMi4wLjAifV0sImlzcyI6IkZsZXggQVBJIiwiZXhwIjoxNzI4NDE3MTkyLCJpYXQiOjE3Mjg0MTYyOTIsImp0aSI6IjM3YW9NSm9zR3ZrWmdDQk8ifQ.nDdnr6qUKrzqZXJoFdY3knNU55B8xOQeU-2WvbWihKaH5h5px_C4H0xmD2m7fL0gGux8v1-qLBDxHVg8kYy6b-D49zVCeJ2BhUbBlnHZ2JI2PHKhUgFQeAoo7HZmWNjZ_WD2rpxiMH9f9U5bU_tdfnsDC08aQsixjyhkl4RHJIAujVxfofyv5SNyvHQf4J_Foljy5DrHr4mRVWWcsXZv3DNtYmGxbKF_l5rZL8Syj-y9FzDe9UEjulJgd-CLR7HpOMO7v2I8sx0Ee_z3rtDCXCU9HvzJ3xLqzE1tVVq2NIYLXPSpD4Ghw1Wg3X3sZameT60K1jGAofHx3vvbEzlbrg';
// testValidateCaptureContext(captureContext);

let transientToken = 'eyJraWQiOiIwOGV2c0hmemx2cURmNm5iREZvZDNhUUN0TVVuZjh4MCIsImFsZyI6IlJTMjU2In0.eyJpc3MiOiJGbGV4LzA4IiwiZXhwIjoxNzI4NjcxNjY3LCJ0eXBlIjoibWYtMi4wLjAiLCJpYXQiOjE3Mjg2NzA3NjcsImp0aSI6IjFFM1A5Q0s2TjBHQlI5TzA1MzdCRUJDQjNSSFgxN0syNUxVRlRHWkpTQTFKV05QRFYzWk82NzA5NkZCMzEwODciLCJjb250ZW50Ijp7InBheW1lbnRJbmZvcm1hdGlvbiI6eyJjYXJkIjp7ImV4cGlyYXRpb25ZZWFyIjp7InZhbHVlIjoiMjAyNCJ9LCJudW1iZXIiOnsiZGV0ZWN0ZWRDYXJkVHlwZXMiOlsiMDAyIl0sIm1hc2tlZFZhbHVlIjoiWFhYWFhYWFhYWFhYNDQ0NCIsImJpbiI6IjU1NTU1NSJ9LCJzZWN1cml0eUNvZGUiOnt9LCJleHBpcmF0aW9uTW9udGgiOnsidmFsdWUiOiIxMiJ9fX19fQ.GBRhlaa9oFLtrMM5cYbl-avoZjoccnPv2SN3U0O1WcqB_X4t305MXAhOXqLVySFW7t6b57j83YQTba8oT0Coa7p_RB1nG56n_B9KWIcSkYw7eNgjW3qropkPLdDWiPBtJBKuq5HbJunF6Gf_J-Ua4CXIzuKCa9lC1qPpHXeMF1thpT8aO_mpXG2gbt_wrGe19cHDR22S22OJIqWA4TqjIVrRpCKt1VjfsWOgQViBdY-xw15136iUGoHg_RK3tg-3vpFtff67inRHzM4-RcE3zatQRqaEB8C8R6j6teKxn2g9dsSP-V-PDxiMcTBSOShqvEnB7iRLJbccgKITIv2Bzw';
// testValidateTransientToken(transientToken);
// testCreateCustomer(transientToken);
testAddPaymentMethod(transientToken);
// testGetPaymentMethodDetails('23FE0306218C3D37E063AF598E0A7E90');
// testSaleTransaction();
// testHoldAuthorization();
// testTransactionSearch();
// testVoidTransaction();
// testRefundTransaction();
// getTransactionDetails('7286688879576739204953');
