var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const routes = require('./routes/index')
var cors = require('cors');
var startup = require('./startup')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
//DEV URL : https://handpoker-3494e.web.app
//LOCAL URL: http://localhost:3000
app.use(cors({
  origin: 'http://localhost:3000',
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",

}));
app.use(express.json({
  type: ['application/json', 'text/plain']
}))
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


startup.startUp();
// catch 404 and forward to error handler
app.use((res, req, next) =>{
  next();
}),

routes.init(app)
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
});

module.exports = app;
