const MongoClient = require('mongodb').MongoClient;


function DbClient (config) {
    let url
    if (config.user) {
        url = `mongodb://${encodeURIComponent(config.user)}:${encodeURIComponent(config.password)}@${config.host}:${config.port}/${config.dbName}`// mongodb://admin:123456@localhost/
    } else {
        url = `mongodb://${config.host}:${config.port}/${config.dbName}`
    }

    console.log(1, url)
    // Database Name
    // Use connect method to connect to the server
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function(err, client) {
            console.log("Connected successfully to server");
            let obj = Object.create(new DAO())
            obj.client = client
            resolve(obj)
        });
    })
}

function DAO () {

}


DAO.prototype.insertDocuments = function(db, collectionName, documents, callback) {
    // Get the documents collection
    const collection = db.collection(collectionName);
    // Insert some documents
    return new Promise((resolve, reject) => {
        collection.insertMany(documents, function(err, result) {
            resolve([err, result])
        });
    })
}

DAO.prototype.findDocuments  = function(db, collectionName, query, callback) {
    // Get the documents collection
    const collection = db.collection(collectionName);
    // Find some documents
    return new Promise((resolve, reject) => {
        collection.find(query).toArray(function(err, docs) {
            resolve([err, docs])
        });
    })
}

DAO.prototype.updateDocument = function(db, collectionName, query, updates,  callback) {
    // Get the documents collection
    const collection = db.collection(collectionName);
    // Update document where a is 2, set b equal to 1
    return new Promise((resolve, reject) => {
        collection.updateOne(query
            , { $set: updates }, function(err, result) {
            resolve([err, result]);
        });
    })
}

DAO.prototype.removeDocument = function(db, collectionName, query,  callback) {
    // Get the documents collection
    const collection = db.collection(collectionName);
    // Delete document where a is 3
    return new Promise((resolve, reject) => {
        collection.deleteOne(query, function(err, result) {
            resolve([err, result]);
        });
    })
}

module.exports = DbClient