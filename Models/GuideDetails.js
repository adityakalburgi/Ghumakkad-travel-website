// models/GuideDetails.js

const mongoose = require('mongoose');

const guideDetailsSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  agencyName: { type: String, required: true },
  contactDetails: { type: String, required: true },
  aadhar: { type: String, required: true },
  pan: { type: String, required: true },
  gst: { type: String, required: true },
  city: { type: String, required: true },
  image: { type: String }, // Path to uploaded image
  languages: [{ type: String }], // Array of languages
});

module.exports = mongoose.model('GuideDetails', guideDetailsSchema);


