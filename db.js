const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',       // Cambia esto por el nombre de usuario de MySQL
    password: '1234', // Cambia esto por la contraseña de MySQL
    database: 'vacancycraft_db'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.message);
        return;
    }
    console.log('Connected to MySQL');
});

module.exports = connection;
