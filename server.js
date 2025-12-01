const express = require('express');
const app = express();
 
app.use(express.json());
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Server is running');
});
 
app.listen(port, () => {
    console.log(`Express.js server running at localhost:${port}`);
});