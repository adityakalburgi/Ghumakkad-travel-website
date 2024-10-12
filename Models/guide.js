const mongoose = require('mongoose');

const guideSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Traveller' }]
},{ collection: 'guides' });


module.exports = mongoose.model('Guide', guideSchema);
