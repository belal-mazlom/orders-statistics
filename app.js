var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var fs = require('fs');
var busboy = require('connect-busboy');
var passport = require('passport');
var passportLocal = require('passport-local');
var config = require('./appConfig');

var favicon = require('serve-favicon');
var logger = require('morgan');
var hbs = require('hbs');

var mysql = require('mysql');
var pool = mysql.createPool(config.mysqlConfig);

var app = express();

var routes = require('./routes/index')(passport, pool, fs, config);

pool.on('error', function (err) {
    try {
        pool.end(function (err) {
        });
    } catch (e) {
    }

    pool = mysql.createPool(config.mysqlConfig)
});

//----------- Template Settings------------------

hbs.registerPartial('partial', fs.readFileSync(__dirname + '/views/layout.hbs', 'utf8'));
hbs.registerPartial('partiallogin', fs.readFileSync(__dirname + '/views/loginlayout.hbs', 'utf8'));
hbs.registerPartials(__dirname + '/views/pages');
hbs.registerPartials(__dirname + '/views/includes');

hbs.registerHelper('if_eq', function (a, b, opts) {
    if (a == b) // Or === depending on your needs
        return opts.fn(this);
    else
        return opts.inverse(this);
});

//----------- App middleware Settings------------------
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
app.use(logger('dev'));
app.use(busboy());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.use(expressSession({
    secret: process.env.SESSION_SECRET || '123_Gasv$5@ASAAS@#$',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new passportLocal.Strategy(function (username, password, done) {
    pool.getConnection(function (err, connection) {
        if (err) {
            done(null, null);
            return;
        }

        connection.query("SELECT id, username, email, active, role_id from `user` where password = sha1(?) and (username = ? or email = ?)", [password, username, username], function (err, rows, fields) {
            if (err) {
                done(null, null);
                return;
            }
            connection.release();

            if (rows.length > 0 && rows[0].active > 0) {
                done(null, {
                    id: rows[0].id,
                    username: rows[0].username,
                    email: rows[0].email,
                    role_id: rows[0].role_id
                });
            } else {
                done(null, null);
            }
        });
    });
}));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    pool.getConnection(function (err, connection) {
        if (err) return;

        connection.query("SELECT id, username, email, active, role_id from `user` where id = ?", [id], function (err, rows, fields) {
            if (err) return;

            connection.release();

            if (rows.length > 0 && rows[0].active > 0) {
                 done(err, {
                    id: rows[0].id,
                    username: rows[0].username,
                    email: rows[0].email,
                    role_id: rows[0].role_id
                });
            }
        });
    });
});


app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;