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
 
// Collection parameter middleware
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

// Update document by ID
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
 
app.listen(port, () => {
    console.log(`Express.js server running at localhost:${port}`);
});