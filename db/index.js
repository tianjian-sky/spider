var mysql      = require('mysql');

function DB () {
}

DB.prototype.createConnection = function (config) {
    var conn = mysql.createConnection({
        host     : config.host, // 'localhost',
        user     : config.user, // 'me',
        password : config.password, //'secret',
        database : config.database, // 'my_db'
    })
    return conn
} 


module.exports = DB

 
// connection.connect();
 
// connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
//   if (error) throw error;
//   console.log('The solution is: ', results[0].solution);
// });
 
// connection.end();