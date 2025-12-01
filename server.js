const express = require('express');
const path = require('path');
const fs = require('fs');
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

app.use(function(req, res, next) {
    console.log("Request IP: " + req.url);
    console.log("Request date: " + new Date());
    next();
});

// Static file middleware for images with error handling
app.use('/images', (req, res, next) => {
    const imagePath = path.join(__dirname, 'images', req.url);
    
    // Check if file exists
    fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (err) {
            // File doesn't exist, send error message
            console.error('Image not found:', imagePath);
            return res.status(404).json({ 
                error: 'Image not found',
                message: `The requested image '${req.url}' does not exist`,
                path: req.url
            });
        }
        
        // File exists, serve it
        res.sendFile(imagePath, (err) => {
            if (err) {
                console.error('Error sending file:', err);
                res.status(500).json({ 
                    error: 'Error serving image',
                    message: err.message 
                });
            }
        });
    });
});
 
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
 
let db;

MongoClient.connect('mongodb+srv://faizmuhmud9_db_user:Faiz123456@cluster0.muu3ydh.mongodb.net/', (err, client) => { 
    if (err) {
        console.error('MongoDB connection error:', err);
        return;
    }
    db = client.db('Store');
    console.log('Connected to MongoDB');
});
 
app.get('/', (req, res, next) => {
    res.send('Select a collection, e.g., /collection/lessons');
});
 
app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName);
    return next();
});
 
// Retrieve all objects from a collection
app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e);
        res.send(results);
    });
});
 
// Create new document in collection
app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insertOne(req.body, (e, result) => {
        if (e) return next(e);
        res.send(result.ops || [result]);
    });
});

// Get single document by ID
app.get('/collection/:collectionName/:id', (req, res, next) => { 
    req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, result) => { 
        if (e) return next(e);
        res.send(result);
    });
});

// Update document by ID (for updating spaces after purchase)
app.put('/collection/:collectionName/:id', (req, res, next) => { 
    req.collection.updateOne( 
        { _id: new ObjectID(req.params.id) }, 
        { $set: req.body },
        (e, result) => { 
            if (e) return next(e);
            res.send((result.matchedCount === 1) ? { msg: 'success' } : { msg: 'error' });
        }
    );
});

// Delete document by ID
app.delete('/collection/:collectionName/:id', (req, res, next) => { 
    req.collection.deleteOne( 
        { _id: new ObjectID(req.params.id) }, 
        (e, result) => { 
            if (e) return next(e);
            res.send((result.deletedCount === 1) ? { msg: 'success' } : { msg: 'error' });
        }
    );
});    

// Search endpoint for lessons
app.get('/search/:collectionName', (req, res, next) => {
    const searchQuery = req.query.q;
    req.collection = db.collection(req.params.collectionName);
    
    req.collection.find({
        $or: [
            { subject: { $regex: searchQuery, $options: 'i' } },
            { location: { $regex: searchQuery, $options: 'i' } }
        ]
    }).toArray((e, results) => {
        if (e) return next(e);
        res.send(results);
    });
});

// Create order endpoint
app.post('/orders', (req, res, next) => {
    const order = {
        customer: req.body.customer,
        items: req.body.items,
        total: req.body.total,
        date: new Date()
    };
    
    db.collection('orders').insertOne(order, (e, result) => {
        if (e) return next(e);
        res.send({ success: true, orderId: result.insertedId });
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: err.message });
});
 
app.listen(port, () => {
    console.log(`Express.js server running at localhost:${port}`);
});