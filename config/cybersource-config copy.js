/*
* CyberSource Merchant Configuration
*/

module.exports = {
  authenticationType: 'http_signature',
  runEnvironment: 'apitest.cybersource.com',

  merchantID: 'transsightdev_1718140723',
  merchantKeyId: 'ad81163c-aa36-471d-be21-9ac7c7ebbe99',
  merchantsecretKey: 'H/P7ehPswD5Y2xr/kUTIWG2mk37G63rsI5tvfCtZ34g=',

  // https://developer.cybersource.com/docs/cybs/en-us/security-keys/user/all/ada/security-keys/keys-meta-intro.html
  useMetaKey: false,
  portfolioID: '',
  // keyAlias: 'transsightdev_1718140723',
  // keyPass: 'transsightdev_1718140723',
  // keyFileName: 'transsightdev_1718140723',
  // keysDirectory: 'Resource',

  logConfiguration: {
    enableLog: true,
    logFileName: 'cybersource',
    logDirectory: 'log',
    logFileMaxSize: '5242880', // 10 Mb
    loggingLevel: 'debug',
    enableMasking: true // TODO: what is this?
  }
};
