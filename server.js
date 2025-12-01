const express = require('express');
const app = express();
 
app.use(express.json());
const port = process.env.PORT || 3000;

// CORS middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
});

// Request logging middleware
app.use(function(req, res, next) {
    console.log("Request IP: " + req.url);
    console.log("Request date: " + new Date());
    next();
});

app.get('/', (req, res) => {
    res.send('Server is running with logging');
});
 
app.listen(port, () => {
    console.log(`Express.js server running at localhost:${port}`);
});