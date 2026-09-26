const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

// middleware 
app.use(cors())

app.get('/', (req, res) => {
    res.send('hello word')
});

app.listen(port, () => {
    console.log(`Example app liste on port ${port}` )
})