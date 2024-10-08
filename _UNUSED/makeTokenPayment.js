try {
  const path = require('path');
  const restApi = require('cybersource-rest-client');
  const cyberSourceConfig = require(path.resolve('config/cybersource-config.js'));

  const apiClient = new restApi.ApiClient();
  var instance = new restApi.KeyGenerationApi(cyberSourceConfig);

  // const instance = new restApi.PaymentsApi(cyberSourceConfig, apiClient);
  // const requestData = restApi.CreatePaymentRequest.constructFromObject({
  //   paymentInformation: {
  //     paymentInstrument: {
  //       id: '238812209805C8ABE063AF598E0A2101'
  //     }
  //   },
  //   orderInformation: {
  //     amountDetails: {
  //       currency: 'USD',
  //       totalAmount: '123.45'
  //     }
  //   },
  //   processingInformation: {
  //     capture: true // auth and submit for settlement
  //   },
  //   clientReferenceInformation: {
  //     code: 'some-order-id'
  //   }
  // });
  
  // instance.createPayment(requestData, function (error, data, response) {
  //   if (response) {
  //     console.log('\n *** Response ***\n', JSON.stringify(response));
  //   }
  //   if (error) {
  //     console.log('\n *** Error ***\n', JSON.stringify(error));
  //   } else if (data) {
  //     console.log('\n *** Response Data returned ***\n', JSON.stringify(data));
  //   }    
  // });
} catch (err) {
  console.error(err);
}
