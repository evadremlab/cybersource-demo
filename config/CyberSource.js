/*
* CyberSource Merchant Configuration
*/

/*
Folder path where the .pem file is located.
Optional property, only required if decoding JWE Response. // TODO: what does this mean?
*/
const PemFileDirectory = 'Resource/NetworkTokenCert.pem';

module.exports = {
  authenticationType: 'http_signature',
  runEnvironment: 'apitest.cybersource.com', // 'cybersource.environment.SANDBOX',

  merchantID: 'transsightdev_1718140723',
  merchantKeyId: 'ad81163c-aa36-471d-be21-9ac7c7ebbe99',
  merchantsecretKey: 'H/P7ehPswD5Y2xr/kUTIWG2mk37G63rsI5tvfCtZ34g=',

  // TODO: what is this? is this different from PemFileDirectory?
  // keyAlias: 'transsightdev_1718140723',
  // keyPass: 'transsightdev_1718140723',
  // keyFileName: 'transsightdev_1718140723',
  // keysDirectory: 'Resource',

  useMetaKey: false,
  portfolioID: '', // TODO: what is this?
  // pemFileDirectory: PemFileDirectory,

  logConfiguration: {
    enableLog: true,
    logFileName: 'cybersource',
    logDirectory: 'log',
    logFileMaxSize: '5242880', // 10 Mb
    loggingLevel: 'debug',
    enableMasking: true // TODO: what is this?
  }
};
