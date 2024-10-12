const mongoose = require('mongoose');

const travellerSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    bookedGuides: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Guide' }]
});

module.exports = mongoose.model('Traveller', travellerSchema);