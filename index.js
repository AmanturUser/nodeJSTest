const express = require("express");
const app = express();
const connectDb = require('./db.js');
const PORT = process.env.PORT || 3000;

connectDb();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Import and use the Authentication Route
const authRoutes = require("./routes/authRoute.js");
app.use('/auth', authRoutes);

// Import and use the OTP Route
const otpRoutes = require("./routes/otpRoute.js");
app.use('/verify-otp', otpRoutes);

// Import and use the School Route
const schoolRoutes = require("./routes/schoolRoute.js");
app.use('/schools', schoolRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
