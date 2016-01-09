/**
 * Created by belalmazlom on 1/10/16.
 */
var mysqlConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'shopgo_statistics',
    connectionLimit : 40,
    debug :  false
};


module.exports = {
    mysqlConfig: mysqlConfig
};