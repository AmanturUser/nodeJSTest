const mongoose = require('mongoose');

// MongoDB URI with login and password
// const MONGO_URI = "mongodb://admin:admin@localhost:27017/myNewDatabase";
const MONGO_URI = "mongodb://localhost:27017/";
// Connect to the database
const connectDb = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // authSource: "admin", 
    });
    console.log('Mongoose connected to MongoDB');
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDb;
