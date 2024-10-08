try {
  var path = require('path');
  var cybersourceRestApi = require('cybersource-rest-client');
  var cybersourceConfiguration = require(path.resolve('config/cybersource-config.js'));
  
  var configObject = cybersourceConfiguration();
  var apiClient = new cybersourceRestApi.ApiClient();
  var requestObj = new cybersourceRestApi.CreatePaymentRequest();
  
  var clientReferenceInformation = new cybersourceRestApi.Ptsv2paymentsClientReferenceInformation();
  clientReferenceInformation.code = 'some-order-id';
  requestObj.clientReferenceInformation = clientReferenceInformation;
  
  var processingInformation = new cybersourceRestApi.Ptsv2paymentsProcessingInformation();
  processingInformation.capture = true;
  requestObj.processingInformation = processingInformation;
  
  var paymentInformation = new cybersourceRestApi.Ptsv2paymentsPaymentInformation();
  // var paymentInformationPaymentInstrument = new cybersourceRestApi.Ptsv2paymentsPaymentInformationInstrumentIdentifier();
  // paymentInformationPaymentInstrument.id = '238812209805C8ABE063AF598E0A2101';
  // var paymentInformationPaymentInstrument = new cybersourceRestApi.Ptsv2paymentsPaymentInformationPaymentInstrument();
  // paymentInformationPaymentInstrument.id = '238812209805C8ABE063AF598E0A2101';
  // paymentInformation.paymentInstrument = paymentInformationPaymentInstrument;
  paymentInformation.paymentInstrument = { // no need for constructor
    id: '238812209805C8ABE063AF598E0A2101'
  };
  requestObj.paymentInformation = paymentInformation;
  
  var orderInformation = new cybersourceRestApi.Ptsv2paymentsOrderInformation();
  var orderInformationAmountDetails = new cybersourceRestApi.Ptsv2paymentsOrderInformationAmountDetails();
  orderInformationAmountDetails.totalAmount = '102.21';
  orderInformationAmountDetails.currency = 'USD';
  orderInformation.amountDetails = orderInformationAmountDetails;
  requestObj.orderInformation = orderInformation;
    
  var instance = new cybersourceRestApi.PaymentsApi(configObject, apiClient);
  
  instance.createPayment(requestObj, function (error, data, response) {
    if (error) {
      console.log('Error', JSON.stringify(error));
    } else if (data) {
      console.log('Data returned', JSON.stringify(data));
    }
    console.log('Response', JSON.stringify(response));
  });
} catch (err) {
  console.error(err);
}
