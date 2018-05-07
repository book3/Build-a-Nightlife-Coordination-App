var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
var request = require("request");


mongoose.connect("mongodb://nightclub_search:nightclub_search@ds263989.mlab.com:63989/nightclub_search")
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));
  var db = mongoose.connection;


// Routes
var routes = require("./routes/index");
var login = require("./routes/login");
var myplans = require("./routes/myplans");
var calculateGoingCount = require("./routes/calculateGoingCount");
var restData = require("./routes/restData");
var isUserGoing = require("./routes/isUserGoing");


var app = express();

// view Engine
var hbs = exphbs.create({
  defaultLayout: "layout",
  helpers: {
    stringify: (content) => {
            return JSON.stringify(content);
          }
}
});

app.set("views", path.join(__dirname, "views"));
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

app.use(session({
	secret: "secret",
	saveUninitialized: true,
	resave: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(expressValidator({
  errorFormatter: (param, msg, value) => {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect flash for displaying messages
app.use(flash());

// Global variables
app.use((req, res, next) => {
	res.locals.success_msg = req.flash("success_msg");
	res.locals.error_msg = req.flash("error_msg");
	res.locals.user = req.user || null;
	next();
});

// handling requests
app.use("/", routes);
app.use("/login", login);
app.use("/myplans", myplans);
app.use("/isUserGoing", isUserGoing);
app.use("/restData", restData);
app.use("/calculateGoingCount", calculateGoingCount);

app.use((req, res) => {
	res.render("404");
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`)
});
