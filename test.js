// require('dotenv').config();

async function testGenerateCaptureContext() {
  try {
    const { generateCaptureContext } = require('./modules');
    const result = await generateCaptureContext();
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}

async function testAddPaymentMethod() {
  try {
    const { addPaymentMethod } = require('./modules');
    const result = await addPaymentMethod({
      customerTokenId: '2387E7B265C60B82E063AF598E0AB911',
      transientTokenJwt: 'eyJraWQiOiIwOEVqbnNwdFFiSjNsUHRyWEJSU0J4aWt6djV1UnVoeiIsImFsZyI6IlJTMjU2In0.eyJpc3MiOiJGbGV4LzA3IiwiZXhwIjoxNzI4MDE5MDg3LCJ0eXBlIjoibWYtMi4wLjAiLCJpYXQiOjE3MjgwMTgxODcsImp0aSI6IjFFMFc5S0E5V0hWRE5NVlM0VlhaSkY4MlhMV1hWNjVJVElQTE9NTUdWU1hPSk5GUEZDRjY2NkZGN0E4RjVDNkQiLCJjb250ZW50Ijp7InBheW1lbnRJbmZvcm1hdGlvbiI6eyJjYXJkIjp7ImV4cGlyYXRpb25ZZWFyIjp7InZhbHVlIjoiMjAyNCJ9LCJudW1iZXIiOnsibWFza2VkVmFsdWUiOiJYWFhYWFhYWFhYWFgxMTExIiwiYmluIjoiNDExMTExIn0sInNlY3VyaXR5Q29kZSI6e30sImV4cGlyYXRpb25Nb250aCI6eyJ2YWx1ZSI6IjEyIn0sInR5cGUiOnsidmFsdWUiOiIwMDEifX19fX0.OUjTAyl_iaq0Bt5CvCn-UkgXd4JZC6brdvneHRfqzqUAhYZNig3r0HXh6eAr5Tj5FvanXhj_iRjFFqriknomEbXJ91oEmohB5j8Q1xilDvqVvuhBg_HjkMO-FMUV9vKVfxyzTZM08Vu-z6oD17YOp3HPeC9RwLESrXGkuCOLzTfjFGlczOGgFvFKNcTuBzLA_6oirTcAzsJnmRDkIvGlCb6UxEK1J3KH_P0KwAIW-sgQzr5cDmBdhqcbgfZCVp2F6ZBsFknC-vqTzzWlbHfuKQej6g4C57LIeHs62FDtC8UYen7ugb_ufEfEp-hqZHHVwNyH8dFVpCdp2m1354vrQg',
      order_id: 'another-fake-order_id',
      billTo: {
        email: 'david.b.balmer@gmail.com',
        firstName: 'David',
        lastName: 'Balmer',
        address1: '123 Main Street',
        locality: 'Alameda', // city
        country: 'US', // two character ISO code
        administrativeArea: 'CA', // state code
        postalCode: '94501' // zipcode
      }
    });
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}

testAddPaymentMethod();
