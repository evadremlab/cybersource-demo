async function testGenerateCaptureContext() {
  try {
    const { generateCaptureContext } = require('./modules/cybersource');
    const result = await generateCaptureContext();
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}

async function testCreateCustomer() {
  try {
    const { createCustomer } = require('./modules/cybersource');
    const result = await createCustomer({
      transientTokenJwt: '', // get from UI
      order_id: 'new-customer-order_id',
      billTo: {
        email: 'david.balmer@transsight.com',
        firstName: 'David',
        lastName: 'Balmer',
        address1: '3355 Geary Blvd.',
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

async function testAddPaymentMethod() {
  try {
    const { addPaymentMethod } = require('./modules/cybersource');
    const result = await addPaymentMethod({
      customerTokenId: '23AC2720514EA950E063AF598E0AF5C1',
      transientTokenJwt: '', // get from UI
      order_id: 'another-fake-order_id',
      billTo: {
        email: 'david.balmer@transsight.com',
        firstName: 'David',
        lastName: 'Balmer',
        address1: '3355 Geary Blvd.',
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
    const { decodeJWT } = require('./modules/cybersource');
    console.log(decodeJWT(token));
  } catch (err) {
    console.error(err);
  }
}

async function testValidateCaptureContext(token) {
  try {
    const { validateCaptureContext } = require('./modules/cybersource');
    const result = await validateCaptureContext(token);
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}

async function testValidateTransientToken(token) {
  try {
    const { validateTransientToken } = require('./modules/cybersource');
    const result = await validateTransientToken(token);
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}

// testCreateCustomer();
const captureContext = 'eyJraWQiOiJ6dSIsImFsZyI6IlJTMjU2In0.eyJmbHgiOnsicGF0aCI6Ii9mbGV4L3YyL3Rva2VucyIsImRhdGEiOiJLeFdYMUtNTnBJdDY4S1hra2pNd05CQUFFS2R2OGVFQTJwMnFwK2txckl4dVZlamhPZlU5ODAwQ2ZVMXBpVXY0TTNyM2hsa3kwN2QwTkdsZ1lUSUJ6d0tMank3dGtZdnZmeDR1TExBaFYreWFCRGpoR2FuMjUwZjB0MVdiVldIYi9lQktlTnJMSHFGblhkQThUMXpPN0ZucEd3XHUwMDNkXHUwMDNkIiwib3JpZ2luIjoiaHR0cHM6Ly90ZXN0ZmxleC5jeWJlcnNvdXJjZS5jb20iLCJqd2siOnsia3R5IjoiUlNBIiwiZSI6IkFRQUIiLCJ1c2UiOiJlbmMiLCJuIjoicFJzV25FaU9wUUw0bWNkbmZ5U2Z6QUg3Z3V3X1RpRThwRjNKMTd1cWpWZ1c1anN3a2tldFdQRGJzdFh1aWJCYmZlbDc2TVNBM2dQV09acy1CZm85cXFCdjI0d2RQQ0lEc083VWtEajlOd2c5WGM4ZmpvNEdZRWJwcktfZy14OWhJVW92MWZJSkNOZzl4MUJocW1sS0c1VXFVZTlMelJOS1pSajE4YWpTSl9qMjhCTWlyMTBuYkE1Y0lINmQ3U1lsV0RzSzdnMW5VdTQtQXlpSkZmMC1iTkZ0V3BvSENFMmZpSW9ialg3MFJtYkE2OG5FWDJGdEZfUjlKNGw4dlRkcUJ3anptd1JFU0F2TDN6c3hXM2xiZkhxYmxGRVhGOHR5Q0UtZ3ZnWXQydHlJTjMxN3hrNU9Eb3pHSWE5b3NrWEJNeEY1SUNwb2RQX1pzb3VKdkF5WHJ3Iiwia2lkIjoiMDg1VDRsMkVwdlR4dzVmaGJJdm9HdDhUWnF1cjhISWYifX0sImN0eCI6W3siZGF0YSI6eyJjbGllbnRMaWJyYXJ5IjoiaHR0cHM6Ly90ZXN0ZmxleC5jeWJlcnNvdXJjZS5jb20vbWljcm9mb3JtL2J1bmRsZS92Mi4wL2ZsZXgtbWljcm9mb3JtLm1pbi5qcyIsImFsbG93ZWRDYXJkTmV0d29ya3MiOlsiVklTQSIsIk1BU1RFUkNBUkQiLCJBTUVYIiwiRElTQ09WRVIiXSwidGFyZ2V0T3JpZ2lucyI6WyJodHRwOi8vbG9jYWxob3N0OjMwMDAiXSwibWZPcmlnaW4iOiJodHRwczovL3Rlc3RmbGV4LmN5YmVyc291cmNlLmNvbSJ9LCJ0eXBlIjoibWYtMi4wLjAifV0sImlzcyI6IkZsZXggQVBJIiwiZXhwIjoxNzI4MDg2MzUxLCJpYXQiOjE3MjgwODU0NTEsImp0aSI6ImljSk5HNnhxMVlCeTVMYzMifQ.AsLoElOVwKZ7uaEwhkiM9v-J0GxX4bBBTwkipTwibPsSSbsYMGHHVsi30ztCmVC8ByexVWwQrLPPVShbNlpfyv8h9Ln1xlP7t8Wugr6LAumCgLnYP_x4sQYnS4SsywJxJmJTOm0-LY68AOYzfCy47ZX9oi9DVVz4kD5sqdOsBDjHQ8Z-UfgNl_r2TVQdV8BhYApxHJlrhUFmBYJAWJLQOLiO9iOyqZv559ttjYb5pHJMw9qhwmEtrrUPmh8qF063-N8orw23p9nSBI0xKQWLZDd2ykk1d4Jz8os9IZhVWZn8JlmOFraSEKtfschmlREEtfhLbsuUZulBbNNyUR95kw';
testValidateCaptureContext(captureContext);

// const transientToken = 'eyJraWQiOiIwOGJuZnhnWFhSMGVyWWZoYU56bXNJV3dLcTd2b2cyaSIsImFsZyI6IlJTMjU2In0.eyJpc3MiOiJGbGV4LzA3IiwiZXhwIjoxNzI4MDg0Nzk0LCJ0eXBlIjoibWYtMi4wLjAiLCJpYXQiOjE3MjgwODM4OTQsImp0aSI6IjFFM04yQTRLN1E1N0RIMTdXQzZYQTRCQ1BQTkU2SlU4VVNaOVBITlVPRkQ5SzJKNVNVT1Q2NzAwN0IzQTQzMEMiLCJjb250ZW50Ijp7InBheW1lbnRJbmZvcm1hdGlvbiI6eyJjYXJkIjp7ImV4cGlyYXRpb25ZZWFyIjp7InZhbHVlIjoiMjAyNCJ9LCJudW1iZXIiOnsibWFza2VkVmFsdWUiOiJYWFhYWFhYWFhYWFg0NDQ0IiwiYmluIjoiNTU1NTU1In0sInNlY3VyaXR5Q29kZSI6e30sImV4cGlyYXRpb25Nb250aCI6eyJ2YWx1ZSI6IjEyIn0sInR5cGUiOnsidmFsdWUiOiIwMDIifX19fX0.jHop82IYDpdKwl8xEqcd3oihxFYz0lmTtmwq_BVdLQyGl1OVfSmfcZIRCCn60MfqeW0QTIF90o_CwW8pTn2OwIS74A6JsyovUQ6lPo9pmwgUswbOvpTUvM9NjBg7nikcr0wOlWQIKEoxTbcIY-217NFAZz6Wj7UVQBI6R13Ummh8r5ud_fKBzundmw5qyQzZWvPmKVQvwi94aQM7Ub1GjnG0_rB-W3OrU1jWBA0Fqyz1BDSl0tATacrsXE_xY0BAoIjYq-3h4xDb0jh6n5zNB7hQOeW9D7vHmChZFLfCm9OBtZJs_gDTJzkW045tLM7MNdSEw6-YFXTNnypwIpdIrw';
// testValidateTransientToken(transientToken);