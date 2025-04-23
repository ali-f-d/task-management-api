const { MongoClient } = require('mongodb');

// initializing for MongoDB client
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.DB_NAME || 'task-management';
const collectionName = process.env.COLLECTION_NAME || 'tasks';

const client = new MongoClient(mongoURI);

async function connect() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    return false;
  }
}

async function disconnect() {
  try {
    await client.close();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
}

function getCollection(dbName, collectionName) {
  try {
    return client.db(dbName).collection(collectionName);
  } catch (error) {
    console.error('Error getting collection:', error);
    throw error;
  }
}

async function getByName(name) {
  try {
    const collection = getCollection(dbName, collectionName);
    return await collection.find({ name }).toArray();
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
}

async function updateOneByName(name, task) {
  try {
    const collection = getCollection(dbName, collectionName);
    return await collection.updateOne({ name }, { $set: task });
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
}

async function getAll() {
  try {
    const collection = getCollection(dbName, collectionName);
    return await collection.find().toArray();
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
}

async function createOne(task) {
  try {
    const collection = getCollection(dbName, collectionName);
    return await collection.insertOne(task);
  } catch (error) {
    console.error('Error inserting task:', error);
    throw error;
  }
}

async function deleteOneByName(name) {
  try {
    const collection = getCollection(dbName, collectionName);
    return await collection.deleteOne({ name });
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}

module.exports = {
  connect,
  disconnect,
  getByName,
  updateOneByName,
  getAll,
  createOne,
  deleteOneByName,
  dbName,
  collectionName,
};
