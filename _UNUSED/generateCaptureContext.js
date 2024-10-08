/**
 * Added to modules/index.js as generateCaptureContext()
 */
try {
  const path = require('path');
  const { ApiClient, MicroformIntegrationApi, GenerateCaptureContextRequest } = require('cybersource-rest-client');
  const cyberSourceConfig = require(path.resolve('config/cybersource-config.js'));

  const apiClient = new ApiClient();
  const instance = new MicroformIntegrationApi(cyberSourceConfig, apiClient);
  // replaces GeneratePublicKeyRequest
  var requestObj = GenerateCaptureContextRequest.constructFromObject({
    clientVersion: 'v2.0',
    targetOrigins: ['http://localhost:3000'],
    allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER']
  });

  instance.generateCaptureContext(requestObj, function (error, data, response) {
    if (response) {
      console.log('\n *** Response ***\n', JSON.stringify(response));
    }
    if (error) {
      console.log('\n *** Error ***\n', JSON.stringify(error));
    } else if (data) {
      console.log('\n *** Response Data returned ***\n', JSON.stringify(data));
    }    
  });
} catch (err) {
  console.error(err);
}
