const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    dollars: {
        type: Number,
        required: true
    },
    color: {
        type: String,
        required: true,
        minlength: 6,
        trim: true
    }
}, {collection: 'budget'})

module.exports = mongoose.model('budget', budgetSchema);
