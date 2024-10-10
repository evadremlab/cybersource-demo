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

// let captureContext = 'eyJraWQiOiJ6dSIsImFsZyI6IlJTMjU2In0.eyJmbHgiOnsicGF0aCI6Ii9mbGV4L3YyL3Rva2VucyIsImRhdGEiOiJzME1JbzJLRFpObFV4YXlhek1FN3d4QUFFRk1SaHV5V2t6MkQ2a2xNdlVoUjhUTVNqTEZqbFdVMG1YVkkvRUZtMVNTc1QvZXBwbHN6aU9EYjNFYkdHTXZhdm1xdXl1SzFiZTFGMkErbFhNNjlUaGIyNnZyZVJZaGJuK01HODBGQnpMSTBrUjFraFI2NVAvUCthd09pWXFmWDZBXHUwMDNkXHUwMDNkIiwib3JpZ2luIjoiaHR0cHM6Ly90ZXN0ZmxleC5jeWJlcnNvdXJjZS5jb20iLCJqd2siOnsia3R5IjoiUlNBIiwiZSI6IkFRQUIiLCJ1c2UiOiJlbmMiLCJuIjoib2NCYnpOZ2k3dUMtTTdDZWJvSDNJUVZGOWtRWUFPQ21MQ25kbmdqa3VMS1FqdkF5THczb1UyXzBka2puREgxMHpQWjc2NWRMbzI0bU5XRWpnTDNnUVAybUhOMTlxalFqTHYxU3lSaHNGRFptUEFnRWtaNDZEZnI1cEZPNGwyR1dpSFNIWDIzMW5KZ3JrR1lsTHdOaVNidXNfbXlsMmZxQ0hqYV91VF9wMURXUmk4eE5YNUpVX3p1TzJ4NHZMdFcxck40aHZRSDhJcWJCanFPWnYtX1pmc0lMT1c1R0NxaDExRGNtczNuT0dhbzhVQ0FvRHhsbXh3SzlLV1daTzRWMU4tbWhIeERHUW1XcnRkUFVWSXluVXJwcjhzUWdwTmJLOWNqNEMweVI4cVNObnlmMi16dUprZ1JvMzV3ZGFHOFAyeEpFaU5tRDltdTZUZ0J4bWtvVTRRIiwia2lkIjoiMDhVUjNYZ2NrQkg2dFNvTmdTQllIeWNXY3RBN2JPOVQifX0sImN0eCI6W3siZGF0YSI6eyJjbGllbnRMaWJyYXJ5IjoiaHR0cHM6Ly90ZXN0ZmxleC5jeWJlcnNvdXJjZS5jb20vbWljcm9mb3JtL2J1bmRsZS92Mi4wL2ZsZXgtbWljcm9mb3JtLm1pbi5qcyIsImFsbG93ZWRDYXJkTmV0d29ya3MiOlsiVklTQSIsIk1BU1RFUkNBUkQiLCJBTUVYIiwiRElTQ09WRVIiXSwidGFyZ2V0T3JpZ2lucyI6WyJodHRwOi8vbG9jYWxob3N0OjMwMDAiXSwibWZPcmlnaW4iOiJodHRwczovL3Rlc3RmbGV4LmN5YmVyc291cmNlLmNvbSJ9LCJ0eXBlIjoibWYtMi4wLjAifV0sImlzcyI6IkZsZXggQVBJIiwiZXhwIjoxNzI4NDE3MTkyLCJpYXQiOjE3Mjg0MTYyOTIsImp0aSI6IjM3YW9NSm9zR3ZrWmdDQk8ifQ.nDdnr6qUKrzqZXJoFdY3knNU55B8xOQeU-2WvbWihKaH5h5px_C4H0xmD2m7fL0gGux8v1-qLBDxHVg8kYy6b-D49zVCeJ2BhUbBlnHZ2JI2PHKhUgFQeAoo7HZmWNjZ_WD2rpxiMH9f9U5bU_tdfnsDC08aQsixjyhkl4RHJIAujVxfofyv5SNyvHQf4J_Foljy5DrHr4mRVWWcsXZv3DNtYmGxbKF_l5rZL8Syj-y9FzDe9UEjulJgd-CLR7HpOMO7v2I8sx0Ee_z3rtDCXCU9HvzJ3xLqzE1tVVq2NIYLXPSpD4Ghw1Wg3X3sZameT60K1jGAofHx3vvbEzlbrg';
// testValidateCaptureContext(captureContext);

// let transientToken = 'eyJraWQiOiIwOGVyNGlvTDFwQVI2djJnVHk2NXNmUjkwVUFvTzEwaCIsImFsZyI6IlJTMjU2In0.eyJpc3MiOiJGbGV4LzA3IiwiZXhwIjoxNzI4NDIzNTYwLCJ0eXBlIjoibWYtMi4wLjAiLCJpYXQiOjE3Mjg0MjI2NjAsImp0aSI6IjFFMDRXSFVJTEhTRkM1SVdDV0tORjNXVDhESVlCMlZIUDIyVEwwWFMyWlhPVEJRNDlaSUs2NzA1QTY4OEY3NTUiLCJjb250ZW50Ijp7InBheW1lbnRJbmZvcm1hdGlvbiI6eyJjYXJkIjp7ImV4cGlyYXRpb25ZZWFyIjp7InZhbHVlIjoiMjAyNCJ9LCJudW1iZXIiOnsiZGV0ZWN0ZWRDYXJkVHlwZXMiOlsiMDAxIl0sIm1hc2tlZFZhbHVlIjoiWFhYWFhYWFhYWFhYMTExMSIsImJpbiI6IjQxMTExMSJ9LCJzZWN1cml0eUNvZGUiOnt9LCJleHBpcmF0aW9uTW9udGgiOnsidmFsdWUiOiIxMiJ9fX19fQ.k1AfSu51_NQJ-z6lhmlFuSDP-RgwPQadevQ7h6T07MDlKD35YEhimPk_zqaErnbeKVaZPN0Y91XuvweaFu5OSTD9sZqXQ4-gYJFBPSzbyOWDmHYryWdRKNqQGdwd_baf7nkdQJViODGgs6TEZXWWSg8tidyi2K5ZvAZkbgT0Vja8IKn-NnCsYHx2beLWfoYOldqfjqad5TMuHnzhnyc5EWtPpz9HxkRd1pt75DxnTJO6fVNx17VTTQCa0ntbggc-PmuuGLJtEG67iPtfR13g5TGSrqM5vvhq8HRQtHd6ZrTC8GftFPduCSsOEpIA_tu9UxrNclQsabHOolIM_TTApg';
// testValidateTransientToken(transientToken);
// testCreateCustomer(transientToken);
// testAddPaymentMethod(transientToken);
// testGetPaymentMethodDetails('23FE0306218C3D37E063AF598E0A7E90');
// testSaleTransaction();
// testHoldAuthorization();
// testTransactionSearch();
testVoidTransaction();
