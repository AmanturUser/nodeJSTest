// models/School.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schoolSchema = new Schema({
    id: {
        type: Schema.Types.ObjectId, 
        auto: true 
    },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
});

const School = mongoose.model('School', schoolSchema);

module.exports = School;
