var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var cybersourceRestApi = require('cybersource-rest-client');
const { generateCaptureContext } = require('./modules');

var configObj = {
  authenticationType: 'http_signature',
  runEnvironment: 'cybersource.environment.SANDBOX',

  merchantID: 'transsightdev_1718140723',
  merchantKeyId: 'ad81163c-aa36-471d-be21-9ac7c7ebbe99',
  merchantsecretKey: 'H/P7ehPswD5Y2xr/kUTIWG2mk37G63rsI5tvfCtZ34g=',

  // keyAlias: 'testrest',
  // keyPass: 'testrest',
  // keyFileName: 'testrest',
  // keysDirectory: 'Resource',

  enableLog: true,
  logFilename: 'cybersource',
  logDirectory: 'log',
  logFileMaxSize: '5242880' // 10 MB
};

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
// app.use('/users', usersRouter);

// SERVER-SIDE REQUEST TO GENERATE DYNAMIC KEY REQUIRED FOR MICROFORM TO TOKENIZE
app.get('/checkout', async function (req, res) {
  try {
    var captureContext = await generateCaptureContext();
    res.render('checkout', { captureContext });
  } catch (err) {
    console.log(err);
    res.render('error', { error: err, message: 'Error generating capture context in /checkout route' });
  }
});

// DISPLAY THE TRANSIENT TOKEN - NOT BE PART OR A REAL CHECKOUT FLOW
app.post('/token', function (req, res) {
  try {
    res.render('token', { flexresponse: req.body.flexresponse });
  } catch (err) {
    res.render('error', { error: err, message: 'Error displaying the transient token' });
  }
});

// SERVER-SIDE REQUEST TO MAKE A PAYMENT WITH THE TRANSIENT TOKEN
app.post('/receipt', function (req, res) {
  var tokenResponse = JSON.parse(req.body.flexresponse)
  console.log('Transient token for payment is', JSON.stringify(tokenResponse));

  try {
    var instance = new cybersourceRestApi.PaymentsApi(configObj);

    var clientReferenceInformation = new cybersourceRestApi.Ptsv2paymentsClientReferenceInformation();
    clientReferenceInformation.code = 'test_flex_payment';

    var processingInformation = new cybersourceRestApi.Ptsv2paymentsProcessingInformation();
    processingInformation.commerceIndicator = 'internet';

    var amountDetails = new cybersourceRestApi.Ptsv2paymentsOrderInformationAmountDetails();
    amountDetails.totalAmount = '102.21';
    amountDetails.currency = 'USD';

    var billTo = new cybersourceRestApi.Ptsv2paymentsOrderInformationBillTo();
    billTo.email = 'david.balmer@transsight.com';

    var orderInformation = new cybersourceRestApi.Ptsv2paymentsOrderInformation();
    orderInformation.amountDetails = amountDetails;
    orderInformation.billTo = billTo;

    // EVERYTHING ABOVE IS JUST NORMAL PAYMENT INFORMATION
    // THIS IS WHERE YOU PLUG IN THE MICROFORM TRANSIENT TOKEN
    var tokenInformation = new cybersourceRestApi.Ptsv2paymentsTokenInformation();
    tokenInformation.transientTokenJwt = tokenResponse;

    var request = new cybersourceRestApi.CreatePaymentRequest();
    request.clientReferenceInformation = clientReferenceInformation;
    request.processingInformation = processingInformation;
    request.orderInformation = orderInformation;
    request.tokenInformation = tokenInformation;

    console.log('\n*************** Process Payment ********************* ');

    instance.createPayment(request, function (error, data, response) {
      if (error) {
        console.log('Error processing payment', JSON.stringify(error));
        res.render('error', { message: 'Processing payment', error });
      } else if (data) {
        console.log('Processed payment', JSON.stringify(data));
        res.render('receipt', { paymentResponse: JSON.stringify(data) });
      }
      console.log('Process payment response', JSON.stringify(response));
      console.log('Process payment response code', JSON.stringify(response['status']));
    });
  } catch (err) {
    res.render('error', { error: err, message: 'Error displaying the receipt' });
  }
});

// SERVER-SIDE REQUEST TO CREATE A CUSTOMER WITH THE TRANSIENT TOKEN
app.post('/createCustomer', function (req, res) {
  var tokenResponse = JSON.parse(req.body.flexresponse)
  console.log('Transient token for customer creation is: ' + JSON.stringify(tokenResponse));
  try {
    var instance = new cybersourceRestApi.PaymentsApi(configObj);

    var clientReferenceInformation = new cybersourceRestApi.Ptsv2paymentsClientReferenceInformation();
    clientReferenceInformation.code = '6429-PERM259643-306693-4875'; // Order reference or tracking number

    // https://developer.cybersource.com/docs/cybs/en-us/api-fields/reference/all/rest/api-fields/processing-info-aa.html
    var processingInformation = new cybersourceRestApi.Ptsv2paymentsProcessingInformation();
    processingInformation.commerceIndicator = 'internet'; // Default value for authorizations. E-commerce order placed from a website.

    var amountDetails = new cybersourceRestApi.Ptsv2paymentsOrderInformationAmountDetails();
    amountDetails.totalAmount = '0'; // NOTE: no need for decimal places
    amountDetails.currency = 'USD';

    var billTo = new cybersourceRestApi.Ptsv2paymentsOrderInformationBillTo();
    billTo.email = 'david.balmer@transsight.com';
    // NOTE: these are also required for creating a CyberSource customer
    billTo.firstName = 'David';
    billTo.lastName = 'Balmer';
    billTo.address1 = '100 Main Street';
    billTo.locality = 'Alameda'; // city
    billTo.country = 'US'; // two character ISO code
    billTo.administrativeArea = 'CA'; // state code
    billTo.postalCode = '94501'; // zipcode

    var orderInformation = new cybersourceRestApi.Ptsv2paymentsOrderInformation();
    orderInformation.amountDetails = amountDetails;
    orderInformation.billTo = billTo;

    // EVERYTHING ABOVE IS JUST NORMAL PAYMENT INFORMATION
    // THIS IS WHERE YOU PLUG IN THE MICROFORM TRANSIENT TOKEN
    var tokenInformation = new cybersourceRestApi.Ptsv2paymentsTokenInformation();
    tokenInformation.transientTokenJwt = tokenResponse;

    // THIS IS WHERE YOU TELL CYBERSOURCE TO CREATE A PERMANENT TOKEN
    // /Users/davidbalmer/Projects/CyberSource/Samples/Payments/Payments/authorization-with-customer-token-creation.js
    var actionList = new Array();
		actionList.push("TOKEN_CREATE");
		processingInformation.actionList = actionList;

    // THIS IS WHERE YOU TELL CYBERSOURCE WHAT TOKENS TO CREATE
    // /Users/davidbalmer/Projects/CyberSource/Samples/Payments/Payments/authorization-with-customer-token-creation.js
		var actionTokenTypes = new Array();
		actionTokenTypes.push("customer");
		actionTokenTypes.push("paymentInstrument");
		processingInformation.actionTokenTypes = actionTokenTypes;
		processingInformation.capture = false; // auth only

    var request = new cybersourceRestApi.CreatePaymentRequest();
    request.clientReferenceInformation = clientReferenceInformation;
    request.processingInformation = processingInformation;
    request.orderInformation = orderInformation;
    request.tokenInformation = tokenInformation;

    console.log('\n*************** Create Customer with Payment Method ********************* ');

    instance.createPayment(request, function (error, data, response) {
      if (error) {
        console.log('Error creating customer with payment method', JSON.stringify(error));
        res.render('error', { message: 'Creating customer with payment method', error });
      } else if (data) {
        console.log('Created customer with payment method', JSON.stringify(data));
        res.render('receipt', { paymentResponse: JSON.stringify(data) });
      }
      console.log('Create customer with payment method response', JSON.stringify(response));
      console.log('Create customer with payment method response code', JSON.stringify(response['status']));
    });
  } catch (err) {
    res.render('error', { error: err, message: 'Error creating customer' });
  }
});

app.post('/addPaymentMethod', function(req, res) {
  res.send('under construction');
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
