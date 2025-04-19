const express = require('express');
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

// api functions
async function getByName(req, res) {
  try {
    const tasks = await app.collection
      .find({ name: req.params.name })
      .toArray();
    res.json({ status: 'success', length: tasks.length, tasks });
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).send('Internal Server Error');
  }
}

async function updateOneByName(req, res) {
  try {
    const task = req.body;
    const result = await app.collection.updateOne(
      { name: req.params.name },
      { $set: task }
    );
    res.json({ status: 'success', modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({
      status: 'failed',
      message: 'Error updating task',
    });
  }
}

async function getAll(req, res) {
  try {
    const tasks = await app.collection.find().toArray();
    res.json({ status: 'success', length: tasks.length, tasks });
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ status: 'failed', message: 'Error fetching tasks' });
  }
}

async function createOne(req, res) {
  try {
    const task = req.body;
    const result = await app.collection.insertOne(task);
    res.status(201).json({ status: 'success', insertedId: result.insertedId });
  } catch (err) {
    console.error('Error inserting task:', err);
    res.status(500).json({ status: 'failed', message: 'Error inserting task' });
  }
}

async function deleteOneByName(req, res) {
  try {
    const result = await app.collection.deleteOne({ name: req.params.name });
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ status: 'failed', message: 'Task not found' });
    }

    res.json({ status: 'success', message: 'Task deleted' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({
      status: 'failed',
      message: 'Error deleting task',
    });
  }
}

// main function
async function main() {
  // Connect to MongoDB
  const mongoConnected = await mongoConnect();
  if (!mongoConnected) {
    mongoDisconnect();
    return;
  }

  // Getting Database Collection
  app.collection = client.db('task-manager').collection('tasks');

  // Middlewares
  app.use(express.json());

  // Routes
  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  app.route('/tasks').get(getAll).post(createOne);
  app
    .route('/tasks/:name')
    .get(getByName)
    .put(updateOneByName)
    .patch(updateOneByName)
    .delete(deleteOneByName);

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
