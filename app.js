var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

const {
  generateCaptureContext, 
  validateCaptureContext,
  generateUnifiedCheckoutCaptureContext
} = require('./modules/cybersource-provider');

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

// Render microform using captureContext
app.get('/checkout', async function (req, res) {
  try {
    var captureContext = await generateCaptureContext();
    await validateCaptureContext(captureContext); // will throw error if invalid
    res.render('checkout', { captureContext });
  } catch (err) {
    console.log(err);
    res.render('error', { error: err, message: 'Error generating capture context in /checkout route' });
  }
});

// Render unified checkout form using captureContext (NOT WORKING)
// app.get('/unifiedCheckout', async function (req, res) {
//   try {
//     var captureContext = await generateUnifiedCheckoutCaptureContext();
//     // await validateCaptureContext(captureContext); // will throw error if invalid
//     res.render('unifiedCheckout', { captureContext });
//   } catch (err) {
//     console.log(err);
//     res.render('error', { error: err, message: 'Error generating capture context in /unifiedCheckout route' });
//   }
// });

// Display the transient token generated from the payment information
app.post('/token', function (req, res) {
  try {
    res.render('token', { transientToken: req.body.transientToken });
  } catch (err) {
    res.render('error', { error: err, message: 'Error displaying the transient token' });
  }
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
