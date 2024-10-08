/*
* Cybersource Merchant Configuration
*/

module.exports = {
  runEnvironment: 'apitest.cybersource.com',
  merchantID: 'transsightdev_1718140723',
  merchantKeyId: 'ad81163c-aa36-471d-be21-9ac7c7ebbe99',
  merchantsecretKey: 'H/P7ehPswD5Y2xr/kUTIWG2mk37G63rsI5tvfCtZ34g=',
  authenticationType: 'http_signature',
  logConfiguration: {
    enableLog: true,
    logFileName: 'cybersource',
    logDirectory: 'log',
    logFileMaxSize: '5242880', // 10 Mb
    loggingLevel: 'debug',
    enableMasking: true // sensitive data in the request/response should be hidden/masked
  }
};
