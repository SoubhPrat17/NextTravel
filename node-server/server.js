const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const suggestionRoutes = require('./routes/suggestions')
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use('/api/suggestions', suggestionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
