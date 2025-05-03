const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require("dotenv").config();
const ondcRoutes = require('./routes/ondcRoutes');
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

const PORT = process.env.PORT;

app.get('/', (req,res) => {
    res.send("hello world");
})
// ONDC Routes
app.use('/ondc', ondcRoutes);
// // Beckn Routes
// app.use('/api/beckn', becknRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
