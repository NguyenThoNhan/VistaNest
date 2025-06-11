const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '261080',
    database: 'document_management'
});

db.connect((err) => {
    if (err) {
        console.error('Failed to connect to MySQL database:', err.message);
        return;
    }
    console.log('Connected to MySQL database');
});

module.exports = db;