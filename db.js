var mysql = require('mysql');
let dbConfig = {
    host     : '127.0.0.1',
    port     : '3306',
    user     : 'root',
    password :  'password',    
    database : 'client_db'
}
let pool = mysql.createPool(dbConfig);
pool.on('connection', function (_conn, error) {
    if (_conn) {
        console.log('Connected the database via threadId %d!!', _conn.threadId);
    }else{
        console.log(error)
    }
});

module.exports = pool;
