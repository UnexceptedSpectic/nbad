// Budget API

const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000
const mongoose = require('mongoose');
const budgetModel = require('./models/budget_model');

let url = 'mongodb://localhost:27017/personal_budget';

app.use(cors());

var bodyParser = require('body-parser')

app.use(bodyParser.json())

app.get('/budget', (req, res) => {
    mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => {
                budgetModel.find()
                            .then(data => {
                                res.json(data);
                                mongoose.connection.close();
                            })
                            .catch(err => {
                                res.sendStatus(400);
                                console.log(err);
                            });
            })
            .catch(err => {
                console.log(err);
            });
});

app.post('/budget', (req, res) => {
    mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => {
                budgetModel.insertMany(req.body)
                            .then(() => {
                                res.sendStatus(200);
                                mongoose.connection.close();
                            })
                            .catch(err => {
                                res.sendStatus(400);
                                console.log(err);
                            });
            })
            .catch(err => {
                console.log(err);
            });
});

app.listen(port, console.log(`API served at localhost:${port}`));
