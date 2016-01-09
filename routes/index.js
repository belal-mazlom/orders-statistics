var express = require('express');
var http = require('http');
var https = require("https");
var CronJob = require('cron').CronJob;
var router = express.Router();

var title = 'Shopgo statistics';
var cssClass = 'page-container-bg-solid page-header-fixed page-sidebar-closed-hide-logo page-md';

module.exports = function (passport, pool, fs) {
    var isAuthenticated = function (req, res, next) {
        if (req.isAuthenticated())
            return next();
        res.redirect('/login');
    };

    new CronJob('00 02 * * * *', function() {
        //Run at 02:00 AM each Day
        pool.getConnection(function (err, connection) {
            if (err) {
                connection && connection.release();
            }
            connection.query("SELECT id, url, token, DATE_FORMAT (`last_update`, '%Y-%m-%d %h:%i:%s') as `last_update` FROM `store` where `status` = 1 AND `last_update` is not null", function (err, rows, fields) {
                if (err) throw err;
                connection.release();

                if (rows.length > 0) {
                    for(var i =0 ;i < rows.length;i++){
                        delaySync(rows[i], 1000);
                    }
                }
            });
        });
    }, null, true, 'UTC');

    function delaySync(row, time){
        var url = row.url + '/shopgoresult/ShopGoProvider.php';
        var token = row.token;
        var hash = 'wsavQvt14cmPNf9wGD59Xir9mzU';
        var method = 'orders';
        var lastUpdate = row.last_update;

        setTimeout(function(){
            syncStore(url, token, hash, lastUpdate, method);
        }, time);
    }

    /* GET home page. */
    router.get('/', function (req, res, next) {
        if (req.isAuthenticated()) {
            res.redirect('/users/list');
        } else {
            res.redirect('/login');
        }
    });

    router.get('/login', function (req, res) {
        if (req.isAuthenticated()) {
            res.redirect('/users/list');
        } else {
            res.render('pages/login', {layout: 'loginlayout', title: title});
        }
    });

    router.post('/login', passport.authenticate('local'), function (req, res) {
        res.redirect('/users/list');
    });

    router.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/login');
    });

    router.post('/users/data', isAuthenticated, function (req, res) {
        getUsersCount(function (totalRecords) {
            getUsers(0, 10, function (rows) {
                res.send(JSON.stringify({
                    data: rows,
                    recordsFiltered: totalRecords,
                    recordsTotal: totalRecords,
                    draw: 1
                }));
            });
        });
    });

    router.get('/users/list', isAuthenticated, function (req, res) {
        res.render('pages/users_list', {
            title: title, user: req.user, selectedPage: 'users-list', cssClass: cssClass
            , scripts: ['/js/users-list.js']
        });
    });

    router.get('/data/reset-filters', isAuthenticated, function (req, res) {
        clearFilters(req, res);
        res.send("");
    });

    router.get('/stores/list', isAuthenticated, function (req, res) {
        res.render('pages/stores_list', {
            title: title, selectedPage: 'stores-list', cssClass: cssClass
            , scripts: ['/js/stores-list.js']
        });
    });

    router.post('/stores/data', isAuthenticated, function (req, res) {
        getStoresCount(function (totalRecords) {
            var filters ={
                title: req.body.title,
                url: req.body.url
            };

            getStores(req.body.start, req.body.length, filters, function (rows) {
                res.send(JSON.stringify({
                    data: rows,
                    recordsFiltered: totalRecords,
                    recordsTotal: totalRecords,
                    draw: req.body.draw
                }));
            });
        });
    });

    router.get('/orders/list', isAuthenticated, function (req, res) {
        handleFilters(req, res);

        var filtersSlider = prepareFilterSlider(req, res);

        getStoreList(function (stores) {
            res.render('pages/orders_list', {
                title: title,
                selectedPage: 'orders-list',
                cssClass: cssClass,
                stores: stores,
                filtersSlider: filtersSlider,
                scripts: ['/js/orders-list.js']
            });
        });
    });

    router.post('/orders/data', isAuthenticated, function (req, res) {
        var filters = handleFilters(req, res);

        getOrdersCount(filters, function (totalRecords) {
            getOrders(filters, req.body.start, req.body.length, function (rows) {
                res.send(JSON.stringify({
                    data: rows,
                    recordsFiltered: totalRecords,
                    recordsTotal: totalRecords,
                    draw: req.body.draw
                }));
            });
        });
    });

    router.get('/statistics/orders', isAuthenticated, function (req, res) {
        handleFilters(req, res);

        var filtersSlider = prepareFilterSlider(req, res);

        getStoreList(function (stores) {
            res.render('pages/statistics_orders', {
                title: title,
                selectedPage: 'orders-statistics',
                cssClass: cssClass,
                filtersSlider: filtersSlider,
                stores: stores,
                scripts: [
                    '/plugins/highcharts/js/highcharts.js',
                    '/plugins/highcharts/js/highcharts-3d.js',
                    '/plugins/highcharts/js/highcharts-more.js',
                    '/js/orders-statistics.js'
                ]
            });
        });
    });

    router.post('/statistics/orders_data', isAuthenticated, function (req, res) {
        var filters = handleFilters(req, res);

        getOrdersStatistics(filters, function (data) {
            res.send(JSON.stringify(data));
        });
    });

    router.get('/statistics/payments', isAuthenticated, function (req, res) {
        handleFilters(req, res);
        var filtersSlider = prepareFilterSlider(req, res);

        getStoreList(function (stores) {
            res.render('pages/statistics_payments', {
                title: title,
                selectedPage: 'payments-statistics',
                cssClass: cssClass,
                filtersSlider: filtersSlider,
                stores: stores,
                scripts: [
                    '/plugins/highcharts/js/highcharts.js',
                    '/plugins/highcharts/js/highcharts-3d.js',
                    '/plugins/highcharts/js/highcharts-more.js',
                    '/js/payments-statistics.js'
                ]
            });
        });
    });

    router.post('/statistics/payments_data', isAuthenticated, function (req, res) {
        var filters = handleFilters(req, res);

        getPaymentsStatistics(filters, function (data) {
            res.send(JSON.stringify(data));
        });
    });

    router.get('/statistics/shipping', isAuthenticated, function (req, res) {
        handleFilters(req, res);
        var filtersSlider = prepareFilterSlider(req, res);

        getStoreList(function (stores) {
            res.render('pages/statistics_shipping', {
                title: title,
                selectedPage: 'shipping-statistics',
                cssClass: cssClass,
                filtersSlider: filtersSlider,
                stores: stores,
                scripts: [
                    '/plugins/highcharts/js/highcharts.js',
                    '/plugins/highcharts/js/highcharts-3d.js',
                    '/plugins/highcharts/js/highcharts-more.js',
                    '/js/shipping-statistics.js'
                ]
            });
        });
    });

    router.post('/statistics/shipping_data', isAuthenticated, function (req, res) {
        var filters = handleFilters(req, res);

        getShippingStatistics(filters, function (data) {
            res.send(JSON.stringify(data));
        });
    });

    router.get('/statistics/countries', isAuthenticated, function (req, res) {
        handleFilters(req, res);
        var filtersSlider = prepareFilterSlider(req, res);

        getStoreList(function (stores) {
            res.render('pages/statistics_countries', {
                title: title,
                selectedPage: 'countries-statistics',
                cssClass: cssClass,
                filtersSlider: filtersSlider,
                stores: stores,
                scripts: [
                    '/plugins/highcharts/js/highcharts.js',
                    '/plugins/highcharts/js/highcharts-3d.js',
                    '/plugins/highcharts/js/highcharts-more.js',
                    '/js/countries-statistics.js'
                ]
            });
        });
    });

    router.post('/statistics/countries_data', isAuthenticated, function (req, res) {
        var filters = handleFilters(req, res);

        getCountriesStatistics(req.body.type, filters, function (data) {
            res.send(JSON.stringify(data));
        });
    });



    router.get('/statistics/monthly-orders', isAuthenticated, function (req, res) {
        handleFilters(req, res);
        var filtersSlider = prepareFilterSlider(req, res);

        getStoreList(function (stores) {
            res.render('pages/statistics_monthly_orders', {
                title: title,
                selectedPage: 'monthly-orders-statistics',
                cssClass: cssClass,
                filtersSlider: filtersSlider,
                stores: stores,
                scripts: [
                    '/plugins/highcharts/js/highcharts.js',
                    '/plugins/highcharts/js/highcharts-3d.js',
                    '/plugins/highcharts/js/highcharts-more.js',
                    '/js/monthly-orders-statistics.js'
                ]
            });
        });
    });

    router.post('/statistics/monthly_orders_data', isAuthenticated, function (req, res) {
        var filters = handleFilters(req, res);

        getMonthlyOrdersStatistics(req.body.type, filters, function (data) {
            res.send(JSON.stringify(data));
        });
    });


    router.post('/stores/connect', function (req, res) {
        var fstream;
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename);
            fstream = fs.createWriteStream(__dirname + '/../collected_data/' + filename);
            fstream.on('finish', function () {
                pool.getConnection(function (err, connection) {
                    if (err) {
                        connection && connection.release();
                    }
                    console.log('file has been written');
                    var arr = filename.split(".");
                    console.log("arr ", arr);
                    connection.query("SELECT id FROM `store` where ?", {token: arr[0]}, function (err, rows, fields) {
                        if (err) throw err;
                        connection.release();
                        if (rows.length > 0) {
                            readDataCSV(filename, rows[0].id, arr[0]);
                        }
                    });
                });
            });
            file.pipe(fstream);
            fstream.on('close', function () {
                res.redirect('back');
            });
        });
    });

    //Sync now from selected store
    router.get('/data/request-orders', isAuthenticated, function (req, res) {
        try {
            var url = require('url');
            var url_parts = url.parse(req.url, true);
            var query = url_parts.query;

            if (query['id'] != undefined && parseInt(query['id']) > 0) {
                pool.getConnection(function (err, connection) {
                    if (err) {
                        connection && connection.release();
                    }
                    connection.query("SELECT id, url, token, DATE_FORMAT (`last_update`, '%Y-%m-%d %h:%i:%s') as `last_update` FROM `store` where ?", {id: query['id']}, function (err, rows, fields) {
                        if (err) throw err;
                        connection.release();

                        if (rows.length > 0) {
                            var url = rows[0].url + '/shopgoresult/ShopGoProvider.php';
                            //var url = 'http://localhost/myuploader' + '/test.php';//rows[0].url + '/ShopGoProvider.php'
                            var token = rows[0].token;
                            var hash = 'wsavQvt14cmPNf9wGD59Xir9mzU';
                            var method = 'orders';
                            var lastUpdate = rows[0].last_update;

                            syncStore(url, token, hash, lastUpdate, method);
                        }
                    });
                });
            }
        } catch (e) {
        }
        var date = new Date();
        var dateFormated = formatDateUTC(date);
        res.send(dateFormated);
    });

    function formatDateUTC(date){
        var month = ((date.getUTCMonth() + 1) > 9 ? (date.getUTCMonth() + 1) : "0" + (date.getUTCMonth() + 1));
        var day = (date.getUTCDate() > 9 ? date.getUTCDate() : "0" + date.getUTCDate());
        var hour = date.getUTCHours() > 12 ? date.getUTCHours() - 12 : date.getUTCHours();
        var am = date.getUTCHours() > 12 ? " PM" : " AM";
        hour = hour > 9 ? hour : "0" + hour;
        var minute = (date.getUTCMinutes() > 9 ? date.getUTCMinutes() : "0" + date.getUTCMinutes());

        return date.getUTCFullYear() + "-" + month + "-" + day + " " + hour + ":" + minute + am;
    }

    function formatDate(date){
        var month = ((date.getMonth() + 1) > 9 ? (date.getMonth() + 1) : "0" + (date.getMonth() + 1));
        var day = (date.getDate() > 9 ? date.getDate() : "0" + date.getDate());
        var hour = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
        hour = hour > 9 ? hour : "0" + hour;
        var minute = (date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes());
        var second = (date.getSeconds() > 9 ? date.getSeconds() : "0" + date.getSeconds());

        return date.getFullYear() + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
    }

    router.get('/data/enter-stores', isAuthenticated, function (req, res) {
        var fs = require('fs');
        var csv = require('csv');

        fs.readFile("../collected_data/stores.csv", "utf8", function (error, data) {

            csv.parse(data, {comment: '#'}, function (err, output) {
                var length = output.length;
                var row;
                for (var i = 1; i < length; i++) {
                    row = output[i];
                    pool.getConnection(function (err, connection) {
                        if (err) {
                            connection && connection.release();
                        }
                        connection.query('INSERT INTO `store` SET ?'
                            , {
                                title: row[0],
                                url: row[1],
                                token: 111,
                                last_update: null,
                                store_timezone: '',
                                status: 1
                            }, function (err, result) {

                                if (err) throw err;
                                connection.release();
                            });
                    });
                }
            });
            res.send("Reading file");
        });
    });

    function syncStore(url, token, hash, lastUpdate, method) {
        try {
            console.log("sync");
            var querystring = require('querystring');
            var postData = {
                'token': token,
                'hash': hash,
                'method': method
            };

            if(lastUpdate != null){
                postData['startdate'] = lastUpdate;
            }

            postData = querystring.stringify(postData);

            console.log("lastUpdate", lastUpdate);

            var arr = url.split("/");
            var sub = '/';
            for (var i = 3; i < arr.length; i++) {
                if (arr[i].length > 0) {
                    sub += arr[i] + '/';
                }
            }

            console.log("Sub ",sub);
            console.log("Post data ", postData);

            if (arr[0] !== undefined && arr[2] !== undefined) {

                var options = {
                    host: arr[2],
                    port: (arr[0] == 'http:' ? '80' : '443'),
                    //path: '/ShopGoProvider.php',
                    path: sub.substr(0, sub.length -1),
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Content-Length': postData.length,
                        'Connection': 'keep-alive'
                    }
                };

                var prot = options.port == 443 ? https : http;

                var req = prot.request(options, function (res) {
                    console.log("Request send", options);
                    res.setEncoding('utf8');
                    res.on('data', function (chunk) {
                        console.log('BODY: ' + chunk);
                    });
                    res.on('end', function () {
                        console.log('   No more data in response.');
                    })
                });

                req.on('error', function (e) {
                    console.log('problem with request: ' + e.message);
                });

                // write data to request body
                req.write(postData);
                req.end();
            }
        }
        catch (e) {
            console.log(e);
        }
    }

    function readDataCSV(filename, storeId, token) {
        var fs = require('fs');
        var csv = require('csv');

        console.log("loading csv file for store" + storeId);

        pool.getConnection(function (err, connection) {
            if (err) {
                console.log("error with pool", err);
                connection && connection && connection.release();
            }
            fs.readFile("../collected_data/" + filename, "utf8", function (error, data) {

                csv.parse(data, {comment: '#'}, function (err, output) {
                    console.log("Start parsing");
                    if(output) {
                        console.log("Enter to parse ");
                        var length = output.length;
                        var row;
                        for (var i = 0; i < length; i++) {
                            try {
                                row = output[i];
                                console.log("Insert date");
                                connection.query('INSERT INTO `order` SET ?'
                                    , {
                                        store_id: storeId,
                                        order_id: row[0],
                                        customer_name: row[1],
                                        customer_email: row[2],
                                        subtotal: row[3],
                                        total: row[4],
                                        state: row[5],
                                        currency: row[6],
                                        country_code: row[7],
                                        payment_code: row[8],
                                        payment_title: row[9],
                                        shipping_method: row[10],
                                        create_date: row[11]
                                    }, function (err, result) {
                                        if (err) console.log(err);
                                    });
                                console.log("Inserting");
                            } catch (e) {
                                console.log(e);
                            }
                        }
                    }
                });
                console.log("file:...", error);

                fs.unlink(__dirname + '/../collected_data/' + filename, function () {
                    console.log("Delete file done");
                    pool.getConnection(function (err, connection) {
                        if (err) {
                            connection && connection.release();
                        }

                        connection.query("Update `store` set last_update = UTC_TIMESTAMP() where ?", {token: token}, function (err, rows, fields) {
                            connection.release();
                        });
                    });
                });
            });
        });
    }

    function getUsersCount(callback) {
        console.log("Users count");
        pool.getConnection(function (err, connection) {
            console.log("count user");
            if (err) {
                console.log(err);
                connection && connection.release();
            }

            connection.query('SELECT count(*) as counts from user', function (err, rows, fields) {
                if (err) throw err;
                connection.release();
                callback(rows[0].counts);
            });
        });
    }

    function getUsers(count, offset, callback) {
        pool.getConnection(function (err, connection) {
            if (err) {
                connection && connection.release();
            }
            connection.query('SELECT id, username, email, active from user limit ' + count + ', ' + offset, function (err, rows, fields) {
                if (err) throw err;
                connection.release();
                callback(rows);
            });
        });
    }


    function getStoresCount(callback) {
        pool.getConnection(function (err, connection) {
            if (err) {
                connection && connection.release();
            }
            connection.query('SELECT count(*) as counts from store', function (err, rows, fields) {
                if (err) throw err;
                connection.release();
                callback(rows[0].counts);
            });
        });
    }

    function getStores(count, offset, filters, callback) {
        pool.getConnection(function (err, connection) {
            if (err) {
                connection && connection.release();
            }

            var filterStr = '';
            if(filters.title != undefined && filters.url != undefined && (filters.title.length > 0 || filters.url.length > 0)){
                if(filters.title.length > 0){
                    filterStr += ' and `title` like "%'+ filters.title+ '%"';
                }
                if(filters.url.length > 0){
                    filterStr += ' and `url` like "%'+ filters.url+ '%"';
                }
            }

            console.log("filter: ",filterStr);

            connection.query("SELECT id, `title`, `url`, DATE_FORMAT (`last_update`, '%Y-%m-%d %h:%i %p') as `last_update`, `status`, id as `actions` FROM `store` where 1=1 "+ filterStr +" limit " + count + ", " + offset, function (err, rows, fields) {
                if (err) throw err;
                connection.release();
                callback(rows);
            });
        });
    }

    function getOrdersCount(filters, callback) {
        var query = 'SELECT count(*) as counts from `order`  where 1=1 ';

        query = prepareFilters(filters, query);
        pool.getConnection(function (err, connection) {
            if (err) {
                connection && connection.release();
            }
            connection.query(query, function (err, rows, fields) {
                if (err) throw err;
                connection.release();
                callback(rows[0].counts);
            });
        });
    }

    function getOrders(filters, start, length, callback) {
        var query = 'SELECT store.title as title, order_id, customer_name, customer_email, subtotal, total, currency, payment_code, state, shipping_method, country_code, DATE_FORMAT(create_date, "%Y-%m-%d %h:%i %p") as create_date  from `order` inner join store on store.id = `order`.store_id  where 1=1 ';

        query = prepareFilters(filters, query);

        var counts = '';
        if (length != -1) {
            counts = " limit " + start + ", " + length;
        }

        pool.getConnection(function (err, connection) {
            if (err) {
                connection && connection.release();
            }
            connection.query(query + counts, function (err, rows, fields) {
                if (err) throw err;
                connection.release();
                callback(rows);
            });
        });
    }

    function getOrdersStatistics(filters, callback) {
        var paymentTypes = {
            banktransfer: 'Western Union',
            cashondelivery: 'Cash on Delivery',
            checkmo: 'Bank Transfer',
            paymentmodule: 'Credit Card',
            paypal_express: 'PayPal Express',
            paypal_standard: 'PayPal Standard',
            phoenix_cashondelivery: 'Cash Collection different address'
        };

        var query = prepareFilters(filters, '');

        var sql = 'SELECT payment_code, TRUNCATE(sum(total/ currency_exchange.exchange_rate), 2) as `total`,' +
            ' Date_format(create_date, "%Y") as `create_year`,' +
            ' Date_format(create_date, "%M") as `create_month`' +
            ' FROM `order` inner JOIN currency_exchange on currency_exchange.currency_code = order.currency' +
            ' WHERE `payment_code` != "free"' + query +
            ' GROUP BY `payment_code`, year(`create_date`), month(`create_date`)' +
            ' ORDER BY create_date , payment_code';

        pool.getConnection(function (err, connection) {
            if (err) {
                connection && connection.release();
            }
            connection.query(sql, function (err, rows, fields) {
                if (err) throw err;
                var data = {};
                var months = [];
                var payments = [];

                var currentYear;
                var currentMonth;
                var paymentsObjects = {};


                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    var total = row.total;
                    var differentVal = total - (parseInt(total / 10) * 10);
                    if(differentVal > 5){
                        total = (parseInt(total / 10) * 10) + 10;
                    }else {
                        total = (parseInt(total / 10) * 10) + 5;
                    }

                    if (row.create_year != currentYear) {
                        currentYear = row.create_year;
                    }
                    if (row.create_month != currentMonth) {
                        currentMonth = row.create_month;
                        months.push(currentMonth);
                    }

                    if (paymentsObjects[row.payment_code] == undefined) {
                        paymentsObjects[row.payment_code] = {};
                    }
                    paymentsObjects[row.payment_code]['data'] = paymentsObjects[row.payment_code]['data'] || [];
                    paymentsObjects[row.payment_code]['data'].push(total);
                }

                for (var payment in paymentsObjects) {
                    payments.push({
                        name: (paymentTypes[payment] == undefined? payment:paymentTypes[payment]),
                        data: paymentsObjects[payment]['data']
                    });
                }

                data = {
                    categories: months,
                    series: payments
                };

                connection.release();
                callback(data);
            });
        });
    }

    function getPaymentsStatistics(filters, callback) {

        var paymentTypes = {
            banktransfer: 'Western Union',
            cashondelivery: 'Cash on Delivery',
            checkmo: 'Bank Transfer',
            paymentmodule: 'Credit Card',
            paypal_express: 'PayPal Express',
            paypal_standard: 'PayPal Standard',
            phoenix_cashondelivery: 'Cash Collection different address',
            free: 'Free'
        };

        var query = prepareFilters(filters, '');

        var sql = 'SELECT `payment_code`, count(`payment_code`) as `counts` FROM `order` where 1 = 1 ' + query + ' GROUP BY `payment_code`';
        pool.getConnection(function (err, connection) {
            if (err) {
                connection && connection.release();
            }
            connection.query(sql, function (err, rows, fields) {
                if (err) throw err;
                var data = [];
                var totalCounts = 0;
                var payments = [];
                var paymentsObjects = {};

                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    totalCounts += row.counts;

                    paymentsObjects[row.payment_code] = row.counts;
                }

                for (var payment in paymentsObjects) {
                    payments.push({
                        name: paymentTypes[payment] || payment,
                        y: (paymentsObjects[payment] / totalCounts * 100)
                    });
                }

                data = payments;
                connection.release();
                callback(data);
            });
        });
    }

    function getShippingStatistics(filters, callback) {
        var query = prepareFilters(filters, '');

        var sql = 'SELECT `shipping_method`, count(`shipping_method`) as `counts` FROM `order` where CHARACTER_LENGTH(shipping_method) > 0 ' + query + ' GROUP BY `shipping_method`';

        pool.getConnection(function (err, connection) {
            if (err) {
                connection && connection.release();
            }
            connection.query(sql, function (err, rows, fields) {
                if (err) throw err;
                var totalCounts = 0;
                var shippings = [];
                var shippingObjects = {};

                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];

                    totalCounts += row.counts;

                    shippingObjects[row.shipping_method] = row.counts;
                }

                for (var shipping in shippingObjects) {
                    shippings.push({
                        name: shipping,
                        y: (shippingObjects[shipping] / totalCounts * 100)
                    });
                }

                connection.release();
                callback(shippings);
            });
        });
    }

    function getCountriesStatistics(type, filters, callback) {
        var countriesTitle = {
            'AF': 'Afghanistan',
            'AX': 'Aland Islands',
            'AL': 'Albania',
            'DZ': 'Algeria',
            'AS': 'American Samoa',
            'AD': 'Andorra',
            'AO': 'Angola',
            'AI': 'Anguilla',
            'AQ': 'Antarctica',
            'AG': 'Antigua And Barbuda',
            'AR': 'Argentina',
            'AM': 'Armenia',
            'AW': 'Aruba',
            'AU': 'Australia',
            'AT': 'Austria',
            'AZ': 'Azerbaijan',
            'BS': 'Bahamas',
            'BH': 'Bahrain',
            'BD': 'Bangladesh',
            'BB': 'Barbados',
            'BY': 'Belarus',
            'BE': 'Belgium',
            'BZ': 'Belize',
            'BJ': 'Benin',
            'BM': 'Bermuda',
            'BT': 'Bhutan',
            'BO': 'Bolivia',
            'BA': 'Bosnia And Herzegovina',
            'BW': 'Botswana',
            'BV': 'Bouvet Island',
            'BR': 'Brazil',
            'IO': 'British Indian Ocean Territory',
            'BN': 'Brunei Darussalam',
            'BG': 'Bulgaria',
            'BF': 'Burkina Faso',
            'BI': 'Burundi',
            'KH': 'Cambodia',
            'CM': 'Cameroon',
            'CA': 'Canada',
            'CV': 'Cape Verde',
            'KY': 'Cayman Islands',
            'CF': 'Central African Republic',
            'TD': 'Chad',
            'CL': 'Chile',
            'CN': 'China',
            'CX': 'Christmas Island',
            'CC': 'Cocos (Keeling) Islands',
            'CO': 'Colombia',
            'KM': 'Comoros',
            'CG': 'Congo',
            'CD': 'Congo, Democratic Republic',
            'CK': 'Cook Islands',
            'CR': 'Costa Rica',
            'CI': 'Cote D\'Ivoire',
            'HR': 'Croatia',
            'CU': 'Cuba',
            'CY': 'Cyprus',
            'CZ': 'Czech Republic',
            'DK': 'Denmark',
            'DJ': 'Djibouti',
            'DM': 'Dominica',
            'DO': 'Dominican Republic',
            'EC': 'Ecuador',
            'EG': 'Egypt',
            'SV': 'El Salvador',
            'GQ': 'Equatorial Guinea',
            'ER': 'Eritrea',
            'EE': 'Estonia',
            'ET': 'Ethiopia',
            'FK': 'Falkland Islands (Malvinas)',
            'FO': 'Faroe Islands',
            'FJ': 'Fiji',
            'FI': 'Finland',
            'FR': 'France',
            'GF': 'French Guiana',
            'PF': 'French Polynesia',
            'TF': 'French Southern Territories',
            'GA': 'Gabon',
            'GM': 'Gambia',
            'GE': 'Georgia',
            'DE': 'Germany',
            'GH': 'Ghana',
            'GI': 'Gibraltar',
            'GR': 'Greece',
            'GL': 'Greenland',
            'GD': 'Grenada',
            'GP': 'Guadeloupe',
            'GU': 'Guam',
            'GT': 'Guatemala',
            'GG': 'Guernsey',
            'GN': 'Guinea',
            'GW': 'Guinea-Bissau',
            'GY': 'Guyana',
            'HT': 'Haiti',
            'HM': 'Heard Island & Mcdonald Islands',
            'VA': 'Holy See (Vatican City State)',
            'HN': 'Honduras',
            'HK': 'Hong Kong',
            'HU': 'Hungary',
            'IS': 'Iceland',
            'IN': 'India',
            'ID': 'Indonesia',
            'IR': 'Iran, Islamic Republic Of',
            'IQ': 'Iraq',
            'IE': 'Ireland',
            'IM': 'Isle Of Man',
            'IL': 'Israel',
            'IT': 'Italy',
            'JM': 'Jamaica',
            'JP': 'Japan',
            'JE': 'Jersey',
            'JO': 'Jordan',
            'KZ': 'Kazakhstan',
            'KE': 'Kenya',
            'KI': 'Kiribati',
            'KR': 'Korea',
            'KW': 'Kuwait',
            'KG': 'Kyrgyzstan',
            'LA': 'Lao People\'s Democratic Republic',
            'LV': 'Latvia',
            'LB': 'Lebanon',
            'LS': 'Lesotho',
            'LR': 'Liberia',
            'LY': 'Libyan Arab Jamahiriya',
            'LI': 'Liechtenstein',
            'LT': 'Lithuania',
            'LU': 'Luxembourg',
            'MO': 'Macao',
            'MK': 'Macedonia',
            'MG': 'Madagascar',
            'MW': 'Malawi',
            'MY': 'Malaysia',
            'MV': 'Maldives',
            'ML': 'Mali',
            'MT': 'Malta',
            'MH': 'Marshall Islands',
            'MQ': 'Martinique',
            'MR': 'Mauritania',
            'MU': 'Mauritius',
            'YT': 'Mayotte',
            'MX': 'Mexico',
            'FM': 'Micronesia, Federated States Of',
            'MD': 'Moldova',
            'MC': 'Monaco',
            'MN': 'Mongolia',
            'ME': 'Montenegro',
            'MS': 'Montserrat',
            'MA': 'Morocco',
            'MZ': 'Mozambique',
            'MM': 'Myanmar',
            'NA': 'Namibia',
            'NR': 'Nauru',
            'NP': 'Nepal',
            'NL': 'Netherlands',
            'AN': 'Netherlands Antilles',
            'NC': 'New Caledonia',
            'NZ': 'New Zealand',
            'NI': 'Nicaragua',
            'NE': 'Niger',
            'NG': 'Nigeria',
            'NU': 'Niue',
            'NF': 'Norfolk Island',
            'MP': 'Northern Mariana Islands',
            'NO': 'Norway',
            'OM': 'Oman',
            'PK': 'Pakistan',
            'PW': 'Palau',
            'PS': 'Palestinian Territory, Occupied',
            'PA': 'Panama',
            'PG': 'Papua New Guinea',
            'PY': 'Paraguay',
            'PE': 'Peru',
            'PH': 'Philippines',
            'PN': 'Pitcairn',
            'PL': 'Poland',
            'PT': 'Portugal',
            'PR': 'Puerto Rico',
            'QA': 'Qatar',
            'RE': 'Reunion',
            'RO': 'Romania',
            'RU': 'Russian Federation',
            'RW': 'Rwanda',
            'BL': 'Saint Barthelemy',
            'SH': 'Saint Helena',
            'KN': 'Saint Kitts And Nevis',
            'LC': 'Saint Lucia',
            'MF': 'Saint Martin',
            'PM': 'Saint Pierre And Miquelon',
            'VC': 'Saint Vincent And Grenadines',
            'WS': 'Samoa',
            'SM': 'San Marino',
            'ST': 'Sao Tome And Principe',
            'SA': 'Saudi Arabia',
            'SN': 'Senegal',
            'RS': 'Serbia',
            'SC': 'Seychelles',
            'SL': 'Sierra Leone',
            'SG': 'Singapore',
            'SK': 'Slovakia',
            'SI': 'Slovenia',
            'SB': 'Solomon Islands',
            'SO': 'Somalia',
            'ZA': 'South Africa',
            'GS': 'South Georgia And Sandwich Isl.',
            'ES': 'Spain',
            'LK': 'Sri Lanka',
            'SD': 'Sudan',
            'SR': 'Suriname',
            'SJ': 'Svalbard And Jan Mayen',
            'SZ': 'Swaziland',
            'SE': 'Sweden',
            'CH': 'Switzerland',
            'SY': 'Syrian Arab Republic',
            'TW': 'Taiwan',
            'TJ': 'Tajikistan',
            'TZ': 'Tanzania',
            'TH': 'Thailand',
            'TL': 'Timor-Leste',
            'TG': 'Togo',
            'TK': 'Tokelau',
            'TO': 'Tonga',
            'TT': 'Trinidad And Tobago',
            'TN': 'Tunisia',
            'TR': 'Turkey',
            'TM': 'Turkmenistan',
            'TC': 'Turks And Caicos Islands',
            'TV': 'Tuvalu',
            'UG': 'Uganda',
            'UA': 'Ukraine',
            'AE': 'United Arab Emirates',
            'GB': 'United Kingdom',
            'US': 'United States',
            'UM': 'United States Outlying Islands',
            'UY': 'Uruguay',
            'UZ': 'Uzbekistan',
            'VU': 'Vanuatu',
            'VE': 'Venezuela',
            'VN': 'Viet Nam',
            'VG': 'Virgin Islands, British',
            'VI': 'Virgin Islands, U.S.',
            'WF': 'Wallis And Futuna',
            'EH': 'Western Sahara',
            'YE': 'Yemen',
            'ZM': 'Zambia',
            'ZW': 'Zimbabwe'
        };

        var query = prepareFilters(filters, '');

        var dataType = type == 1 ? 'count(order.id)' : 'TRUNCATE(sum(total/ currency_exchange.exchange_rate), 2)';
        var sql = 'SELECT `country_code`, ' + dataType + ' as `counts` FROM `order` INNER JOIN currency_exchange on currency_exchange.currency_code = order.currency where 1 = 1 ' + query + ' GROUP BY `country_code`';
        pool.getConnection(function (err, connection) {
            if (err) {
                connection && connection.release();
            }
            connection.query(sql, function (err, rows, fields) {
                if (err) throw err;
                var data;
                var dataCountries = [];
                var countries = {};
                var totalCounts = 0;
                var otherCountries = 0;//total countries values for less than 20% of all

                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    if (type ==  1) {
                        if(row.counts > 1) {
                            totalCounts += row.counts;
                            countries[row.country_code] = row.counts;
                        }
                    }else {
                        var total = row.counts;
                        var differentVal = total - (parseInt(total / 10) * 10);
                        if(differentVal > 5){
                            total = (parseInt(total / 10) * 10) + 10;
                        }else {
                            total = (parseInt(total / 10) * 10) + 5;
                        }

                        totalCounts += total;
                        countries[row.country_code] = total;
                    }
                }

                for (var countryCode in countries) {
                    if ((countries[countryCode] / totalCounts * 100) > 5) {
                        dataCountries.push([countriesTitle[countryCode], countries[countryCode]]);
                    } else {
                        otherCountries += countries[countryCode];
                    }
                }

                if (type != 1) {
                    otherCountries = Math.round(otherCountries * 100) / 100;
                }

                if (otherCountries > 0) {
                    dataCountries.push(["Others", otherCountries]);
                }

                connection.release();
                data = dataCountries;
                callback(data);
            });
        });
    }


    function getMonthlyOrdersStatistics(type, filters, callback) {
        var query = prepareFilters(filters, '');

        var dataType = type == 1 ? 'count(order.id)' : 'TRUNCATE(sum(total/ currency_exchange.exchange_rate), 2)';
        var sql = 'SELECT Date_format(create_date, "%Y") as `create_year`, Date_format(create_date, "%M") as `create_month`, ' + dataType + ' as `counts` FROM `order` INNER JOIN currency_exchange on currency_exchange.currency_code = order.currency where 1 = 1 ' + query + ' GROUP BY year(`create_date`), month(`create_date`)';
        pool.getConnection(function (err, connection) {
            if (err) {
                connection && connection.release();
            }
            connection.query(sql, function (err, rows, fields) {
                if (err) throw err;
                var dataMonths = [];

                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];

                    if (type == 1) {
                        dataMonths.push([row.create_month, row.counts]);
                    } else {
                        var total = row.counts;
                        var differentVal = total - (parseInt(total / 10) * 10);
                        if (differentVal > 5) {
                            total = (parseInt(total / 10) * 10) + 10;
                        } else {
                            total = (parseInt(total / 10) * 10) + 5;
                        }
                        dataMonths.push([row.create_month, total]);
                    }
                }

                connection.release();
                callback(dataMonths);
            });
        });
    }

    function handleFilters(req, res) {
        var month = 30 * 24 * 60 * 60 * 1000;
        var stores = -1;
        var timeframe = -1;
        var orderstatus = -1;

        if (req.cookies['filters-cookie'] == undefined) {
            res.cookie('filters-cookie', JSON.stringify({stores: -1, timeframe: -1, orderstatus: -1}), {maxAge: month});
        }
        else {
            if (req.method == "POST") {
                var cookies = JSON.parse(req.cookies['filters-cookie']);

                if (req.body["stores-selected[]"] != undefined) {
                    stores = req.body["stores-selected[]"];
                } else {
                    stores = cookies['stores'];
                }

                if (req.body["timeframe"] != undefined) {
                    timeframe = req.body["timeframe"];
                } else {
                    timeframe = cookies['timeframe'];
                }

                if (req.body["order-status[]"] != undefined) {
                    orderstatus = req.body["order-status[]"];
                } else {
                    orderstatus = cookies['orderstatus'];
                }

                res.cookie('filters-cookie', JSON.stringify({
                    stores: stores,
                    timeframe: timeframe,
                    orderstatus: orderstatus
                }), {maxAge: month});
            }
        }

        return {stores: stores, timeframe: timeframe, orderstatus: orderstatus};
    }

    function clearFilters(req, res) {
        var month = 30 * 24 * 60 * 60 * 1000;
        res.cookie('filters-cookie', JSON.stringify({stores: -1, timeframe: -1, orderstatus: -1}), {maxAge: month});
        req.cookies['filters-cookie'] = JSON.stringify({stores: -1, timeframe: -1, orderstatus: -1});
    }

    function prepareFilters(filters, query) {
        if (filters['stores']) {
            var stores = filters['stores'];
            if (stores != -1 && stores.length > 0) {
                var storesStat = '';

                if (Array.isArray(stores)) {
                    storesStat = stores.join(',');
                } else {
                    storesStat = stores;
                }

                query += ' and store_id in (' + storesStat + ')';
            }
        }

        if (filters['timeframe'] && filters['timeframe'] != "-1") {
            var d = new Date();
            d.setSeconds(0);
            d.setMinutes(0);
            d.setHours(0);

            switch (filters['timeframe']) {
                case "1"://last year
                    d.setYear(d.getFullYear() - 1);
                    d.setMonth(0);
                    d.setDate(1);

                    var toD = new Date();//To
                    toD.setMonth(0);
                    toD.setDate(1);

                    var dateFormated = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
                    var dateFormatedTo = toD.getFullYear() + '-' + (toD.getMonth() + 1) + '-' + toD.getDate();

                    query += ' AND create_date >= "' + dateFormated + '" AND create_date < "' + dateFormatedTo + '"';

                    break;
                case "2"://last quarter
                    d.setDate(1); //To
                    var currentQuarter = Math.ceil((d.getMonth() + 1) / 3);
                    if(currentQuarter < 2){
                        d.setYear(d.getFullYear() - 1); //quarter 4 of previous year
                        d.setMonth(11);
                    }else{
                        d.setMonth((currentQuarter -1) * 3 - 1); //set month of previous quarter
                    }

                    var fromD = new Date();//From
                    fromD.setFullYear(d.getFullYear());
                    fromD.setMonth(d.getMonth() - 2);
                    fromD.setDate(1);
                    d.setMonth(d.getMonth()+ 1); //get all days of month


                    var dateFormated = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
                    var dateFormateFromD = fromD.getFullYear() + '-' + (fromD.getMonth() + 1) + '-' + fromD.getDate();

                    query += ' and create_date >= "' + dateFormateFromD + '" and create_date < "' + dateFormated + '"';

                    break;
                case "3":
                    d.setDate(1);
                    d.setMonth(d.getMonth() - 1);

                    var toD = new Date();//To
                    toD.setDate(1);

                    var dateFormated = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
                    var dateFormatedTo = toD.getFullYear() + '-' + (toD.getMonth() + 1) + '-' + toD.getDate();

                    query += ' AND create_date >= "' + dateFormated + '" AND create_date < "' + dateFormatedTo + '"';
                    break;
                case "4"://this year
                    d.setMonth(0);
                    d.setDate(1);

                    var dateFormated = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
                    query += ' AND create_date >= "' + dateFormated + '"';

                    break;
                case "5"://this quarter
                    d.setDate(1); //To
                    var currentQuarter = Math.ceil((d.getMonth() + 1) / 3);
                    d.setMonth((currentQuarter) * 3 - 1); //set month of previous quarter

                    var fromD = new Date();//From
                    fromD.setFullYear(d.getFullYear());
                    fromD.setMonth(d.getMonth() - 2);
                    fromD.setDate(1);
                    d.setMonth(d.getMonth()+ 1); //get all days of month

                    var dateFormated = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
                    var dateFormateFromD = fromD.getFullYear() + '-' + (fromD.getMonth() + 1) + '-' + fromD.getDate();

                    query += ' and create_date >= "' + dateFormateFromD + '" and create_date < "' + dateFormated + '"';

                    break;
                case "6":
                    d.setDate(1);
                    var dateFormated = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
                    query += ' AND create_date >= "' + dateFormated + '"';
                    break;
            }

            console.log(query);
        }

        if (filters['orderstatus'] && filters['orderstatus'] != -1) {
            var statuz = filters['orderstatus'];
            if (statuz != -1 && statuz.length > 0) {
                var statusStat = '';

                if (Array.isArray(statuz)) {
                    statusStat = '"' + statuz.join('","') + '"';
                } else {
                    statusStat = '"' + statuz + '"';
                }


                query += ' and `state` in (' + statusStat + ')';
            }
        }

        return query;
    }


    //used for Filter by stores
    function getStoreList(callback) {
        var sql = 'SELECT id, title FROM `store`';
        pool.getConnection(function (err, connection) {
            if (err) {
                connection && connection.release();
            }
            connection.query(sql, function (err, rows, fields) {
                if (err) throw err;
                var stores = [];

                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    stores.push(row);
                }

                connection.release();
                callback(stores);
            });
        });
    }

    function prepareFilterSlider(req, res) {
        var data = {stores: [], timeframe: -1, orderstatus: []};

        if (req.cookies['filters-cookie'] != undefined) {
            var cookies = JSON.parse(req.cookies['filters-cookie']);

            if (cookies['stores'] != -1) {
                if (Array.isArray(cookies['stores'])) {
                    data['stores'] = cookies['stores'];
                } else {
                    data['stores'] = [];
                    data['stores'].push(cookies['stores']);
                }
            }

            if (cookies['timeframe'] != "-1") {
                data['timeframe'] = cookies['timeframe'];
            }

            if (cookies['orderstatus'] != -1) {
                if (Array.isArray(cookies['orderstatus'])) {
                    data['orderstatus'] = cookies['orderstatus'];
                } else {
                    data['orderstatus'] = []
                    data['orderstatus'].push(cookies['orderstatus']);
                }
            }
        }

        return data;
    }

    return router;
};
//module.exports = router;
