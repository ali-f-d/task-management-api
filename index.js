const express = require('express');
const fs = require('fs');
const { MongoClient } = require('mongodb');

// initializing for MongoDB client
const mongoURI = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(mongoURI);

// express initialization
const protocol = 'http';
const hostname = 'localhost';
const port = 3000;
const app = express();

// functions
async function mongoConnect() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    return false;
  }
}

async function mongoDisconnect() {
  try {
    await client.close();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
}

async function uncaughtException(error) {
  console.error('Uncaught Exception:', error);
  await mongoDisconnect();
  console.log('Server closed due to uncaught exception');
  process.exit(1);
}

// main function
async function main() {
  // Connect to MongoDB
  const mongoConnected = await mongoConnect();
  if (!mongoConnected) {
    mongoDisconnect();
    return;
  }

  // Getting Database and Collection
  const db = client.db('task-manager');
  const collection = db.collection('tasks');

  // Middlewares
  app.use(express.json());

  // Routes
  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  app.listen(port, () => {
    console.log(`Server is running on ${protocol}://${hostname}:${port}`);
  });
}

// take care of closing the connection when the process ends
process.on('SIGINT', async () => {
  await mongoDisconnect();
  console.log('Server closed');
  process.exit(0);
});
process.on('uncaughtException', uncaughtException);

// Start the server
main().catch(uncaughtException);
