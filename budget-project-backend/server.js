// Budget API

const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const axios = require('axios');
const budgetModel = require('./models/budget_model');
const mongoPassword = process.env.MONGO_PASSWORD;

let ssoServer = 'auth.libredelibre.com';
let url = 'mongodb://ssoMaster:' + mongoPassword + '@' + ssoServer + ':27017/budget?authSource=budget';

app.use(cors());

var bodyParser = require('body-parser');
const { json } = require('express');

app.use(bodyParser.json())

function ensureAuthenticated(req, response, next) {
    let jwt = req.headers.authorization;

    axios.post('http://' + ssoServer + ':8080/account/authenticate', {jwt: jwt})
    .then(() => {
        return next();
    })
    .catch(err => {
        console.log(err.response.status);
        return response.sendStatus(401);
    })
}

function getUserId(jwt) {
    return JSON.parse(Buffer.from(jwt.split('.')[1], 'base64').toString()).userId;
}
     
// Get a document
app.get('/budget', ensureAuthenticated, (req, res) => {
    let userId = getUserId(req.headers.authorization);
    mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => {
                budgetModel.find({ 'userId': userId, 'data.month': req.query.month })
                            .then(data => {
                                if (data[0] == undefined) {
                                    res.sendStatus(404);
                                } else {
                                    res.json(data[0].data);
                                }
                                mongoose.connection.close();
                            })
                            .catch(err => {
                                res.sendStatus(err.status);
                                console.log(err);
                            });
            })
            .catch(err => {
                console.log(err);
                res.sendStatus(404);
            });
});

// Update an object
app.put('/budget', ensureAuthenticated, (req, res) => {
    let userId = getUserId(req.headers.authorization);
    let filter = { 
        'userId': userId
    }
    let newData;
    mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            // Get and update the current data
            budgetModel.find(filter)
                .then(data => {
                    if (data[0] == undefined) {
                        res.sendStatus(404);
                        return;
                    } else {
                        monthData = data[0].data.filter(obj => obj.month == req.body.month);
                        otherData = data[0].data.filter(obj => obj.month != req.body.month);
                        newMonthData = monthData.filter(obj => obj.title != req.body.title);
                        if (monthData.length == newMonthData.length) {
                            res.sendStatus(404);
                        } else {
                            newMonthData.push({
                                'title': req.body.title, 
                                'budget': req.body.budget, 
                                'expense': req.body.expense, 
                                'month': req.body.month
                            });
                            newData = otherData.concat(newMonthData);
                        }
                    }
                })
                .catch(err => {
                    console.log(err);
                    return;
                })
                .then(() => {
                    // Update db with new data
                    budgetModel.updateOne(filter, 
                        {
                            'data': newData
                        }
                    )
                    .then(data => {
                        res.json(newData);
                        mongoose.connection.close();
                    })
                    .catch(err => {
                        console.log(err);
                    })
                })
                .catch(err => {
                    console.log(err);
                });
        })
        .catch(err => {
            console.log(err);
            res.sendStatus(404);
        });
});

// Add an object
app.post('/budget', ensureAuthenticated, (req, res) => {
     let userId = getUserId(req.headers.authorization);
     let filter = { 
        'userId': userId
    }
    let newObj = {
        'title': req.body.title, 
        'budget': req.body.budget, 
        'expense': req.body.expense, 
        'month': req.body.month
    }
    let newData;
    let newDoc;
    mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            // Get and push to the current data
            budgetModel.find(filter)
                .then(data => {
                    if (data[0] == undefined) {
                        // No document for that user. Insert new doc
                        newDoc = {
                            'userId': userId,
                            data: [newObj]
                        }
                    } else {
                        // Get all the objects for a given month
                        monthData = data[0].data.filter(obj => obj.month == req.body.month);
                        otherData = data[0].data.filter(obj => obj.month != req.body.month);
                        let objExists = monthData.some(obj => {
                            return obj.title == req.body.title
                        })
                        if (!objExists) {
                            monthData.push(newObj);
                        } else {
                            res.sendStatus(409);
                        }
                        newData = otherData.concat(monthData);
                    }
                })
                .catch(err => {
                    console.log(err);
                    return;
                })
                .then(() => {
                    if (newDoc != undefined) {
                        budgetModel.insertMany([newDoc])
                        .then(() => {
                            res.json(newDoc.data);
                        })
                        .catch(err => {
                            console.log(err);
                        })
                    } else {
                        // Update db with new data
                        budgetModel.updateOne(filter, 
                            {
                                'data': newData
                            }
                        )
                        .then(data => {
                            res.json(newData);
                            mongoose.connection.close();
                        })
                        .catch(err => {
                            console.log(err);
                        })
                    }
                })
                .catch(err => {
                    console.log(err);
                });
        })
        .catch(err => {
            console.log(err);
            res.sendStatus(404);
        });
});

// Delete an object
app.delete('/budget', ensureAuthenticated, (req, res) => {
    let userId = getUserId(req.headers.authorization);
    let filter = { 
       'userId': userId,
       'data.month': Number(req.query.month),
       'data.title': req.query.title
   }
   let newData;
   mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
       .then(() => {
           // Get and delete from the current data
           budgetModel.find(filter)
               .then(data => {
                   if (data[0] == undefined) {
                       // No document found. Cannot perform deletion
                       res.sendStatus(404);
                       return;
                   } else {
                       newData = data[0].data.filter(obj => {
                           if (obj.month == Number(req.query.month) && obj.title == req.query.title) {
                               return false;
                           } else {
                               return true;
                           }
                       })                       
                   }
               })
               .catch(err => {
                   console.log(err);
                   return;
               })
               .then(() => {
                   // Update db with new data
                   budgetModel.updateOne(filter, 
                       {
                           'data': newData
                       }
                   )
                   .then(data => {
                       res.json(newData);
                       mongoose.connection.close();
                   })
                   .catch(err => {
                       console.log(err);
                   })
               })
               .catch(err => {
                   console.log(err);
               });
       })
       .catch(err => {
           console.log(err);
           res.sendStatus(404);
       });
});

app.listen(port, console.log(`API served at localhost:${port}`));
