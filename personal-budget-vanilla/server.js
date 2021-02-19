// Budget API

const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000
const budget = require('./myBudget.json');

app.use(cors());

app.get('/budget', (req, res) => {
    res.json(budget);
})

app.listen(port, console.log(`API served at localhost:${port}`))
