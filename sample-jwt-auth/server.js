const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
})

const PORT = 3000;
const SECRET_KEY = 'a secret key for signing jwts';
const jwtMW = exjwt({
    secret: SECRET_KEY,
    algorithms: ['HS256']
})

var connection = mysql.createConnection({
    host: 'sql9.freemysqlhosting.net',
    user: 'sql9374936',
    password: 'sdz4SVDeSj',
    database: 'sql9374936'
})

app.post('/api/signup', async (req, res) => {
    const { username, password } = req.body;
    encryptPassword(password).then(encryptedPassword => {
        const date = mysqlDate();
        connection.query('SELECT * FROM `user` WHERE `username` = ?', [username], (err, results) => {
            if (err) throw err;
            if (results.length == 0) {
                connection.query('INSERT INTO user VALUES ("", ?, ?, ?)', [username, encryptedPassword, date], err => {
                    if (err) throw err;
                    res.status(200).json({
                        success: true,
                    });
                })
            } else {
                res.status(409).json({
                    success: false,
                    err: 'User exists'
                })
            }
        });
    });
})

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    connection.query('SELECT * FROM `user` WHERE `username` = ?', [username], (err, results) => {
        if (err) throw err;
        if (results.length != 0) {
            let encryptedPassword = results[0].password;
            bcrypt.compare(password, encryptedPassword).then(matching => {
                if (matching) {
                    let token = jwt.sign({ id: results[0].id, username: username }, SECRET_KEY, { expiresIn: '3m' });
                    res.json({
                        success: true,
                        err: null,
                        token
                    });
                } else {
                    res.status(401).json({
                        success: false,
                        token: null,
                        err: 'Password is incorrect'
                    });
                }
            });
        } else {
            res.status(401).json({
                success: false,
                token: null,
                err: 'Username is not associated with an account'
            });
        }
    })
})

app.get('/api/budget', jwtMW, async (req, res) => {
    connection.query('SELECT * FROM budget', (err, results, fields) => {
        if (err) throw err;
        res.json(results);
    })
})

app.get('/api/dashboard', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'Secret content that only logged in users can see.'
    })
});

app.get('/api/settings', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'Settings that only logged in users can see.'
    })
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
})

app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            err
        })
    } else {
        next(err);
    }
})

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})

function encryptPassword(password) {
    let saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
}

function mysqlDate() {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
}
