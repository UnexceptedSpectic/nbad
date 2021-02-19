const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    data: {
        type: [{
                title: {
                    type: String,
                    required: true,
                    trim: true
                },
                budget: {
                    type: Number,
                    required: true
                },
                expense: {
                    type: Number,
                    required: true
                },
                month: {
                    type: Number,
                    required: true
                }
            }],
        required: true
    }
    }, {collection: 'budget', _id : false})

module.exports = mongoose.model('budget', budgetSchema);
